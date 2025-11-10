import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

type Simulation = {
  id: string
  title: string
  prompt: string
  scenario?: string
  previewHtml?: string
  instructions?: string
  metadata?: Record<string, unknown>
}

const LLM_API_KEY = Deno.env.get("LLM_API_KEY") || ""
const DEFAULT_GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

const LLM_API_URL = Deno.env.get("LLM_API_URL") || DEFAULT_GEMINI_URL
const PROJECT_URL = Deno.env.get("PROJECT_URL") || ""
const SUPABASE_URL = (Deno.env.get("SUPABASE_URL") || "").replace(/\/$/, "")
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || ""

function toBase64(input: string) {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(input)
  let binary = ""
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

if (!LLM_API_KEY || !LLM_API_URL) {
  console.warn("LLM_API_KEY and LLM_API_URL must be set in environment")
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const pathname = url.pathname

    if (req.method === "POST" && pathname.endsWith("/create")) {
      const payload = await req.json().catch(() => ({}))
      const title = (payload.title || "Untitled Simulation").trim()
      const prompt = (payload.prompt || "").trim()

      if (!prompt) {
        return new Response(JSON.stringify({ error: "Missing prompt" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const systemPrompt = `You are a senior instructional designer who turns a plain request into a fully-playable workplace simulation.
Return **only** valid JSON with the following keys:
  - "scenario": rich markdown that includes an introduction, setup, and exactly 3-5 numbered steps. Each step must contain:
      * a vivid scenario paragraph
      * three decision options labelled A, B, C
      * consequences for each option
      * a reflection question
  - "instructions": guidance for the learner that explains how to approach the simulation and what success looks like.
  - "tasks": array of concise bullet-ready tasks the learner must complete.
  - "expected_behavior": a detailed evaluation rubric describing what makes an excellent response (include tone, structure, strategy, metrics).
  - "hints": array of coaching nudges tailored to the scenario.
  - "preview_blurb": 1–2 sentence teaser highlighting the challenge.
Make the content realistic with specific metrics, stakeholders, and constraints.`

      const userPrompt = `Simulation Title: ${title}
Original Request:
${prompt}

Produce the JSON so the learner can immediately play the simulation and be evaluated afterwards.`

      const raw = await sendToModel(systemPrompt, userPrompt)

      let spec: any
      try {
        spec = JSON.parse(raw)
      } catch {
        const match = raw.match(/\{[\s\S]*\}$/)
        if (match) {
          spec = JSON.parse(match[0])
        } else {
          spec = {
            scenario: `# Simulation Overview

## Introduction
${prompt.slice(0, 180)}...

## Step 1
- **Scenario:** Describe the first high-impact moment.
- **Options:** A) Conservative move, B) Balanced, C) Bold
- **Consequences:** Explain the outcome of each decision.

## Step 2
- Continue with a new escalation.

## Step 3
- Present the resolution trade-offs.

Reflect on key learnings at the end.`,
            instructions:
              "Review the scenario, choose a course of action at each step, and justify your decisions with data-driven reasoning. Highlight communication strategy, metrics, and stakeholder alignment.",
            tasks: ["Diagnose the core challenge", "Select responses for each step", "Explain your rationale"],
            expected_behavior:
              "Top responses synthesize data, anticipate stakeholder pushback, and provide a clear plan with measurable outcomes. Tone should be confident, empathetic, and strategic.",
            hints: [
              "Anchor each decision in a measurable KPI or qualitative insight.",
              "Acknowledge trade-offs and address stakeholder concerns explicitly.",
            ],
            preview_blurb: prompt.slice(0, 140),
          }
        }
      }

      const id = crypto.randomUUID()
      const simulation: Simulation = {
        id,
        title,
        prompt: spec.scenario ?? prompt,
        scenario: spec.scenario ?? prompt,
        instructions: spec.instructions ?? "Respond to the scenario.",
        metadata: {
          tasks: spec.tasks ?? [],
          expected_behavior: spec.expected_behavior ?? "",
          hints: spec.hints ?? [],
          preview_blurb: spec.preview_blurb ?? (spec.scenario ?? prompt).slice(0, 140),
        },
      }

      const evaluateUrl = resolveEvaluateUrl(req.url)

      const encodedSpec = encodeURIComponent(toBase64(JSON.stringify(simulation)))
      const previewPath = `/preview?id=${encodeURIComponent(id)}&spec=${encodedSpec}`
      const previewUrl = PROJECT_URL ? `${PROJECT_URL}${previewPath}` : previewPath
      const previewHtml = buildPreviewHtml(simulation, evaluateUrl, SUPABASE_ANON_KEY)

      return new Response(
        JSON.stringify({
          ok: true,
          simulation,
          preview_url: previewUrl,
          preview_html: previewHtml,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }

    if (req.method === "GET" && pathname.endsWith("/preview")) {
      const id = url.searchParams.get("id")
      if (!id) {
        return new Response("Missing id", {
          status: 400,
          headers: corsHeaders,
        })
      }

      const specB64 = url.searchParams.get("spec")
      let simulation: Simulation | null = null

      if (specB64) {
        try {
          const binary = atob(specB64)
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i)
          }
          const decoded = new TextDecoder().decode(bytes)
          simulation = JSON.parse(decoded)
        } catch {
          simulation = null
        }
      }

      if (!simulation) {
        simulation = {
          id,
          title: "Preview Simulation",
          prompt:
            "You are a customer support rep: A customer writes that their order arrived damaged and it's urgent. Write a reply that apologizes, proposes a fix, and keeps the customer.",
          instructions: "Write a short, empathetic reply that solves the issue and includes next steps.",
          metadata: {
            tasks: ["Acknowledge", "Apologize", "Offer remediation", "Set expectations"],
            expected_behavior: "Empathetic, helpful, concise",
            hints: ["Start with apology", "Offer refund or replacement"],
            preview_blurb: "Respond as a customer support rep to a damaged-order report.",
          },
        }
      }

      const evaluateUrl = resolveEvaluateUrl(req.url)

      const html = buildPreviewHtml(simulation, evaluateUrl, SUPABASE_ANON_KEY)

      return new Response(html, {
        headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
      })
    }

    if (req.method === "POST" && pathname.endsWith("/evaluate")) {
      const payload = await req.json().catch(() => ({}))
      const simulation: Simulation = payload.simulation
      const userResponse: string = payload.userResponse

      if (!simulation || !userResponse) {
        return new Response(JSON.stringify({ error: "Missing simulation or userResponse" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const systemPrompt = `You are an expert evaluator of workplace communication and behavioral simulations.
Return a JSON object with keys: score (0-100 integer), feedback (detailed text), strengths (array), improvements (array).`

      const userPrompt = `Simulation Title: ${simulation.title}
Scenario: ${simulation.prompt}
Instructions: ${simulation.instructions}
Expected behavior: ${JSON.stringify(simulation.metadata?.expected_behavior ?? "")}
User Response:
${userResponse}

Please evaluate the response against the expected behavior and tasks. Output only valid JSON.`

      const rawEval = await sendToModel(systemPrompt, userPrompt)

      let evaluation: any
      try {
        evaluation = JSON.parse(rawEval)
      } catch {
        const match = rawEval.match(/\{[\s\S]*\}$/)
        if (match) {
          evaluation = JSON.parse(match[0])
        } else {
          evaluation = rawEval
        }
      }

      const normalized = normalizeEvaluation(evaluation)

      return new Response(
        JSON.stringify({
          ok: true,
          ...normalized,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      )
    }

    return new Response("Not found", {
      status: 404,
      headers: corsHeaders,
    })
  } catch (error) {
    console.error("create-simulation error:", error)
    return new Response(JSON.stringify({ error: String(error?.message ?? error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})

async function sendToModel(systemPrompt: string, userPrompt: string) {
  const isGemini = LLM_API_URL.includes("generativelanguage.googleapis.com")
  const modelOverride = Deno.env.get("LLM_MODEL")

  if (isGemini) {
    const urlWithKey = LLM_API_URL.includes("?")
      ? `${LLM_API_URL}&key=${LLM_API_KEY}`
      : `${LLM_API_URL}?key=${LLM_API_KEY}`

    const geminiBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${systemPrompt.trim()}\n\n${userPrompt.trim()}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
        ...(modelOverride ? { model: modelOverride } : {}),
      },
    }

    const response = await fetch(urlWithKey, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(geminiBody),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`LLM call failed: ${response.status} ${text}`)
    }

    const json = await response.json()
    const result =
      json?.candidates?.[0]?.content?.parts?.[0]?.text ??
      json?.output ??
      JSON.stringify(json)

    return result
  }

  const body = {
    model: modelOverride || "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    max_tokens: 800,
    temperature: 0.2,
  }

  const response = await fetch(LLM_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`LLM call failed: ${response.status} ${text}`)
  }

  const data = await response.json()
  const result =
    data?.choices?.[0]?.message?.content ??
    data?.choices?.[0]?.text ??
    data?.output ??
    JSON.stringify(data)

  return result
}

function htmlEscape(input: string) {
  return input.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}

function normalizeEvaluation(evaluation: any) {
  const base = {
    score: 0,
    feedback: '',
    strengths: [] as string[],
    improvements: [] as string[],
  }

  if (!evaluation) {
    return base
  }

  if (typeof evaluation === "string") {
    const trimmed = evaluation.trim()
    if (trimmed.startsWith("```")) {
      const cleaned = trimmed.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
      try {
        return normalizeEvaluation(JSON.parse(cleaned))
      } catch {
        return { ...base, feedback: cleaned || trimmed }
      }
    }
    try {
      return normalizeEvaluation(JSON.parse(trimmed))
    } catch {
      return { ...base, feedback: trimmed }
    }
  }

  const clone: any = { ...evaluation }

  if (clone.feedback && typeof clone.feedback === "string") {
    let feedbackText = clone.feedback.trim()
    if (feedbackText.startsWith("```")) {
      feedbackText = feedbackText.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
    }
    if (feedbackText.startsWith("{") && feedbackText.endsWith("}")) {
      try {
        const nested = JSON.parse(feedbackText)
        return normalizeEvaluation({ ...clone, ...nested })
      } catch {
        clone.feedback = feedbackText
      }
    } else {
      clone.feedback = feedbackText
    }
  }

  clone.score = typeof clone.score === "number" ? clone.score : Number(clone.score) || 0
  clone.strengths = Array.isArray(clone.strengths) ? clone.strengths : []
  clone.improvements = Array.isArray(clone.improvements) ? clone.improvements : []

  return {
    score: clone.score,
    feedback: typeof clone.feedback === "string" ? clone.feedback : "",
    strengths: clone.strengths.map((item: any) => String(item)),
    improvements: clone.improvements.map((item: any) => String(item)),
  }
}

function resolveEvaluateUrl(requestUrl: string) {
  if (SUPABASE_URL) {
    return `${SUPABASE_URL}/functions/v1/create-simulation/evaluate`
  }

  try {
    const url = new URL(requestUrl)
    const basePath = url.pathname.replace(/\/(create|preview)(\?.*)?$/, "")
    const cleanedPath = basePath.endsWith("/evaluate") ? basePath : `${basePath}/evaluate`
    return `${url.protocol}//${url.host}${cleanedPath}`
  } catch {
    return "/functions/v1/create-simulation/evaluate"
  }
}

function buildPreviewHtml(simulation: Simulation, evaluateUrl: string, anonKey: string) {
  const hints = (simulation.metadata?.hints as string[]) ?? []
  const tasks = (simulation.metadata?.tasks as string[]) ?? []
  const scenarioMarkdown = simulation.scenario ?? simulation.prompt
  const expectedBehavior = (simulation.metadata?.expected_behavior as string) ?? ""

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${htmlEscape(simulation.title)}</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;padding:32px;box-sizing:border-box;background:#111827;color:#0f172a;display:flex;justify-content:center;}
  main{max-width:900px;width:100%;background:#ffffff;border-radius:20px;box-shadow:0 40px 120px -45px rgba(15,23,42,0.45);padding:36px;}
  h1{font-size:28px;margin-bottom:12px;color:#0f172a;}
  h2{font-size:18px;margin-top:32px;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.08em;color:#475569;}
  section{margin-top:20px;}
  .meta{font-size:14px;color:#64748b;border-left:4px solid #6366f1;padding-left:12px;margin-bottom:24px;}
  .tasks{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;}
  .task{background:#eef2ff;color:#3730a3;border-radius:999px;padding:6px 12px;font-size:12px;font-weight:600;}
  .rubric{background:#f1f5f9;border:1px solid #e2e8f0;border-radius:18px;padding:18px;margin-top:18px;}
  .rubric h3{margin:0 0 12px 0;font-size:16px;color:#1d4ed8;text-transform:uppercase;letter-spacing:0.08em;}
  .rubric ul{list-style:none;padding:0;margin:0;}
  .rubric li{display:flex;gap:10px;margin-bottom:8px;font-size:14px;color:#475569;}
  .rubric li::before{content:"✔";color:#16a34a;font-weight:700;}
  iframe{border:0;border-radius:16px;margin-top:24px;}
  textarea{width:100%;height:200px;margin-top:16px;border-radius:16px;padding:16px;font-size:16px;border:1px solid #cbd5f5;background:#f8fafc;}
  button{padding:14px 18px;border-radius:14px;border:0;background:#1d4ed8;color:#fff;font-weight:600;cursor:pointer;box-shadow:0 18px 30px -18px rgba(29,78,216,0.65);}
  button:hover{background:#1e3a8a;}
  pre{background:#0f172a;color:#e2e8f0;padding:16px;border-radius:12px;white-space:pre-wrap;}
  .feedback{margin-top:24px;padding:28px;border-radius:24px;background:#fff7ed;border:1px solid #fed7aa;box-shadow:0 35px 75px -45px rgba(17,24,39,0.45);}
  .feedback-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px;}
  .feedback-title{font-size:18px;font-weight:700;color:#9a3412;letter-spacing:0.05em;text-transform:uppercase;}
  .score-chip{display:flex;align-items:center;gap:12px;background:#fb923c;color:#fff;padding:10px 18px;border-radius:999px;font-weight:700;font-size:16px;box-shadow:0 18px 35px -25px rgba(234,88,12,0.75);}
  .score-chip span{font-size:13px;font-weight:500;text-transform:uppercase;letter-spacing:0.08em;}
  .score-bars{display:grid;gap:12px;margin-bottom:20px;}
  .score-row{display:flex;align-items:center;justify-content:space-between;color:#9a3412;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;}
  .score-meter{width:100%;height:10px;border-radius:999px;background:#fed7aa;overflow:hidden;margin-top:6px;}
  .score-meter-fill{height:100%;background:#f97316;}
  .report-section{margin-top:22px;background:#fff1da;border-radius:18px;padding:18px;border:1px solid #fed7aa;}
  .report-section h4{margin:0 0 10px 0;font-size:14px;color:#9a3412;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;}
  .report-section ul{margin:0;padding-left:18px;color:#7c2d12;}
  .report-section li{margin-bottom:8px;line-height:1.6;}
  .summary-text{color:#7c2d12;line-height:1.8;font-size:15px;}
  .scenario{margin-top:16px;padding:18px;border-radius:16px;background:#f8fafc;border:1px solid #e2e8f0;}
</style>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
</head>
<body>
  <main>
    <h1>${htmlEscape(simulation.title)}</h1>
    <div class="meta">${htmlEscape((simulation.metadata?.preview_blurb as string) ?? "")}</div>

    <section>
      <h2>Instructions</h2>
      <p>${htmlEscape(simulation.instructions ?? "")}</p>
    </section>

    ${
      tasks.length
        ? `<section>
      <h2>Mission Objectives</h2>
      <div class="tasks">
        ${tasks.map((task) => `<span class="task">${htmlEscape(task)}</span>`).join("")}
      </div>
    </section>`
        : ""
    }

    <section>
      <h2>Simulation</h2>
      <div id="scenario" class="scenario"></div>
      ${
        expectedBehavior
          ? `<div class="rubric" id="rubric">
        <h3>Evaluation Rubric</h3>
        <ul id="rubric-list"></ul>
      </div>`
          : ""
      }
    </section>

    <section>
      <h2>Your Response</h2>
      <label for="answer">Compose your decisions and rationale below.</label>
      <textarea id="answer" placeholder="Outline your decisions for each step, cite metrics, and justify trade-offs..."></textarea>
      <div style="display:flex;gap:12px;margin-top:16px">
        <button id="submit">Submit for evaluation</button>
        ${
          hints.length
            ? `<button id="hint" type="button">Show hint</button>`
            : ""
        }
      </div>
    </section>

    <section class="feedback">
      <h2>Feedback</h2>
      <div id="feedback"><em>No submission yet.</em></div>
    </section>
  </main>

<script>
const hints = ${JSON.stringify(hints)}
const simulation = ${JSON.stringify(simulation)}
const evaluateUrl = ${JSON.stringify(evaluateUrl)}
const anonKey = ${JSON.stringify(anonKey)}
const rubric = ${JSON.stringify(expectedBehavior)}

const rubricLines = rubric ? rubric.split(/\\n+/).map(line => line.trim()).filter(Boolean) : []
const competencyLabels = rubricLines.length ? rubricLines.slice(0, Math.min(4, rubricLines.length)) : [
  'Understanding & Framing',
  'Value Articulation',
  'Creative Alternatives',
  'Closing Momentum'
]

document.getElementById('scenario').innerHTML = marked.parse(${JSON.stringify(scenarioMarkdown)});

if (rubric) {
  const list = document.getElementById('rubric-list')
  if (list && rubricLines.length) {
    list.innerHTML = rubricLines.map(item => '<li>' + item + '</li>').join('')
  } else if (document.getElementById('rubric')) {
    document.getElementById('rubric').style.display = 'none'
  }
}

function buildScoreBreakdown(score) {
  const maxScore = 100
  const safeScore = typeof score === 'number' ? Math.max(0, Math.min(maxScore, score)) : 0
  const buckets = [25, 30, 30, 15]
  return competencyLabels.map((label, index) => {
    const bucket = buckets[index] ?? Math.round(maxScore / competencyLabels.length)
    const assigned = safeScore === 0 ? 0 : Math.round((safeScore / maxScore) * bucket)
    return {
      label,
      target: bucket,
      achieved: assigned,
      fill: assigned / bucket,
    }
  })
}

function formatSummary(text) {
  if (!text) return ''

  var cleaned = text
  try {
    var tripleFence = new RegExp('\\x60{3}', 'g')
    var edgeBraces = new RegExp('^\\{|\\}$', 'g')
    var stripped = text.replace(tripleFence, '')
    var withoutBraces = stripped.replace(edgeBraces, '')
    var jsonCandidate = '{' + withoutBraces + '}'
    var parsed = JSON.parse(jsonCandidate)
    if (parsed.feedback) {
      cleaned = String(parsed.feedback)
    }
  } catch (_) {
    cleaned = text.replace(new RegExp('\\x60{3}(?:json)?', 'gi'), '')
  }

  cleaned = cleaned
    .replace(/"strengths"\s*:\s*\[[^\]]*\]/gi, '')
    .replace(/"improvements"\s*:\s*\[[^\]]*\]/gi, '')
    .replace(/"feedback"\s*:\s*"?/i, '')
    .replace(/\\n/g, ' ')
    .replace(/"\s*,\s*$/, '')
    .trim()

  return cleaned || text
}

function escapeHtml(value) {
  if (typeof value !== 'string') return ''
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function postJson(path, body){
  const resp = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type':'application/json',
      ${anonKey ? `'apikey': anonKey,
      'Authorization': 'Bearer ' + anonKey,` : ""}
    },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || ('Request failed with status ' + resp.status));
  }
  return resp.json();
}

if (hints.length) {
  document.getElementById('hint').addEventListener('click', () => {
    alert('Hints:\\n\\n' + hints.map((hint, index) => (index + 1) + '. ' + hint).join('\\n'));
  });
}

document.getElementById('submit').addEventListener('click', async () => {
  const answer = document.getElementById('answer').value.trim();
  if(!answer) return alert('Please write a response first.');
  document.getElementById('feedback').innerText = 'Evaluating...';

  try {
    const body = { simulation, userResponse: answer };
    const res = await postJson(evaluateUrl, body);
    if(!res || res.error) {
      document.getElementById('feedback').innerText = 'Error: ' + res.error;
      return;
    }
    const strengths = Array.isArray(res.strengths) ? res.strengths : []
    const improvements = Array.isArray(res.improvements) ? res.improvements : []
    const breakdown = buildScoreBreakdown(res.score)

    document.getElementById('feedback').innerHTML =
      '<div class="feedback-header">' +
        '<div class="feedback-title">Scoring & Feedback</div>' +
        '<div class="score-chip">' + escapeHtml(String(res.score ?? 'N/A')) + ' / 100 <span>Performance Score</span></div>' +
      '</div>' +
      '<div class="score-bars">' +
        breakdown.map(segment => (
          '<div>' +
            '<div class="score-row">' + escapeHtml(String(segment.label)) + ' — ' + escapeHtml(String(segment.achieved)) + ' / ' + escapeHtml(String(segment.target)) + '</div>' +
            '<div class="score-meter"><div class="score-meter-fill" style="width:' + Math.round(Math.min(1, Math.max(0, segment.fill)) * 100) + '%"></div></div>' +
          '</div>'
        )).join('') +
      '</div>' +
      (res.feedback ? '<div class="report-section"><h4>Evaluator Summary</h4><div class="summary-text">' + escapeHtml(String(res.feedback)) + '</div></div>' : '') +
      (strengths.length ? '<div class="report-section"><h4>Recognized Strengths</h4><ul>' + strengths.map(item => '<li>' + escapeHtml(String(item)) + '</li>').join('') + '</ul></div>' : '') +
      (improvements.length ? '<div class="report-section"><h4>Recommended Improvements</h4><ul>' + improvements.map(item => '<li>' + escapeHtml(String(item)) + '</li>').join('') + '</ul></div>' : '');
  } catch (e) {
    document.getElementById('feedback').innerText = 'Evaluation failed: ' + e.message;
  }
});
</script>
</body>
</html>`
}

