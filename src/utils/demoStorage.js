// Local storage utilities for demo simulation

const STORAGE_KEY = 'noah_simulation_data';
const PROGRESS_KEY = 'noah_simulation_progress';

export const saveTaskData = (taskId, data) => {
  try {
    const allData = getAllTaskData();
    allData[taskId] = {
      ...data,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    return true;
  } catch (error) {
    console.error('Error saving task data:', error);
    return false;
  }
};

export const getTaskData = (taskId) => {
  try {
    const allData = getAllTaskData();
    return allData[taskId] || null;
  } catch (error) {
    console.error('Error getting task data:', error);
    return null;
  }
};

export const getAllTaskData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting all task data:', error);
    return {};
  }
};

export const markTaskComplete = (taskId) => {
  try {
    const progress = getProgress();
    progress.completedTasks = [...new Set([...progress.completedTasks, taskId])];
    progress.lastUpdated = new Date().toISOString();
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    return true;
  } catch (error) {
    console.error('Error marking task complete:', error);
    return false;
  }
};

export const isTaskComplete = (taskId) => {
  const progress = getProgress();
  return progress.completedTasks.includes(taskId);
};

export const getProgress = () => {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : {
      completedTasks: [],
      startedAt: new Date().toISOString(),
      lastUpdated: null
    };
  } catch (error) {
    console.error('Error getting progress:', error);
    return {
      completedTasks: [],
      startedAt: new Date().toISOString(),
      lastUpdated: null
    };
  }
};

export const getAllCompletedTasks = () => {
  const progress = getProgress();
  return progress.completedTasks || [];
};

export const clearSimulationData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROGRESS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing simulation data:', error);
    return false;
  }
};

export const isAllTasksComplete = () => {
  const progress = getProgress();
  // Tasks 0-7 (8 total, but task 0 is intro, so 1-7 need completion)
  const requiredTasks = ['task1', 'task2', 'task3', 'task4', 'task5', 'task6', 'task7'];
  return requiredTasks.every(task => progress.completedTasks.includes(task));
};

