/**
 * Slack Simulation Service
 * Handles AI-generated messages using Gemini API
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Helper to get system instruction based on persona
const getPersonaInstruction = (user) => {
  return `
    You are roleplaying as ${user.name}, a ${user.role} at a tech company.
    Your bio is: "${user.bio || ''}".
    You are communicating in a Slack-like workspace.
    Keep your messages relatively short, informal (unless your persona is formal), and realistic for a work environment.
    Use common tech slang if appropriate for the role.
    Do not use hashtags.
    Do not include the name of the speaker in the output, just the message content.
  `;
};

export const generateIncomingMessage = async (senderId, allUsers, channel) => {
  if (!GEMINI_API_KEY) {
    return "API Key missing. Simulation disabled.";
  }

  const sender = allUsers.find(u => u.id === senderId);
  if (!sender) return "Error: Sender not found.";

  const prompt = `
    Context: You are posting a message in the channel "${channel.name}".
    The purpose of this channel is: "${channel.purpose || 'General discussion'}".
    
    Generate a single realistic Slack message that this person might send right now.
    It could be a question, a status update, a complaint, or a random thought relevant to their role and the channel.
    If the channel is 'general', keep it light or company related.
    If 'engineering', make it technical.
    If 'design', make it about UX/UI.
    
    Current mood: slightly stressed but professional.
  `;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        systemInstruction: {
          parts: [{
            text: getPersonaInstruction(sender)
          }]
        },
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 60,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Thinking about the roadmap...";
    return text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Thinking about the roadmap..."; // Fallback
  }
};

export const generateReply = async (senderId, allUsers, messageHistory, lastUserMessage, scenario) => {
  if (!GEMINI_API_KEY) {
    return "I can't reply without an API Key.";
  }

  const sender = allUsers.find(u => u.id === senderId);
  if (!sender) return "...";

  // Build a tiny bit of history context (last 5 messages)
  const recentHistory = messageHistory.slice(-5).map(m => {
    const u = allUsers.find(user => user.id === m.senderId);
    return `${u?.name || 'User'} (${u?.role || 'Unknown'}): ${m.text}`;
  }).join('\n');

  let scenarioContext = "";
  if (scenario) {
    scenarioContext = `
      CRITICAL CONTEXT: There is an active conflict scenario: "${scenario.title}".
      Description: ${scenario.description}
      You are a stakeholder in this. React according to your role and bio.
      If you are the initiator, press your point. 
      If you are an opposing stakeholder, argue back or express concern.
      If you are neutral, be confused or ask for clarification.
    `;
  }

  const prompt = `
    Context: You are in a chat conversation.
    ${scenarioContext}

    Recent history:
    ${recentHistory}
    
    The Product Manager (User) just said: "${lastUserMessage}"
    
    Reply to the conversation. Address the PM or the previous speaker.
    Maintain your persona (${sender.role}).
    Keep it under 3 sentences. Be reactive and opinionated.
  `;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        systemInstruction: {
          parts: [{
            text: getPersonaInstruction(sender)
          }]
        },
        generationConfig: {
          temperature: 0.7,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Got it.";
    return text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Got it.";
  }
};

export const evaluatePerformance = async (scenario, messageHistory, allUsers) => {
  if (!GEMINI_API_KEY) {
    return { score: 0, feedback: "No API Key", strengths: [], weaknesses: [] };
  }

  // Filter messages to only those since the scenario started (roughly)
  const relevantHistory = messageHistory.slice(-15).map(m => {
    const u = allUsers.find(user => user.id === m.senderId);
    return `${u?.name || 'User'}: ${m.text}`;
  }).join('\n');

  const prompt = `
    You are a Senior Product Leader and mentor.
    A Junior PM (User) has just handled a conflict scenario in a simulated workplace.
    
    Scenario Title: ${scenario.title}
    Scenario Description: ${scenario.description}
    
    Transcript of the resolution attempt:
    ${relevantHistory}
    
    Evaluate the PM's performance based on:
    1. Stakeholder Empathy (Did they listen?)
    2. Business Value (Did they protect the business interests?)
    3. Communication (Was it clear and professional?)
    4. Decision Making (Did they find a resolution or just delay?)
    
    Provide the output in JSON format with: score (number 1-10), feedback (string), strengths (array of strings), weaknesses (array of strings).
  `;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (text) {
      try {
        return JSON.parse(text);
      } catch (parseError) {
        // Try to extract JSON from text if it's wrapped
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw parseError;
      }
    }
    
    throw new Error("No text response");
  } catch (error) {
    console.error("Evaluation Error:", error);
    return {
      score: 5,
      feedback: "Could not generate evaluation due to an error. Please try again.",
      strengths: ["Attempted to engage with the scenario"],
      weaknesses: ["Evaluation service unavailable"]
    };
  }
};

