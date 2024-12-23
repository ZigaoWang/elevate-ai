import { useState, useEffect, useRef } from 'react'
import './App.css'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ReactDiffViewer from 'react-diff-viewer-continued'

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

function DiffView({ oldContent, newContent }: { oldContent: string; newContent: string }) {
  const [showDiff, setShowDiff] = useState(false)

  return (
    <div>
      <button
        onClick={() => setShowDiff(true)}
        className="mt-6 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-200 font-semibold shadow-lg flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9 1a1 1 0 10-2 0v6a1 1 0 102 0V6zm-4 1a1 1 0 10-2 0v4a1 1 0 102 0V7z" clipRule="evenodd" />
        </svg>
        View Changes
      </button>
      
      {/* Full Screen Modal */}
      {showDiff && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col">
          {/* Modal Header */}
          <div className="bg-gray-900 p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm9 3a1 1 0 10-2 0v6a1 1 0 102 0V5zm-4 1a1 1 0 10-2 0v4a1 1 0 102 0V6z" clipRule="evenodd" />
              </svg>
              Content Changes
            </h2>
            <button
              onClick={() => setShowDiff(false)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Modal Content */}
          <div className="flex-1 overflow-auto p-4">
            <div className="h-full max-w-[90%] mx-auto">
              <ReactDiffViewer
                oldValue={oldContent}
                newValue={newContent}
                splitView={true}
                useDarkTheme={true}
                hideLineNumbers={false}
                styles={{
                  variables: {
                    dark: {
                      diffViewerBackground: 'transparent',
                      diffViewerColor: '#fff',
                      addedBackground: '#1e462d',
                      addedColor: '#4ade80',
                      removedBackground: '#462029',
                      removedColor: '#ff8ba7',
                      wordAddedBackground: '#2c5e3c',
                      wordRemovedBackground: '#5e2c3c',
                      codeFoldGutterBackground: 'transparent',
                      codeFoldBackground: '#182130',
                      emptyLineBackground: 'transparent',
                    }
                  },
                  line: {
                    fontSize: '1rem',
                    lineHeight: '1.5'
                  },
                  content: {
                    width: '50%'  // Set both sides to 50%
                  },
                  contentText: {
                    width: '100%'  // Ensure text takes full width of its container
                  },
                  gutter: {
                    width: '50px',  // Smaller gutter
                    padding: '0 0.5rem'  // Reduced padding
                  }
                }}
                leftTitle={
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clipRule="evenodd" />
                    </svg>
                    Original Content
                  </div>
                }
                rightTitle={
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Elevated Content
                  </div>
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  const [prompt, setPrompt] = useState('')
  const [initialContent, setInitialContent] = useState('')
  const [technicalFeedback, setTechnicalFeedback] = useState('')
  const [creativeFeedback, setCreativeFeedback] = useState('')
  const [finalContent, setFinalContent] = useState('')
  const [technicalRatings, setTechnicalRatings] = useState<Ratings>({})
  const [creativeRatings, setCreativeRatings] = useState<Ratings>({})
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const ws = useRef<WebSocket | null>(null)
  const currentSection = useRef<'initial' | 'technical' | 'creative' | 'final'>('initial')

  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [])

  const generateContent = async () => {
    setLoading(true)
    setInitialContent('')
    setTechnicalFeedback('')
    setCreativeFeedback('')
    setFinalContent('')
    setTechnicalRatings({})
    setCreativeRatings({})
    currentSection.current = 'initial'
    
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

      ws.current.onmessage = (event) => {
        try {
          const message: Message = JSON.parse(event.data)
          
          switch (message.type) {
            case 'status':
              setStatus(message.content || '')
              if (message.content?.includes('technical')) {
                currentSection.current = 'technical'
              } else if (message.content?.includes('creative')) {
                currentSection.current = 'creative'
              } else if (message.content?.includes('final')) {
                currentSection.current = 'final'
              }
              break
              
            case 'content':
              switch (currentSection.current) {
                case 'initial':
                  setInitialContent(prev => prev + (message.content || ''))
                  break
                case 'technical':
                  setTechnicalFeedback(prev => prev + (message.content || ''))
                  break
                case 'creative':
                  setCreativeFeedback(prev => prev + (message.content || ''))
                  break
                case 'final':
                  setFinalContent(prev => prev + (message.content || ''))
                  break
              }
              break
              
            case 'ratings':
              if (currentSection.current === 'technical') {
                setTechnicalRatings(message.content)
              } else if (currentSection.current === 'creative') {
                setCreativeRatings(message.content)
              }
              break
              
            case 'done':
              setLoading(false)
              setStatus('')
              break
              
            case 'error':
              console.error('Error:', message.content)
              setLoading(false)
              setStatus(`Error: ${message.content}`)
              break
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
          setStatus('Error processing response')
          setLoading(false)
        }
      }

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setStatus('Connection error')
        setLoading(false)
      }

      ws.current.onclose = () => {
        console.log('WebSocket closed')
        if (loading) {
          setStatus('Connection closed')
          setLoading(false)
        }
      }
    } catch (error) {
      console.error('Error setting up WebSocket:', error)
      setStatus('Failed to connect')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="w-full min-h-screen px-4 py-8">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Elevate AI
          </h1>
          <p className="text-xl text-gray-300 mb-8">Transform your content with AI-powered refinement and expert analysis</p>
          
          {/* Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <ProcessStep 
              number={1} 
              title="Initial Generation" 
              description="Your prompt is transformed into polished content by our advanced AI"
            />
            <ProcessStep 
              number={2} 
              title="Technical Analysis" 
              description="Our technical tutor evaluates structure, clarity, and accuracy"
            />
            <ProcessStep 
              number={3} 
              title="Creative Review" 
              description="Our creative tutor assesses engagement, style, and impact"
            />
            <ProcessStep 
              number={4} 
              title="Final Refinement" 
              description="All feedback is incorporated into an elevated final version"
            />
          </div>
        </div>
        
        {/* Input Section */}
        <div className="w-full max-w-4xl mx-auto mb-12">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-6 bg-gray-800/50 border border-gray-700 rounded-xl shadow-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="Enter your prompt here..."
            rows={4}
          />
          <button
            onClick={generateContent}
            disabled={loading || !prompt}
            className="mt-4 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition duration-200 font-semibold shadow-lg w-full sm:w-auto relative overflow-hidden group"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>{status || 'Generating...'}</span>
              </div>
            ) : (
              'Elevate Your Content'
            )}
          </button>
        </div>

        {/* Results Section */}
        {(initialContent || technicalFeedback || creativeFeedback || finalContent) && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Initial Content */}
            <div className="space-y-6">
              <div className="bg-gray-800/50 p-6 rounded-xl shadow-xl border border-gray-700 transition duration-300 hover:border-blue-500">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">1</div>
                  <h2 className="text-2xl font-semibold text-blue-400">Initial Content</h2>
                </div>
                <MarkdownContent>{initialContent}</MarkdownContent>
              </div>
            </div>

            {/* Analysis Column */}
            <div className="space-y-6">
              {/* Technical Analysis */}
              <div className="bg-gray-800/50 p-6 rounded-xl shadow-xl border border-gray-700 transition duration-300 hover:border-purple-500">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-3">2</div>
                  <h2 className="text-2xl font-semibold text-purple-400">Technical Analysis</h2>
                </div>
                {Object.keys(technicalRatings).length > 0 && (
                  <div className="mb-6 space-y-4">
                    <RatingBar value={technicalRatings.clarity || 0} label="Clarity" color="bg-blue-500" />
                    <RatingBar value={technicalRatings.structure || 0} label="Structure" color="bg-indigo-500" />
                    <RatingBar value={technicalRatings.technical_accuracy || 0} label="Technical Accuracy" color="bg-purple-500" />
                    <RatingBar value={technicalRatings.completeness || 0} label="Completeness" color="bg-violet-500" />
                  </div>
                )}
                <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-medium text-gray-300 mb-2">Feedback</h3>
                  <MarkdownContent>{technicalFeedback}</MarkdownContent>
                </div>
              </div>

              {/* Creative Analysis */}
              <div className="bg-gray-800/50 p-6 rounded-xl shadow-xl border border-gray-700 transition duration-300 hover:border-pink-500">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center mr-3">3</div>
                  <h2 className="text-2xl font-semibold text-pink-400">Creative Analysis</h2>
                </div>
                {Object.keys(creativeRatings).length > 0 && (
                  <div className="mb-6 space-y-4">
                    <RatingBar value={creativeRatings.engagement || 0} label="Engagement" color="bg-pink-500" />
                    <RatingBar value={creativeRatings.style || 0} label="Style" color="bg-rose-500" />
                    <RatingBar value={creativeRatings.impact || 0} label="Impact" color="bg-red-500" />
                    <RatingBar value={creativeRatings.innovation || 0} label="Innovation" color="bg-orange-500" />
                  </div>
                )}
                <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <h3 className="text-lg font-medium text-gray-300 mb-2">Feedback</h3>
                  <MarkdownContent>{creativeFeedback}</MarkdownContent>
                </div>
              </div>
            </div>

            {/* Final Content */}
            <div className="space-y-6">
              <div className="bg-gray-800/50 p-6 rounded-xl shadow-xl border border-gray-700 transition duration-300 hover:border-green-500 sticky top-4">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mr-3">4</div>
                  <h2 className="text-2xl font-semibold text-green-400">Elevated Content</h2>
                </div>
                <MarkdownContent>{finalContent}</MarkdownContent>
                
                {/* Diff View */}
                {initialContent && finalContent && (
                  <DiffView oldContent={initialContent} newContent={finalContent} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
