import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { useSupabase } from '../../hooks/useSupabase'

const { FiClock, FiCheck, FiX, FiEye, FiSearch, FiFilter } = FiIcons

const ProcessingHistory = ({ onSelectTranscript }) => {
  const [transcripts, setTranscripts] = useState([])
  const [filteredTranscripts, setFilteredTranscripts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { getTranscripts, loading } = useSupabase()

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    filterTranscripts()
  }, [transcripts, searchTerm, statusFilter])

  const loadHistory = async () => {
    try {
      const data = await getTranscripts()
      setTranscripts(data)
    } catch (error) {
      console.error('Error loading history:', error)
    }
  }

  const filterTranscripts = () => {
    let filtered = transcripts

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transcript =>
        transcript.filename.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(transcript => {
        const hasApprovedContent = transcript.content?.some(c => c.approved)
        switch (statusFilter) {
          case 'approved':
            return hasApprovedContent
          case 'pending':
            return transcript.content?.length > 0 && !hasApprovedContent
          case 'processed':
            return transcript.content?.length > 0
          default:
            return true
        }
      })
    }

    setFilteredTranscripts(filtered)
  }

  const getStatusInfo = (transcript) => {
    const hasInsights = transcript.insights?.length > 0
    const hasContent = transcript.content?.length > 0
    const hasApprovedContent = transcript.content?.some(c => c.approved)

    if (hasApprovedContent) {
      return { status: 'approved', label: 'Approved', color: 'green' }
    } else if (hasContent) {
      return { status: 'pending', label: 'Pending Review', color: 'yellow' }
    } else if (hasInsights) {
      return { status: 'processed', label: 'Insights Extracted', color: 'blue' }
    } else {
      return { status: 'uploaded', label: 'Uploaded', color: 'gray' }
    }
  }

  const getContentTypeCount = (transcript) => {
    return transcript.content?.length || 0
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <SafeIcon icon={FiClock} className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600">Loading processing history...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
          Processing History
        </h2>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search transcripts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending Review</option>
              <option value="processed">Processed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredTranscripts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-lg">No transcripts found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Upload your first transcript to get started'
              }
            </p>
          </div>
        ) : (
          filteredTranscripts.map((transcript, index) => {
            const statusInfo = getStatusInfo(transcript)
            const contentCount = getContentTypeCount(transcript)
            
            return (
              <motion.div
                key={transcript.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onSelectTranscript(transcript)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">{transcript.filename}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                        statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        statusInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {statusInfo.label}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{format(new Date(transcript.created_at), 'MMM d, yyyy')}</span>
                      {contentCount > 0 && (
                        <span>{contentCount} content type{contentCount !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectTranscript(transcript)
                      }}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <SafeIcon icon={FiEye} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </motion.div>
  )
}

export default ProcessingHistory