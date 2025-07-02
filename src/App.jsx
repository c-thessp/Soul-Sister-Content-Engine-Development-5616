import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Layout/Header'
import TranscriptUpload from './components/Upload/TranscriptUpload'
import ContentGenerationDashboard from './components/Dashboard/ContentGenerationDashboard'
import ContentReviewInterface from './components/Review/ContentReviewInterface'
import ProcessingHistory from './components/History/ProcessingHistory'

function App() {
  const [currentTranscript, setCurrentTranscript] = useState(null)
  const [activeView, setActiveView] = useState('upload') // upload, generate, review, history

  const handleUploadComplete = (transcript) => {
    setCurrentTranscript(transcript)
    setActiveView('generate')
  }

  const handleContentGenerated = (type, content) => {
    // Refresh current transcript data or update state as needed
    setActiveView('review')
  }

  const handleSelectTranscript = (transcript) => {
    setCurrentTranscript(transcript)
    setActiveView('review')
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'upload':
        return <TranscriptUpload onUploadComplete={handleUploadComplete} />
      
      case 'generate':
        return currentTranscript ? (
          <ContentGenerationDashboard 
            transcript={currentTranscript}
            onContentGenerated={handleContentGenerated}
          />
        ) : null
      
      case 'review':
        return currentTranscript ? (
          <ContentReviewInterface transcript={currentTranscript} />
        ) : null
      
      case 'history':
        return <ProcessingHistory onSelectTranscript={handleSelectTranscript} />
      
      default:
        return <TranscriptUpload onUploadComplete={handleUploadComplete} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            {[
              { id: 'upload', label: 'Upload' },
              { id: 'generate', label: 'Generate', disabled: !currentTranscript },
              { id: 'review', label: 'Review', disabled: !currentTranscript },
              { id: 'history', label: 'History' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => !item.disabled && setActiveView(item.id)}
                disabled={item.disabled}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeView === item.id
                    ? 'bg-primary-500 text-white'
                    : item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Current Transcript Info */}
        {currentTranscript && activeView !== 'history' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-4 mb-6 border-l-4 border-primary-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Transcript:</p>
                <p className="font-medium text-gray-900">{currentTranscript.filename}</p>
              </div>
              <button
                onClick={() => {
                  setCurrentTranscript(null)
                  setActiveView('upload')
                }}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear & Upload New
              </button>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App