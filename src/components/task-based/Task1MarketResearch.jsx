import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { personas, competitors, industryStats } from '../../data/demoSimulationData';
import { saveTaskData, getTaskData, markTaskComplete } from '../../utils/demoStorage';
import { validateTask1 } from '../../utils/demoValidation';

const Task1MarketResearch = ({ onNext, onPrevious, onComplete, taskId, canGoNext, canGoPrevious }) => {
  const [targetMarket, setTargetMarket] = useState('');
  const [userNeeds, setUserNeeds] = useState('');
  const [competitiveDiff, setCompetitiveDiff] = useState('');
  const [constraints, setConstraints] = useState('');
  const [fileUploaded, setFileUploaded] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    const saved = getTaskData(taskId);
    if (saved) {
      setTargetMarket(saved.targetMarket || '');
      setUserNeeds(saved.userNeeds || '');
      setCompetitiveDiff(saved.competitiveDiff || '');
      setConstraints(saved.constraints || '');
      setFileUploaded(saved.fileUploaded || false);
      setSubmitted(saved.submitted || false);
    }
  }, [taskId]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileUploaded(true);
      // Show success message
      setTimeout(() => {
        alert('File uploaded successfully!');
      }, 100);
    }
  };

  const handleSubmit = () => {
    const data = {
      targetMarket,
      userNeeds,
      competitiveDiff,
      constraints,
      fileUploaded
    };

    saveTaskData(taskId, { ...data, submitted: true });
    const result = validateTask1(data);
    setValidationResult(result);
    setSubmitted(true);
    markTaskComplete(taskId);
    onComplete(taskId);
    
    // Show success toast
    alert('Task 1 completed successfully!');
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ]
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-10 mb-6 border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Task 1: Ideation & Market Research</h2>
            <p className="text-gray-600 mt-1">
              Validate your ability to define target segments, identify user needs, analyze competitors, 
              and understand product constraints for the Smart Fitness Watch.
            </p>
          </div>
        </div>

        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <h3 className="font-bold text-gray-900 text-lg">Brand Constraints</h3>
          </div>
          <ul className="text-base text-gray-700 space-y-2 ml-9">
            <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">•</span> Battery life goal: 5-7 days</li>
            <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">•</span> Medical data privacy emphasis (HIPAA considerations)</li>
            <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">•</span> Price ceiling: ₹8,000–12,000 or $100–150</li>
            <li className="flex items-center gap-2"><span className="text-blue-600 font-bold">•</span> Must be comfortable for all-day wear</li>
          </ul>
        </div>

        {/* Personas */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Target Personas</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {personas.map(persona => (
              <div key={persona.id} className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-3xl">
                    {persona.avatar}
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg">{persona.name}</h4>
                </div>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong className="text-gray-900">Age:</strong> {persona.ageRange}</p>
                  <p><strong className="text-gray-900">Goals:</strong> {persona.goals}</p>
                  <p><strong className="text-gray-900">Pain Points:</strong> {persona.painPoints}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Stats */}
        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <h3 className="font-bold text-gray-900 text-lg">Industry Statistics</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Market Size', value: industryStats.marketSize },
              { label: 'Growth Rate', value: industryStats.growthRate },
              { label: 'Avg Price', value: industryStats.averagePrice },
              { label: 'Battery Expectation', value: industryStats.batteryExpectation }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-green-200">
                <div className="text-xs text-gray-600 mb-1 uppercase tracking-wide">{stat.label}</div>
                <div className="font-bold text-gray-900 text-lg">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Competitors */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Top Competitors</h3>
          </div>
          <div className="space-y-4">
            {competitors.map((comp, idx) => (
              <div key={idx} className="border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-gray-900 text-lg">{comp.name}</h4>
                  <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{comp.price}</span>
                </div>
                <ul className="text-sm text-gray-700 space-y-2">
                  {comp.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Prompts */}
        <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            <h3 className="font-bold text-gray-900 text-lg">Your Tasks</h3>
          </div>
          <ol className="space-y-3 text-base text-gray-700">
            <li className="flex items-start gap-3">
              <span className="font-bold text-yellow-600 text-lg">1.</span>
              <span><strong className="text-gray-900">Define target market and primary persona</strong> (max 150 words)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-yellow-600 text-lg">2.</span>
              <span><strong className="text-gray-900">List top 5 user needs</strong> and how the watch will serve those needs</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-yellow-600 text-lg">3.</span>
              <span><strong className="text-gray-900">Identify 3 key competitive differentiators</strong></span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-yellow-600 text-lg">4.</span>
              <span><strong className="text-gray-900">Upload optional supporting research</strong> or paste market brief below</span>
            </li>
          </ol>
        </div>

        {/* Input Fields */}
        <div className="space-y-8 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <label className="block text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">1</span>
              Target Market & Primary Persona (max 150 words)
            </label>
            <ReactQuill
              theme="snow"
              value={targetMarket}
              onChange={setTargetMarket}
              modules={quillModules}
              placeholder="Describe your target market segment and primary persona..."
              className="bg-white rounded-lg"
            />
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
            <label className="block text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">2</span>
              Top 5 User Needs & How Watch Serves Them
            </label>
            <ReactQuill
              theme="snow"
              value={userNeeds}
              onChange={setUserNeeds}
              modules={quillModules}
              placeholder="List user needs and explain how the watch addresses each..."
              className="bg-white rounded-lg"
            />
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <label className="block text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">3</span>
              Key Competitive Differentiators
            </label>
            <ReactQuill
              theme="snow"
              value={competitiveDiff}
              onChange={setCompetitiveDiff}
              modules={quillModules}
              placeholder="Identify 3 key ways your product will differentiate from competitors..."
              className="bg-white rounded-lg"
            />
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border-2 border-orange-200">
            <label className="block text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">4</span>
              Feasibility & Constraints Awareness
            </label>
            <ReactQuill
              theme="snow"
              value={constraints}
              onChange={setConstraints}
              modules={quillModules}
              placeholder="Discuss regulatory, pricing, technical constraints and how you'll address them..."
              className="bg-white rounded-lg"
            />
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border-2 border-gray-200">
            <label className="block text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Optional: Upload Market Research Document (PDF/PNG)
            </label>
            <input
              type="file"
              accept=".pdf,.png,.jpg"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gradient-to-r file:from-blue-500 file:to-indigo-600 file:text-white hover:file:from-blue-600 hover:file:to-indigo-700 file:shadow-lg file:cursor-pointer"
            />
            {fileUploaded && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-600 font-semibold bg-green-50 px-4 py-2 rounded-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                File uploaded successfully
              </div>
            )}
          </div>
        </div>

        {/* Example Answer Toggle */}
        <div className="mb-8">
          <button
            onClick={() => setShowExample(!showExample)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {showExample ? 'Hide' : 'Show'} Example Answer
          </button>
          {showExample && (
            <div className="mt-4 p-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200 text-base text-gray-700 space-y-3">
              <p><strong className="text-gray-900">Target Market:</strong> Primary persona is the Young Fitness Enthusiast (25-35), 
              tech-savvy professionals who want accurate fitness tracking and health monitoring.</p>
              <p><strong className="text-gray-900">User Needs:</strong> 1) Accurate step counting, 2) Heart rate monitoring during workouts, 
              3) Sleep quality tracking, 4) Long battery life, 5) Comfortable all-day wear.</p>
              <p><strong className="text-gray-900">Differentiators:</strong> 1) Medical-grade sensors at consumer price, 2) HIPAA-compliant 
              data privacy, 3) 7-day battery life vs competitors' 2-3 days.</p>
              <p><strong className="text-gray-900">Constraints:</strong> Must comply with healthcare regulations, maintain price under $150, ensure 
              battery life meets expectations, and prioritize data privacy.</p>
            </div>
          )}
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-gray-900">Task Score: <span className="text-green-600">{validationResult.score}/100</span></h4>
            </div>
            {validationResult.strengths.length > 0 && (
              <div className="mb-4">
                <strong className="text-base text-gray-900 font-bold">Strengths:</strong>
                <ul className="text-base text-gray-700 ml-6 list-disc mt-2 space-y-1">
                  {validationResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            {validationResult.improvements.length > 0 && (
              <div>
                <strong className="text-base text-gray-900 font-bold">Areas for Improvement:</strong>
                <ul className="text-base text-gray-700 ml-6 list-disc mt-2 space-y-1">
                  {validationResult.improvements.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t-2 border-gray-200">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitted}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg hover:shadow-xl transition-all"
            >
              {submitted ? 'Completed ✓' : 'Submit Task'}
            </button>
            {submitted && canGoNext && (
              <button
                onClick={onNext}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                Next Task
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task1MarketResearch;

