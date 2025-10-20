import React, { useState } from 'react';
import { analyzePrompt, generateSimulation, regenerateSimulation } from '../services/aiService';
import { saveCustomSimulation } from '../utils/storage';

const AIBuilder = ({ onSimulationCreated }) => {
  const [step, setStep] = useState(1);
  const [userPrompt, setUserPrompt] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [generatedSimulation, setGeneratedSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [regenerationFeedback, setRegenerationFeedback] = useState('');

  const handleAnalyzePrompt = async () => {
    if (!userPrompt.trim()) {
      setError('Please enter a prompt to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const analysisResult = await analyzePrompt(userPrompt);
      setAnalysis(analysisResult);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSimulation = async () => {
    setLoading(true);
    setError(null);

    try {
      const simulation = await generateSimulation(analysis, userPrompt);
      setGeneratedSimulation(simulation);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const simulation = await regenerateSimulation(analysis, userPrompt, regenerationFeedback);
      setGeneratedSimulation(simulation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = () => {
    try {
      const savedSimulation = saveCustomSimulation(generatedSimulation);
      onSimulationCreated(savedSimulation);
      alert('Simulation published successfully!');
      // Reset form
      setStep(1);
      setUserPrompt('');
      setAnalysis(null);
      setGeneratedSimulation(null);
      setRegenerationFeedback('');
    } catch (err) {
      setError('Failed to publish simulation. Please try again.');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'customer-comments': return '💬';
      case 'sales-negotiation': return '💼';
      case 'prioritization': return '📋';
      case 'team-conflict': return '👥';
      default: return '🎯';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step 1: Prompt Input */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              AI Simulation Builder
            </h2>
            <p className="text-lg text-slate-600">
              Describe your simulation idea in natural language, and our AI will create a complete, professional simulation for you.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                Describe Your Simulation Idea
              </label>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Example: Create a simulation where a product manager handles a major bug in production and needs to prioritize tasks while managing stakeholder expectations..."
                rows={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-bold text-blue-900 mb-2">💡 Tips for Better Results:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Include the role (e.g., "product manager", "sales executive")</li>
                <li>• Describe the situation or challenge</li>
                <li>• Mention the industry or context if relevant</li>
                <li>• Be specific about what skills you want to test</li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <button
              onClick={handleAnalyzePrompt}
              disabled={loading || !userPrompt.trim()}
              className={`w-full py-4 text-lg font-semibold text-white rounded-xl transition-all ${
                loading || !userPrompt.trim()
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-accent hover:shadow-2xl transform hover:scale-105'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing your prompt...
                </span>
              ) : (
                '✨ Analyze & Generate Simulation'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Analysis Review */}
      {step === 2 && analysis && (
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Analysis Results</h2>
            <button
              onClick={() => setStep(1)}
              className="text-slate-600 hover:text-slate-800"
            >
              ← Back to Edit
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-slate-600 mb-1">Interaction Type</div>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">🤖</span>
                  <span className="font-bold text-slate-900 capitalize">
                    {analysis.interactionType?.replace('-', ' ') || 'Custom'}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-600 mb-1">Role</div>
                <div className="font-bold text-slate-900">{analysis.role}</div>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-600 mb-1">Category</div>
                <div className="font-bold text-slate-900">{analysis.category}</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-slate-600 mb-1">Difficulty</div>
                <div className="font-bold text-slate-900">{analysis.difficulty}</div>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-600 mb-1">Duration</div>
                <div className="font-bold text-slate-900">{analysis.duration}</div>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-600 mb-1">Title</div>
                <div className="font-bold text-slate-900">{analysis.title}</div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-sm font-semibold text-slate-600 mb-2">Context</div>
            <div className="text-slate-700 bg-slate-50 rounded-lg p-4">
              {analysis.context}
            </div>
          </div>

          {analysis.learningObjectives && analysis.learningObjectives.length > 0 && (
            <div className="mb-6">
              <div className="text-sm font-semibold text-slate-600 mb-2">Learning Objectives</div>
              <ul className="space-y-1">
                {analysis.learningObjectives.map((objective, index) => (
                  <li key={index} className="text-slate-700 flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.skillsTested && analysis.skillsTested.length > 0 && (
            <div className="mb-6">
              <div className="text-sm font-semibold text-slate-600 mb-2">Skills Tested</div>
              <div className="flex flex-wrap gap-2">
                {analysis.skillsTested.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleGenerateSimulation}
              disabled={loading}
              className={`flex-1 py-3 font-semibold text-white rounded-lg transition-all ${
                loading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-accent hover:shadow-lg'
              }`}
            >
              {loading ? 'Generating...' : '🚀 Generate Simulation'}
            </button>
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
            >
              Edit Prompt
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Generated Simulation Preview */}
      {step === 3 && generatedSimulation && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Generated Simulation</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(2)}
                  className="text-slate-600 hover:text-slate-800"
                >
                  ← Back to Analysis
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-sm font-semibold text-slate-600 mb-1">Title</div>
                <div className="font-bold text-slate-900 text-lg">{generatedSimulation.title}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-600 mb-1">Type</div>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">🤖</span>
                  <span className="font-bold text-slate-900 capitalize">
                    {generatedSimulation.interactionType?.replace('-', ' ') || 'AI Generated'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <div className="text-sm font-semibold text-slate-600 mb-2">Scenario Preview</div>
              <pre className="text-sm text-slate-700 whitespace-pre-wrap">
                {JSON.stringify(generatedSimulation.scenario, null, 2)}
              </pre>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handlePublish}
                className="flex-1 py-3 font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:shadow-lg transition-all"
              >
                🚀 Publish Simulation
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-6 py-3 font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Regeneration */}
      {step === 4 && (
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Regenerate Simulation</h2>
            <button
              onClick={() => setStep(3)}
              className="text-slate-600 hover:text-slate-800"
            >
              ← Back to Preview
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                What would you like to change? (Optional)
              </label>
              <textarea
                value={regenerationFeedback}
                onChange={(e) => setRegenerationFeedback(e.target.value)}
                placeholder="Example: Make it more challenging, focus on technical skills, add more realistic details..."
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleRegenerate}
                disabled={loading}
                className={`flex-1 py-3 font-semibold text-white rounded-lg transition-all ${
                  loading
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary to-accent hover:shadow-lg'
                }`}
              >
                {loading ? 'Regenerating...' : '🔄 Regenerate Simulation'}
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIBuilder;
