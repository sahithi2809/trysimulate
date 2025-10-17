import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveCustomSimulation } from '../utils/storage';

const SimulationBuilder = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    simulationType: '',
    title: '',
    category: '',
    difficulty: 'Intermediate',
    duration: '15 min',
    description: '',
    roleContext: '',
  });
  const [generatedScenario, setGeneratedScenario] = useState(null);

  const simulationTypes = [
    { value: 'customer-comments', label: 'Customer Comments', icon: '💬', desc: 'Reply to customer feedback' },
    { value: 'sales-negotiation', label: 'Sales Negotiation', icon: '💼', desc: 'Navigate pricing discussions' },
    { value: 'prioritization', label: 'Task Prioritization', icon: '📋', desc: 'Drag-drop task ordering' },
    { value: 'team-conflict', label: 'Team Conflict', icon: '👥', desc: 'Resolve team disagreements' },
  ];

  const categories = ['Product Management', 'Sales', 'Leadership', 'Marketing', 'HR', 'Engineering'];

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const mockAIGeneration = () => {
    const { simulationType, title, description, roleContext } = formData;

    // Mock AI-generated scenarios based on type
    let scenario = {};

    switch (simulationType) {
      case 'customer-comments':
        scenario = {
          role: roleContext || 'Customer Support Manager',
          context: description || 'Handle customer complaints professionally.',
          comments: [
            { id: 1, user: 'Customer A', text: 'The product quality is poor. Very disappointed.' },
            { id: 2, user: 'Customer B', text: 'Delivery took way too long. Not acceptable.' },
            { id: 3, user: 'Customer C', text: 'Customer service was rude and unhelpful.' },
          ],
        };
        break;

      case 'sales-negotiation':
        scenario = {
          role: roleContext || 'Sales Executive',
          context: description || 'Navigate a pricing negotiation with a potential client.',
          email: {
            from: 'Potential Client',
            subject: 'Re: Pricing Discussion',
            body: 'Thank you for the proposal. However, the pricing is higher than our budget. Can you offer a discount or flexible payment terms?',
          },
          rubric: {
            empathy: 25,
            value: 30,
            alternatives: 30,
            closing: 15,
          },
        };
        break;

      case 'prioritization':
        const tasks = [
          'Complete urgent client request',
          'Attend team standup meeting',
          'Review quarterly budget',
          'Respond to stakeholder emails',
          'Update project documentation',
          'Prepare presentation for next week',
          'Handle system outage incident',
          'Conduct 1:1 with team member',
        ];
        scenario = {
          role: roleContext || 'Project Manager',
          context: description || 'Prioritize tasks under time pressure.',
          tasks: tasks.map((title, idx) => ({
            id: idx + 1,
            title,
            est_time: Math.floor(Math.random() * 40) + 10,
            ideal_rank: idx + 1,
            note: `Priority level ${idx + 1} task`,
          })),
        };
        break;

      case 'team-conflict':
        scenario = {
          role: roleContext || 'Team Lead',
          context: description || 'Resolve a conflict between team members.',
          messages: [
            { id: 1, user: 'Team Member A', avatar: 'A', text: 'I think we should proceed with option 1. It\'s what the data shows.', time: '10:15 AM' },
            { id: 2, user: 'Team Member B', avatar: 'B', text: 'Option 1 won\'t work. We tried it before and it failed.', time: '10:17 AM' },
            { id: 3, user: 'Team Member A', avatar: 'A', text: 'That was different circumstances. This time it will work.', time: '10:19 AM' },
            { id: 4, user: 'Team Member B', avatar: 'B', text: 'I disagree. We\'re wasting time on this.', time: '10:20 AM' },
          ],
        };
        break;

      default:
        break;
    }

    return scenario;
  };

  const handleGenerate = () => {
    if (!formData.title || !formData.simulationType || !formData.description) {
      alert('Please fill in all required fields (Title, Type, and Description)');
      return;
    }

    setLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      const scenario = mockAIGeneration();
      setGeneratedScenario(scenario);
      setLoading(false);
      setStep(2);
    }, 2000);
  };

  const handleSave = () => {
    const newSimulation = {
      ...formData,
      type: formData.simulationType,
      scenario: generatedScenario,
    };
    const saved = saveCustomSimulation(newSimulation);
    alert('Simulation created successfully!');
    navigate('/creator');
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            AI Simulation Builder
          </h1>
          <p className="text-lg text-slate-600">
            Describe your scenario in natural language, and our AI will generate a complete simulation
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-10 flex items-center justify-center space-x-4">
          <div className={`flex items-center ${step >= 1 ? 'text-primary' : 'text-slate-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-slate-200'}`}>
              1
            </div>
            <span className="ml-2 font-semibold hidden sm:inline">Configure</span>
          </div>
          <div className="w-20 h-1 bg-slate-300"></div>
          <div className={`flex items-center ${step >= 2 ? 'text-primary' : 'text-slate-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-slate-200'}`}>
              2
            </div>
            <span className="ml-2 font-semibold hidden sm:inline">Review & Publish</span>
          </div>
        </div>

        {/* Step 1: Configuration */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
            {/* Simulation Type */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-900 mb-3">
                Simulation Type <span className="text-red-500">*</span>
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                {simulationTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleInputChange('simulationType', type.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.simulationType === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="text-3xl mr-3">{type.icon}</div>
                      <div>
                        <div className="font-bold text-slate-900">{type.label}</div>
                        <div className="text-sm text-slate-600 mt-1">{type.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Simulation Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Customer Support - Handling Angry Customers"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Category & Difficulty */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Duration */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Expected Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="e.g., 15 min"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Scenario Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the workplace scenario in detail. For example: 'A customer has received a damaged product and is requesting a full refund plus compensation...'"
                rows={5}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Role Context */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-900 mb-2">
                Role/Context (Optional)
              </label>
              <input
                type="text"
                value={formData.roleContext}
                onChange={(e) => handleInputChange('roleContext', e.target.value)}
                placeholder="e.g., Senior Product Manager at a SaaS startup"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`w-full py-4 text-lg font-semibold text-white rounded-xl transition-all ${
                loading
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
                  Generating with AI...
                </span>
              ) : (
                '✨ Generate Simulation with AI'
              )}
            </button>

            <div className="mt-4 text-sm text-slate-500 text-center">
              Our AI will create realistic scenarios, scoring rubrics, and feedback templates
            </div>
          </div>
        )}

        {/* Step 2: Review & Publish */}
        {step === 2 && generatedScenario && (
          <div className="space-y-6">
            {/* Preview Card */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Preview Generated Simulation</h2>
                <span className="px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-lg">
                  ✓ Generated
                </span>
              </div>

              {/* Simulation Details */}
              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-sm font-semibold text-slate-600 mb-1">Title</div>
                  <div className="text-lg font-bold text-slate-900">{formData.title}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-600 mb-1">Description</div>
                  <div className="text-slate-700">{formData.description}</div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-600 mb-1">Category</div>
                    <div className="text-slate-900">{formData.category}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-600 mb-1">Difficulty</div>
                    <div className="text-slate-900">{formData.difficulty}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-600 mb-1">Duration</div>
                    <div className="text-slate-900">{formData.duration}</div>
                  </div>
                </div>
              </div>

              {/* Generated Scenario Preview */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="text-sm font-bold text-slate-900 mb-3">AI-Generated Scenario</div>
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                  {JSON.stringify(generatedScenario, null, 2)}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 font-semibold text-slate-700 bg-white border-2 border-slate-300 rounded-lg hover:border-slate-400 transition-all"
              >
                ← Back to Edit
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 text-lg font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-lg hover:shadow-2xl transition-all transform hover:scale-105"
              >
                💾 Save & Publish Simulation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationBuilder;

