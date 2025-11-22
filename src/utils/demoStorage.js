// Local storage utilities for demo simulation
// Now supports simulation-specific storage keys

const getStorageKey = (simulationSlug = 'noah-smart-fitness-watch') => {
  return `simulation_data_${simulationSlug}`;
};

const getProgressKey = (simulationSlug = 'noah-smart-fitness-watch') => {
  return `simulation_progress_${simulationSlug}`;
};

// Legacy keys for backward compatibility
const LEGACY_STORAGE_KEY = 'noah_simulation_data';
const LEGACY_PROGRESS_KEY = 'noah_simulation_progress';

export const saveTaskData = (taskId, data, simulationSlug = 'noah-smart-fitness-watch') => {
  try {
    const allData = getAllTaskData(simulationSlug);
    allData[taskId] = {
      ...data,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(getStorageKey(simulationSlug), JSON.stringify(allData));
    return true;
  } catch (error) {
    console.error('Error saving task data:', error);
    return false;
  }
};

export const getTaskData = (taskId, simulationSlug = 'noah-smart-fitness-watch') => {
  try {
    const allData = getAllTaskData(simulationSlug);
    return allData[taskId] || null;
  } catch (error) {
    console.error('Error getting task data:', error);
    return null;
  }
};

export const getAllTaskData = (simulationSlug = 'noah-smart-fitness-watch') => {
  try {
    const data = localStorage.getItem(getStorageKey(simulationSlug));
    if (data) {
      return JSON.parse(data);
    }
    // Try legacy key for backward compatibility (only for Noah)
    if (simulationSlug === 'noah-smart-fitness-watch') {
      const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyData) {
        return JSON.parse(legacyData);
      }
    }
    return {};
  } catch (error) {
    console.error('Error getting all task data:', error);
    return {};
  }
};

export const markTaskComplete = (taskId, simulationSlug = 'noah-smart-fitness-watch') => {
  try {
    const progress = getProgress(simulationSlug);
    progress.completedTasks = [...new Set([...progress.completedTasks, taskId])];
    progress.lastUpdated = new Date().toISOString();
    localStorage.setItem(getProgressKey(simulationSlug), JSON.stringify(progress));
    return true;
  } catch (error) {
    console.error('Error marking task complete:', error);
    return false;
  }
};

export const isTaskComplete = (taskId, simulationSlug = 'noah-smart-fitness-watch') => {
  const progress = getProgress(simulationSlug);
  return progress.completedTasks.includes(taskId);
};

export const getProgress = (simulationSlug = 'noah-smart-fitness-watch') => {
  try {
    const data = localStorage.getItem(getProgressKey(simulationSlug));
    if (data) {
      return JSON.parse(data);
    }
    // Try legacy key for backward compatibility (only for Noah)
    if (simulationSlug === 'noah-smart-fitness-watch') {
      const legacyData = localStorage.getItem(LEGACY_PROGRESS_KEY);
      if (legacyData) {
        return JSON.parse(legacyData);
      }
    }
    return {
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

export const getAllCompletedTasks = (simulationSlug = 'noah-smart-fitness-watch') => {
  const progress = getProgress(simulationSlug);
  return progress.completedTasks || [];
};

export const clearSimulationData = (simulationSlug = 'noah-smart-fitness-watch') => {
  try {
    localStorage.removeItem(getStorageKey(simulationSlug));
    localStorage.removeItem(getProgressKey(simulationSlug));
    // Also clear legacy keys if clearing Noah
    if (simulationSlug === 'noah-smart-fitness-watch') {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.removeItem(LEGACY_PROGRESS_KEY);
    }
    return true;
  } catch (error) {
    console.error('Error clearing simulation data:', error);
    return false;
  }
};

export const isAllTasksComplete = (simulationSlug = 'noah-smart-fitness-watch', requiredTasks = null) => {
  const progress = getProgress(simulationSlug);
  // Default to Noah's tasks, but allow override for other simulations
  const tasks = requiredTasks || ['task1', 'task2', 'task3', 'task4', 'task5', 'task6', 'task7'];
  return tasks.every(task => progress.completedTasks.includes(task));
};

