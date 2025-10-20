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
    console.log('🔧 Calling Edge Function:', EDGE_FUNCTION_NAME)
    console.log('📤 Action:', action)
    console.log('📦 Payload:', payload)
    
    // Check if supabase client is initialized
    if (!supabase) {
      throw new Error('Supabase client is not initialized. Check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
    }
    
    const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
      body: {
        action,
        payload
      }
    })

    console.log('📥 Response data:', data)
    console.log('❌ Response error:', error)

    if (error) {
      console.error('Edge Function invocation error details:', {
        message: error.message,
        status: error.status,
        statusText: error.statusText,
        context: error.context
      })
      throw new Error(`Failed to send a request to the Edge Function: ${error.message || JSON.stringify(error)}`)
    }

    if (!data) {
      throw new Error('No data returned from Edge Function')
    }

    if (!data.success) {
      throw new Error(data.error || 'AI service returned error')
    }

    return data.data
  } catch (error) {
    console.error('❌ Error calling Edge Function:', error)
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    throw error
  }
}

/**
 * NEW: Generate HTML simulation directly (one-step process)
 * Uses GPT-4-turbo-preview for high-quality, free-form HTML
 */
export const generateHTMLSimulation = async (userPrompt) => {
  try {
    console.log('🚀 Generating HTML simulation with GPT-4-turbo-preview...')
    console.log('User prompt:', userPrompt)
    
    const simulation = await callEdgeFunction('generateHTMLSimulation', {
      userPrompt
    })
    
    console.log('✅ HTML Simulation generated successfully!')
    console.log('- Title:', simulation.title)
    console.log('- Category:', simulation.category)
    console.log('- HTML length:', simulation.htmlContent?.length || 0, 'characters')
    
    return simulation
  } catch (error) {
    console.error('Failed to generate HTML simulation:', error)
    throw new Error(`Failed to generate simulation: ${error.message}`)
  }
}

/**
 * NEW: Regenerate HTML simulation with feedback
 */
export const regenerateHTMLSimulation = async (currentHTML, feedback) => {
  try {
    console.log('🔄 Regenerating HTML simulation with feedback...')
    console.log('Feedback:', feedback)
    
    const simulation = await callEdgeFunction('regenerateHTMLSimulation', {
      currentHTML,
      feedback
    })
    
    console.log('✅ HTML Simulation regenerated successfully!')
    return simulation
  } catch (error) {
    console.error('Failed to regenerate HTML simulation:', error)
    throw new Error(`Failed to regenerate simulation: ${error.message}`)
  }
}

/**
 * LEGACY: Analyze user prompt to determine simulation structure
 * (Still supported for backward compatibility)
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
 * LEGACY: Generate simulation based on analysis
 * (Still supported for backward compatibility)
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
 * LEGACY: Regenerate simulation with user feedback
 * (Still supported for backward compatibility)
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
    
    // Try to generate a simple test simulation
    const result = await generateHTMLSimulation('Test: Create a simple customer service simulation')
    
    console.log('✅ Edge Function connection successful!')
    return true
  } catch (error) {
    console.error('❌ Edge Function connection failed:', error)
    return false
  }
}
