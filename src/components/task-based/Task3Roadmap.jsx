import React, { useState, useEffect } from 'react';
import { saveTaskData, getTaskData, markTaskComplete } from '../../utils/demoStorage';
import { validateTask3 } from '../../utils/demoValidation';

const defaultPhases = [
  { id: 1, name: 'Ideation & Discovery', duration: 4, deliverables: '', acceptanceCriteria: '', risks: '' },
  { id: 2, name: 'Development (MVP)', duration: 16, deliverables: '', acceptanceCriteria: '', risks: '' },
  { id: 3, name: 'Testing & Certification', duration: 8, deliverables: '', acceptanceCriteria: '', risks: '' },
  { id: 4, name: 'Deployment & Monitoring', duration: 4, deliverables: '', acceptanceCriteria: '', risks: '' },
  { id: 5, name: 'Marketing & Launch', duration: 6, deliverables: '', acceptanceCriteria: '', risks: '' }
];

const Task3Roadmap = ({ onNext, onPrevious, onComplete, taskId, canGoNext, canGoPrevious }) => {
  const [phases, setPhases] = useState(defaultPhases);
  const [overallRisks, setOverallRisks] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    const saved = getTaskData(taskId);
    if (saved && saved.phases) {
      setPhases(saved.phases);
      setOverallRisks(saved.overallRisks || '');
      setSubmitted(saved.submitted || false);
    }
  }, [taskId]);

  const updatePhase = (phaseId, field, value) => {
    setPhases(phases.map(p => 
      p.id === phaseId ? { ...p, [field]: value } : p
    ));
  };

  const updatePhaseDuration = (phaseId, value) => {
    const numValue = parseInt(value) || 0;
    setPhases(phases.map(p => 
      p.id === phaseId ? { ...p, duration: numValue } : p
    ));
  };

  const handleSubmit = () => {
    const data = { phases, overallRisks };
    saveTaskData(taskId, { ...data, submitted: true });
    const result = validateTask3(data);
    setValidationResult(result);
    setSubmitted(true);
    markTaskComplete(taskId);
    onComplete(taskId);
    
    alert('Task 3 completed successfully!');
  };

  const totalWeeks = phases.reduce((sum, p) => sum + (p.duration || 0), 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Task 3: Roadmap & Phases</h2>
        <p className="text-gray-700 mb-6">
          Break down the work into phases, estimate timelines, and define deliverables and acceptance criteria.
        </p>

        {/* Timeline Preview */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-900">Total Timeline</h3>
            <span className="text-2xl font-bold text-blue-600">{totalWeeks} weeks</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
            <div 
              className="bg-blue-500 h-4 rounded-full transition-all"
              style={{ width: `${Math.min((totalWeeks / 52) * 100, 100)}%` }}
            />
          </div>
          {totalWeeks < 12 && (
            <p className="text-sm text-yellow-700 mt-2">⚠ Warning: Timeline seems short for IoT + app development</p>
          )}
        </div>

        {/* Phases */}
        <div className="space-y-4 mb-6">
          {phases.map((phase, index) => (
            <div key={phase.id} className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{phase.name}</h3>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-700">Duration (weeks):</label>
                  <input
                    type="number"
                    min="0"
                    value={phase.duration}
                    onChange={(e) => updatePhaseDuration(phase.id, e.target.value)}
                    className="w-20 px-3 py-1 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Primary Deliverables</label>
                  <textarea
                    value={phase.deliverables}
                    onChange={(e) => updatePhase(phase.id, 'deliverables', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows="2"
                    placeholder="e.g., MVP hardware prototype, mobile app v1.0, regulatory approval..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Acceptance Criteria</label>
                  <textarea
                    value={phase.acceptanceCriteria}
                    onChange={(e) => updatePhase(phase.id, 'acceptanceCriteria', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows="2"
                    placeholder="e.g., Battery life ≥ 5 days, step accuracy within 5%, FDA approval received..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Key Risks & Mitigations (optional)</label>
                  <textarea
                    value={phase.risks}
                    onChange={(e) => updatePhase(phase.id, 'risks', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows="2"
                    placeholder="e.g., Supply chain delays - mitigate with multiple suppliers..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Risks */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Overall Project Risks & Mitigation Strategy
          </label>
          <textarea
            value={overallRisks}
            onChange={(e) => setOverallRisks(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows="4"
            placeholder="Identify key risks across the project and how you'll mitigate them..."
          />
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Task Score: {validationResult.score}/100</h4>
            {validationResult.warnings && validationResult.warnings.length > 0 && (
              <div className="mb-2">
                {validationResult.warnings.map((w, i) => (
                  <p key={i} className="text-sm text-yellow-700">⚠ {w}</p>
                ))}
              </div>
            )}
            {validationResult.strengths.length > 0 && (
              <div className="mb-2">
                <strong className="text-sm text-gray-700">Strengths:</strong>
                <ul className="text-sm text-gray-600 ml-4 list-disc">
                  {validationResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            {validationResult.improvements.length > 0 && (
              <div>
                <strong className="text-sm text-gray-700">Improvements:</strong>
                <ul className="text-sm text-gray-600 ml-4 list-disc">
                  {validationResult.improvements.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitted}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitted ? 'Completed ✓' : 'Submit Task'}
            </button>
            {submitted && canGoNext && (
              <button
                onClick={onNext}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Next Task →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task3Roadmap;

