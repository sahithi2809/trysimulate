// Supabase Edge Function to securely call Google Gemini API
// Generates free-form HTML simulations using Gemini 2.5 Pro

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔧 Edge Function called:', req.method, req.url)
    
    // Create Supabase client with service role to access secrets table
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('📡 Supabase client created')

    // Fetch Gemini API key from secrets table
    const { data: secretData, error: secretError } = await supabaseAdmin
      .from('secrets')
      .select('key_value')
      .eq('key_name', 'GEMINI_API_KEY')
      .eq('is_active', true)
      .single()

    if (secretError || !secretData) {
      console.error('❌ Failed to fetch API key:', secretError)
      throw new Error('Failed to fetch API key from secrets table')
    }

    const geminiApiKey = secretData.key_value
    console.log('🔑 Gemini API key fetched successfully')

    // Update last_used_at
    await supabaseAdmin
      .from('secrets')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key_name', 'GEMINI_API_KEY')

    // Parse request body
    const requestBody = await req.json()
    console.log('📦 Request body:', requestBody)
    
    const { action, payload } = requestBody
    console.log('🎯 Action:', action)
    console.log('📋 Payload:', payload)

    let result

    // Handle different AI actions
    switch (action) {
      case 'generateHTMLSimulation':
        if (!payload?.userPrompt) {
          throw new Error('Missing userPrompt in payload')
        }
        result = await generateHTMLSimulation(geminiApiKey, payload.userPrompt)
        break
      
      case 'regenerateHTMLSimulation':
        if (!payload?.currentMarkdown || !payload?.feedback) {
          throw new Error('Missing currentMarkdown or feedback in payload')
        }
        result = await regenerateHTMLSimulation(geminiApiKey, payload.currentMarkdown, payload.feedback)
        break
      
      // Legacy support for old flow
      case 'analyzePrompt':
      case 'generateSimulation':
        const prompt = payload?.userPrompt || payload?.originalPrompt
        if (!prompt) {
          throw new Error('Missing userPrompt or originalPrompt in payload')
        }
        result = await generateHTMLSimulation(geminiApiKey, prompt)
        break
      
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    console.log('✅ Result generated successfully')
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Edge Function error:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.stack 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

// Generate markdown-based simulation in one step
async function generateHTMLSimulation(apiKey: string, userPrompt: string) {
  const simulationPrompt = `
You are an elite workplace simulation architect.

USER REQUEST:
${userPrompt}

OUTPUT RULES:
- Respond with JSON only. No markdown fences, no commentary.
- JSON shape:
{
  "metadata": {
    "title": "...",
    "description": "...",
    "category": "Product Management|Sales|Leadership|Marketing|HR|Engineering|Operations|Customer Service|Other",
    "difficulty": "Beginner|Intermediate|Advanced",
    "duration": "5-10 min|10-15 min|15-20 min|20-30 min|30+ min",
    "learningObjectives": ["objective 1", "objective 2", "objective 3"]
  },
  "markdownContent": "# Simulation: ...\\n\\n## Introduction\\n...\\n\\n## Setup\\n...\\n\\n## Step 1: ...\\n### Scenario\\n...\\n### Your Options:\\nA. ...\\nB. ...\\nC. ...\\n### Potential Outcomes:\\n* **If you choose A:** ...\\n* **If you choose B:** ...\\n* **If you choose C:** ...\\n---\\n\\n## Step 2: ... (continue for all steps)"
}

CONTENT GUIDELINES:
- Use realistic business context, company names, metrics, stakeholders.
- Elevate stakes and learning tension. Each option must probe different skills and the outcomes must spell out impact.
- Keep the tone professional yet engaging, highlighting the competencies being evaluated.
`

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: simulationPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 8192,
        responseMimeType: "application/json"
      }
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${error}`)
  }

  const data = await response.json()
  let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

  responseText = responseText.trim()
  if (responseText.startsWith('```')) {
    responseText = responseText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  }

  let result
  try {
    result = JSON.parse(responseText)
  } catch (parseError) {
    console.error('JSON parse error (primary):', parseError)
    console.error('Response preview:', responseText.substring(0, 400))

    const markdownMatch = responseText.match(/"markdownContent"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/)
    const titleMatch = responseText.match(/"title"\s*:\s*"([^"]*)"/)
    const descMatch = responseText.match(/"description"\s*:\s*"([^"]*)"/)

    if (!markdownMatch) {
      throw new Error(`Failed to parse Gemini response as JSON: ${parseError.message}`)
    }

    let markdownContent = markdownMatch[1]
    markdownContent = markdownContent
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')

    result = {
      metadata: {
        title: titleMatch ? titleMatch[1] : 'AI Generated Simulation',
        description: descMatch ? descMatch[1] : 'An interactive workplace simulation',
        category: 'General',
        difficulty: 'Intermediate',
        duration: '15-20 min',
        learningObjectives: []
      },
      markdownContent
    }
  }

  if (!result.markdownContent) {
    throw new Error('Generated response missing markdownContent field')
  }

  return {
    id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'markdown',
    isAIGenerated: true,
    isMarkdownSimulation: true,
    created: new Date().toISOString().split('T')[0],
    ...(result.metadata || {}),
    markdownContent: result.markdownContent
  }
}

