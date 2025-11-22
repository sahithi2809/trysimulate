import React from 'react';
import { companyInfo } from '../../data/demoSimulationData';

const Task0Intro = ({ onNext, onComplete, simulation, task }) => {
  const handleStart = () => {
    onComplete('task0');
    onNext();
  };

  // Get company info from simulation or fallback
  const currentCompanyInfo = simulation?.company_info || companyInfo;
  
  // Detect if this is Argo simulation (different branding)
  const isArgo = simulation?.slug === 'argo-marketing-foundations' || 
                 currentCompanyInfo?.name === 'Argo' ||
                 simulation?.category === 'Marketing';
  
  // Use purple/pink for Argo, blue for Noah
  const primaryGradient = isArgo 
    ? 'from-purple-600 to-pink-600' 
    : 'from-primary to-accent';
  const primaryGradientLight = isArgo
    ? 'from-purple-50 to-pink-50'
    : 'from-blue-50 to-indigo-50';
  const primaryBorder = isArgo
    ? 'border-purple-200'
    : 'border-blue-200';

  // Get intro content from task config or use defaults
  const introConfig = task?.config || {};
  const headline = introConfig.headline || (isArgo ? 'Heard of These Marketing Jobs?' : 'Welcome to the Simulation');
  const bullets = introConfig.bullets || (isArgo ? [
    'Social Media Coordinator',
    'Brand Strategist',
    'Growth Marketing Analyst',
    'Customer Insights Associate'
  ] : []);
  const body = introConfig.body || (isArgo 
    ? 'This simulation walks through five hands-on marketing tasks to show what entry-level marketing roles feel like. By the end you\'ll practice creative writing, data analysis, customer insight, SEO selection, and reflection.'
    : 'You are a Product Manager leading the product development. You\'ll be responsible for the entire product lifecycle from ideation to post-launch optimization.');

  // Get tasks from simulation for overview
  const simulationTasks = simulation?.tasks?.filter(t => t.id !== 'task0') || [];
  const learningObjectives = simulation?.learning_objectives || [];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-10 mb-6 border border-gray-100">
        <div className={`flex items-center gap-4 mb-8 p-6 bg-gradient-to-r ${primaryGradientLight} rounded-xl border ${primaryBorder}`}>
          <div className={`w-16 h-16 bg-gradient-to-br ${primaryGradient} rounded-xl flex items-center justify-center text-3xl shadow-lg`}>
            {currentCompanyInfo.logo || '🏢'}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{currentCompanyInfo.fullName || currentCompanyInfo.name}</h2>
            <p className="text-gray-600 mt-1">{currentCompanyInfo.description || simulation?.description}</p>
          </div>
        </div>

        {/* Intro Headline and Body */}
        {headline && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 bg-gradient-to-br ${primaryGradient} rounded-xl flex items-center justify-center`}>
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{headline}</h3>
            </div>
            {body && (
              <div className={`bg-gradient-to-r ${primaryGradientLight} rounded-xl p-6 border ${primaryBorder}`}>
                <p className="text-lg text-gray-700 leading-relaxed">{body}</p>
              </div>
            )}
            {bullets.length > 0 && (
              <div className="mt-4 space-y-2">
                {bullets.map((bullet, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-4 bg-gradient-to-r ${primaryGradientLight} rounded-xl border ${primaryBorder}`}>
                    <span className="text-2xl">{idx === 0 ? '📊' : idx === 1 ? '✍️' : idx === 2 ? '📈' : '💡'}</span>
                    <span className="text-gray-700 font-medium">{bullet}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Simulation Overview - Show tasks from simulation */}
        {simulationTasks.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 bg-gradient-to-br ${primaryGradient} rounded-xl flex items-center justify-center`}>
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Simulation Overview</h3>
            </div>
            <div className="space-y-4">
              {simulationTasks.map((task, idx) => (
                <div key={task.id} className={`flex items-start gap-4 p-5 bg-gradient-to-r ${primaryGradientLight} rounded-xl border ${primaryBorder} hover:shadow-md transition-all`}>
                  <div className={`w-10 h-10 bg-gradient-to-br ${primaryGradient} rounded-lg flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-lg mb-1 flex items-center gap-2">
                      <span>{task.icon || '📋'}</span>
                      <span>{task.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {task.estimated_time || 'N/A'} - {task.config?.instruction?.substring(0, 80) || 'Complete this task'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learning Objectives */}
        {learningObjectives.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Learning Objectives</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {learningObjectives.map((objective, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <span className="text-green-600 text-xl mt-0.5">✓</span>
                  <span className="text-gray-700 font-medium">{objective}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 mb-8">
          <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
            <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Quick Tips
          </h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">•</span>
              <span>You can upload files (PDF, images) - they'll be marked as submitted</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">•</span>
              <span>Use the rich text editor for detailed responses</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">•</span>
              <span>Scoring is based on rubric criteria - check example answers for guidance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">•</span>
              <span>You can navigate between tasks using the left sidebar</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">•</span>
              <span>Your progress is saved automatically</span>
            </li>
          </ul>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleStart}
            className={`px-10 py-4 bg-gradient-to-r ${primaryGradient} text-white rounded-xl ${isArgo ? 'hover:from-purple-700 hover:to-pink-700' : 'hover:from-blue-700 hover:to-indigo-700'} font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3`}
          >
            Start {simulationTasks.length > 0 ? simulationTasks[0].name : 'Task 1'}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Task0Intro;
