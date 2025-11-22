import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Task0Intro from '../components/task-based/Task0Intro';
import Task1MarketResearch from '../components/task-based/Task1MarketResearch';
import Task2TeamComposition from '../components/task-based/Task2TeamComposition';
import Task3Roadmap from '../components/task-based/Task3Roadmap';
import Task4Wireframe from '../components/task-based/Task4Wireframe';
import Task5GTM from '../components/task-based/Task5GTM';
import Task6Analytics from '../components/task-based/Task6Analytics';
import Task7Final from '../components/task-based/Task7Final';
import TaskMCQ from '../components/task-based/TaskMCQ';
import TaskShortText from '../components/task-based/TaskShortText';
import TaskReflection from '../components/task-based/TaskReflection';
import TaskDecisionLoop from '../components/task-based/TaskDecisionLoop';
import FinalReportCard from '../components/task-based/FinalReportCard';
import { getProgress, isAllTasksComplete, getAllTaskData, saveTaskData, markTaskComplete } from '../utils/demoStorage';
import { companyInfo } from '../data/demoSimulationData';
import { taskBasedService } from '../services/taskBasedService';

// Helper to get simulation slug for storage keys
const getSimulationSlug = (simulation) => {
  return simulation?.slug || 'noah-smart-fitness-watch';
};

