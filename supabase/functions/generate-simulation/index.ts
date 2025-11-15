import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    const { data: secret, error: secretError } = await supabase.from("secrets").select("key_value").eq("key_name", "GEMINI_API_KEY").eq("is_active", true).maybeSingle();
    if (secretError || !secret) {
      throw new Error("Gemini API key not found in secrets table");
    }
    const body = await req.json();
    const prompt = body?.prompt?.trim();
    if (!prompt) {
      throw new Error("Prompt is required");
    }
    const result = await generateSimulation(secret.key_value, prompt);
    return new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    console.error("generate-simulation error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message ?? "Unknown error"
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 400
    });
  }
});
async function generateSimulation(apiKey, userPrompt) {
  const instruction = `
You are an elite workplace simulation architect.

USER PROMPT:
${userPrompt}

RETURN JSON ONLY. NO MARKDOWN FENCES.
JSON SHAPE:
{
  "metadata": {
    "title": "Concise, compelling title",
    "description": "2-3 sentence overview of the simulation and its value",
    "category": "Product Management|Sales|Leadership|Marketing|HR|Engineering|Operations|Customer Service|Other",
    "difficulty": "Beginner|Intermediate|Advanced",
    "duration": "5-10 min|10-15 min|15-20 min|20-30 min|30+ min",
    "learningObjectives": ["objective 1", "objective 2", "objective 3"]
  },
  "markdownContent": "# Simulation: ...\\n\\n## Introduction\\n...\\n\\n## Setup\\n...\\n\\n## Step 1: ...\\n### Scenario\\n...\\n### Your Options:\\nA. ...\\nB. ...\\nC. ...\\n### Potential Outcomes:\\n* **If you choose A:** ...\\n* **If you choose B:** ...\\n* **If you choose C:** ...\\n---\\n\\n## Step 2: ... (continue for all steps)"
}

GUIDELINES:
- Mirror the user's intent with realistic companies, stakes, metrics, and interpersonal dynamics.
- Each option must test a distinct set of skills; outcomes must spell out impact and learning insights.
- Keep tone professional yet engaging; emphasize growth and assessment.
`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: instruction
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 8192,
        responseMimeType: "application/json"
      }
    })
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${errText}`);
  }
  const data = await response.json();
  let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  responseText = responseText.trim();
  if (responseText.startsWith("```")) {
    responseText = responseText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  }
  let result;
  try {
    result = JSON.parse(responseText);
  } catch (parseError) {
    console.error("JSON parse error:", parseError);
    console.error("Response preview:", responseText.substring(0, 400));
    const markdownMatch = responseText.match(/"markdownContent"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
    const titleMatch = responseText.match(/"title"\s*:\s*"([^"]*)"/);
    const descriptionMatch = responseText.match(/"description"\s*:\s*"([^"]*)"/);
    if (!markdownMatch) {
      throw new Error(`Failed to parse Gemini response as JSON: ${parseError.message}`);
    }
    let markdownContent = markdownMatch[1];
    markdownContent = markdownContent.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\"/g, "\"").replace(/\\\\/g, "\\");
    result = {
      metadata: {
        title: titleMatch ? titleMatch[1] : "AI Generated Simulation",
        description: descriptionMatch ? descriptionMatch[1] : "An interactive workplace simulation",
        category: "General",
        difficulty: "Intermediate",
        duration: "15-20 min",
        learningObjectives: []
      },
      markdownContent
    };
  }
  if (!result.markdownContent) {
    throw new Error("Generated response missing markdownContent field");
  }
  return {
    id: `sim_${Date.now()}_${crypto.randomUUID()}`,
    type: "markdown",
    isAIGenerated: true,
    created: new Date().toISOString(),
    ...result.metadata ?? {},
    markdownContent: result.markdownContent
  };
}



