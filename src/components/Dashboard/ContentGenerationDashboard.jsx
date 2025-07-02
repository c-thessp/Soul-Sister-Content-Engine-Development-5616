import React, { useState } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'
import { useSupabase } from '../../hooks/useSupabase'

const { FiBook, FiFacebook, FiMail, FiInstagram, FiLoader, FiCheck } = FiIcons

const ContentGenerationDashboard = ({ transcript, onContentGenerated }) => {
  const [generationStates, setGenerationStates] = useState({})
  const { generateContent } = useSupabase()

  const contentTypes = [
    {
      id: 'book-chapter',
      title: 'Generate Book Chapter',
      description: 'Create a compelling book chapter from your insights',
      icon: FiBook,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'from-purple-600 to-purple-700'
    },
    {
      id: 'facebook',
      title: 'Generate Facebook Content',
      description: 'Posts and group strategy for Facebook engagement',
      icon: FiFacebook,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'from-blue-600 to-blue-700'
    },
    {
      id: 'substack',
      title: 'Generate Substack Content',
      description: 'Newsletter content optimized for Substack',
      icon: FiMail,
      color: 'from-orange-500 to-orange-600',
      hoverColor: 'from-orange-600 to-orange-700'
    },
    {
      id: 'instagram',
      title: 'Generate Instagram Content',
      description: 'Posts, stories, and reels for Instagram',
      icon: FiInstagram,
      color: 'from-pink-500 to-pink-600',
      hoverColor: 'from-pink-600 to-pink-700'
    }
  ]

  const handleGenerate = async (type) => {
    setGenerationStates(prev => ({
      ...prev,
      [type]: { status: 'generating', message: 'Generating content...' }
    }))

    try {
      const content = await generateContent(type, transcript.id)
      
      setGenerationStates(prev => ({
        ...prev,
        [type]: { status: 'success', message: 'Content generated successfully!' }
      }))

      if (onContentGenerated) {
        onContentGenerated(type, content)
      }

      // Reset status after 3 seconds
      setTimeout(() => {
        setGenerationStates(prev => ({
          ...prev,
          [type]: null
        }))
      }, 3000)

    } catch (error) {
      setGenerationStates(prev => ({
        ...prev,
        [type]: { status: 'error', message: error.message || 'Generation failed' }
      }))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-8"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
          Content Generation
        </h2>
        <p className="text-gray-600">
          Generate content from transcript: <span className="font-medium">{transcript.filename}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contentTypes.map((contentType, index) => {
          const state = generationStates[contentType.id]
          
          return (
            <motion.div
              key={contentType.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden"
            >
              <button
                onClick={() => handleGenerate(contentType.id)}
                disabled={state?.status === 'generating'}
                className={`w-full p-6 rounded-xl bg-gradient-to-r ${contentType.color} hover:${contentType.hoverColor} text-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    {state?.status === 'generating' ? (
                      <SafeIcon icon={FiLoader} className="w-6 h-6 animate-spin" />
                    ) : state?.status === 'success' ? (
                      <SafeIcon icon={FiCheck} className="w-6 h-6" />
                    ) : (
                      <SafeIcon icon={contentType.icon} className="w-6 h-6" />
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-lg mb-1">{contentType.title}</h3>
                    <p className="text-white/80 text-sm">
                      {state?.message || contentType.description}
                    </p>
                  </div>
                </div>
              </button>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default ContentGenerationDashboard