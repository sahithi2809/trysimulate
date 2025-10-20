import { supabase } from '../config/supabaseClient'

/**
 * Secure AI Service
 * Calls Supabase Edge Functions which securely access OpenAI
 * API keys are never exposed to the browser
 */

const EDGE_FUNCTION_NAME = 'ai-generate'

/**
 * Call the secure Edge Function
 */
async function callEdgeFunction(action, payload) {
  try {
    const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
      body: {
        action,
        payload
      }
    })

    if (error) {
      console.error('Edge Function error:', error)
      throw new Error(error.message || 'Failed to call AI service')
    }

    if (!data.success) {
      throw new Error(data.error || 'AI service returned error')
    }

    return data.data
  } catch (error) {
    console.error('Error calling Edge Function:', error)
    throw error
  }
}

/**
 * Analyze user prompt to determine simulation structure
 */
export const analyzePrompt = async (userPrompt) => {
  try {
    console.log('🔍 Analyzing prompt securely via Edge Function...')
    
    const analysis = await callEdgeFunction('analyzePrompt', {
      userPrompt
    })
    
    console.log('✅ Prompt analysis complete:', analysis)
    return analysis
  } catch (error) {
    console.error('Failed to analyze prompt:', error)
    throw new Error(`Failed to analyze prompt: ${error.message}`)
  }
}

/**
 * Generate simulation based on analysis
 */
export const generateSimulation = async (analysis, originalPrompt) => {
  try {
    console.log('🎯 Generating simulation securely via Edge Function...')
    
    const simulation = await callEdgeFunction('generateSimulation', {
      analysis,
      originalPrompt
    })
    
    console.log('✅ Simulation generated:', simulation)
    return simulation
  } catch (error) {
    console.error('Failed to generate simulation:', error)
    throw new Error(`Failed to generate simulation: ${error.message}`)
  }
}

/**
 * Regenerate simulation with user feedback
 */
export const regenerateSimulation = async (currentSimulation, feedback) => {
  try {
    console.log('🔄 Regenerating simulation securely via Edge Function...')
    
    const simulation = await callEdgeFunction('regenerateSimulation', {
      currentSimulation,
      feedback
    })
    
    console.log('✅ Simulation regenerated:', simulation)
    return simulation
  } catch (error) {
    console.error('Failed to regenerate simulation:', error)
    throw new Error(`Failed to regenerate simulation: ${error.message}`)
  }
}

/**
 * Test connection to Edge Function
 */
export const testEdgeFunctionConnection = async () => {
  try {
    console.log('🔍 Testing Edge Function connection...')
    
    // Try to analyze a simple test prompt
    const result = await analyzePrompt('Test: Create a simple customer service simulation')
    
    console.log('✅ Edge Function connection successful!')
    return true
  } catch (error) {
    console.error('❌ Edge Function connection failed:', error)
    return false
  }
}

