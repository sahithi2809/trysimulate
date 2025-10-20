// Supabase Edge Function to securely call OpenAI API
// This keeps the API key on the server side and never exposes it to the browser

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

    // Fetch OpenAI API key from secrets table
    const { data: secretData, error: secretError } = await supabaseAdmin
      .from('secrets')
      .select('key_value')
      .eq('key_name', 'OPENAI_API_KEY')
      .eq('is_active', true)
      .single()

    if (secretError || !secretData) {
      throw new Error('Failed to fetch API key from secrets table')
    }

    const openaiApiKey = secretData.key_value

    // Update last_used_at
    await supabaseAdmin
      .from('secrets')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key_name', 'OPENAI_API_KEY')

    // Parse request body
    const { action, payload } = await req.json()

    let openaiResponse

    // Handle different AI actions
    switch (action) {
      case 'analyzePrompt':
        openaiResponse = await analyzePrompt(openaiApiKey, payload.userPrompt)
        break
      
      case 'generateSimulation':
        openaiResponse = await generateSimulation(openaiApiKey, payload.analysis, payload.originalPrompt)
        break
      
      case 'regenerateSimulation':
        openaiResponse = await regenerateSimulation(openaiApiKey, payload.currentSimulation, payload.feedback)
        break
      
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(
      JSON.stringify({ success: true, data: openaiResponse }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

// Analyze user prompt
async function analyzePrompt(apiKey: string, userPrompt: string) {
  const analysisPrompt = `
    Analyze this user prompt and design a custom simulation:
    
    User Prompt: "${userPrompt}"
    
    Return a JSON object with:
    {
      "simulationType": "custom",
      "interactionType": "text-input|drag-drop|multiple-choice|scenario-based|decision-tree|role-play",
      "role": "extracted role (e.g., Product Manager, Sales Executive)",
      "context": "detailed scenario description",
      "difficulty": "Beginner|Intermediate|Advanced",
      "category": "Product Management|Sales|Leadership|Marketing|HR|Engineering|Operations|Finance",
      "duration": "estimated duration (e.g., 15 min)",
      "title": "compelling simulation title",
      "learningObjectives": ["objective1", "objective2", "objective3"],
      "skillsTested": ["skill1", "skill2", "skill3"]
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
        { role: 'system', content: 'You are a workplace simulation designer. Always respond with valid JSON.' },
        { role: 'user', content: analysisPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  return JSON.parse(data.choices[0].message.content)
}

// Generate simulation
async function generateSimulation(apiKey: string, analysis: any, originalPrompt: string) {
  const { interactionType, role, context, difficulty, category, title, learningObjectives, skillsTested } = analysis
  
  const structurePrompt = getDynamicStructureForType(interactionType)
  
  const generationPrompt = `
    Create a COMPLETELY UNIQUE workplace simulation based on this analysis. DO NOT use generic templates.
    
    Original User Prompt: "${originalPrompt}"
    Interaction Type: ${interactionType}
    Role: ${role}
    Context: ${context}
    Difficulty: ${difficulty}
    Category: ${category}
    Title: ${title}
    Learning Objectives: ${JSON.stringify(learningObjectives)}
    Skills Tested: ${JSON.stringify(skillsTested)}
    
    CRITICAL REQUIREMENTS:
    1. Create a SPECIFIC, REALISTIC scenario based on the user's prompt
    2. Use REAL company names, products, and industry details
    3. Make interactions AUTHENTIC to the role and situation
    4. Include SPECIFIC details that make it feel real
    5. DO NOT use generic placeholder text
    6. For decision-tree type: Create AT LEAST 3 intermediate nodes and 3 different ending nodes (success, failure, partial)
    7. For decision-tree type: Every node MUST have either "options" (if not an end) or "isEnd: true" (if it's an ending)
    8. Ensure ALL nodes referenced in "next" fields actually exist in the decisionTree object
    
    Generate a realistic, engaging simulation with this JSON structure:
    ${structurePrompt}
    
    Examples of GOOD vs BAD:
    BAD: "You are a Product Manager. Handle customer feedback."
    GOOD: "You are a Product Manager at Spotify. Users are complaining about the new podcast discovery algorithm. The engineering team says fixing it will delay the quarterly release by 2 weeks."
    
    VALIDATION:
    - Check that all "next" node IDs exist as keys in the decisionTree
    - Ensure all ending nodes have "isEnd: true"
    - Make sure the tree has at least 5 total nodes for a complete experience
    
    Make it SPECIFIC and REALISTIC!
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
        { role: 'system', content: 'You are a workplace simulation designer. Always respond with valid JSON.' },
        { role: 'user', content: generationPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  const simulation = JSON.parse(data.choices[0].message.content)
  
  return {
    ...simulation,
    title,
    type: 'custom',
    interactionType,
    category,
    difficulty,
    duration: analysis.duration,
    description: `AI-generated simulation: ${context}`,
    learningObjectives,
    skillsTested,
    created: new Date().toISOString().split('T')[0],
    isDefault: false,
    isAIGenerated: true
  }
}

// Regenerate simulation
async function regenerateSimulation(apiKey: string, currentSimulation: any, feedback: string) {
  const regenerationPrompt = `
    Regenerate this simulation based on user feedback:
    
    Current Simulation: ${JSON.stringify(currentSimulation)}
    User Feedback: "${feedback}"
    
    Improve the simulation while maintaining the same structure and type.
    Return the complete updated simulation as JSON.
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
        { role: 'system', content: 'You are a workplace simulation designer. Always respond with valid JSON.' },
        { role: 'user', content: regenerationPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  return JSON.parse(data.choices[0].message.content)
}

// Get dynamic structure for interaction type
function getDynamicStructureForType(interactionType: string): string {
  const structures: Record<string, string> = {
    'text-input': `{
      "scenario": {
        "role": "specific role (e.g., Product Manager, Customer Service Rep)",
        "context": "detailed scenario description",
        "situation": "current situation or challenge"
      },
      "interactions": [
        {
          "id": "unique_id",
          "prompt": "question or challenge",
          "placeholder": "hint for user input",
          "expectedKeywords": ["keyword1", "keyword2"],
          "scoringCriteria": {
            "criterion1": "description",
            "criterion2": "description"
          }
        }
      ]
    }`,
    'multiple-choice': `{
      "scenario": {
        "role": "specific role (e.g., Product Manager, Customer Service Rep)",
        "context": "detailed scenario description",
        "situation": "current situation or challenge"
      },
      "questions": [
        {
          "id": "unique_id",
          "question": "question text",
          "options": [
            { "id": "a", "text": "option text", "isCorrect": true, "explanation": "why correct/incorrect" }
          ]
        }
      ]
    }`,
    'scenario-based': `{
      "scenario": {
        "role": "specific role (e.g., Product Manager, Customer Service Rep)",
        "context": "detailed scenario description",
        "situation": "current situation or challenge"
      },
      "decisions": [
        {
          "id": "unique_id",
          "situation": "situation description",
          "question": "what do you do?",
          "options": [
            { "id": "a", "text": "option", "score": 0-100, "feedback": "result of choice" }
          ]
        }
      ]
    }`,
    'decision-tree': `{
      "scenario": {
        "role": "specific role (e.g., Product Manager, Customer Service Rep)",
        "context": "detailed scenario description",
        "situation": "current situation or challenge"
      },
      "decisionTree": {
        "start": {
          "id": "start",
          "description": "Initial situation description",
          "question": "What do you do?",
          "options": [
            { "text": "First choice", "next": "node_1", "impact": "Short-term consequence" },
            { "text": "Second choice", "next": "node_2", "impact": "Alternative consequence" }
          ]
        },
        "node_1": {
          "id": "node_1",
          "description": "Result of first choice",
          "question": "How do you proceed?",
          "options": [
            { "text": "Option A", "next": "end_success", "impact": "Positive outcome" },
            { "text": "Option B", "next": "end_failure", "impact": "Negative outcome" }
          ]
        },
        "node_2": {
          "id": "node_2",
          "description": "Result of second choice",
          "question": "Next step?",
          "options": [
            { "text": "Option C", "next": "end_partial", "impact": "Mixed outcome" },
            { "text": "Option D", "next": "end_success", "impact": "Good outcome" }
          ]
        },
        "end_success": {
          "id": "end_success",
          "description": "Successful outcome description",
          "isEnd": true,
          "outcome": "Success",
          "feedback": "What went well and why"
        },
        "end_failure": {
          "id": "end_failure",
          "description": "Failure outcome description",
          "isEnd": true,
          "outcome": "Failure",
          "feedback": "What went wrong and lessons learned"
        },
        "end_partial": {
          "id": "end_partial",
          "description": "Partial success outcome",
          "isEnd": true,
          "outcome": "Partial Success",
          "feedback": "Mixed results analysis"
        }
      }
    }`,
    'role-play': `{
      "scenario": {
        "role": "specific role (e.g., Product Manager, Customer Service Rep)",
        "context": "detailed scenario description",
        "situation": "current situation or challenge"
      },
      "characterName": "character you're interacting with",
      "characterRole": "their role",
      "interactions": [
        {
          "id": "unique_id",
          "characterMessage": "what they say",
          "promptHint": "how to respond",
          "goodResponseKeywords": ["keyword1", "keyword2"]
        }
      ]
    }`,
    'drag-drop': `{
      "scenario": {
        "role": "specific role (e.g., Product Manager, Customer Service Rep)",
        "context": "detailed scenario description",
        "situation": "current situation or challenge"
      },
      "instructions": "what to do",
      "items": [
        { "id": "unique_id", "text": "item", "correctCategory": "category_name" }
      ],
      "categories": [
        { "id": "category_id", "name": "category name", "description": "what goes here" }
      ]
    }`
  }

  return structures[interactionType] || structures['text-input']
}

