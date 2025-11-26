import React from 'react';
import { X, TrendingUp, CheckCircle } from 'lucide-react';

export const EvaluationModal = ({ isOpen, onClose, evaluation, scenarioTitle }) => {
  if (!isOpen || !evaluation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">Performance Review</h2>
            <p className="text-slate-400 text-sm mt-1">Scenario: {scenarioTitle}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Score */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-gray-600 font-medium">Overall Score</div>
            <div className="flex items-center space-x-1">
              <span className={`text-4xl font-bold ${evaluation.score >= 7 ? 'text-green-600' : evaluation.score >= 4 ? 'text-yellow-600' : 'text-red-600'}`}>
                {evaluation.score}
              </span>
              <span className="text-gray-400 text-xl">/10</span>
            </div>
          </div>

          {/* Feedback */}
          <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <p className="text-gray-700 leading-relaxed italic">"{evaluation.feedback}"</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div>
              <h3 className="flex items-center text-green-700 font-semibold mb-2">
                <CheckCircle size={16} className="mr-2" /> What went well
              </h3>
              <ul className="space-y-1">
                {(evaluation.strengths || []).map((s, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start">
                    <span className="mr-2">•</span>{s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div>
              <h3 className="flex items-center text-red-600 font-semibold mb-2">
                <TrendingUp size={16} className="mr-2" /> Areas to improve
              </h3>
              <ul className="space-y-1">
                {(evaluation.weaknesses || []).map((w, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start">
                    <span className="mr-2">•</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 flex justify-end border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

