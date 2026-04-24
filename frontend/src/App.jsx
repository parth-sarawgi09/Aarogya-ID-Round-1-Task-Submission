import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import ProfileForm from './components/ProfileForm'
import ChatInterface from './components/ChatInterface'
import AdminPanel from './components/AdminPanel'
import useStore from './store/useStore'
import { HeartPulse, Settings } from 'lucide-react'

function MainApp() {
  const { sessionId, clearSession } = useStore()

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <HeartPulse className="text-brand-600" size={28} />
              <span className="text-xl font-bold text-gray-900">AarogyaAid AI</span>
            </Link>
            <div className="flex items-center gap-4">
              {sessionId && (
                <button 
                  onClick={clearSession}
                  className="text-sm text-gray-500 hover:text-brand-600 transition-colors"
                >
                  Start New Session
                </button>
              )}
              <Link to="/admin" className="text-gray-400 hover:text-gray-600">
                <Settings size={20} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!sessionId ? (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                Find Your Perfect Health Insurance
              </h1>
              <p className="text-lg text-gray-500">
                Tell us about yourself, and our AI agent will analyze documents to find and compare the best policies for you.
              </p>
            </div>
            <ProfileForm onComplete={() => window.scrollTo({top: 0, behavior: 'smooth'})} />
          </div>
        ) : (
          <ChatInterface />
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  )
}
