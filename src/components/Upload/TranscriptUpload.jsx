import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { useSupabase } from '../../hooks/useSupabase'

const { FiUpload, FiFile, FiCheck, FiX, FiLoader } = FiIcons

const TranscriptUpload = ({ onUploadComplete }) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploadStatus, setUploadStatus] = useState(null)
  const fileInputRef = useRef(null)
  const { uploadTranscript, extractInsights, loading } = useSupabase()

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file) => {
    // Validate file type
    if (!file.name.match(/\.(txt|md)$/i)) {
      setUploadStatus({ type: 'error', message: 'Please upload a .txt or .md file' })
      return
    }

    try {
      setUploadStatus({ type: 'uploading', message: 'Uploading transcript...' })
      
      // Upload transcript
      const transcript = await uploadTranscript(file, {
        originalName: file.name,
        size: file.size,
        type: file.type
      })

      setUploadStatus({ type: 'processing', message: 'Extracting insights...' })
      
      // Extract insights
      await extractInsights(transcript.id)
      
      setUploadStatus({ type: 'success', message: 'Transcript processed successfully!' })
      
      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(transcript)
      }

      // Reset after 2 seconds
      setTimeout(() => {
        setUploadStatus(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }, 2000)

    } catch (error) {
      setUploadStatus({ type: 'error', message: error.message || 'Upload failed' })
    }
  }

  const onButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-8 border-2 border-dashed border-gray-200 hover:border-primary-300 transition-colors"
    >
      <div
        className={`relative ${dragActive ? 'bg-primary-50' : ''} rounded-lg p-8 transition-colors`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md"
          onChange={handleChange}
          className="hidden"
        />

        <div className="text-center">
          {uploadStatus ? (
            <div className="space-y-4">
              {uploadStatus.type === 'uploading' || uploadStatus.type === 'processing' ? (
                <SafeIcon icon={FiLoader} className="w-12 h-12 text-primary-500 mx-auto animate-spin" />
              ) : uploadStatus.type === 'success' ? (
                <SafeIcon icon={FiCheck} className="w-12 h-12 text-green-500 mx-auto" />
              ) : (
                <SafeIcon icon={FiX} className="w-12 h-12 text-red-500 mx-auto" />
              )}
              <p className={`text-lg font-medium ${
                uploadStatus.type === 'success' ? 'text-green-600' :
                uploadStatus.type === 'error' ? 'text-red-600' :
                'text-primary-600'
              }`}>
                {uploadStatus.message}
              </p>
            </div>
          ) : (
            <>
              <SafeIcon icon={FiUpload} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">
                Upload Your Transcript
              </h3>
              <p className="text-gray-600 mb-6">
                Drag and drop your transcript file here, or click to browse
              </p>
              <button
                onClick={onButtonClick}
                disabled={loading}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiFile} className="w-4 h-4" />
                  <span>Choose File</span>
                </div>
              </button>
              <p className="text-sm text-gray-500 mt-4">
                Supports .txt and .md files
              </p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default TranscriptUpload