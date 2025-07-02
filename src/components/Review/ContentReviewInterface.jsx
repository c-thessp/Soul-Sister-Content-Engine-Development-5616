import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { useSupabase } from '../../hooks/useSupabase'
import { createNotionPage } from '../../config/notion'

const { FiEye, FiDownload, FiCheck, FiX, FiExternalLink, FiLoader } = FiIcons

const ContentReviewInterface = ({ transcript }) => {
  const [activeTab, setActiveTab] = useState('insights')
  const [content, setContent] = useState({})
  const [approvalStates, setApprovalStates] = useState({})
  const [notionStatus, setNotionStatus] = useState({})
  const { getTranscripts, updateContentApproval } = useSupabase()

  const tabs = [
    { id: 'insights', label: 'Extracted Insights', icon: FiEye },
    { id: 'book-chapter', label: 'Book Chapter', icon: FiEye },
    { id: 'facebook', label: 'Facebook Content', icon: FiEye },
    { id: 'substack', label: 'Substack Content', icon: FiEye },
    { id: 'instagram', label: 'Instagram Content', icon: FiEye }
  ]

  useEffect(() => {
    loadContent()
  }, [transcript])

  const loadContent = async () => {
    try {
      const transcripts = await getTranscripts()
      const currentTranscript = transcripts.find(t => t.id === transcript.id)
      
      if (currentTranscript) {
        const contentData = {}
        
        // Load insights
        if (currentTranscript.insights?.length > 0) {
          contentData.insights = currentTranscript.insights[0]
        }
        
        // Load generated content
        currentTranscript.content?.forEach(item => {
          contentData[item.type] = item
        })
        
        setContent(contentData)
      }
    } catch (error) {
      console.error('Error loading content:', error)
    }
  }

  const handleApproval = async (contentId, contentType, approved) => {
    try {
      setApprovalStates(prev => ({ ...prev, [contentId]: 'updating' }))
      
      await updateContentApproval(contentId, approved)
      
      // If approved and it's a book chapter, send to Notion
      if (approved && contentType === 'book-chapter') {
        await sendToNotion(content[contentType])
      }
      
      setApprovalStates(prev => ({ ...prev, [contentId]: approved ? 'approved' : 'rejected' }))
      
      // Reload content to get updated approval status
      await loadContent()
      
    } catch (error) {
      console.error('Error updating approval:', error)
      setApprovalStates(prev => ({ ...prev, [contentId]: 'error' }))
    }
  }

  const sendToNotion = async (bookChapter) => {
    try {
      setNotionStatus(prev => ({ ...prev, [bookChapter.id]: 'sending' }))
      
      await createNotionPage(
        bookChapter.title || `Chapter from ${transcript.filename}`,
        bookChapter.content,
        {
          transcriptSource: transcript.filename,
          generatedAt: bookChapter.created_at
        }
      )
      
      setNotionStatus(prev => ({ ...prev, [bookChapter.id]: 'success' }))
      
    } catch (error) {
      console.error('Error sending to Notion:', error)
      setNotionStatus(prev => ({ ...prev, [bookChapter.id]: 'error' }))
    }
  }

  const downloadContent = (contentData, filename) => {
    const blob = new Blob([contentData], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderContent = () => {
    const currentContent = content[activeTab]
    
    if (!currentContent) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No content available for this tab</p>
          <p className="text-gray-400 text-sm mt-2">Generate content first to see it here</p>
        </div>
      )
    }

    const isApproved = currentContent.approved
    const approvalState = approvalStates[currentContent.id]
    const notionState = notionStatus[currentContent.id]

    return (
      <div className="space-y-6">
        {/* Approval Controls */}
        {activeTab !== 'insights' && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Approval Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isApproved ? 'Approved' : 'Pending Review'}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Notion Status for Book Chapters */}
              {activeTab === 'book-chapter' && notionState && (
                <div className="flex items-center space-x-2">
                  {notionState === 'sending' ? (
                    <>
                      <SafeIcon icon={FiLoader} className="w-4 h-4 animate-spin text-blue-500" />
                      <span className="text-sm text-blue-600">Sending to Notion...</span>
                    </>
                  ) : notionState === 'success' ? (
                    <>
                      <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Sent to Notion</span>
                    </>
                  ) : (
                    <>
                      <SafeIcon icon={FiX} className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">Notion error</span>
                    </>
                  )}
                </div>
              )}
              
              <button
                onClick={() => downloadContent(
                  currentContent.content, 
                  `${activeTab}-${transcript.filename.replace(/\.[^/.]+$/, '')}.txt`
                )}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
              >
                <SafeIcon icon={FiDownload} className="w-4 h-4" />
                <span>Download</span>
              </button>
              
              <button
                onClick={() => handleApproval(currentContent.id, activeTab, !isApproved)}
                disabled={approvalState === 'updating'}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isApproved 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } disabled:opacity-50`}
              >
                {approvalState === 'updating' ? (
                  <SafeIcon icon={FiLoader} className="w-4 h-4 animate-spin" />
                ) : (
                  <SafeIcon icon={isApproved ? FiX : FiCheck} className="w-4 h-4" />
                )}
                <span>{isApproved ? 'Reject' : 'Approve'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Display */}
        <div className="bg-white border rounded-lg p-6">
          {currentContent.title && (
            <h3 className="text-xl font-heading font-semibold text-gray-900 mb-4">
              {currentContent.title}
            </h3>
          )}
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {currentContent.content}
            </pre>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <SafeIcon icon={tab.icon} className="w-4 h-4" />
                <span>{tab.label}</span>
                {content[tab.id]?.approved && (
                  <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-500" />
                )}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default ContentReviewInterface