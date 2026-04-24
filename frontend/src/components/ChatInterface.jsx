import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import useStore from '../store/useStore'
import ReactMarkdown from 'react-markdown'
import { Send, User, Bot, Loader2 } from 'lucide-react'

export default function ChatInterface() {
  const { sessionId, chatHistory, addMessage, userProfile } = useStore()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory])

  // Initial trigger
  useEffect(() => {
    if (chatHistory.length === 0 && sessionId) {
      handleSend("Please recommend health insurance policies based on my profile.")
    }
  }, [sessionId])

  const handleSend = async (text) => {
    if (!text.trim()) return
    
    addMessage({ role: 'user', content: text })
    setInput('')
    setLoading(true)

    try {
      const response = await axios.post(`http://localhost:8000/api/sessions/${sessionId}/chat`, {
        role: 'user',
        content: text
      })
      addMessage({ role: 'assistant', content: response.data.content })
    } catch (error) {
      console.error("Chat error", error)
      addMessage({ role: 'assistant', content: "Sorry, I encountered an error. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[80vh] bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-brand-600 text-white p-4 flex justify-between items-center">
        <div>
          <h2 className="font-bold text-lg">AarogyaAid Agent</h2>
          <p className="text-sm opacity-80">Recommending for {userProfile?.full_name}</p>
        </div>
        <Bot size={24} />
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
              <div className={`p-2 rounded-full flex-shrink-0 ${msg.role === 'user' ? 'bg-brand-100 text-brand-700' : 'bg-blue-100 text-blue-700'}`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 rounded-tl-sm text-gray-800'}`}>
                {msg.role === 'user' ? (
                  <p>{msg.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none prose-tables:border prose-tables:border-collapse prose-td:border prose-th:border prose-th:bg-gray-50 prose-td:p-2 prose-th:p-2">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 text-blue-700">
                <Bot size={20} />
              </div>
              <div className="p-4 bg-white border border-gray-200 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                <Loader2 className="animate-spin text-brand-600" size={20} />
                <span className="text-gray-500 text-sm">Agent is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="flex gap-2"
        >
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about waiting periods, co-pays, or specific policies..."
            className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <button 
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-brand-600 text-white p-3 rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  )
}
