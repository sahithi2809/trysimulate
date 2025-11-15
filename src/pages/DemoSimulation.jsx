import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Task0Intro from '../components/task-based/Task0Intro';
import Task1MarketResearch from '../components/task-based/Task1MarketResearch';
import Task2TeamComposition from '../components/task-based/Task2TeamComposition';
import Task3Roadmap from '../components/task-based/Task3Roadmap';
import Task4Wireframe from '../components/task-based/Task4Wireframe';
import Task5GTM from '../components/task-based/Task5GTM';
import Task6Analytics from '../components/task-based/Task6Analytics';
import Task7Final from '../components/task-based/Task7Final';
import FinalReportCard from '../components/task-based/FinalReportCard';
import { getProgress, isAllTasksComplete } from '../utils/demoStorage';
import { companyInfo } from '../data/demoSimulationData';

const DemoSimulation = () => {
  const [currentTask, setCurrentTask] = useState(0);
  const [progress, setProgress] = useState(getProgress());
  const [showFinalReport, setShowFinalReport] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const progressData = getProgress();
    setProgress(progressData);
    if (isAllTasksComplete() && currentTask === 7) {
      // Can show final report
    }
  }, [currentTask]);

  const tasks = [
    { id: 'task0', name: 'Introduction', component: Task0Intro, time: '5 min', icon: '📋' },
    { id: 'task1', name: 'Market Research', component: Task1MarketResearch, time: '60-90 min', icon: '🔍' },
    { id: 'task2', name: 'Team & Tech Stack', component: Task2TeamComposition, time: '30-45 min', icon: '👥' },
    { id: 'task3', name: 'Roadmap & Phases', component: Task3Roadmap, time: '30-45 min', icon: '🗺️' },
    { id: 'task4', name: 'Wireframe Design', component: Task4Wireframe, time: '30-60 min', icon: '🎨' },
    { id: 'task5', name: 'GTM Strategy', component: Task5GTM, time: '45-60 min', icon: '🚀' },
    { id: 'task6', name: 'Post-Launch Analytics', component: Task6Analytics, time: '60-90 min', icon: '📊' },
    { id: 'task7', name: 'Final Submission', component: Task7Final, time: '30-45 min', icon: '✅' }
  ];

  const handleTaskComplete = (taskId) => {
    const newProgress = getProgress();
    setProgress(newProgress);
    if (isAllTasksComplete() && taskId === 'task7') {
      setShowFinalReport(true);
    }
  };

  const handleNext = () => {
    if (currentTask < tasks.length - 1) {
      setCurrentTask(currentTask + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTask > 0) {
      setCurrentTask(currentTask - 1);
    }
  };

  const handleTaskSelect = (index) => {
    setCurrentTask(index);
  };

  const CurrentTaskComponent = tasks[currentTask].component;

  if (showFinalReport) {
    return <FinalReportCard onClose={() => setShowFinalReport(false)} />;
  }

  const progressPercentage = (progress.completedTasks.length / 7) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex">
      {/* Left Sidebar */}
      <div className="w-72 bg-white border-r-2 border-gray-200 flex-shrink-0 overflow-y-auto shadow-lg">
        <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-primary to-accent text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl">
              {companyInfo.logo}
            </div>
            <div>
              <h2 className="text-xl font-bold">{companyInfo.name}</h2>
              <p className="text-xs text-blue-100">Smart Fitness Watch</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4 px-2">Tasks</div>
          <div className="space-y-2">
            {tasks.map((task, index) => {
              const isComplete = progress.completedTasks.includes(task.id);
              const isActive = index === currentTask;
              
              return (
                <button
                  key={task.id}
                  onClick={() => handleTaskSelect(index)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg transform scale-105'
                      : isComplete
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-gray-700 hover:shadow-md hover:border-green-300'
                      : 'bg-gray-50 border-2 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{task.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-gray-900'}`}>
                          {task.name}
                        </span>
                        {isComplete && !isActive && (
                          <span className="text-green-500 text-lg">✓</span>
                        )}
                        {isActive && (
                          <span className="text-white/80 text-xs bg-white/20 px-2 py-1 rounded-full">Active</span>
                        )}
                      </div>
                      <div className={`text-xs mt-1 ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                        ⏱️ {task.time}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t-2 border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Progress</span>
            <span className="text-sm font-bold text-blue-600">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2 shadow-inner">
            <div
              className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-600 font-medium">
            {progress.completedTasks.length} of 7 tasks completed
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b-2 border-gray-200 px-8 py-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white text-xl">
                  {tasks[currentTask].icon}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {tasks[currentTask].name}
                  </h1>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Estimated time: <span className="font-semibold text-blue-600">{tasks[currentTask].time}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/browse')}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                Exit Simulation
              </button>
              {isAllTasksComplete() && currentTask === 7 && (
                <button
                  onClick={() => setShowFinalReport(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:from-blue-700 hover:to-blue-600 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  Finish & Submit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Task Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
          <CurrentTaskComponent
            onComplete={handleTaskComplete}
            onNext={handleNext}
            onPrevious={handlePrevious}
            taskId={tasks[currentTask].id}
            canGoNext={currentTask < tasks.length - 1}
            canGoPrevious={currentTask > 0}
          />
        </div>
      </div>
    </div>
  );
};

export default DemoSimulation;
