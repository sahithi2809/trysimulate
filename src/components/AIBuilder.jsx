import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateHTMLSimulation, regenerateHTMLSimulation } from '../services/secureAiService';
import { databaseService } from '../services/databaseService';
import { activityService } from '../services/activityService';

const AIBuilder = ({ onSimulationCreated }) => {
  const [step, setStep] = useState(1);
  const [generatedSimulation, setGeneratedSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [regenerationFeedback, setRegenerationFeedback] = useState('');
  
  // Enhanced form data
  const [formData, setFormData] = useState({
    // Basic Info
    title: '',
    description: '',
    
    // Simulation Type
    simulationType: '',
    
    // Learning Objectives
    learningObjectives: [],
    currentObjective: '',
    
    // Skills Being Tested
    skillsTested: [],
    
    // Target Audience
    targetAudience: '',
    experienceLevel: '',
    
    // Context & Setting
    industry: '',
    companySize: '',
    scenarioContext: '',
    
    // Simulation Parameters
    duration: '',
    difficulty: '',
    numberOfSteps: 5,
    
    // Specific Requirements
    specificRequirements: [],
    currentRequirement: '',
    
    // Additional Context
    additionalContext: ''
  });

  // Form helper functions
  const addLearningObjective = () => {
    if (formData.currentObjective.trim()) {
      setFormData({
        ...formData,
        learningObjectives: [...formData.learningObjectives, formData.currentObjective.trim()],
        currentObjective: ''
      });
    }
  };

  const removeLearningObjective = (index) => {
    setFormData({
      ...formData,
      learningObjectives: formData.learningObjectives.filter((_, i) => i !== index)
    });
  };

  const addRequirement = () => {
    if (formData.currentRequirement.trim()) {
      setFormData({
        ...formData,
        specificRequirements: [...formData.specificRequirements, formData.currentRequirement.trim()],
        currentRequirement: ''
      });
    }
  };

  const removeRequirement = (index) => {
    setFormData({
      ...formData,
      specificRequirements: formData.specificRequirements.filter((_, i) => i !== index)
    });
  };

  const toggleSkill = (skill) => {
    setFormData({
      ...formData,
      skillsTested: formData.skillsTested.includes(skill)
        ? formData.skillsTested.filter(s => s !== skill)
        : [...formData.skillsTested, skill]
    });
  };

  const generateStructuredPrompt = () => {
    const header = `
You are an AI-powered business simulation expert. Your goal is to create a dynamic and realistic business simulation.

---
**SIMULATION REQUIREMENTS:**

**Title:** ${formData.title || 'Not specified'}
**Description:** ${formData.description || 'Not specified'}
**Target Audience:** ${formData.targetAudience || 'Not specified'}
**Type of Simulation:** ${formData.simulationType || 'General (AI may choose best format)'}
**Learning Objectives:** ${formData.learningObjectives.length > 0 ? formData.learningObjectives.map(obj => `- ${obj}`).join('\n') : 'Not specified'}
**Skills to be Tested:** ${formData.skillsTested.length > 0 ? formData.skillsTested.join(', ') : 'Not specified'}
**Industry & Experience Level:** ${formData.industry || 'Not specified'}, ${formData.experienceLevel || 'Not specified'}
**Scenario Context:** ${formData.scenarioContext || 'Not specified'}
**Duration:** ${formData.duration || 'Not specified'}
**Difficulty:** ${formData.difficulty || 'Not specified'}
**Number of Steps:** ${formData.numberOfSteps || 5}
**Specific Requirements:** ${formData.specificRequirements.length > 0 ? formData.specificRequirements.map(req => `- ${req}`).join('\n') : 'None specified'}
**Additional Context:** ${formData.additionalContext || 'None'}

---
**SIMULATION GENERATION INSTRUCTIONS:**

1. **Structure:** Create a step-by-step simulation. Each step must clearly present the scenario, offer three distinct decision choices (A, B, C), and explain the immediate outcome of each choice.
2. **Realism:** Ensure all scenarios, decisions, and outcomes feel authentic for the specified audience, industry, and role.
3. **Engagement:** Make the narrative immersive and challenging, introducing real workplace stakes.
4. **Learning:** Explicitly connect choices and outcomes to the learning objectives and skills being assessed.
5. **Output Format (IMPORTANT):**
   Provide the simulation in the following markdown structure:

   # Simulation: ${formData.title}

   ## Introduction
   [Write an engaging intro based on the description]

   ## Setup
   [Describe initial conditions, roles, industry context, experience level, scenario setup]

   ${Array.from({ length: formData.numberOfSteps || 5 }, (_, i) => `## Step ${i + 1}: [Step Title]
   ### Scenario
   [Detailed scenario description for Step ${i + 1}]
   ### Your Options:
   A. [Option 1 that tests ${formData.skillsTested.join(', ')}]
   B. [Option 2]
   C. [Option 3]
   ### Potential Outcomes:
   *   **If you choose A:** [Describe outcome, consequences, and skills demonstrated]
   *   **If you choose B:** [Describe outcome, consequences, and skills demonstrated]
   *   **If you choose C:** [Describe outcome, consequences, and skills demonstrated]
   ---`).join('\n\n')}

   **CRITICAL:** Return ONLY valid JSON with this structure:
   {
     "metadata": {
       "title": "${formData.title}",
       "description": "${formData.description}",
       "category": "Based on the simulation (e.g., Product Management, Sales, Leadership, etc.)",
       "difficulty": "${formData.difficulty}",
       "duration": "${formData.duration}",
       "learningObjectives": ${JSON.stringify(formData.learningObjectives)}
     },
     "markdownContent": "# Simulation: ${formData.title}\\n\\n## Introduction\\n...complete markdown output with all steps and outcomes..."
   }

**SIMULATION REQUIREMENTS:**
- Use SPECIFIC company names, realistic metrics, and stakeholder dynamics appropriate for ${formData.industry || 'the chosen industry'}.
- Tie every choice to the skills being tested: ${formData.skillsTested.join(', ') || 'core workplace competencies'}.
- Ensure consequences feel tangible and insightful for ${formData.targetAudience || 'the intended audience'} at a/an ${formData.experienceLevel || 'appropriate'} level.
- Maintain the requested duration of ${formData.duration || '15-20 minutes'} with ${formData.numberOfSteps || 5} pivotal steps.
- Highlight ${formData.learningObjectives.join(', ') || 'key learning goals'} throughout the narrative.

**Start generating the simulation now, beginning with the Introduction.**
`;

    return header;
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.simulationType) errors.simulationType = "Please select a simulation type";
    if (formData.learningObjectives.length === 0) errors.learningObjectives = "Add at least one learning objective";
    if (formData.skillsTested.length === 0) errors.skillsTested = "Select at least one skill";
    if (!formData.targetAudience) errors.targetAudience = "Please select target audience";
    if (!formData.industry) errors.industry = "Please select industry";
    if (!formData.duration) errors.duration = "Please select duration";
    if (!formData.difficulty) errors.difficulty = "Please select difficulty";
    
    return errors;
  };

  const handleGenerateSimulation = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setError(Object.values(errors)[0]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const structuredPrompt = generateStructuredPrompt();
      console.log('🤖 Generating simulation with structured prompt:', structuredPrompt);
      
      const simulation = await generateHTMLSimulation(structuredPrompt);
      console.log('🎯 Generated simulation:', simulation);
      console.log('📄 Markdown length:', simulation.markdownContent?.length);
      setGeneratedSimulation(simulation);
      setStep(2); // Move to preview step
    } catch (err) {
      setError(`Failed to generate simulation: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!regenerationFeedback.trim()) {
      setError('Please provide feedback for regeneration');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const simulation = await regenerateHTMLSimulation(
        generatedSimulation.markdownContent,
        regenerationFeedback
      );
      setGeneratedSimulation(simulation);
      setRegenerationFeedback('');
    } catch (err) {
      setError(`Failed to regenerate simulation: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('💾 Saving simulation to database...');
      
      // Save to database with structured form data
      const savedSimulation = await databaseService.saveSimulation({
        ...generatedSimulation,
        userPrompt: generateStructuredPrompt(),
        formData: formData
      });
      
      console.log('✅ Simulation saved to database:', savedSimulation.id);
      
      // Log activity
      await activityService.logActivity('simulation_created', {
        simulation_id: savedSimulation.id,
        title: savedSimulation.title,
        category: savedSimulation.category,
      });
      
      await activityService.logActivity('simulation_published', {
        simulation_id: savedSimulation.id,
        title: savedSimulation.title,
      });
      
      onSimulationCreated(savedSimulation);
      alert('✅ Simulation published successfully to database!');
      
      // Reset form
      setStep(1);
      setUserPrompt('');
      setGeneratedSimulation(null);
      setRegenerationFeedback('');
    } catch (err) {
      console.error('❌ Error saving simulation to database:', err);
      setError(`Failed to publish simulation: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    setStep(1);
    setGeneratedSimulation(null);
    setRegenerationFeedback('');
    setError(null);
    setFormData({
      title: '',
      description: '',
      simulationType: '',
      learningObjectives: [],
      currentObjective: '',
      skillsTested: [],
      targetAudience: '',
      experienceLevel: '',
      industry: '',
      companySize: '',
      scenarioContext: '',
      duration: '',
      difficulty: '',
      numberOfSteps: 5,
      specificRequirements: [],
      currentRequirement: '',
      additionalContext: ''
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Step 1: Enhanced Form */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🤖✨</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2"> Create your own simulations</h2>
            {/* <p className="text-slate-600 text-lg">
              Create your own simulations with AI 
            </p> */}
          </div>

          <div className="space-y-8">
            {/* Basic Information */}
            <div className="form-section">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">📝 Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Simulation Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Customer Service Training Simulation"
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Target Audience *
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                  >
                    <option value="">Select target audience</option>
                    <option value="Customer Service">Customer Service</option>
                    <option value="Sales Team">Sales Team</option>
                    <option value="Managers">Managers</option>
                    <option value="New Hires">New Hires</option>
                    <option value="General Staff">General Staff</option>
                    <option value="Students">Students</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of what this simulation will teach..."
                  className="w-full h-24 px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-primary focus:ring focus:ring-primary/20 transition-all resize-none"
                />
              </div>
            </div>

            {/* Simulation Type */}
            <div className="form-section">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">🎯 What type of simulation?</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { value: 'role-play', label: '🎭 Role Play', desc: 'Interactive conversations' },
                  { value: 'decision-tree', label: '🌳 Decision Tree', desc: 'Multiple choice scenarios' },
                  { value: 'scenario-based', label: '📋 Scenario Based', desc: 'Step-by-step situations' },
                  { value: 'interactive-story', label: '📖 Interactive Story', desc: 'Narrative with choices' }
                ].map(type => (
                  <label key={type.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="simulationType"
                      value={type.value}
                      checked={formData.simulationType === type.value}
                      onChange={(e) => setFormData({...formData, simulationType: e.target.value})}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg text-center transition-all ${
                      formData.simulationType === type.value 
                        ? 'border-primary bg-primary/5' 
                        : 'border-slate-300 hover:border-slate-400'
                    }`}>
                      <div className="text-2xl mb-2">{type.label.split(' ')[0]}</div>
                      <div className="font-semibold text-slate-800">{type.label.split(' ').slice(1).join(' ')}</div>
                      <div className="text-sm text-slate-600 mt-1">{type.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Learning Objectives */}
            <div className="form-section">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">🎓 Learning Objectives *</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.currentObjective}
                    onChange={(e) => setFormData({...formData, currentObjective: e.target.value})}
                    placeholder="Add learning objective (press Enter)"
                    className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && addLearningObjective()}
                  />
                  <button
                    type="button"
                    onClick={addLearningObjective}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.learningObjectives.map((objective, index) => (
                    <span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {objective}
                      <button
                        type="button"
                        onClick={() => removeLearningObjective(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Skills Being Tested */}
            <div className="form-section">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">💪 Skills Being Tested *</h3>
              <div className="grid md:grid-cols-3 gap-3">
                {['Communication', 'Leadership', 'Problem Solving', 'Empathy', 'Negotiation', 'Time Management', 'Critical Thinking', 'Teamwork', 'Adaptability', 'Decision Making'].map(skill => (
                  <label key={skill} className="cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.skillsTested.includes(skill)}
                      onChange={() => toggleSkill(skill)}
                      className="sr-only"
                    />
                    <div className={`p-3 border-2 rounded-lg text-center transition-all ${
                      formData.skillsTested.includes(skill)
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}>
                      {skill}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Context & Setting */}
            <div className="form-section">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">🏢 Industry & Context</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Industry *
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                  >
                    <option value="">Select industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Retail">Retail</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Experience Level *
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                  >
                    <option value="">Select level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Scenario Context
                </label>
                <textarea
                  value={formData.scenarioContext}
                  onChange={(e) => setFormData({...formData, scenarioContext: e.target.value})}
                  placeholder="Describe the specific situation or context..."
                  className="w-full h-20 px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-primary focus:ring focus:ring-primary/20 transition-all resize-none"
                />
              </div>
            </div>

            {/* Simulation Parameters */}
            <div className="form-section">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">⚙️ Simulation Settings</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Duration *
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                  >
                    <option value="">Select duration</option>
                    <option value="5-10 minutes">5-10 minutes</option>
                    <option value="10-15 minutes">10-15 minutes</option>
                    <option value="15-20 minutes">15-20 minutes</option>
                    <option value="20-30 minutes">20-30 minutes</option>
                    <option value="30+ minutes">30+ minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Difficulty *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                  >
                    <option value="">Select difficulty</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Number of Steps
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.numberOfSteps}
                    onChange={(e) => setFormData({...formData, numberOfSteps: parseInt(e.target.value) || 5})}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Specific Requirements */}
            <div className="form-section">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">📋 Specific Requirements</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.currentRequirement}
                    onChange={(e) => setFormData({...formData, currentRequirement: e.target.value})}
                    placeholder="Add specific requirement (press Enter)"
                    className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-primary focus:ring focus:ring-primary/20 transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                  />
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.specificRequirements.map((requirement, index) => (
                    <span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {requirement}
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Context */}
            <div className="form-section">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">💭 Additional Context</h3>
              <textarea
                value={formData.additionalContext}
                onChange={(e) => setFormData({...formData, additionalContext: e.target.value})}
                placeholder="Any additional context, special instructions, or specific details..."
                className="w-full h-20 px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-primary focus:ring focus:ring-primary/20 transition-all resize-none"
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-center">
                  <span className="text-red-700 font-medium">⚠️ {error}</span>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <div className="flex justify-center pt-6">
              <button
                onClick={handleGenerateSimulation}
                disabled={loading}
                className="px-12 py-4 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </div>
                ) : (
                  '✨ Generate Simulation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Preview & Publish */}
      {step === 2 && generatedSimulation && (
        <div className="space-y-6">
          {/* Simulation Info Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {generatedSimulation.title}
                </h2>
                <p className="text-slate-600 mb-4">{generatedSimulation.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {generatedSimulation.category}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {generatedSimulation.difficulty}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    ⏱️ {generatedSimulation.duration}
                  </span>
                </div>
              </div>
            </div>

            {generatedSimulation.learningObjectives && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Learning Objectives:</h3>
                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                  {generatedSimulation.learningObjectives.map((obj, index) => (
                    <li key={index}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Markdown Preview Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">📱 Simulation Preview</h3>
            <div className="border-2 border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="ml-2 text-sm text-slate-600">Simulation Preview</span>
                </div>
              </div>
              <div className="bg-white">
                {generatedSimulation.markdownContent ? (
                  <div className="p-6 max-h-[70vh] overflow-y-auto prose prose-slate max-w-none">
                    <ReactMarkdown>{generatedSimulation.markdownContent}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    <div className="text-4xl mb-4">⚠️</div>
                    <div className="text-lg font-medium mb-2">No markdown content generated</div>
                    <div className="text-sm">The simulation generation may have failed. Check the console for errors.</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Regeneration Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-slate-800 mb-3">Want to improve it?</h3>
            <p className="text-sm text-slate-600 mb-4">
              Provide feedback and the AI will regenerate the simulation with improvements.
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={regenerationFeedback}
                onChange={(e) => setRegenerationFeedback(e.target.value)}
                placeholder="e.g., Make it more challenging, Add more specific metrics, Include time pressure..."
                className="flex-1 px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-primary focus:ring focus:ring-primary/20"
                disabled={loading}
              />
              <button
                onClick={handleRegenerate}
                disabled={loading || !regenerationFeedback.trim()}
                className="px-6 py-2 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Regenerating...' : '🔄 Regenerate'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="text-red-700 font-medium">⚠️ {error}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleStartOver}
              className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
            >
              ← Start Over
            </button>
            <button
              onClick={handlePublish}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
            >
              ✅ Publish Simulation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIBuilder;
