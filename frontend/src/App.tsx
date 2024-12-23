import { useState, useEffect, useRef } from 'react'
import './App.css'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Message = {
  type: 'status' | 'content' | 'error' | 'done' | 'ratings';
  content?: string | any;
}

type Ratings = {
  clarity?: number;
  structure?: number;
  technical_accuracy?: number;
  completeness?: number;
  engagement?: number;
  style?: number;
  impact?: number;
  innovation?: number;
}

function RatingBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className={`text-sm font-medium ${color.replace('bg-', 'text-')}`}>{value}/10</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${color}`}
          style={{ 
            width: `${(value/10) * 100}%`, 
            transition: 'width 1s ease-in-out',
            boxShadow: `0 0 10px ${color.replace('bg-', '#')}` 
          }}
        ></div>
      </div>
    </div>
  )
}

function ProcessStep({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex items-start space-x-3">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white`}>
        {number}
      </div>
      <div>
        <h3 className="font-semibold text-white mb-1">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  )
}

function MarkdownContent({ children }: { children: string }) {
  return (
    <div className="prose prose-invert prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-lg prose-pre:p-4 prose-code:text-pink-400 prose-headings:text-white prose-a:text-blue-400 prose-strong:text-white prose-em:text-gray-300 max-w-none">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Override pre and code rendering
          pre: ({ node, ...props }) => (
            <pre className="bg-gray-800/50 p-4 rounded-lg" {...props} />
          ),
          code: ({ node, inline, ...props }) => (
            inline ? 
              <code className="bg-gray-800/50 px-1 rounded" {...props} /> :
              <code {...props} />
          ),
          // Style tables
          table: ({ node, ...props }) => (
            <table className="border-collapse border border-gray-700" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="border border-gray-700 px-4 py-2 bg-gray-800/50" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-gray-700 px-4 py-2" {...props} />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-2 rounded-lg transition-all duration-200 ${
        copied 
          ? 'bg-green-500/20 text-green-400' 
          : 'bg-gray-900/50 text-gray-400 hover:bg-gray-800/80 hover:text-white'
      }`}
      title="Copy to clipboard"
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
        </svg>
      )}
    </button>
  );
}

function TextStats({ text }: { text: string }) {
  const words = text.trim().split(/\s+/).length;
  const chars = text.length;
  
  return (
    <div className="flex gap-4 text-sm text-gray-400">
      <span>{words.toLocaleString()} words</span>
      <span>{chars.toLocaleString()} characters</span>
    </div>
  );
}

function LoadingDots({ step }: { step: string }) {
  const loadingText = {
    initial: "Generating initial content...",
    technical: "Technical tutor analyzing content...",
    creative: "Creative tutor reviewing style...",
    final: "Crafting final improvements..."
  }[step];

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="flex items-center justify-center space-x-2 mb-3">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
      </div>
      <span className="text-sm text-gray-400">{loadingText}</span>
    </div>
  );
}

function PlaceholderContent({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="text-sm italic">{text}</span>
    </div>
  );
}

function App() {
  const [prompt, setPrompt] = useState('')
  const [initialContent, setInitialContent] = useState('')
  const [technicalFeedback, setTechnicalFeedback] = useState('')
  const [creativeFeedback, setCreativeFeedback] = useState('')
  const [finalContent, setFinalContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [technicalRatings, setTechnicalRatings] = useState<any>({})
  const [creativeRatings, setCreativeRatings] = useState<any>({})
  const [error, setError] = useState('')
  const ws = useRef<WebSocket | null>(null)
  const currentStep = useRef<'initial' | 'technical' | 'creative' | 'final'>('initial')

  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [])

  const handleMessage = (message: MessageEvent) => {
    const data = JSON.parse(message.data)
    if (data.type === 'content') {
      try {
        // Try to parse as JSON first
        const jsonData = JSON.parse(data.content)
        if (jsonData.feedback) {
          // If it's a feedback message, just use the feedback text
          if (currentStep.current === 'technical') {
            setTechnicalFeedback(jsonData.feedback)
          } else if (currentStep.current === 'creative') {
            setCreativeFeedback(jsonData.feedback)
          }
        }
      } catch (e) {
        // If it's not JSON, handle as regular content
        if (currentStep.current === 'initial') {
          setInitialContent(prev => prev + data.content)
        } else if (currentStep.current === 'technical') {
          setTechnicalFeedback(prev => prev + data.content)
        } else if (currentStep.current === 'creative') {
          setCreativeFeedback(prev => prev + data.content)
        } else if (currentStep.current === 'final') {
          setFinalContent(prev => prev + data.content)
        }
      }
    } else if (data.type === 'ratings') {
      if (currentStep.current === 'technical') {
        setTechnicalRatings(data.content)
      } else if (currentStep.current === 'creative') {
        setCreativeRatings(data.content)
      }
    } else if (data.type === 'error') {
      setError(data.content)
      setLoading(false)
    } else if (data.type === 'done') {
      handleNextStep()
    }
  }

  const handleNextStep = () => {
    if (currentStep.current === 'initial') {
      currentStep.current = 'technical'
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          messages: [
            { role: "system", content: "You are a technical tutor. Please evaluate the content for structure, clarity, and technical accuracy." },
            { role: "user", content: initialContent }
          ]
        }))
      }
    } else if (currentStep.current === 'technical') {
      currentStep.current = 'creative'
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          messages: [
            { role: "system", content: "You are a creative tutor. Please assess the content for engagement, style, and impact." },
            { role: "user", content: initialContent }
          ]
        }))
      }
    } else if (currentStep.current === 'creative') {
      currentStep.current = 'final'
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          messages: [
            { role: "system", content: "You are a professional content editor. Based on the technical and creative feedback provided, improve the content while maintaining its core message. Focus on clarity, engagement, and impact." },
            { role: "user", content: `Original Content: ${initialContent}\n\nTechnical Feedback: ${technicalFeedback}\n\nCreative Feedback: ${creativeFeedback}\n\nPlease improve the content based on this feedback.` }
          ]
        }))
      }
    } else if (currentStep.current === 'final') {
      setLoading(false)
      if (ws.current) {
        ws.current.close()
      }
    }
  }

  const generateContent = async () => {
    setLoading(true)
    setInitialContent('')
    setTechnicalFeedback('')
    setCreativeFeedback('')
    setFinalContent('')
    setTechnicalRatings({})
    setCreativeRatings({})
    currentStep.current = 'initial'
    
    if (ws.current) {
      ws.current.close()
    }

    try {
      ws.current = new WebSocket('ws://localhost:8080/ws/generate')
      
      ws.current.onopen = () => {
        if (ws.current) {
          ws.current.send(JSON.stringify({ prompt }))
        }
      }

      ws.current.onmessage = handleMessage

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setError('Connection error')
        setLoading(false)
      }

      ws.current.onclose = () => {
        console.log('WebSocket closed')
        if (loading) {
          setError('Connection closed')
          setLoading(false)
        }
      }
    } catch (error) {
      console.error('Error setting up WebSocket:', error)
      setError('Failed to connect')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="w-full min-h-screen px-4 py-8">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
            Elevate AI
          </h1>
          <p className="text-gray-400 text-lg">
            Transform your content with AI-powered analysis and enhancement
          </p>
        </div>

        {/* Input Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gray-800/50 p-6 rounded-xl shadow-xl border border-gray-700">
            <textarea
              className="w-full h-32 bg-gray-900/50 text-white p-4 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200 mb-4"
              placeholder="Enter your content here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition duration-200 flex items-center justify-center"
              onClick={generateContent}
              disabled={loading || !prompt.trim()}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>{error || 'Generating...'}</span>
                </div>
              ) : (
                'Elevate Your Content'
              )}
            </button>
          </div>
        </div>

        {/* Results Section - Vertical Layout */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Initial Content */}
          <div className="bg-gray-800/50 p-6 rounded-xl shadow-xl border border-gray-700 transition duration-300 hover:border-blue-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">1</div>
                <h2 className="text-2xl font-semibold text-blue-400">Initial Content</h2>
              </div>
              {initialContent && <CopyButton text={initialContent} />}
            </div>
            <div className="min-h-[100px] prose prose-invert max-w-none relative">
              {loading && currentStep.current === 'initial' && <LoadingDots step="initial" />}
              {initialContent ? (
                <>
                  <MarkdownContent>{initialContent}</MarkdownContent>
                  <div className="mt-4 border-t border-gray-700 pt-4">
                    <TextStats text={initialContent} />
                  </div>
                </>
              ) : !loading && (
                <PlaceholderContent text="Generated content will appear here..." />
              )}
            </div>
          </div>

          {/* Analysis Section - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Technical Analysis */}
            <div className="bg-gray-800/50 p-6 rounded-xl shadow-xl border border-gray-700 transition duration-300 hover:border-purple-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-3">2</div>
                  <h2 className="text-2xl font-semibold text-purple-400">Technical Analysis</h2>
                </div>
                {technicalFeedback && <CopyButton text={technicalFeedback} />}
              </div>
              <div className="min-h-[200px] relative">
                {loading && currentStep.current === 'technical' && <LoadingDots step="technical" />}
                {Object.keys(technicalRatings).length > 0 ? (
                  <div className="mb-6 space-y-4">
                    <RatingBar value={technicalRatings.clarity || 0} label="Clarity" color="bg-blue-500" />
                    <RatingBar value={technicalRatings.structure || 0} label="Structure" color="bg-indigo-500" />
                    <RatingBar value={technicalRatings.technical_accuracy || 0} label="Technical Accuracy" color="bg-purple-500" />
                    <RatingBar value={technicalRatings.completeness || 0} label="Completeness" color="bg-violet-500" />
                  </div>
                ) : !loading && (
                  <div className="mb-6 space-y-4 opacity-50">
                    <RatingBar value={0} label="Clarity" color="bg-blue-500" />
                    <RatingBar value={0} label="Structure" color="bg-indigo-500" />
                    <RatingBar value={0} label="Technical Accuracy" color="bg-purple-500" />
                    <RatingBar value={0} label="Completeness" color="bg-violet-500" />
                  </div>
                )}
                <div className="prose prose-invert max-w-none">
                  {technicalFeedback ? (
                    <>
                      <MarkdownContent>{technicalFeedback}</MarkdownContent>
                      <div className="mt-4 border-t border-gray-700 pt-4">
                        <TextStats text={technicalFeedback} />
                      </div>
                    </>
                  ) : !loading && (
                    <PlaceholderContent text="Technical feedback will appear here..." />
                  )}
                </div>
              </div>
            </div>

            {/* Creative Analysis */}
            <div className="bg-gray-800/50 p-6 rounded-xl shadow-xl border border-gray-700 transition duration-300 hover:border-pink-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center mr-3">3</div>
                  <h2 className="text-2xl font-semibold text-pink-400">Creative Analysis</h2>
                </div>
                {creativeFeedback && <CopyButton text={creativeFeedback} />}
              </div>
              <div className="min-h-[200px] relative">
                {loading && currentStep.current === 'creative' && <LoadingDots step="creative" />}
                {Object.keys(creativeRatings).length > 0 ? (
                  <div className="mb-6 space-y-4">
                    <RatingBar value={creativeRatings.engagement || 0} label="Engagement" color="bg-pink-500" />
                    <RatingBar value={creativeRatings.style || 0} label="Style" color="bg-rose-500" />
                    <RatingBar value={creativeRatings.impact || 0} label="Impact" color="bg-red-500" />
                    <RatingBar value={creativeRatings.innovation || 0} label="Innovation" color="bg-orange-500" />
                  </div>
                ) : !loading && (
                  <div className="mb-6 space-y-4 opacity-50">
                    <RatingBar value={0} label="Engagement" color="bg-pink-500" />
                    <RatingBar value={0} label="Style" color="bg-rose-500" />
                    <RatingBar value={0} label="Impact" color="bg-red-500" />
                    <RatingBar value={0} label="Innovation" color="bg-orange-500" />
                  </div>
                )}
                <div className="prose prose-invert max-w-none">
                  {creativeFeedback ? (
                    <>
                      <MarkdownContent>{creativeFeedback}</MarkdownContent>
                      <div className="mt-4 border-t border-gray-700 pt-4">
                        <TextStats text={creativeFeedback} />
                      </div>
                    </>
                  ) : !loading && (
                    <PlaceholderContent text="Creative feedback will appear here..." />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Final Content */}
          <div className="bg-gray-800/50 p-6 rounded-xl shadow-xl border border-gray-700 transition duration-300 hover:border-green-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mr-3">4</div>
                <h2 className="text-2xl font-semibold text-green-400">Elevated Content</h2>
              </div>
              {finalContent && <CopyButton text={finalContent} />}
            </div>
            <div className="min-h-[100px] prose prose-invert max-w-none relative">
              {loading && currentStep.current === 'final' && <LoadingDots step="final" />}
              {finalContent ? (
                <>
                  <MarkdownContent>{finalContent}</MarkdownContent>
                  <div className="mt-4 border-t border-gray-700 pt-4">
                    <TextStats text={finalContent} />
                  </div>
                </>
              ) : !loading && (
                <PlaceholderContent text="Enhanced content will appear here..." />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
