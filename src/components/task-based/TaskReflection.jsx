import React, { useState, useEffect } from 'react';
import { saveTaskData, getTaskData, markTaskComplete } from '../../utils/demoStorage';

const TaskReflection = ({ 
  onNext, 
  onPrevious, 
  onComplete, 
  taskId, 
  canGoNext, 
  canGoPrevious,
  task,
  simulation 
}) => {
  const [response, setResponse] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // Get simulation slug for storage keys
  const simulationSlug = simulation?.slug || 'noah-smart-fitness-watch';

  useEffect(() => {
    const saved = getTaskData(taskId, simulationSlug);
    if (saved) {
      setResponse(saved.response || '');
      // Only set submitted if the saved data is actually for this task and simulation
      setSubmitted(saved.submitted || false);
      if (saved.validationResult) {
        setValidationResult(saved.validationResult);
      }
    } else {
      // Reset state if no saved data (fresh start)
      setResponse('');
      setSubmitted(false);
      setValidationResult(null);
    }
  }, [taskId, simulationSlug]);

  const handleSubmit = () => {
    const minWords = task?.config?.minWords || 20;
    const wordCount = response.trim().split(/\s+/).filter(Boolean).length;
    
    if (wordCount < minWords) {
      alert(`Please write at least ${minWords} words (3-4 sentences).`);
      return;
    }

    const data = { response, wordCount };
    saveTaskData(taskId, { ...data, submitted: true }, simulationSlug);
    markTaskComplete(taskId, simulationSlug);
    onComplete(taskId);
    setSubmitted(true);
  };

  const wordCount = response.trim().split(/\s+/).filter(Boolean).length;
  const minWords = task?.config?.minWords || 20;
  const instruction = task?.config?.instruction || '';
  const prompt = task?.config?.prompt || '';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{task?.name || 'Reflection'}</h2>
        
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

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Your Reflection (Minimum {minWords} words - 3-4 sentences)
          </label>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            rows="6"
            placeholder="Write your reflection here..."
            disabled={submitted}
          />
          <p className={`mt-2 text-sm ${wordCount < minWords ? 'text-red-600' : 'text-gray-600'}`}>
            {wordCount} word{wordCount !== 1 ? 's' : ''}
            {wordCount < minWords && ` (Need ${minWords - wordCount} more)`}
          </p>
        </div>

        {validationResult && (
          <div className="mb-6 p-4 rounded-xl border-2 bg-green-50 border-green-200">
            <h4 className="font-semibold text-gray-900 mb-2">
              Score: {validationResult.score}/100
            </h4>
            {validationResult.feedback && (
              <p className="text-sm text-gray-700 mb-2">{validationResult.feedback}</p>
            )}
            {validationResult.strengths && validationResult.strengths.length > 0 && (
              <div className="mb-2">
                <strong className="text-sm text-gray-700">Strengths:</strong>
                <ul className="text-sm text-gray-600 ml-4 list-disc">
                  {validationResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            {validationResult.improvements && validationResult.improvements.length > 0 && (
              <div>
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
              disabled={submitted || wordCount < minWords}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitted ? 'Completed ✓' : 'Submit Reflection'}
            </button>
            {submitted && canGoNext && (
              <button
                onClick={onNext}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                View Report →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskReflection;

