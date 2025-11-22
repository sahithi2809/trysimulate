import React, { useState, useEffect, useRef } from 'react';
import { saveTaskData, getTaskData, markTaskComplete } from '../../utils/demoStorage';
import { validateTask3 } from '../../utils/demoValidation';
import Sortable from 'sortablejs';

const defaultPhases = [
  { id: 1, name: 'Ideation & Discovery', duration: 4, deliverables: '', acceptanceCriteria: '', risks: '', color: '#3b82f6' },
  { id: 2, name: 'Development (MVP)', duration: 16, deliverables: '', acceptanceCriteria: '', risks: '', color: '#10b981' },
  { id: 3, name: 'Testing & Certification', duration: 8, deliverables: '', acceptanceCriteria: '', risks: '', color: '#f59e0b' },
  { id: 4, name: 'Deployment & Monitoring', duration: 4, deliverables: '', acceptanceCriteria: '', risks: '', color: '#ef4444' },
  { id: 5, name: 'Marketing & Launch', duration: 6, deliverables: '', acceptanceCriteria: '', risks: '', color: '#8b5cf6' }
];

const Task3Roadmap = ({ onNext, onPrevious, onComplete, taskId, canGoNext, canGoPrevious }) => {
  const [phases, setPhases] = useState(defaultPhases);
  const [overallRisks, setOverallRisks] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [expandedPhases, setExpandedPhases] = useState(new Set([1, 2, 3, 4, 5]));
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'list'
  const phasesListRef = useRef(null);
  const sortableRef = useRef(null);

  useEffect(() => {
    const saved = getTaskData(taskId);
    if (saved && saved.phases) {
      setPhases(saved.phases);
      setOverallRisks(saved.overallRisks || '');
      setSubmitted(saved.submitted || false);
      if (saved.expandedPhases) {
        setExpandedPhases(new Set(saved.expandedPhases));
      }
    }
  }, [taskId]);

  // Initialize SortableJS for drag-and-drop reordering
  useEffect(() => {
    if (phasesListRef.current && !sortableRef.current && !submitted && viewMode === 'list') {
      sortableRef.current = new Sortable(phasesListRef.current, {
        animation: 200,
        handle: '.drag-handle',
        ghostClass: 'opacity-50',
        chosenClass: 'ring-2 ring-blue-500',
        onEnd: (evt) => {
          const newPhases = [...phases];
          const [movedPhase] = newPhases.splice(evt.oldIndex, 1);
          newPhases.splice(evt.newIndex, 0, movedPhase);
          setPhases(newPhases);
        },
      });
    }

    return () => {
      if (sortableRef.current) {
        sortableRef.current.destroy();
        sortableRef.current = null;
      }
    };
  }, [phases, submitted, viewMode]);

  const updatePhase = (phaseId, field, value) => {
    const updated = phases.map(p => 
      p.id === phaseId ? { ...p, [field]: value } : p
    );
    setPhases(updated);
    saveTaskData(taskId, { phases: updated, overallRisks, expandedPhases: Array.from(expandedPhases) });
  };

  const updatePhaseDuration = (phaseId, value) => {
    const numValue = parseInt(value) || 0;
    const updated = phases.map(p => 
      p.id === phaseId ? { ...p, duration: Math.max(0, numValue) } : p
    );
    setPhases(updated);
    saveTaskData(taskId, { phases: updated, overallRisks, expandedPhases: Array.from(expandedPhases) });
  };

  const togglePhaseExpanded = (phaseId) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
    saveTaskData(taskId, { phases, overallRisks, expandedPhases: Array.from(newExpanded) });
  };

  // Calculate cumulative start times for timeline
  const calculateTimeline = () => {
    let currentWeek = 0;
    return phases.map(phase => {
      const start = currentWeek;
      currentWeek += phase.duration || 0;
      return {
        ...phase,
        startWeek: start,
        endWeek: currentWeek
      };
    });
  };

  const handleSubmit = () => {
    const data = { phases, overallRisks };
    saveTaskData(taskId, { ...data, submitted: true, expandedPhases: Array.from(expandedPhases) });
    const result = validateTask3(data);
    setValidationResult(result);
    setSubmitted(true);
    markTaskComplete(taskId);
    onComplete(taskId);
  };

  const totalWeeks = phases.reduce((sum, p) => sum + (p.duration || 0), 0);
  const timelinePhases = calculateTimeline();
  const maxWeeks = Math.max(totalWeeks, 40); // Minimum 40 weeks for visualization

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Task 3: Roadmap & Phases</h2>
          <p className="text-gray-700">
            Break down the work into phases, estimate timelines, and define deliverables and acceptance criteria.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-6 flex gap-4 items-center">
          <span className="text-sm font-semibold text-gray-700">View:</span>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'timeline'
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📊 Timeline View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📋 List View
          </button>
        </div>

        {/* Timeline Summary */}
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-gray-900">Total Timeline</h3>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {totalWeeks} weeks ({Math.round(totalWeeks / 4.33)} months)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 mt-3 shadow-inner">
            <div 
              className="bg-gradient-to-r from-primary to-accent h-6 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${Math.min((totalWeeks / 52) * 100, 100)}%` }}
            />
          </div>
          {totalWeeks < 12 && (
            <p className="text-sm text-yellow-700 mt-3 font-semibold">⚠ Warning: Timeline seems short for IoT + app development</p>
          )}
          {totalWeeks > 52 && (
            <p className="text-sm text-orange-700 mt-3 font-semibold">⚠ Consider breaking into smaller phases or reducing scope</p>
          )}
        </div>

        {/* Interactive Timeline View */}
        {viewMode === 'timeline' && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Visual Timeline (Gantt Chart)</h3>
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 overflow-x-auto">
              {/* Week markers */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: Math.min(maxWeeks, 52) }, (_, i) => (
                  <div key={i} className="flex-1 text-center">
                    {i % 4 === 0 && (
                      <div className="text-xs text-gray-600 font-semibold border-t-2 border-gray-300 pt-1">
                        W{i}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Phase bars */}
              <div className="space-y-3">
                {timelinePhases.map((phase, index) => {
                  const widthPercent = ((phase.duration / maxWeeks) * 100);
                  const leftPercent = ((phase.startWeek / maxWeeks) * 100);
                  return (
                    <div key={phase.id} className="relative">
                      <div className="flex items-center gap-4 mb-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: phase.color }}
                        />
                        <span className="font-semibold text-gray-900 min-w-[200px]">{phase.name}</span>
                        <span className="text-sm text-gray-600">{phase.duration} weeks</span>
                      </div>
                      <div className="relative h-12 bg-gray-200 rounded-lg overflow-hidden">
                        <div
                          className="absolute h-full rounded-lg shadow-md transition-all duration-300 flex items-center justify-center text-white font-semibold text-sm"
                          style={{
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`,
                            backgroundColor: phase.color,
                            minWidth: '60px'
                          }}
                        >
                          {phase.duration > 2 && `${phase.duration}w`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Phase Details (Expandable Cards */}
            <div className="mt-6 space-y-4">
              {phases.map((phase) => (
                <div 
                  key={phase.id} 
                  className="border-2 rounded-xl overflow-hidden transition-all"
                  style={{ borderColor: expandedPhases.has(phase.id) ? phase.color : '#e5e7eb' }}
                >
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => togglePhaseExpanded(phase.id)}
                    style={{ backgroundColor: expandedPhases.has(phase.id) ? `${phase.color}10` : 'white' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: phase.color }}
                        />
                        <h3 className="font-bold text-gray-900 text-lg">{phase.name}</h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-semibold text-gray-700">Duration:</label>
                          <input
                            type="range"
                            min="0"
                            max="24"
                            value={phase.duration}
                            onChange={(e) => updatePhaseDuration(phase.id, e.target.value)}
                            className="w-32"
                          />
                          <input
                            type="number"
                            min="0"
                            max="24"
                            value={phase.duration}
                            onChange={(e) => updatePhaseDuration(phase.id, e.target.value)}
                            className="w-16 px-2 py-1 border-2 border-gray-300 rounded-lg font-semibold"
                          />
                          <span className="text-sm text-gray-600">weeks</span>
                        </div>
                        <button className="text-gray-500 hover:text-gray-700">
                          {expandedPhases.has(phase.id) ? '▼' : '▶'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {expandedPhases.has(phase.id) && (
                    <div className="p-6 bg-white border-t-2" style={{ borderColor: phase.color }}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">
                            Primary Deliverables
                          </label>
                          <textarea
                            value={phase.deliverables}
                            onChange={(e) => updatePhase(phase.id, 'deliverables', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="2"
                            placeholder="e.g., MVP hardware prototype, mobile app v1.0, regulatory approval..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">
                            Acceptance Criteria
                          </label>
                          <textarea
                            value={phase.acceptanceCriteria}
                            onChange={(e) => updatePhase(phase.id, 'acceptanceCriteria', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="2"
                            placeholder="e.g., Battery life ≥ 5 days, step accuracy within 5%, FDA approval received..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-900 mb-2">
                            Key Risks & Mitigations (optional)
                          </label>
                          <textarea
                            value={phase.risks}
                            onChange={(e) => updatePhase(phase.id, 'risks', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="2"
                            placeholder="e.g., Supply chain delays - mitigate with multiple suppliers..."
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drag-and-Drop List View */}
        {viewMode === 'list' && (
          <div className="mb-6">
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <p className="text-sm text-gray-700">
                💡 <strong>Tip:</strong> Drag phases by the handle (⋮⋮) to reorder them. Adjust durations with the sliders.
              </p>
            </div>
            <div ref={phasesListRef} className="space-y-4">
              {phases.map((phase, index) => (
                <div 
                  key={phase.id} 
                  className="border-2 rounded-xl p-5 bg-white hover:shadow-lg transition-all"
                  style={{ borderColor: phase.color }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="drag-handle cursor-move text-gray-400 hover:text-gray-600 text-2xl">
                      ⋮⋮
                    </div>
                    <div 
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: phase.color }}
                    />
                    <h3 className="flex-1 font-bold text-gray-900 text-lg">{phase.name}</h3>
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-semibold text-gray-700">Duration:</label>
                      <input
                        type="range"
                        min="0"
                        max="24"
                        value={phase.duration}
                        onChange={(e) => updatePhaseDuration(phase.id, e.target.value)}
                        className="w-32"
                      />
                      <input
                        type="number"
                        min="0"
                        max="24"
                        value={phase.duration}
                        onChange={(e) => updatePhaseDuration(phase.id, e.target.value)}
                        className="w-16 px-2 py-1 border-2 border-gray-300 rounded-lg font-semibold"
                      />
                      <span className="text-sm text-gray-600">weeks</span>
                    </div>
                    <button
                      onClick={() => togglePhaseExpanded(phase.id)}
                      className="text-gray-500 hover:text-gray-700 px-3"
                    >
                      {expandedPhases.has(phase.id) ? '▼' : '▶'}
                    </button>
                  </div>

                  {expandedPhases.has(phase.id) && (
                    <div className="mt-4 pt-4 border-t-2 space-y-4" style={{ borderColor: phase.color }}>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Primary Deliverables
                        </label>
                        <textarea
                          value={phase.deliverables}
                          onChange={(e) => updatePhase(phase.id, 'deliverables', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                          rows="2"
                          placeholder="e.g., MVP hardware prototype, mobile app v1.0, regulatory approval..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Acceptance Criteria
                        </label>
                        <textarea
                          value={phase.acceptanceCriteria}
                          onChange={(e) => updatePhase(phase.id, 'acceptanceCriteria', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                          rows="2"
                          placeholder="e.g., Battery life ≥ 5 days, step accuracy within 5%, FDA approval received..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Key Risks & Mitigations (optional)
                        </label>
                        <textarea
                          value={phase.risks}
                          onChange={(e) => updatePhase(phase.id, 'risks', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                          rows="2"
                          placeholder="e.g., Supply chain delays - mitigate with multiple suppliers..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overall Risks */}
        <div className="mb-6 p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
          <label className="block text-base font-bold text-gray-900 mb-3">
            ⚠️ Overall Project Risks & Mitigation Strategy
          </label>
          <textarea
            value={overallRisks}
            onChange={(e) => {
              setOverallRisks(e.target.value);
              saveTaskData(taskId, { phases, overallRisks: e.target.value, expandedPhases: Array.from(expandedPhases) });
            }}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
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
        <div className="flex justify-between items-center pt-6 border-t-2 border-gray-200">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            ← Previous
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitted}
              className="px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitted ? 'Completed ✓' : 'Submit Task'}
            </button>
            {submitted && canGoNext && (
              <button
                onClick={onNext}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
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

