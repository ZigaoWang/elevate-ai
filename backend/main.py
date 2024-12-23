from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import AsyncOpenAI
import os
import json
from dotenv import load_dotenv
from typing import List, Dict
import asyncio
import re

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url=os.getenv("OPENAI_BASE_URL")
)

class Prompt(BaseModel):
    text: str

class FeedbackPrompt(BaseModel):
    content: str
    feedback1: str
    feedback2: str

TECHNICAL_SYSTEM_PROMPT = """You are a technical writing tutor. Analyze the text and provide ratings in the following categories:
- Clarity (1-10): How clear and understandable is the content?
- Structure (1-10): How well-organized is the content?
- Technical Accuracy (1-10): How accurate and precise is the technical information?
- Completeness (1-10): How thoroughly does it cover the necessary information?

Provide a concise, focused feedback (max 2-3 sentences) that highlights the most important improvements needed.

Your response should be in markdown format. Start with the ratings, followed by your feedback.
Example:
### Technical Analysis
- **Clarity**: 8/10
- **Structure**: 7/10
- **Technical Accuracy**: 9/10
- **Completeness**: 8/10

Your feedback here in 2-3 sentences."""

CREATIVE_SYSTEM_PROMPT = """You are a creative writing tutor. Analyze the text and provide ratings in the following categories:
- Engagement (1-10): How engaging and captivating is the content?
- Style (1-10): How well-crafted and stylistically appropriate is the writing?
- Impact (1-10): How memorable and impactful is the content?
- Innovation (1-10): How original and creative is the approach?

Provide a concise, focused feedback (max 2-3 sentences) that highlights the most important creative improvements needed.

Your response should be in markdown format. Start with the ratings, followed by your feedback.
Example:
### Creative Analysis
- **Engagement**: 8/10
- **Style**: 7/10
- **Impact**: 9/10
- **Innovation**: 8/10

Your feedback here in 2-3 sentences."""

async def stream_completion(messages: List[Dict], websocket: WebSocket):
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            stream=True,
            temperature=0.7
        )
        
        collected_content = ""
        async for chunk in response:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                collected_content += content
                await websocket.send_json({
                    "type": "content",
                    "content": content
                })
        
        # If this is feedback, try to parse the ratings
        if any(prompt["content"] in [TECHNICAL_SYSTEM_PROMPT, CREATIVE_SYSTEM_PROMPT] for prompt in messages):
            try:
                # Extract ratings using regex
                ratings = {}
                if "Technical Analysis" in collected_content:
                    matches = re.findall(r'\*\*(Clarity|Structure|Technical Accuracy|Completeness)\*\*: (\d+)/10', collected_content)
                    ratings = {key.lower().replace(' ', '_'): int(value) for key, value in matches}
                elif "Creative Analysis" in collected_content:
                    matches = re.findall(r'\*\*(Engagement|Style|Impact|Innovation)\*\*: (\d+)/10', collected_content)
                    ratings = {key.lower(): int(value) for key, value in matches}
                
                if ratings:
                    await websocket.send_json({
                        "type": "ratings",
                        "content": ratings
                    })
                    
                    # Extract feedback (everything after the ratings)
                    feedback = re.split(r'\n\n', collected_content)[-1].strip()
                    await websocket.send_json({
                        "type": "content",
                        "content": feedback
                    })
                    return {"ratings": ratings, "feedback": feedback}
            except Exception as e:
                print(f"Error parsing feedback: {e}")
                print(f"Raw content: {collected_content}")
        
        return collected_content
    except Exception as e:
        print(f"Error in stream_completion: {str(e)}")
        await websocket.send_json({
            "type": "error",
            "content": str(e)
        })
        return None

@app.websocket("/ws/generate")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_json()
            prompt = data.get("prompt", "")
            
            # Step 1: Initial Content
            await websocket.send_json({"type": "status", "content": "Generating initial content..."})
            initial_content = await stream_completion([
                {"role": "system", "content": """You are a helpful content generator. 
                - Start with the content directly, no introductory phrases like 'Here's' or 'Absolutely!'
                - Use markdown formatting for better readability
                - Be concise and direct"""},
                {"role": "user", "content": prompt}
            ], websocket)
            
            if not initial_content:
                continue
                
            # Step 2: Technical Feedback
            await websocket.send_json({"type": "status", "content": "Getting technical feedback..."})
            tech_feedback = await stream_completion([
                {"role": "system", "content": TECHNICAL_SYSTEM_PROMPT},
                {"role": "user", "content": initial_content}
            ], websocket)
            
            # Step 3: Creative Feedback
            await websocket.send_json({"type": "status", "content": "Getting creative feedback..."})
            creative_feedback = await stream_completion([
                {"role": "system", "content": CREATIVE_SYSTEM_PROMPT},
                {"role": "user", "content": initial_content}
            ], websocket)
            
            # Step 4: Final Improved Content
            await websocket.send_json({"type": "status", "content": "Generating final improved content..."})
            await stream_completion([
                {"role": "system", "content": """You are a content refinement AI. Improve the content based on the provided feedback.
                - Start with the content directly, no introductory phrases
                - Use markdown formatting for better readability
                - Be concise and direct"""},
                {"role": "user", "content": f"""
Original content: {initial_content}

Technical Feedback: {tech_feedback['feedback'] if isinstance(tech_feedback, dict) else tech_feedback}

Creative Feedback: {creative_feedback['feedback'] if isinstance(creative_feedback, dict) else creative_feedback}

Improve the content incorporating both the technical and creative feedback.
"""}
            ], websocket)
            
            await websocket.send_json({"type": "done"})
            
    except Exception as e:
        await websocket.send_json({
            "type": "error",
            "content": str(e)
        })

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
