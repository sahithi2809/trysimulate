/**
 * LLM-Based Task Scoring Edge Function
 * 
 * This function uses an LLM (Gemini/OpenAI) to score task submissions
 * based on rubrics and prompts defined in the simulation.
 * 
 * Future-ready: Currently returns rule-based fallback, but structure
 * is ready for LLM integration.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { autoRefreshToken: false, persistSession: false }
      }
    );

    const { taskId, taskData, rubric, prompt, simulationId, taskName } = await req.json();

    if (!taskId || !taskData) {
      throw new Error('taskId and taskData are required');
    }

    // Get LLM API key from secrets
    const { data: secret, error: secretError } = await supabase
      .from('secrets')
      .select('key_value')
      .eq('key_name', 'GEMINI_API_KEY')
      .eq('is_active', true)
      .maybeSingle();

    if (secretError || !secret) {
      console.warn('LLM API key not found, using rule-based fallback');
      // Fallback to rule-based scoring
      return new Response(
        JSON.stringify({
          ok: true,
          score: 50,
          breakdown: {},
          strengths: ['Good effort'],
          improvements: ['LLM scoring not available, using fallback'],
          validation_method: 'rule-based-fallback'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Build LLM prompt
    const llmPrompt = prompt || `Evaluate this task submission based on the following rubric:
${JSON.stringify(rubric, null, 2)}

Task: ${taskName || taskId}
Submission:
${JSON.stringify(taskData, null, 2)}

Return a JSON object with:
- score: integer 0-100
- breakdown: object with scores per rubric criterion
- strengths: array of strings (top 3)
- improvements: array of strings (top 3)
}`;

    // Call Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${secret.key_value}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: llmPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`LLM API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // Parse JSON response
    let result;
    try {
      // Clean up response if it has markdown fences
      responseText = responseText.trim();
      if (responseText.startsWith('```')) {
        responseText = responseText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
      }
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse LLM response:', parseError);
      throw new Error('Invalid LLM response format');
    }

    // Normalize result
    const normalizedResult = {
      score: Math.min(Math.max(parseInt(result.score) || 50, 0), 100),
      breakdown: result.breakdown || {},
      strengths: Array.isArray(result.strengths) ? result.strengths.slice(0, 3) : [],
      improvements: Array.isArray(result.improvements) ? result.improvements.slice(0, 3) : [],
      validation_method: 'llm-based'
    };

    return new Response(
      JSON.stringify({ ok: true, ...normalizedResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in score-task-llm:', error);
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error.message,
        // Fallback response
        score: 50,
        breakdown: {},
        strengths: [],
        improvements: ['Scoring failed, please try again'],
        validation_method: 'error-fallback'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});


