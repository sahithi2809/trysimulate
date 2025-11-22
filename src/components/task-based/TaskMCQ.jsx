import React, { useState, useEffect } from 'react';
import { saveTaskData, getTaskData, markTaskComplete } from '../../utils/demoStorage';

const TaskMCQ = ({ 
  onNext, 
  onPrevious, 
  onComplete, 
  taskId, 
  canGoNext, 
  canGoPrevious,
  task,
  simulation 
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // Get simulation slug for storage keys
  const simulationSlug = simulation?.slug || 'noah-smart-fitness-watch';

  useEffect(() => {
    const saved = getTaskData(taskId, simulationSlug);
    if (saved) {
      setSelectedOption(saved.selectedOption || null);
      // Only set submitted if the saved data is actually for this task and simulation
      setSubmitted(saved.submitted || false);
      if (saved.validationResult) {
        setValidationResult(saved.validationResult);
      }
    } else {
      // Reset state if no saved data (fresh start)
      setSelectedOption(null);
      setSubmitted(false);
      setValidationResult(null);
    }
  }, [taskId, simulationSlug]);

  const handleSubmit = () => {
    if (!selectedOption) {
      alert('Please select an option before submitting.');
      return;
    }

    const data = { selectedOption };
    saveTaskData(taskId, { ...data, submitted: true }, simulationSlug);
    
    // Validation will be done by backend/validation service
    // For now, just mark as complete
    markTaskComplete(taskId, simulationSlug);
    onComplete(taskId);
    setSubmitted(true);
  };

  const options = task?.config?.options || [];
  const instruction = task?.config?.instruction || '';
  const prompt = task?.config?.prompt || '';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{task?.name || 'Multiple Choice Question'}</h2>
        
        {instruction && (
          <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
            <p className="text-gray-800 leading-relaxed">{instruction}</p>
          </div>
        )}

        {prompt && (
          <div className="mb-6">
            <p className="text-lg font-semibold text-gray-900 mb-4">{prompt}</p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          {options.map((option) => (
            <label
              key={option.id}
              className={`flex items-start p-5 rounded-xl border-2 cursor-pointer transition-all ${
                selectedOption === option.id
                  ? 'border-purple-500 bg-purple-50 shadow-lg'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={`mcq-${taskId}`}
                value={option.id}
                checked={selectedOption === option.id}
                onChange={() => setSelectedOption(option.id)}
                className="mt-1 mr-4 w-5 h-5 text-purple-600"
                disabled={submitted}
              />
              <span className="text-gray-800 text-lg flex-1">{option.text}</span>
            </label>
          ))}
        </div>

        {validationResult && (
          <div className={`mb-6 p-4 rounded-xl border-2 ${
            validationResult.score === 100 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <h4 className="font-semibold text-gray-900 mb-2">
              Score: {validationResult.score}/100
            </h4>
            {validationResult.feedback && (
              <p className="text-sm text-gray-700">{validationResult.feedback}</p>
            )}
            {validationResult.strengths && validationResult.strengths.length > 0 && (
              <div className="mt-2">
                <strong className="text-sm text-gray-700">Strengths:</strong>
                <ul className="text-sm text-gray-600 ml-4 list-disc">
                  {validationResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            {validationResult.improvements && validationResult.improvements.length > 0 && (
              <div className="mt-2">
                <strong className="text-sm text-gray-700">Improvements:</strong>
                <ul className="text-sm text-gray-600 ml-4 list-disc">
                  {validationResult.improvements.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

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
              disabled={submitted || !selectedOption}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitted ? 'Completed ✓' : 'Submit Answer'}
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

export default TaskMCQ;

