import React, { useState, useEffect } from 'react';
import { roleOptions, techStackOptions } from '../../data/demoSimulationData';
import { saveTaskData, getTaskData, markTaskComplete } from '../../utils/demoStorage';
import { validateTask2 } from '../../utils/demoValidation';

const Task2TeamComposition = ({ onNext, onPrevious, onComplete, taskId, canGoNext, canGoPrevious }) => {
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [roleDetails, setRoleDetails] = useState({});
  const [techStack, setTechStack] = useState({
    backend: '',
    database: '',
    mobile: '',
    embedded: '',
    cloud: '',
    analytics: ''
  });
  const [hiringTimeline, setHiringTimeline] = useState('');
  const [budget, setBudget] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    const saved = getTaskData(taskId);
    if (saved) {
      setSelectedRoles(saved.selectedRoles || []);
      setRoleDetails(saved.roleDetails || {});
      setTechStack(saved.techStack || techStack);
      setHiringTimeline(saved.hiringTimeline || '');
      setBudget(saved.budget || '');
      setSubmitted(saved.submitted || false);
    }
  }, [taskId]);

  const toggleRole = (role) => {
    if (selectedRoles.find(r => r.id === role.id)) {
      setSelectedRoles(selectedRoles.filter(r => r.id !== role.id));
      const newDetails = { ...roleDetails };
      delete newDetails[role.id];
      setRoleDetails(newDetails);
    } else {
      setSelectedRoles([...selectedRoles, role]);
      setRoleDetails({
        ...roleDetails,
        [role.id]: {
          ftePercent: 100,
          experience: 'senior',
          timeline: '',
          budget: ''
        }
      });
    }
  };

  const updateRoleDetail = (roleId, field, value) => {
    setRoleDetails({
      ...roleDetails,
      [roleId]: {
        ...roleDetails[roleId],
        [field]: value
      }
    });
  };

  const handleSubmit = () => {
    const data = {
      selectedRoles,
      roleDetails,
      techStack,
      hiringTimeline,
      budget
    };

    saveTaskData(taskId, { ...data, submitted: true });
    const result = validateTask2(data);
    setValidationResult(result);
    setSubmitted(true);
    markTaskComplete(taskId);
    onComplete(taskId);
    
    alert('Task 2 completed successfully!');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-10 mb-6 border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Task 2: Team Composition & Tech Stack</h2>
            <p className="text-gray-600 mt-1">
              Specify the team you will form, roles, headcount, and tech stack choices for building the Smart Fitness Watch.
            </p>
          </div>
        </div>

        {/* Role Selection */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Select Team Roles</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {roleOptions.map(role => {
              const isSelected = selectedRoles.find(r => r.id === role.id);
              return (
                <button
                  key={role.id}
                  onClick={() => toggleRole(role)}
                  className={`px-5 py-3 rounded-xl border-2 transition-all font-semibold shadow-md hover:shadow-lg ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-600 text-white shadow-lg transform scale-105'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  } ${role.essential ? 'ring-2 ring-yellow-400' : ''}`}
                >
                  {role.name} {role.essential && <span className="text-yellow-300">⭐</span>}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-gray-600 mt-3 flex items-center gap-2">
            <span className="text-yellow-500">⭐</span> Essential roles
          </p>
        </div>

        {/* Role Details */}
        {selectedRoles.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Role Details</h3>
            </div>
            <div className="space-y-4">
              {selectedRoles.map(role => (
                <div key={role.id} className="border-2 border-gray-200 rounded-xl p-6 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all">
                  <h4 className="font-bold text-gray-900 text-lg mb-4">{role.name}</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">FTE %</label>
                      <select
                        value={roleDetails[role.id]?.ftePercent || 100}
                        onChange={(e) => updateRoleDetail(role.id, 'ftePercent', parseInt(e.target.value))}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      >
                        <option value={100}>100% (Full-time)</option>
                        <option value={50}>50% (Part-time)</option>
                        <option value={25}>25% (Contractor)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Experience Level</label>
                      <select
                        value={roleDetails[role.id]?.experience || 'senior'}
                        onChange={(e) => updateRoleDetail(role.id, 'experience', e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      >
                        <option value="junior">Junior</option>
                        <option value="mid">Mid-level</option>
                        <option value="senior">Senior</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Hiring Timeline (weeks)</label>
                      <input
                        type="number"
                        value={roleDetails[role.id]?.timeline || ''}
                        onChange={(e) => updateRoleDetail(role.id, 'timeline', e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="e.g., 8"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Budget Allocation (optional)</label>
                      <input
                        type="text"
                        value={roleDetails[role.id]?.budget || ''}
                        onChange={(e) => updateRoleDetail(role.id, 'budget', e.target.value)}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="e.g., $80K-$120K"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tech Stack */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Technology Stack</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Backend Language</label>
              <select
                value={techStack.backend}
                onChange={(e) => setTechStack({ ...techStack, backend: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="">Select...</option>
                {techStackOptions.backend.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Database</label>
              <select
                value={techStack.database}
                onChange={(e) => setTechStack({ ...techStack, database: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="">Select...</option>
                {techStackOptions.database.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Mobile Stack</label>
              <select
                value={techStack.mobile}
                onChange={(e) => setTechStack({ ...techStack, mobile: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="">Select...</option>
                {techStackOptions.mobile.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Embedded Platform</label>
              <select
                value={techStack.embedded}
                onChange={(e) => setTechStack({ ...techStack, embedded: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="">Select...</option>
                {techStackOptions.embedded.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Cloud Provider</label>
              <select
                value={techStack.cloud}
                onChange={(e) => setTechStack({ ...techStack, cloud: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="">Select...</option>
                {techStackOptions.cloud.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Analytics Tools</label>
              <select
                value={techStack.analytics}
                onChange={(e) => setTechStack({ ...techStack, analytics: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="">Select...</option>
                {techStackOptions.analytics.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mb-8 space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Estimated Hiring Timeline (weeks)
            </label>
            <input
              type="number"
              value={hiringTimeline}
              onChange={(e) => setHiringTimeline(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="e.g., 12"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Approximate Budget Band (optional)
            </label>
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="e.g., $500K-$800K"
            />
          </div>
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
            {validationResult.warnings && validationResult.warnings.length > 0 && (
              <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                {validationResult.warnings.map((w, i) => (
                  <p key={i} className="text-base text-yellow-800 font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.725-1.36 3.49 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {w}
                  </p>
                ))}
              </div>
            )}
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

export default Task2TeamComposition;

