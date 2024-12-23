# Project Proposal: Elevate AI

## Overview
**Elevate AI** is an iterative AI refinement system where a generator AI creates content based on user prompts, and two tutor AIs provide structured feedback to improve the output. This process continues through multiple iterations, ensuring the content is refined to meet user expectations and quality standards.

The concept was originally proposed by [Thomas Wu](https://github.com/TakumiBC/).

---

## Objectives
1. **Content Enhancement**: Generate high-quality, user-specific content efficiently.
2. **Iterative Refinement**: Employ a feedback loop to iteratively enhance the generated output.
3. **Customizable Feedback**: Allow users to define feedback criteria for diverse use cases.
4. **Streamlined Workflow**: Optimize the process for cost-effectiveness and speed.

---

## Features
### 1. **User Input**
- Users provide a prompt to initiate the content generation process.

### 2. **Generator AI**
- The primary AI generates initial content tailored to the user's prompt.

### 3. **Tutor AIs**
- Two separate AIs act as tutors, reviewing the generated content:
  - **Tutor 1**: Focuses on technical aspects such as grammar, clarity, and structure.
  - **Tutor 2**: Focuses on creative elements like tone, engagement, and originality.

### 4. **Iterative Feedback Loop**
- Generator AI refines the content based on combined feedback from the tutors.
- Iterations continue until the content reaches the desired quality.

### 5. **Feedback Customization**
- Users can set weights and priorities for different feedback types.

### 6. **Real-Time Visualization**
- Display the iterative evolution of content for user review.

---

## Workflow
1. **Prompt Submission**: User submits a textual prompt.
2. **Initial Generation**: Generator AI creates an initial draft.
3. **Feedback Process**:
   - Tutor AI 1 and Tutor AI 2 provide focused feedback.
   - Feedback is consolidated for clarity.
4. **Content Refinement**: Generator AI uses the feedback to improve the content.
5. **Repeat**: The process iterates for a predefined number of cycles or until user satisfaction.
6. **Final Output**: The refined content is presented to the user.
