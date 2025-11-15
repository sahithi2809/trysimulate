import React, { useState, useEffect } from 'react';
import { getAllTaskData, getTaskData, saveTaskData, markTaskComplete } from '../../utils/demoStorage';
import { validateTask7 } from '../../utils/demoValidation';

const Task7Final = ({ onNext, onPrevious, onComplete, taskId, canGoNext, canGoPrevious }) => {
  const [consolidatedReport, setConsolidatedReport] = useState('');
  const [pitch, setPitch] = useState('');
  const [checklist, setChecklist] = useState({
    kpis: false,
    roadmap: false,
    budget: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    // Auto-populate consolidated report from previous tasks
    const allData = getAllTaskData();
    const report = `
# Noah Smart Fitness Watch - Project Summary

## Market Research (Task 1)
${allData.task1?.targetMarket || 'Not completed'}

## Team & Tech Stack (Task 2)
${allData.task2?.selectedRoles?.map(r => r.name).join(', ') || 'Not completed'}

## Roadmap (Task 3)
${allData.task3?.phases?.map(p => `${p.name}: ${p.duration} weeks`).join('\n') || 'Not completed'}

## Design (Task 4)
${allData.task4?.explanation || 'Not completed'}

## GTM Strategy (Task 5)
${allData.task5?.positioning || 'Not completed'}

## Post-Launch Analysis (Task 6)
${allData.task6?.insights || 'Not completed'}
    `.trim();
    setConsolidatedReport(report);

    const saved = getTaskData(taskId);
    if (saved) {
      setPitch(saved.pitch || '');
      setChecklist(saved.checklist || checklist);
      setSubmitted(saved.submitted || false);
    }
  }, [taskId]);

  const handleChecklistChange = (key) => {
    setChecklist({ ...checklist, [key]: !checklist[key] });
  };

  const handleSubmit = () => {
    const data = {
      consolidatedReport,
      pitch,
      checklist
    };
    saveTaskData(taskId, { ...data, submitted: true });
    const result = validateTask7(data);
    setValidationResult(result);
    setSubmitted(true);
    markTaskComplete(taskId);
    onComplete(taskId);
    
    alert('Task 7 completed! You can now view your final report and certificate.');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Task 7: Final Submission & Reflection</h2>
        <p className="text-gray-700 mb-6">
          Consolidate your project work, reflect on trade-offs, and create a 2-minute investor pitch.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Consolidated Project Report (auto-filled, editable)
          </label>
          <textarea
            value={consolidatedReport}
            onChange={(e) => setConsolidatedReport(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
            rows="12"
          />
          <p className="text-xs text-gray-500 mt-1">
            This report consolidates your work from all previous tasks. Edit as needed.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            2-Minute Investor Pitch Script (max 300 words)
          </label>
          <textarea
            value={pitch}
            onChange={(e) => setPitch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows="8"
            placeholder="Write a compelling pitch that covers: problem, solution, market opportunity, business model, ask..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {pitch.length} characters (approximately {Math.round(pitch.length / 5)} words)
          </p>
        </div>

        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Final Checklist</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.kpis}
                onChange={() => handleChecklistChange('kpis')}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Did you include success KPIs?</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.roadmap}
                onChange={() => handleChecklistChange('roadmap')}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Did you include 3-month roadmap?</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist.budget}
                onChange={() => handleChecklistChange('budget')}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Did you include budget estimates?</span>
            </label>
          </div>
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Task Score: {validationResult.score}/100</h4>
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
              {submitted ? 'Completed ✓' : 'Submit Final Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task7Final;

