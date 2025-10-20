import OpenAI from 'openai';

// For production, this should be moved to a backend service
const API_KEY = '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';

const openai = new OpenAI({
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true
});

// Analyze user prompt to extract simulation parameters
export const analyzePrompt = async (userPrompt) => {
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
    
    Rules:
    - Design the most appropriate interaction type for this scenario
    - Extract the main role and context from the prompt
    - Determine appropriate difficulty level based on complexity
    - Select relevant category and skills
    - Create an engaging, specific title
    - Define clear learning objectives and skills being tested
    - Make the context detailed and realistic
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing workplace scenarios and extracting simulation parameters. Always return valid JSON."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    console.log('OpenAI Response:', content);
    const analysis = JSON.parse(content);
    return analysis;
  } catch (error) {
    console.error('Prompt analysis error:', error);
    console.error('Error details:', error.message);
    throw new Error(`Failed to analyze prompt: ${error.message}`);
  }
};

// Generate complete simulation based on analyzed parameters
export const generateSimulation = async (analysis, originalPrompt) => {
  const { simulationType, interactionType, role, context, difficulty, category, title, learningObjectives, skillsTested } = analysis;
  
  const generationPrompt = `
    Create a complete, unique workplace simulation based on this analysis:
    
    Original Prompt: "${originalPrompt}"
    Interaction Type: ${interactionType}
    Role: ${role}
    Context: ${context}
    Difficulty: ${difficulty}
    Category: ${category}
    Title: ${title}
    Learning Objectives: ${JSON.stringify(learningObjectives)}
    Skills Tested: ${JSON.stringify(skillsTested)}
    
    Generate a realistic, engaging simulation with a custom JSON structure that matches the interaction type:
    
    ${getDynamicStructureForType(interactionType)}
    
    Requirements:
    - Create a unique simulation structure that fits the scenario perfectly
    - Make it realistic and industry-specific with authentic details
    - Include 3-7 decision points, challenges, or interactions
    - Ensure it tests the specified skills and meets learning objectives
    - Make it engaging but appropriately complex for the difficulty level
    - Include specific, realistic workplace details and context
    - Create scenarios that feel authentic to the role and industry
    - Design interactions that naturally test the required skills
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert in creating workplace simulations for professional development. Generate realistic, engaging scenarios that help people practice real-world skills. Always return valid JSON."
        },
        {
          role: "user",
          content: generationPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    console.log('Simulation Generation Response:', content);
    // Clean the response to ensure valid JSON
    const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const simulation = JSON.parse(cleanedContent);
    
    return {
      ...simulation,
      title,
      type: 'custom', // Always custom for AI-generated
      interactionType: interactionType,
      category,
      difficulty,
      duration: analysis.duration,
      description: `AI-generated simulation: ${context}`,
      learningObjectives: learningObjectives,
      skillsTested: skillsTested,
      created: new Date().toISOString().split('T')[0],
      isDefault: false,
      isAIGenerated: true
    };
  } catch (error) {
    console.error('Simulation generation error:', error);
    throw new Error('Failed to generate simulation. Please try again.');
  }
};

// Get dynamic JSON structure based on interaction type
const getDynamicStructureForType = (interactionType) => {
  switch (interactionType) {
    case 'text-input':
      return `{
        "scenario": {
          "role": "string (detailed role description)",
          "context": "string (detailed scenario description)",
          "situation": "string (current situation details)",
          "challenge": "string (main challenge to address)"
        },
        "interactions": [
          {
            "id": 1,
            "type": "text-input",
            "prompt": "string (what the user needs to respond to)",
            "context": "string (additional context for this interaction)",
            "maxLength": 500,
            "evaluationCriteria": {
              "keyPoints": ["point1", "point2", "point3"],
              "tone": "professional|empathetic|assertive",
              "requiredElements": ["element1", "element2"]
            }
          }
        ],
        "evaluation": {
          "rubric": {
            "criterion1": 25,
            "criterion2": 25,
            "criterion3": 25,
            "criterion4": 25
          },
          "feedbackTemplate": "string (template for providing feedback)"
        }
      }`;
    
    case 'multiple-choice':
      return `{
        "scenario": {
          "role": "string (detailed role description)",
          "context": "string (detailed scenario description)",
          "situation": "string (current situation details)"
        },
        "questions": [
          {
            "id": 1,
            "question": "string (the question text)",
            "context": "string (additional context)",
            "options": [
              {"id": "a", "text": "string (option text)", "isCorrect": true},
              {"id": "b", "text": "string (option text)", "isCorrect": false},
              {"id": "c", "text": "string (option text)", "isCorrect": false},
              {"id": "d", "text": "string (option text)", "isCorrect": false}
            ],
            "explanation": "string (explanation of correct answer)",
            "learningPoint": "string (key learning from this question)"
          }
        ],
        "evaluation": {
          "passingScore": 70,
          "feedbackLevels": {
            "excellent": "string (90-100% feedback)",
            "good": "string (70-89% feedback)",
            "needsImprovement": "string (below 70% feedback)"
          }
        }
      }`;
    
    case 'scenario-based':
      return `{
        "scenario": {
          "role": "string (detailed role description)",
          "context": "string (detailed scenario description)",
          "background": "string (background information)",
          "currentSituation": "string (what's happening now)"
        },
        "decisions": [
          {
            "id": 1,
            "situation": "string (decision point description)",
            "context": "string (additional context)",
            "options": [
              {
                "id": "a",
                "text": "string (option description)",
                "consequences": "string (what happens if chosen)",
                "score": 10,
                "reasoning": "string (why this is good/bad)"
              }
            ],
            "bestChoice": "string (id of best option)",
            "learningObjective": "string (what this teaches)"
          }
        ],
        "evaluation": {
          "maxScore": 100,
          "feedbackCriteria": ["criterion1", "criterion2", "criterion3"]
        }
      }`;
    
    case 'decision-tree':
      return `{
        "scenario": {
          "role": "string (detailed role description)",
          "context": "string (detailed scenario description)",
          "initialSituation": "string (starting point)"
        },
        "decisionTree": {
          "root": {
            "id": "start",
            "situation": "string (initial decision point)",
            "options": [
              {
                "id": "option1",
                "text": "string (option description)",
                "nextNode": "node1",
                "consequences": "string (immediate consequences)"
              }
            ]
          },
          "nodes": [
            {
              "id": "node1",
              "situation": "string (resulting situation)",
              "options": [
                {
                  "id": "option2",
                  "text": "string (option description)",
                  "nextNode": "end1",
                  "consequences": "string (consequences)"
                }
              ]
            }
          ],
          "endings": [
            {
              "id": "end1",
              "outcome": "string (final outcome)",
              "score": 85,
              "feedback": "string (feedback on this path)"
            }
          ]
        }
      }`;
    
    case 'role-play':
      return `{
        "scenario": {
          "role": "string (user's role)",
          "context": "string (detailed scenario description)",
          "situation": "string (current situation)",
          "otherParticipants": [
            {
              "name": "string (character name)",
              "role": "string (their role)",
              "personality": "string (their personality traits)",
              "motivations": "string (what they want)"
            }
          ]
        },
        "interactions": [
          {
            "id": 1,
            "participant": "string (who you're talking to)",
            "situation": "string (what's happening)",
            "theirMessage": "string (what they say to you)",
            "context": "string (additional context)",
            "evaluationCriteria": {
              "communication": 30,
              "problemSolving": 30,
              "empathy": 20,
              "leadership": 20
            }
          }
        ],
        "evaluation": {
          "rubric": {
            "communication": 30,
            "problemSolving": 30,
            "empathy": 20,
            "leadership": 20
          }
        }
      }`;
    
    case 'drag-drop':
      return `{
        "scenario": {
          "role": "string (detailed role description)",
          "context": "string (detailed scenario description)",
          "task": "string (what needs to be organized/prioritized)"
        },
        "items": [
          {
            "id": 1,
            "title": "string (item title)",
            "description": "string (item description)",
            "priority": 1,
            "timeEstimate": "string (time needed)",
            "dependencies": ["item2"],
            "impact": "high|medium|low",
            "urgency": "high|medium|low"
          }
        ],
        "categories": [
          {
            "id": "urgent-important",
            "title": "Urgent & Important",
            "description": "Do first"
          },
          {
            "id": "important-not-urgent",
            "title": "Important, Not Urgent",
            "description": "Schedule"
          }
        ],
        "evaluation": {
          "correctPlacements": {
            "item1": "urgent-important",
            "item2": "important-not-urgent"
          },
          "scoringWeights": {
            "correctness": 60,
            "reasoning": 40
          }
        }
      }`;
    
    default:
      return `{
        "scenario": {
          "role": "string (detailed role description)",
          "context": "string (detailed scenario description)",
          "situation": "string (current situation details)"
        },
        "interactions": [
          {
            "id": 1,
            "type": "custom",
            "prompt": "string (what the user needs to do)",
            "context": "string (additional context)",
            "evaluationCriteria": {
              "criterion1": 25,
              "criterion2": 25,
              "criterion3": 25,
              "criterion4": 25
            }
          }
        ],
        "evaluation": {
          "maxScore": 100,
          "feedbackTemplate": "string (template for feedback)"
        }
      }`;
  }
};

// Generate alternative scenarios for regeneration
export const regenerateSimulation = async (analysis, originalPrompt, feedback = '') => {
  const regenerationPrompt = `
    The user wants to regenerate this simulation with the following feedback:
    "${feedback || 'Please create a different version of this simulation'}"
    
    Original Prompt: "${originalPrompt}"
    Analysis: ${JSON.stringify(analysis)}
    
    Create a new version of the simulation that addresses the feedback while maintaining the same core parameters.
    Return the same JSON structure as before.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert in creating workplace simulations. Generate alternative versions based on user feedback. Always return valid JSON."
        },
        {
          role: "user",
          content: regenerationPrompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    console.log('Regeneration Response:', content);
    const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const simulation = JSON.parse(cleanedContent);
    
    return {
      ...simulation,
      title: analysis.title,
      type: 'custom',
      interactionType: analysis.interactionType,
      category: analysis.category,
      difficulty: analysis.difficulty,
      duration: analysis.duration,
      description: `AI-generated simulation: ${analysis.context}`,
      learningObjectives: analysis.learningObjectives,
      skillsTested: analysis.skillsTested,
      created: new Date().toISOString().split('T')[0],
      isDefault: false,
      isAIGenerated: true
    };
  } catch (error) {
    console.error('Regeneration error:', error);
    throw new Error('Failed to regenerate simulation. Please try again.');
  }
};
