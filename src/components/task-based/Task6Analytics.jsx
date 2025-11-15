import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsData, actionOptions } from '../../data/demoSimulationData';
import { saveTaskData, getTaskData, markTaskComplete } from '../../utils/demoStorage';
import { validateTask6 } from '../../utils/demoValidation';

const Task6Analytics = ({ onNext, onPrevious, onComplete, taskId, canGoNext, canGoPrevious }) => {
  const [insights, setInsights] = useState('');
  const [prioritizedActions, setPrioritizedActions] = useState([]);
  const [customerReplies, setCustomerReplies] = useState(['', '']);
  const [submitted, setSubmitted] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    const saved = getTaskData(taskId);
    if (saved) {
      setInsights(saved.insights || '');
      setPrioritizedActions(saved.prioritizedActions || []);
      setCustomerReplies(saved.customerReplies || ['', '']);
      setSubmitted(saved.submitted || false);
    }
  }, [taskId]);

  const toggleAction = (actionId) => {
    if (prioritizedActions.includes(actionId)) {
      setPrioritizedActions(prioritizedActions.filter(id => id !== actionId));
    } else if (prioritizedActions.length < 3) {
      setPrioritizedActions([...prioritizedActions, actionId]);
    }
  };

  const updateCustomerReply = (index, value) => {
    const newReplies = [...customerReplies];
    newReplies[index] = value;
    setCustomerReplies(newReplies);
  };

  const handleSubmit = () => {
    const data = {
      insights,
      prioritizedActions: prioritizedActions.map(id => actionOptions.find(a => a.id === id)?.label || id),
      customerReplies
    };
    saveTaskData(taskId, { ...data, submitted: true });
    const result = validateTask6(data);
    setValidationResult(result);
    setSubmitted(true);
    markTaskComplete(taskId);
    onComplete(taskId);
    
    alert('Task 6 completed successfully!');
  };

  const selectedReviews = analyticsData.reviews.filter(r => r.sentiment === 'negative').slice(0, 2);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-10 mb-6 border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Task 6: Post-Launch Analytics & Customer Responses</h2>
            <p className="text-gray-600 mt-1">
              Analyze post-launch data, prioritize actions, and respond to customer feedback.
            </p>
          </div>
        </div>

        {/* Data Visualization */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900">Daily Active Users (30 Days)</h3>
          </div>
          <div className="bg-white rounded-xl p-4 border border-blue-200">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analyticsData.dau}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottom', offset: -5 }} stroke="#6b7280" />
                <YAxis label={{ value: 'Users', angle: -90, position: 'insideLeft' }} stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #3b82f6', borderRadius: '8px' }}
                  labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Onboarding Completion', value: analyticsData.metrics.onboardingCompletion, unit: '%', color: 'green' },
            { label: 'Setup Drop-off', value: analyticsData.metrics.setupDropoff, unit: '%', color: 'red' },
            { label: 'Crash Rate', value: analyticsData.metrics.crashRate, unit: '%', color: 'gray' },
            { label: 'Avg Session Time', value: analyticsData.metrics.avgSessionTime, unit: ' min', color: 'blue' },
            { label: '7-Day Retention', value: analyticsData.metrics.retention7Day, unit: '%', color: 'yellow' },
            { label: '30-Day Retention', value: analyticsData.metrics.retention30Day, unit: '%', color: 'red' }
          ].map((metric, idx) => (
            <div key={idx} className={`p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 ${
              metric.color === 'green' ? 'border-green-200' :
              metric.color === 'red' ? 'border-red-200' :
              metric.color === 'yellow' ? 'border-yellow-200' :
              'border-gray-200'
            } hover:shadow-lg transition-all`}>
              <div className="text-xs text-gray-600 mb-2 uppercase tracking-wide font-semibold">{metric.label}</div>
              <div className={`text-3xl font-bold ${
                metric.color === 'green' ? 'text-green-600' :
                metric.color === 'red' ? 'text-red-600' :
                metric.color === 'yellow' ? 'text-yellow-600' :
                'text-gray-900'
              }`}>
                {metric.value}{metric.unit}
              </div>
            </div>
          ))}
        </div>

        {/* NPS */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900">Net Promoter Score (NPS)</h3>
          </div>
          <div className="bg-white rounded-xl p-6 border-2 border-blue-200">
            <div className="flex justify-between items-center mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analyticsData.nps.promoters}%</div>
                <div className="text-xs text-gray-600 mt-1">Promoters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{analyticsData.nps.passives}%</div>
                <div className="text-xs text-gray-600 mt-1">Passives</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{analyticsData.nps.detractors}%</div>
                <div className="text-xs text-gray-600 mt-1">Detractors</div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6 mb-4 shadow-inner">
              <div className="flex h-6 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600" style={{ width: `${analyticsData.nps.promoters}%` }} />
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600" style={{ width: `${analyticsData.nps.passives}%` }} />
                <div className="bg-gradient-to-r from-red-500 to-red-600" style={{ width: `${analyticsData.nps.detractors}%` }} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">
                NPS = {analyticsData.nps.promoters}% - {analyticsData.nps.detractors}% = 
                <span className={`ml-2 ${
                  (analyticsData.nps.promoters - analyticsData.nps.detractors) > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {analyticsData.nps.promoters - analyticsData.nps.detractors}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User Reviews */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Sample User Reviews</h3>
          </div>
          <div className="space-y-4">
            {analyticsData.reviews.map(review => (
              <div key={review.id} className={`p-6 rounded-xl border-2 ${
                review.sentiment === 'positive' 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' 
                  : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300'
              } hover:shadow-lg transition-all`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex text-yellow-400 text-xl">
                    {'⭐'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    review.sentiment === 'positive' 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-red-200 text-red-800'
                  }`}>
                    {review.sentiment}
                  </span>
                </div>
                <p className="text-base text-gray-700 leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-8 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <label className="block text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">1</span>
              Summarize Top 3 Insights (max 150 words)
            </label>
            <textarea
              value={insights}
              onChange={(e) => setInsights(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              rows="5"
              placeholder="What are the biggest problems? What patterns do you see in the data?..."
            />
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
            <label className="block text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">2</span>
              Prioritize Next 3 Actions (select in order of priority)
            </label>
            <div className="space-y-3">
              {actionOptions.map(action => {
                const isSelected = prioritizedActions.includes(action.id);
                const order = prioritizedActions.indexOf(action.id) + 1;
                return (
                  <button
                    key={action.id}
                    onClick={() => toggleAction(action.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-green-500 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-105'
                        : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold">{action.label}</span>
                      {isSelected && (
                        <span className="px-3 py-1 bg-white text-green-600 rounded-lg text-sm font-bold shadow-md">
                          Priority {order}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-gray-600 mt-4 font-semibold">
              Selected: <span className="text-green-600">{prioritizedActions.length}/3</span> actions
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <label className="block text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">3</span>
              Draft Customer Replies (select 2 negative reviews to respond to)
            </label>
            <div className="space-y-5">
              {selectedReviews.map((review, idx) => (
                <div key={review.id} className="border-2 border-gray-200 rounded-xl p-5 bg-white">
                  <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-base text-gray-700 italic font-medium">"{review.text}"</p>
                  </div>
                  <textarea
                    value={customerReplies[idx] || ''}
                    onChange={(e) => updateCustomerReply(idx, e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    rows="4"
                    placeholder="Write a professional, empathetic response addressing their concern..."
                  />
                  <p className="text-sm text-gray-500 mt-2 font-medium">
                    {customerReplies[idx]?.length || 0} characters (max 150 words recommended)
                  </p>
                </div>
              ))}
            </div>
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

export default Task6Analytics;

