import { GoogleGenAI, Type } from "@google/genai";
import { User, Channel, Message, Scenario, Evaluation } from '../types';

let ai: GoogleGenAI | null = null;
if (process.env.API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

// Helper to get system instruction based on persona
const getPersonaInstruction = (user: User) => {
  return `
    You are roleplaying as ${user.name}, a ${user.role} at a tech company.
    Your bio is: "${user.bio}".
    You are communicating in a Slack-like workspace.
    Keep your messages relatively short, informal (unless your persona is formal), and realistic for a work environment.
    Use common tech slang if appropriate for the role.
    Do not use hashtags.
    Do not include the name of the speaker in the output, just the message content.
  `;
};

export const generateIncomingMessage = async (
  senderId: string, 
  allUsers: User[], 
  channel: Channel
): Promise<string> => {
  if (!ai) return "API Key missing. Simulation disabled.";

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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: getPersonaInstruction(sender),
        temperature: 0.8, // Higher creativity for variety
        maxOutputTokens: 60,
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Thinking about the roadmap..."; // Fallback
  }
};

export const generateReply = async (
  senderId: string,
  allUsers: User[],
  messageHistory: Message[],
  lastUserMessage: string,
  scenario?: Scenario
): Promise<string> => {
  if (!ai) return "I can't reply without an API Key.";

  const sender = allUsers.find(u => u.id === senderId);
  if (!sender) return "...";

  // Build a tiny bit of history context (last 5 messages)
  const recentHistory = messageHistory.slice(-5).map(m => {
    const u = allUsers.find(user => user.id === m.senderId);
    return `${u?.name} (${u?.role}): ${m.text}`;
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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: getPersonaInstruction(sender),
        temperature: 0.7,
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Got it.";
  }
};

export const evaluatePerformance = async (
  scenario: Scenario,
  messageHistory: Message[],
  allUsers: User[]
): Promise<Evaluation> => {
  if (!ai) return { score: 0, feedback: "No API Key", strengths: [], weaknesses: [] };

  // Filter messages to only those since the scenario started (roughly)
  // For simplicity, we just take the last 15 messages in the channel as context
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
    
    Provide the output in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Score out of 10" },
            feedback: { type: Type.STRING, description: "2-3 sentences of overall feedback" },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as Evaluation;
    }
    throw new Error("No text response");
  } catch (error) {
    console.error("Evaluation Error:", error);
    return {
      score: 5,
      feedback: "Could not generate evaluation due to an error.",
      strengths: [],
      weaknesses: []
    };
  }
};