const DemoSimulation = () => {
  const { slug } = useParams(); // Get simulation slug from URL
  const [simulation, setSimulation] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [simulationId, setSimulationId] = useState(null);
  const [currentTask, setCurrentTask] = useState(0);
  const [progress, setProgress] = useState(null);
  const [showFinalReport, setShowFinalReport] = useState(false);
  const [usingBackend, setUsingBackend] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load simulation and initialize session
  useEffect(() => {
    const initializeSimulation = async () => {
      try {
        setLoading(true);
        
        // Default to Noah simulation if no slug (backward compatibility)
        const simulationSlug = slug || 'noah-smart-fitness-watch';
        
        // Try to load from backend
        try {
          const sim = await taskBasedService.getSimulationBySlug(simulationSlug);
          
          if (sim) {
            setSimulation(sim);
            setSimulationId(sim.id);
            
            // Try to start/resume session
            try {
              // Check for existing active session
              const existingSession = await taskBasedService.resumeSession(sim.id);
              
              if (existingSession) {
                setSessionId(existingSession.session.id);
                setProgress(existingSession.progress);
                setUsingBackend(true);
              } else {
                // Start new session
                const { session, progress: progressData } = await taskBasedService.startSession(sim.id);
                setSessionId(session.id);
                setProgress(progressData);
                setUsingBackend(true);
              }
            } catch (sessionError) {
              console.warn('Failed to start session, using localStorage:', sessionError);
              // Fallback to localStorage
              const slug = getSimulationSlug(sim);
              setProgress(getProgress(slug));
              setUsingBackend(false);
            }
          } else {
            console.warn('Simulation not found in database, using localStorage');
            const slug = getSimulationSlug(null);
            setProgress(getProgress(slug));
            setUsingBackend(false);
          }
        } catch (backendError) {
          console.warn('Backend not available, using localStorage:', backendError);
          // Fallback to localStorage
          const slug = getSimulationSlug(null);
          setProgress(getProgress(slug));
          setUsingBackend(false);
        }
      } catch (error) {
        console.error('Error initializing simulation:', error);
        // Fallback to localStorage
        const slug = getSimulationSlug(null);
        setProgress(getProgress(slug));
        setUsingBackend(false);
      } finally {
        setLoading(false);
      }
    };

    initializeSimulation();
  }, [slug]);

  // Map task types to components
  const taskComponentMap = {
    'intro': Task0Intro,
    'multi-text-input': Task1MarketResearch,
    'multi-select-form': Task2TeamComposition,
    'roadmap': Task3Roadmap,
    'wireframe': Task4Wireframe,
    'gtm-strategy': Task5GTM,
    'analytics-dashboard': Task6Analytics,
    'final-submission': Task7Final,
    // Argo task types
    'mcq': TaskMCQ,
    'short-text': TaskShortText,
    'reflection': TaskReflection,
    // Persona simulation task type
    'decision-loop': TaskDecisionLoop
  };

  // Get tasks from simulation or use default (only if simulation is not loaded)
  const tasks = simulation?.tasks && simulation.tasks.length > 0
    ? simulation.tasks.map(task => ({
        id: task.id,
        name: task.name,
        component: taskComponentMap[task.type] || Task0Intro,
        time: task.estimated_time || 'N/A',
        icon: task.icon || '📋'
      }))
    : [
        // Fallback to Noah tasks only if simulation is not loaded
        { id: 'task0', name: 'Introduction', component: Task0Intro, time: '5 min', icon: '📋' },
        { id: 'task1', name: 'Market Research', component: Task1MarketResearch, time: '60-90 min', icon: '🔍' },
        { id: 'task2', name: 'Team & Tech Stack', component: Task2TeamComposition, time: '30-45 min', icon: '👥' },
        { id: 'task3', name: 'Roadmap & Phases', component: Task3Roadmap, time: '30-45 min', icon: '🗺️' },
        { id: 'task4', name: 'Wireframe Design', component: Task4Wireframe, time: '30-60 min', icon: '🎨' },
        { id: 'task5', name: 'GTM Strategy', component: Task5GTM, time: '45-60 min', icon: '🚀' },
        { id: 'task6', name: 'Post-Launch Analytics', component: Task6Analytics, time: '60-90 min', icon: '📊' },
        { id: 'task7', name: 'Final Submission', component: Task7Final, time: '30-45 min', icon: '✅' }
      ];

  const handleTaskComplete = async (taskId) => {
    try {
      console.log(`✅ Task ${taskId} completed. Using backend: ${usingBackend}, Simulation ID: ${simulationId}, Session ID: ${sessionId}`);
      
      if (usingBackend && simulationId && sessionId) {
        // Get task data from localStorage (components still use it temporarily)
        const slug = getSimulationSlug(simulation);
        const allTaskData = getAllTaskData(slug);
        const taskData = allTaskData[taskId] || {};

        console.log(`💾 Saving task submission for ${taskId}...`);

        // Save to backend
        try {
          await taskBasedService.saveTaskSubmission(
            simulationId,
            sessionId,
            taskId,
            taskData
          );
          console.log(`✅ Task submission saved successfully for ${taskId}`);
        } catch (saveError) {
          console.error(`❌ Error saving task submission for ${taskId}:`, saveError);
          throw saveError; // Re-throw to trigger fallback
        }

        // Refresh progress from backend
        console.log(`🔄 Refreshing progress...`);
        const updatedProgress = await taskBasedService.getProgress(simulationId, sessionId);
        if (updatedProgress) {
          console.log(`📊 Updated progress:`, {
            completed_tasks: updatedProgress.completed_tasks?.length || 0,
            progress_percentage: updatedProgress.progress_percentage,
            completed_at: updatedProgress.completed_at || 'NOT SET'
          });
          setProgress(updatedProgress);
          
          // Check if all tasks complete
          const totalTasks = tasks.filter(t => t.id !== 'task0').length;
          const completedCount = updatedProgress.completed_tasks?.length || 0;
          console.log(`📋 Progress check: ${completedCount}/${totalTasks} tasks completed`);
          
          if (completedCount >= totalTasks) {
            console.log(`🎉 All tasks completed! Showing final report.`);
            if (!updatedProgress.completed_at) {
              console.warn(`⚠️ All tasks done but completed_at is not set. This should be set by updateProgress.`);
            }
            setShowFinalReport(true);
          }
        } else {
          console.warn(`⚠️ Could not fetch updated progress`);
        }
      } else {
        console.log(`📦 Using localStorage fallback (backend not available or not authenticated)`);
        // Fallback to localStorage
        const slug = getSimulationSlug(simulation);
        markTaskComplete(taskId, slug);
        const newProgress = getProgress(slug);
        setProgress(newProgress);
        // Check completion based on simulation's tasks
        const totalTasks = tasks.filter(t => t.id !== 'task0').length;
        const requiredTasks = tasks.filter(t => t.id !== 'task0').map(t => t.id);
        if (isAllTasksComplete(slug, requiredTasks) && currentTask === tasks.length - 1) {
          console.log(`🎉 All tasks completed (localStorage)!`);
          setShowFinalReport(true);
        }
      }
    } catch (error) {
      console.error('❌ Failed to save task completion:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
      // Fallback to localStorage on error
      const slug = getSimulationSlug(simulation);
      markTaskComplete(taskId, slug);
      const newProgress = getProgress(slug);
      setProgress(newProgress);
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

  const CurrentTaskComponent = tasks[currentTask]?.component || Task0Intro;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading simulation...</div>
        </div>
      </div>
    );
  }

  if (showFinalReport) {
    return (
      <FinalReportCard 
        onClose={() => setShowFinalReport(false)} 
        simulation={simulation}
        sessionId={sessionId}
        simulationId={simulationId}
        usingBackend={usingBackend}
      />
    );
  }

  // Calculate progress percentage
  const completedTasks = usingBackend && progress?.completed_tasks 
    ? progress.completed_tasks.length 
    : (progress?.completedTasks?.length || 0);
  const totalTasks = tasks.filter(t => t.id !== 'task0').length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // Get company info from simulation or fallback
  const currentCompanyInfo = simulation?.company_info || companyInfo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex">
      {/* Left Sidebar */}
      <div className="w-72 bg-white border-r-2 border-gray-200 flex-shrink-0 overflow-y-auto shadow-lg">
        <div className="p-6 border-b-2 border-gray-200 bg-gradient-to-r from-primary to-accent text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl">
              {currentCompanyInfo.logo || '🏢'}
            </div>
            <div>
              <h2 className="text-xl font-bold">{currentCompanyInfo.name || simulation?.title || 'Simulation'}</h2>
              <p className="text-xs text-blue-100">{simulation?.description?.substring(0, 30) || 'Task-based simulation'}</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4 px-2">Tasks</div>
          <div className="space-y-2">
            {tasks.map((task, index) => {
              const completedTasks = usingBackend && progress?.completed_tasks 
                ? progress.completed_tasks 
                : (progress?.completedTasks || []);
              const isComplete = completedTasks.includes(task.id);
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
            {completedTasks} of {totalTasks} tasks completed
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
              {((usingBackend && progress?.completed_at) || (!usingBackend && isAllTasksComplete())) && currentTask === tasks.length - 1 && (
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
            taskId={tasks[currentTask]?.id}
            canGoNext={currentTask < tasks.length - 1}
            canGoPrevious={currentTask > 0}
            simulation={simulation}
            task={simulation?.tasks?.find(t => t.id === tasks[currentTask]?.id)}
            taskData={simulation?.task_data}
          />
        </div>
      </div>
    </div>
  );
};

export default DemoSimulation;
