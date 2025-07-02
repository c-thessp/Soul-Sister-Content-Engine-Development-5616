import React from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import SafeIcon from '../../common/SafeIcon'

const { FiHeart, FiZap } = FiIcons

const Header = () => {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gradient-to-r from-primary-500 to-soul-500 text-white shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <SafeIcon icon={FiHeart} className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold">Soul Sister Accelerator</h1>
              <p className="text-white/80 text-sm">Content Engine v1</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full">
            <SafeIcon icon={FiZap} className="w-4 h-4" />
            <span className="text-sm font-medium">Phase 1</span>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header