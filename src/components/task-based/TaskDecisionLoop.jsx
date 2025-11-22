import React, { useState, useEffect } from 'react';
import { saveTaskData, getTaskData, markTaskComplete } from '../../utils/demoStorage';

const TaskDecisionLoop = ({ 
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
  const [showFeedback, setShowFeedback] = useState(false);
  const [budgetRemaining, setBudgetRemaining] = useState(15000);
  const [choicesHistory, setChoicesHistory] = useState([]);

  // Get simulation slug for storage keys
  const simulationSlug = simulation?.slug || 'persona-finding';

  useEffect(() => {
    const saved = getTaskData(taskId, simulationSlug);
    if (saved) {
      setSelectedOption(saved.selectedOption || null);
      setSubmitted(saved.submitted || false);
      setShowFeedback(saved.showFeedback || false);
      setBudgetRemaining(saved.budgetRemaining || 15000);
      setChoicesHistory(saved.choicesHistory || []);
    } else {
      // Initialize budget from previous tasks
      let initialBudget = 15000;
      for (let i = 1; i < parseInt(taskId.replace('task', '')); i++) {
        const prevTask = getTaskData(`task${i}`, simulationSlug);
        if (prevTask && prevTask.budgetRemaining !== undefined) {
          initialBudget = prevTask.budgetRemaining;
        }
      }
      setBudgetRemaining(initialBudget);
    }
  }, [taskId, simulationSlug]);

  const handleOptionSelect = (optionId) => {
    if (submitted) return;
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOption) {
      alert('Please select an option before submitting.');
      return;
    }

    const option = task?.config?.options?.find(opt => opt.id === selectedOption);
    if (!option) return;

    const newBudget = budgetRemaining - (option.cost || 0);
    const newChoicesHistory = [...choicesHistory, { taskId, option: selectedOption, cost: option.cost || 0 }];

    const data = {
      selectedOption,
      submitted: true,
      showFeedback: true,
      budgetRemaining: newBudget,
      choicesHistory: newChoicesHistory,
      feedback: task?.config?.feedback?.[selectedOption]
    };

    saveTaskData(taskId, data, simulationSlug);
    setBudgetRemaining(newBudget);
    setChoicesHistory(newChoicesHistory);
    setSubmitted(true);
    setShowFeedback(true);
    markTaskComplete(taskId, simulationSlug);
    onComplete(taskId);
  };

  const options = task?.config?.options || [];
  const context = task?.config?.context || '';
  const feedback = submitted && selectedOption ? task?.config?.feedback?.[selectedOption] : null;
  const loopNumber = task?.config?.loopNumber || 1;

  // Determine if this is Argo (purple/pink) or other (blue)
  const isArgo = simulation?.slug === 'argo-marketing-foundations' || 
                 simulation?.category === 'Marketing';
  const primaryGradient = isArgo ? 'from-purple-600 to-pink-600' : 'from-primary to-accent';
  const primaryGradientLight = isArgo ? 'from-purple-50 to-pink-50' : 'from-blue-50 to-indigo-50';
  const primaryBorder = isArgo ? 'border-purple-200' : 'border-blue-200';
  const primaryText = isArgo ? 'text-purple-700' : 'text-blue-700';

  return (
    <div className="max-w-5xl mx-auto">
      {/* Budget Display */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">Remaining Budget</h3>
            <p className="text-3xl font-bold text-slate-900">₹{budgetRemaining.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">Total: ₹15,000</p>
            <div className="w-32 bg-slate-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full bg-gradient-to-r ${primaryGradient}`}
                style={{ width: `${(budgetRemaining / 15000) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Context */}
      <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${primaryGradient} flex items-center justify-center text-white text-xl font-bold`}>
            {loopNumber}
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{task?.name || 'Decision Loop'}</h2>
        </div>
        
        {context && (
          <div className={`mb-6 p-6 bg-gradient-to-r ${primaryGradientLight} rounded-xl border-2 ${primaryBorder}`}>
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">{context}</p>
          </div>
        )}

        {/* Options */}
        {!showFeedback && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Choose ONE option:</h3>
            {options.map((option) => {
              const canAfford = budgetRemaining >= (option.cost || 0);
              return (
                <label
                  key={option.id}
                  className={`flex items-start p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedOption === option.id
                      ? `bg-gradient-to-r ${primaryGradientLight} border-${isArgo ? 'purple' : 'blue'}-500 shadow-lg`
                      : canAfford
                      ? 'bg-white border-slate-300 hover:border-primary hover:shadow-md'
                      : 'bg-slate-100 border-slate-300 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    value={option.id}
                    checked={selectedOption === option.id}
                    onChange={() => handleOptionSelect(option.id)}
                    disabled={!canAfford || submitted}
                    className="mt-1 mr-4 w-5 h-5 text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{option.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        option.cost === 0 
                          ? 'bg-green-100 text-green-700' 
                          : canAfford
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {option.cost === 0 ? 'Free' : `₹${option.cost.toLocaleString()}`}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{option.description}</p>
                    {option.budgetRemaining !== undefined && (
                      <p className="text-sm text-gray-500 mt-2">
                        Budget after: ₹{option.budgetRemaining.toLocaleString()}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {/* Feedback */}
        {showFeedback && feedback && (
          <div className={`mt-6 p-6 bg-gradient-to-r ${primaryGradientLight} rounded-xl border-2 ${primaryBorder}`}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">{feedback.title || 'Feedback'}</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-800 leading-relaxed whitespace-pre-line mb-3">{feedback.data || feedback.insight}</p>
                {feedback.insight && (
                  <p className={`font-semibold ${primaryText} mb-3`}>💡 {feedback.insight}</p>
                )}
              </div>
              {feedback.signals && feedback.signals.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Key Signals:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {feedback.signals.map((signal, idx) => (
                      <li key={idx} className="text-gray-700">{signal}</li>
                    ))}
                  </ul>
                </div>
              )}
              {feedback.outcome && (
                <div className={`mt-4 p-3 rounded-lg ${
                  feedback.outcome === 'positive' || feedback.outcome === 'strong'
                    ? 'bg-green-50 border border-green-200'
                    : feedback.outcome === 'negative'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <p className={`text-sm font-semibold ${
                    feedback.outcome === 'positive' || feedback.outcome === 'strong'
                      ? 'text-green-800'
                      : feedback.outcome === 'negative'
                      ? 'text-red-800'
                      : 'text-yellow-800'
                  }`}>
                    {feedback.outcome === 'positive' || feedback.outcome === 'strong' ? '✅ Strong Result' :
                     feedback.outcome === 'negative' ? '⚠️ Needs Revision' : '📊 Moderate Result'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              canGoPrevious
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                : 'bg-slate-50 text-slate-400 cursor-not-allowed'
            }`}
          >
            ← Previous
          </button>

          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className={`px-8 py-3 rounded-lg font-semibold text-white transition-all bg-gradient-to-r ${primaryGradient} ${
                selectedOption
                  ? 'hover:shadow-lg transform hover:scale-105'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              Submit Decision
            </button>
          ) : (
            <button
              onClick={onNext}
              disabled={!canGoNext}
              className={`px-8 py-3 rounded-lg font-semibold text-white transition-all bg-gradient-to-r ${primaryGradient} ${
                canGoNext
                  ? 'hover:shadow-lg transform hover:scale-105'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDecisionLoop;

