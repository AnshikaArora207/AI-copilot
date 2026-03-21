import { useState, useEffect, useRef } from 'react'

const BACKEND_URL = 'http://localhost:8000'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageTitle, setPageTitle] = useState('')
  const [backendError, setBackendError] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load page title from storage when sidebar opens
  useEffect(() => {
    chrome.storage.local.get(['pageTitle'], (result) => {
      if (result.pageTitle) {
        setPageTitle(result.pageTitle)
      }
    })

    // Check if backend is running
    fetch(`${BACKEND_URL}/health`)
      .then(() => setBackendError(false))
      .catch(() => setBackendError(true))
  }, [])

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const result = await new Promise<{ pageContent?: string }>((resolve) =>
        chrome.storage.local.get(['pageContent'], resolve)
      )
      const pageContent = result.pageContent || ''

      const response = await fetch(`${BACKEND_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage, page_content: pageContent }),
      })

      if (!response.ok) throw new Error('Backend error')

      const data = await response.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }])
      setBackendError(false)
    } catch {
      setBackendError(true)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Could not reach the backend. Make sure it is running on localhost:8000.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <div className="container">
      <div className="header">
        <span className="header-title">AI Copilot</span>
        {backendError && <span className="badge error">Backend offline</span>}
        {!backendError && <span className="badge ok">Connected</span>}
      </div>

      {pageTitle && (
        <div className="page-bar">
          <span className="page-label">Page:</span>
          <span className="page-title">{pageTitle}</span>
        </div>
      )}

      <div className="messages">
        {messages.length === 0 && (
          <div className="empty">Ask me anything about this page...</div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <span className="role">{msg.role === 'user' ? 'You' : 'AI'}</span>
            <p>{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <span className="role">AI</span>
            <p className="thinking">Thinking...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about this page..."
          disabled={loading}
          autoFocus
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  )
}

export default App