// Regenerate markdown simulation based on feedback
async function regenerateHTMLSimulation(apiKey: string, currentMarkdown: string, feedback: string) {
  const regenerationPrompt = `
You are a workplace simulation designer. Improve this markdown simulation based on user feedback.

CURRENT MARKDOWN SIMULATION:
${currentMarkdown.substring(0, 2000)}... (truncated)

USER FEEDBACK: "${feedback}"

INSTRUCTIONS:
1. Preserve the structure (Introduction, Setup, Step sections with Options & Outcomes)
2. Apply the feedback to sharpen realism, stakes, and learning value
3. Ensure each option/outcome clearly states consequences and skill insights

Return a JSON object with:
{
  "metadata": {
    "title": "...",
    "description": "...",
    "category": "...",
    "difficulty": "...",
    "duration": "...",
    "learningObjectives": ["..."]
  },
  "markdownContent": "# Simulation: ...\\n..."
}
  `

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: regenerationPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 8192,
        responseMimeType: "application/json"
      }
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${error}`)
  }

  const data = await response.json()
  let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

  responseText = responseText.trim()
  if (responseText.startsWith('```')) {
    responseText = responseText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  }

  let result
  try {
    result = JSON.parse(responseText)
  } catch (parseError) {
    console.error('JSON parse error (regenerate):', parseError)
    console.error('Response preview:', responseText.substring(0, 400))

    const markdownMatch = responseText.match(/"markdownContent"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/)
    const titleMatch = responseText.match(/"title"\s*:\s*"([^"]*)"/)
    const descMatch = responseText.match(/"description"\s*:\s*"([^"]*)"/)

    if (!markdownMatch) {
      throw new Error(`Failed to parse Gemini response as JSON: ${parseError.message}`)
    }

    let markdownContent = markdownMatch[1]
    markdownContent = markdownContent
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')

    result = {
      metadata: {
        title: titleMatch ? titleMatch[1] : 'AI Generated Simulation',
        description: descMatch ? descMatch[1] : 'An interactive workplace simulation',
        category: 'General',
        difficulty: 'Intermediate',
        duration: '15-20 min',
        learningObjectives: []
      },
      markdownContent
    }
  }

  if (!result.markdownContent) {
    throw new Error('Generated response missing markdownContent field')
  }

  return {
    id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'markdown',
    isAIGenerated: true,
    isMarkdownSimulation: true,
    created: new Date().toISOString().split('T')[0],
    ...(result.metadata || {}),
    markdownContent: result.markdownContent
  }
}
