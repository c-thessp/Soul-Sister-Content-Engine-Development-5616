import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

export const useSupabase = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const uploadTranscript = async (file, metadata = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      // Read file content
      const content = await file.text()
      
      // Insert transcript record
      const { data: transcript, error: insertError } = await supabase
        .from('transcripts')
        .insert([
          {
            filename: file.name,
            content,
            status: 'uploaded',
            metadata
          }
        ])
        .select()
        .single()

      if (insertError) throw insertError

      return transcript
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const extractInsights = async (transcriptId) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.functions.invoke('extract-insights', {
        body: { transcript_id: transcriptId }
      })

      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const generateContent = async (type, transcriptId) => {
    setLoading(true)
    setError(null)
    
    try {
      const functionName = `generate-${type}-content`
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { transcript_id: transcriptId }
      })

      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getTranscripts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('transcripts')
        .select(`
          *,
          insights(*),
          content(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateContentApproval = async (contentId, approved) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('content')
        .update({ approved, approved_at: approved ? new Date().toISOString() : null })
        .eq('id', contentId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    uploadTranscript,
    extractInsights,
    generateContent,
    getTranscripts,
    updateContentApproval
  }
}