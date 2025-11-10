import { supabase } from '../config/supabaseClient'

/**
 * Secure AI Service
 * Calls Supabase Edge Functions which securely access OpenAI
 * API keys are never exposed to the browser
 */

const EDGE_FUNCTION_NAME = 'ai-generate'
const SIMPLE_GENERATE_FUNCTION = 'generate-simulation'
const CREATE_SIMULATION_FUNCTION = 'create-simulation'

const getEnvValue = (...keys) => {
  for (const key of keys) {
    if (key in import.meta.env && import.meta.env[key]) {
      return import.meta.env[key]
    }
  }

  if (typeof process !== 'undefined' && process?.env) {
    for (const key of keys) {
      if (process.env[key]) {
        return process.env[key]
      }
    }
  }

  return ''
}

const SUPABASE_URL = getEnvValue('VITE_SUPABASE_URL', 'REACT_APP_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL')
const SUPABASE_ANON_KEY = getEnvValue(
  'VITE_SUPABASE_ANON_KEY',
  'REACT_APP_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
)

const CREATE_SIMULATION_BASE = SUPABASE_URL
  ? `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/${CREATE_SIMULATION_FUNCTION}`
  : ''

function buildCreateSimulationUrl(path = '') {
  if (!CREATE_SIMULATION_BASE) {
    throw new Error('Supabase URL is not configured. Set VITE_SUPABASE_URL.')
  }

  if (!path) return CREATE_SIMULATION_BASE

  const normalized = path.startsWith('/') ? path.slice(1) : path
  return `${CREATE_SIMULATION_BASE}/${normalized}`
}

async function callCreateSimulationEndpoint(path, { method = 'POST', body } = {}) {
  if (!SUPABASE_ANON_KEY) {
    throw new Error('Supabase anon key is not configured. Set VITE_SUPABASE_ANON_KEY.')
  }

  const url = buildCreateSimulationUrl(path)
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok || data.error || data.ok === false) {
    const message = data.error || data.message || `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return data
}

/**
 * Call the secure Edge Function
 */
async function callEdgeFunction(action, payload, override) {
  try {
    const functionName = override?.functionName || EDGE_FUNCTION_NAME
    const requestBody = override?.body || { action, payload }

    console.log('🔧 Calling Edge Function:', functionName)
    console.log('📤 Action:', action)
    console.log('📦 Payload:', payload)
    
    // Check if supabase client is initialized
    if (!supabase) {
      throw new Error('Supabase client is not initialized. Check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
    }
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: requestBody
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
    console.log('🚀 Generating markdown simulation with Gemini 2.5 Pro...')
    console.log('User prompt:', userPrompt)
    
    const simulation = await callEdgeFunction('generateHTMLSimulation', {
      userPrompt
    })
    
    console.log('✅ Simulation generated successfully!')
    console.log('- Title:', simulation.title)
    console.log('- Category:', simulation.category)
    console.log('- Markdown length:', simulation.markdownContent?.length || 0, 'characters')
    
    return simulation
  } catch (error) {
    console.error('Failed to generate HTML simulation:', error)
    throw new Error(`Failed to generate simulation: ${error.message}`)
  }
}

/**
 * Simplified generation endpoint (prompt only)
 */
export const generateSimulationWithPrompt = async (prompt) => {
  try {
    const simulation = await callEdgeFunction(undefined, undefined, {
      functionName: SIMPLE_GENERATE_FUNCTION,
      body: { prompt },
    })

    return simulation
  } catch (error) {
    console.error('Failed to generate simulation via generate-simulation:', error)
    throw new Error(`Failed to generate simulation: ${error.message}`)
  }
}

/**
 * Create a structured simulation using the create-simulation Edge Function
 */
export const createSimulationFromPrompt = async ({ title, prompt }) => {
  try {
    const payload = await callCreateSimulationEndpoint('create', {
      method: 'POST',
      body: { title, prompt },
    })

    return payload
  } catch (error) {
    console.error('Failed to create simulation:', error)
    throw new Error(`Failed to create simulation: ${error.message}`)
  }
}

/**
 * Submit a user response for evaluation feedback
 */
export const evaluateSimulationResponse = async ({ simulation, userResponse }) => {
  try {
    const payload = await callCreateSimulationEndpoint('evaluate', {
      method: 'POST',
      body: { simulation, userResponse },
    })

    return payload
  } catch (error) {
    console.error('Failed to evaluate simulation response:', error)
    throw new Error(`Failed to evaluate simulation: ${error.message}`)
  }
}

/**
 * NEW: Regenerate HTML simulation with feedback
 */
export const regenerateHTMLSimulation = async (currentMarkdown, feedback) => {
  try {
    console.log('🔄 Regenerating markdown simulation with feedback...')
    console.log('Feedback:', feedback)
    
    const simulation = await callEdgeFunction('regenerateHTMLSimulation', {
      currentMarkdown,
      feedback
    })
    
    console.log('✅ Simulation regenerated successfully!')
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
