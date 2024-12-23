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
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">1</div>
              <h2 className="text-2xl font-semibold text-blue-400">Initial Content</h2>
            </div>
            <div className="min-h-[100px] prose prose-invert max-w-none">
              {initialContent ? (
                <MarkdownContent>{initialContent}</MarkdownContent>
              ) : (
                <div className="text-gray-500 italic">Generated content will appear here...</div>
              )}
            </div>
          </div>

          {/* Analysis Section - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Technical Analysis */}
            <div className="bg-gray-800/50 p-6 rounded-xl shadow-xl border border-gray-700 transition duration-300 hover:border-purple-500">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-3">2</div>
                <h2 className="text-2xl font-semibold text-purple-400">Technical Analysis</h2>
              </div>
              <div className="min-h-[200px]">
                {Object.keys(technicalRatings).length > 0 ? (
                  <div className="mb-6 space-y-4">
                    <RatingBar value={technicalRatings.clarity || 0} label="Clarity" color="bg-blue-500" />
                    <RatingBar value={technicalRatings.structure || 0} label="Structure" color="bg-indigo-500" />
                    <RatingBar value={technicalRatings.technical_accuracy || 0} label="Technical Accuracy" color="bg-purple-500" />
                    <RatingBar value={technicalRatings.completeness || 0} label="Completeness" color="bg-violet-500" />
                  </div>
                ) : (
                  <div className="mb-6 space-y-4 opacity-50">
                    <RatingBar value={0} label="Clarity" color="bg-blue-500" />
                    <RatingBar value={0} label="Structure" color="bg-indigo-500" />
                    <RatingBar value={0} label="Technical Accuracy" color="bg-purple-500" />
                    <RatingBar value={0} label="Completeness" color="bg-violet-500" />
                  </div>
                )}
                <div className="prose prose-invert max-w-none">
                  {technicalFeedback ? (
                    <MarkdownContent>{technicalFeedback}</MarkdownContent>
                  ) : (
                    <div className="text-gray-500 italic">Technical feedback will appear here...</div>
                  )}
                </div>
              </div>
            </div>

            {/* Creative Analysis */}
            <div className="bg-gray-800/50 p-6 rounded-xl shadow-xl border border-gray-700 transition duration-300 hover:border-pink-500">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center mr-3">3</div>
                <h2 className="text-2xl font-semibold text-pink-400">Creative Analysis</h2>
              </div>
              <div className="min-h-[200px]">
                {Object.keys(creativeRatings).length > 0 ? (
                  <div className="mb-6 space-y-4">
                    <RatingBar value={creativeRatings.engagement || 0} label="Engagement" color="bg-pink-500" />
                    <RatingBar value={creativeRatings.style || 0} label="Style" color="bg-rose-500" />
                    <RatingBar value={creativeRatings.impact || 0} label="Impact" color="bg-red-500" />
                    <RatingBar value={creativeRatings.innovation || 0} label="Innovation" color="bg-orange-500" />
                  </div>
                ) : (
                  <div className="mb-6 space-y-4 opacity-50">
                    <RatingBar value={0} label="Engagement" color="bg-pink-500" />
                    <RatingBar value={0} label="Style" color="bg-rose-500" />
                    <RatingBar value={0} label="Impact" color="bg-red-500" />
                    <RatingBar value={0} label="Innovation" color="bg-orange-500" />
                  </div>
                )}
                <div className="prose prose-invert max-w-none">
                  {creativeFeedback ? (
                    <MarkdownContent>{creativeFeedback}</MarkdownContent>
                  ) : (
                    <div className="text-gray-500 italic">Creative feedback will appear here...</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Final Content */}
          <div className="bg-gray-800/50 p-6 rounded-xl shadow-xl border border-gray-700 transition duration-300 hover:border-green-500">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mr-3">4</div>
              <h2 className="text-2xl font-semibold text-green-400">Elevated Content</h2>
            </div>
            <div className="min-h-[100px] prose prose-invert max-w-none">
              {finalContent ? (
                <MarkdownContent>{finalContent}</MarkdownContent>
              ) : (
                <div className="text-gray-500 italic">Enhanced content will appear here...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
