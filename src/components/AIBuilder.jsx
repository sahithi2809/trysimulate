import React, { useState } from 'react';
import { generateHTMLSimulation, regenerateHTMLSimulation } from '../services/secureAiService';
import { saveCustomSimulation } from '../utils/storage';

const AIBuilder = ({ onSimulationCreated }) => {
  const [step, setStep] = useState(1);
  const [userPrompt, setUserPrompt] = useState('');
  const [generatedSimulation, setGeneratedSimulation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [regenerationFeedback, setRegenerationFeedback] = useState('');

  const handleGenerateSimulation = async () => {
    if (!userPrompt.trim()) {
      setError('Please enter a prompt to generate your simulation');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const simulation = await generateHTMLSimulation(userPrompt);
      setGeneratedSimulation(simulation);
      setStep(2); // Move to preview/publish step
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
        generatedSimulation.htmlContent,
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

  const handlePublish = () => {
    try {
      const savedSimulation = saveCustomSimulation(generatedSimulation);
      onSimulationCreated(savedSimulation);
      alert('✅ Simulation published successfully!');
      // Reset form
      setStep(1);
      setUserPrompt('');
      setGeneratedSimulation(null);
      setRegenerationFeedback('');
      setError(null);
    } catch (err) {
      setError('Failed to publish simulation. Please try again.');
    }
  };

  const handleStartOver = () => {
    setStep(1);
    setUserPrompt('');
    setGeneratedSimulation(null);
    setRegenerationFeedback('');
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Step 1: Prompt Input */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🤖✨</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">AI Simulation Builder</h2>
            <p className="text-slate-600 text-lg">
              Describe your ideal simulation in natural language, and our AI will create it instantly
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                What simulation would you like to create?
              </label>
              <textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Examples:
• Create a customer service simulation for handling angry customers at an e-commerce company
• Build a sales negotiation scenario where I'm selling SaaS software to a startup founder
• Make a product manager prioritization exercise with competing feature requests
• Design a team conflict resolution simulation between engineering and marketing
• Create a crisis management simulation for a social media manager handling a PR issue"
                className="w-full h-48 px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-primary focus:ring focus:ring-primary/20 transition-all resize-none text-slate-800"
                disabled={loading}
              />
              <div className="mt-2 text-sm text-slate-500">
                💡 Tip: Be specific! Mention company types, roles, and exact scenarios for best results.
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-center">
                  <span className="text-red-700 font-medium">⚠️ {error}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleGenerateSimulation}
              disabled={loading || !userPrompt.trim()}
              className="w-full px-6 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Your Simulation with AI...
                </span>
              ) : (
                '🚀 Generate Simulation with AI'
              )}
            </button>
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

          {/* Simulation Preview */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800">Simulation Preview</h3>
            </div>
            <div className="p-4">
              <iframe
                srcDoc={generatedSimulation.htmlContent}
                title="Simulation Preview"
                className="w-full border border-slate-200 rounded-lg"
                style={{ minHeight: '600px' }}
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
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
