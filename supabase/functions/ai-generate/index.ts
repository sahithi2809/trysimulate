// Supabase Edge Function to securely call OpenAI API
// Generates free-form HTML simulations using GPT-4-turbo-preview

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

    // Fetch OpenAI API key from secrets table
    const { data: secretData, error: secretError } = await supabaseAdmin
      .from('secrets')
      .select('key_value')
      .eq('key_name', 'OPENAI_API_KEY')
      .eq('is_active', true)
      .single()

    if (secretError || !secretData) {
      console.error('❌ Failed to fetch API key:', secretError)
      throw new Error('Failed to fetch API key from secrets table')
    }

    const openaiApiKey = secretData.key_value
    console.log('🔑 API key fetched successfully')

    // Update last_used_at
    await supabaseAdmin
      .from('secrets')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key_name', 'OPENAI_API_KEY')

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
        result = await generateHTMLSimulation(openaiApiKey, payload.userPrompt)
        break
      
      case 'regenerateHTMLSimulation':
        if (!payload?.currentHTML || !payload?.feedback) {
          throw new Error('Missing currentHTML or feedback in payload')
        }
        result = await regenerateHTMLSimulation(openaiApiKey, payload.currentHTML, payload.feedback)
        break
      
      // Legacy support for old flow
      case 'analyzePrompt':
      case 'generateSimulation':
        const prompt = payload?.userPrompt || payload?.originalPrompt
        if (!prompt) {
          throw new Error('Missing userPrompt or originalPrompt in payload')
        }
        result = await generateHTMLSimulation(openaiApiKey, prompt)
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

// Generate complete HTML simulation in one step
async function generateHTMLSimulation(apiKey: string, userPrompt: string) {
  const simulationPrompt = `
You are a world-class workplace simulation designer. Create a complete, interactive HTML simulation based on this user request:

"${userPrompt}"

CRITICAL REQUIREMENTS:
1. Generate a COMPLETE, STANDALONE HTML simulation with embedded CSS and JavaScript
2. Use SPECIFIC company names, products, and realistic scenarios (e.g., "Spotify", "Netflix", "Airbnb", "Tesla")
3. Include REAL details: actual metrics, timelines, stakeholder names, industry-specific jargon
4. Make it FULLY INTERACTIVE with JavaScript for:
   - User input collection (text areas, forms, buttons, dropdowns)
   - Real-time validation and feedback
   - Scoring mechanisms
   - Dynamic content updates
5. Design must be MODERN and PROFESSIONAL:
   - Clean, minimal interface
   - Proper spacing and typography
   - Responsive layout
   - Smooth animations and transitions
6. Include clear instructions, rich scenario context, and detailed feedback

SIMULATION TYPES YOU CAN CREATE:
- Customer service responses (rate empathy, clarity, resolution)
- Sales negotiations (multi-turn conversations)
- Prioritization exercises (drag-and-drop or ranking)
- Decision trees (branching scenarios with consequences)
- Role-play conversations (back-and-forth dialogue)
- Data analysis (interpret charts/metrics and make decisions)
- Crisis management (time-pressured decisions)
- Team conflict resolution
- Product roadmap decisions
- Any other workplace scenario!

HTML STRUCTURE REQUIREMENTS:
- Use semantic HTML5
- Include a clear header with simulation title and context
- Main content area with the interactive simulation
- Footer with scoring/feedback section
- All CSS must be inline in a <style> tag
- All JavaScript must be inline in a <script> tag at the end
- Make it 100% self-contained (no external dependencies)

STYLING GUIDELINES:
- Use modern color palette (blues, greens, neutrals)
- Font: system-ui or sans-serif
- Proper contrast for readability
- Cards/boxes with subtle shadows
- Buttons with hover effects
- Input fields with clear labels

JAVASCRIPT REQUIREMENTS:
- Add event listeners for user interactions
- Calculate scores based on user input
- Provide immediate, specific feedback
- Show results in a summary section
- Allow reset/retry functionality

Return ONLY a JSON object with this structure:
{
  "metadata": {
    "title": "Compelling simulation title",
    "description": "2-3 sentence description of what user will learn",
    "category": "Product Management|Sales|Leadership|Marketing|HR|Engineering|Operations|Customer Service",
    "difficulty": "Beginner|Intermediate|Advanced",
    "duration": "10-20 min",
    "learningObjectives": ["specific objective 1", "specific objective 2", "specific objective 3"]
  },
  "htmlContent": "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>...</title><style>...modern CSS here...</style></head><body>...interactive content with buttons/forms...</body><script>...scoring and interaction logic...</script></html>"
}

EXAMPLES OF EXCELLENCE:
- ChatGPT's customer comments simulation: Multiple comments, text replies, scores empathy/clarity/helpfulness
- Real sales negotiation: Multi-step conversation, budget discussions, objection handling
- PM prioritization: Drag tasks, score based on impact/urgency/effort

Make it SPECIFIC to the request. Use REAL company/product names. Create something that feels valuable and realistic!
  `

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert at creating realistic, interactive HTML workplace simulations. Always respond with valid JSON containing metadata and htmlContent fields.' 
        },
        { role: 'user', content: simulationPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.9,
      max_tokens: 4000,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  const result = JSON.parse(data.choices[0].message.content)
  
  // Add system metadata
  return {
    id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'html',
    isAIGenerated: true,
    isHTMLSimulation: true,
    created: new Date().toISOString().split('T')[0],
    ...result.metadata,
    htmlContent: result.htmlContent
  }
}

// Regenerate HTML simulation based on feedback
async function regenerateHTMLSimulation(apiKey: string, currentHTML: string, feedback: string) {
  const regenerationPrompt = `
You are a workplace simulation designer. Improve this HTML simulation based on user feedback.

CURRENT HTML SIMULATION:
${currentHTML.substring(0, 2000)}... (truncated)

USER FEEDBACK: "${feedback}"

INSTRUCTIONS:
1. Keep the same general structure and interaction type
2. Apply the user's feedback to improve the simulation
3. Make sure it's still fully self-contained with inline CSS and JavaScript
4. Maintain professional design and interactivity

Return a JSON object with:
{
  "metadata": {
    "title": "Updated title if needed",
    "description": "Updated description",
    "category": "same or updated category",
    "difficulty": "same or updated difficulty",
    "duration": "estimated duration",
    "learningObjectives": ["updated objectives"]
  },
  "htmlContent": "Complete improved HTML with inline CSS and JavaScript"
}
  `

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert at creating realistic, interactive HTML workplace simulations. Always respond with valid JSON.' 
        },
        { role: 'user', content: regenerationPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 4000,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  const result = JSON.parse(data.choices[0].message.content)
  
  return {
    id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'html',
    isAIGenerated: true,
    isHTMLSimulation: true,
    created: new Date().toISOString().split('T')[0],
    ...result.metadata,
    htmlContent: result.htmlContent
  }
}
