import { supabase } from '../config/supabaseClient';
import { taskValidationService } from './taskValidationService';

/**
 * Task-Based Simulation Service
 * Handles all backend operations for task-based simulations
 * Includes error handling, fallbacks, and edge case management
 */
export const taskBasedService = {
  /**
   * Get all published task-based simulations
   * @returns {Promise<Array>} Array of simulation objects
   */
  async getAllSimulations() {
    try {
      const { data, error } = await supabase
        .from('task_based_simulations')
        .select('*')
        .eq('is_published', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching simulations:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get simulations:', error);
      return []; // Return empty array on error
    }
  },

  /**
   * Get a specific simulation by slug
   * @param {string} slug - Simulation slug
   * @returns {Promise<Object|null>} Simulation object or null
   */
  async getSimulationBySlug(slug) {
    try {
      if (!slug) {
        throw new Error('Slug is required');
      }

      const { data, error } = await supabase
        .from('task_based_simulations')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching simulation by slug:', error);
      throw error;
    }
  },

  /**
   * Get simulation by ID
   * @param {string} simulationId - Simulation UUID
   * @returns {Promise<Object|null>} Simulation object or null
   */
  async getSimulationById(simulationId) {
    try {
      if (!simulationId) {
        throw new Error('Simulation ID is required');
      }

      const { data, error } = await supabase
        .from('task_based_simulations')
        .select('*')
        .eq('id', simulationId)
        .eq('is_published', true)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching simulation by ID:', error);
      throw error;
    }
  },

  /**
   * Start a new simulation session
   * Creates both simulation_session and task_based_progress records
   * @param {string} simulationId - Simulation UUID
   * @returns {Promise<Object>} { session, progress }
   */
  async startSession(simulationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be authenticated to start a session');
      }

      if (!simulationId) {
        throw new Error('Simulation ID is required');
      }

      // Verify simulation exists
      const simulation = await this.getSimulationById(simulationId);
      if (!simulation) {
        throw new Error('Simulation not found or not published');
      }

      // Check if user already has an active session for this simulation
      const existingProgress = await this.getActiveProgress(simulationId, user.id);
      if (existingProgress) {
        // Return existing session
        const { data: session } = await supabase
          .from('simulation_sessions')
          .select('*')
          .eq('id', existingProgress.session_id)
          .single();

        return { session, progress: existingProgress };
      }

      // Create simulation session
      const { data: session, error: sessionError } = await supabase
        .from('simulation_sessions')
        .insert({
          user_id: user.id,
          simulation_id: simulationId,
          status: 'started',
          simulation_state: { type: 'task-based' }
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        throw sessionError;
      }

      // Create progress record
      const totalTasks = simulation.tasks?.length || 0;
      const { data: progress, error: progressError } = await supabase
        .from('task_based_progress')
        .insert({
          user_id: user.id,
          simulation_id: simulationId,
          session_id: session.id,
          current_task: 0,
          completed_tasks: [],
          progress_percentage: 0,
          metadata: {
            total_tasks: totalTasks,
            started_from: 'web'
          }
        })
        .select()
        .single();

      if (progressError) {
        console.error('Error creating progress:', progressError);
        // Clean up session if progress creation fails
        await supabase
          .from('simulation_sessions')
          .delete()
          .eq('id', session.id);
        throw progressError;
      }

      return { session, progress };
    } catch (error) {
      console.error('Failed to start session:', error);
      throw error;
    }
  },

  /**
   * Get active progress for a user and simulation
   * @param {string} simulationId - Simulation UUID
   * @param {string} userId - User UUID (optional, defaults to current user)
   * @returns {Promise<Object|null>} Progress object or null
   */
  async getActiveProgress(simulationId, userId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (!targetUserId) {
        return null;
      }

      const { data, error } = await supabase
        .from('task_based_progress')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('simulation_id', simulationId)
        .is('completed_at', null) // Only active (not completed) sessions
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting active progress:', error);
      return null;
    }
  },

  /**
   * Save a task submission
   * Validates, scores, and saves the task data
   * @param {string} simulationId - Simulation UUID
   * @param {string} sessionId - Session UUID
   * @param {string} taskId - Task ID (e.g., 'task1')
   * @param {Object} taskData - Task submission data
   * @returns {Promise<Object>} Saved submission object
   */
  async saveTaskSubmission(simulationId, sessionId, taskId, taskData) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ Auth error:', authError);
        throw new Error('Authentication error: ' + authError.message);
      }
      
      if (!user) {
        console.error('❌ User not authenticated');
        throw new Error('User must be authenticated to save submissions');
      }

      console.log(`💾 Saving submission for user ${user.id}, simulation ${simulationId}, task ${taskId}`);

      if (!simulationId || !sessionId || !taskId) {
        throw new Error('simulationId, sessionId, and taskId are required');
      }

      if (!taskData || typeof taskData !== 'object') {
        throw new Error('taskData must be an object');
      }

      // Get simulation for validation rules
      const simulation = await this.getSimulationById(simulationId);
      if (!simulation) {
        throw new Error('Simulation not found');
      }

      // Get task definition
      const task = simulation.tasks?.find(t => t.id === taskId);
      if (!task) {
        throw new Error(`Task ${taskId} not found in simulation`);
      }

      // Validate and score the task
      let scoringResult;
      try {
        scoringResult = await taskValidationService.validateTask(
          task,
          taskData,
          simulation
        );
      } catch (validationError) {
        console.error('Validation error:', validationError);
        // Use default scoring if validation fails
        scoringResult = {
          score: 0,
          breakdown: {},
          strengths: [],
          improvements: ['Validation failed. Please try again.']
        };
      }

      // Save submission
      const submissionData = {
        user_id: user.id,
        simulation_id: simulationId,
        session_id: sessionId,
        task_id: taskId,
        task_data: taskData,
        score: scoringResult.score || 0,
        score_breakdown: scoringResult.breakdown || {},
        strengths: scoringResult.strengths || [],
        improvements: scoringResult.improvements || [],
        validation_method: task.validation?.method || 'rule-based',
        metadata: {
          task_type: task.type,
          submitted_at: new Date().toISOString()
        }
      };

      const { data, error } = await supabase
        .from('task_submissions')
        .upsert(submissionData, {
          onConflict: 'user_id,simulation_id,session_id,task_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving submission:', error);
        throw error;
      }

      // Update progress
      await this.updateProgress(simulationId, sessionId, taskId, simulation);

      return data;
    } catch (error) {
      console.error('Failed to save task submission:', error);
      throw error;
    }
  },

  /**
   * Update progress after task completion
   * @param {string} simulationId - Simulation UUID
   * @param {string} sessionId - Session UUID
   * @param {string} completedTaskId - Completed task ID
   * @param {Object} simulation - Simulation object (optional, will fetch if not provided)
   * @returns {Promise<Object>} Updated progress object
   */
  async updateProgress(simulationId, sessionId, completedTaskId, simulation = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be authenticated');
      }

      // Get simulation if not provided
      if (!simulation) {
        simulation = await this.getSimulationById(simulationId);
        if (!simulation) {
          throw new Error('Simulation not found');
        }
      }

      // Get current progress
      const { data: currentProgress, error: fetchError } = await supabase
        .from('task_based_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('simulation_id', simulationId)
        .eq('session_id', sessionId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // Progress doesn't exist, create it
          const { data: newProgress } = await supabase
            .from('task_based_progress')
            .insert({
              user_id: user.id,
              simulation_id: simulationId,
              session_id: sessionId,
              current_task: 0,
              completed_tasks: [completedTaskId],
              progress_percentage: 0
            })
            .select()
            .single();
          return newProgress;
        }
        throw fetchError;
      }

      // Calculate total tasks (exclude intro task if it exists)
      const tasks = simulation.tasks || [];
      const totalTasks = tasks.filter(t => t.id !== 'task0').length; // Exclude intro
      
      // Update completed tasks
      const completedTasks = [...new Set([
        ...(currentProgress.completed_tasks || []),
        completedTaskId
      ])];

      // Calculate progress percentage
      const progressPercentage = totalTasks > 0 
        ? Math.round((completedTasks.length / totalTasks) * 100)
        : 0;

      // Check if all tasks complete
      const allTasksComplete = completedTasks.length >= totalTasks;

      // Prepare update data
      const updateData = {
        completed_tasks: completedTasks,
        progress_percentage: progressPercentage,
        current_task: allTasksComplete ? totalTasks - 1 : currentProgress.current_task,
        last_updated_at: new Date().toISOString()
      };

      // If all tasks complete, generate final report
      if (allTasksComplete && !currentProgress.completed_at) {
        console.log(`🎉 All tasks completed! Generating final report and marking as complete...`);
        try {
          const finalReport = await this.generateFinalReport(simulationId, sessionId, simulation);
          console.log(`✅ Final report generated. Score: ${finalReport.finalScore}%`);
          
          updateData.final_score = finalReport.finalScore;
          updateData.skill_breakdown = finalReport.skillBreakdown;
          updateData.resume_snippet = finalReport.resumeSnippet;
          updateData.completed_at = new Date().toISOString();
          updateData.progress_percentage = 100; // Ensure 100%

          console.log(`💾 Setting completed_at to: ${updateData.completed_at}`);

          // Update session status
          const { error: sessionError } = await supabase
            .from('simulation_sessions')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
              final_score: finalReport.finalScore,
              progress_percentage: 100
            })
            .eq('id', sessionId);

          if (sessionError) {
            console.error('❌ Error updating session status:', sessionError);
          } else {
            console.log(`✅ Session marked as completed`);
          }
        } catch (reportError) {
          console.error('❌ Error generating final report:', reportError);
          // Still mark as completed even if report generation fails
          updateData.completed_at = new Date().toISOString();
          updateData.progress_percentage = 100;
          console.log(`⚠️ Marking as completed without final report due to error`);
        }
      } else if (allTasksComplete && currentProgress.completed_at) {
        console.log(`✅ Already marked as completed at: ${currentProgress.completed_at}`);
      } else {
        console.log(`⏳ Not all tasks complete yet: ${completedTasks.length}/${totalTasks}`);
      }

      // Update progress
      console.log(`💾 Updating progress with data:`, {
        completed_tasks: updateData.completed_tasks?.length || 0,
        progress_percentage: updateData.progress_percentage,
        completed_at: updateData.completed_at || 'NOT SET',
        final_score: updateData.final_score || 'NOT SET'
      });

      const { data, error } = await supabase
        .from('task_based_progress')
        .update(updateData)
        .eq('id', currentProgress.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating progress:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log(`✅ Progress updated successfully. Completed: ${data.completed_at ? 'YES' : 'NO'}`);
      return data;
    } catch (error) {
      console.error('Failed to update progress:', error);
      throw error;
    }
  },

  /**
   * Generate final report when all tasks are complete
   * @param {string} simulationId - Simulation UUID
   * @param {string} sessionId - Session UUID
   * @param {Object} simulation - Simulation object
   * @returns {Promise<Object>} Final report data
   */
  async generateFinalReport(simulationId, sessionId, simulation) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User must be authenticated');
      }

      // Get all submissions for this session
      const { data: submissions, error: submissionsError } = await supabase
        .from('task_submissions')
        .select('*')
        .eq('user_id', user.id)
        .eq('simulation_id', simulationId)
        .eq('session_id', sessionId)
        .order('task_id', { ascending: true });

      if (submissionsError) {
        throw submissionsError;
      }

      if (!submissions || submissions.length === 0) {
        throw new Error('No submissions found for final report');
      }

      // Calculate final score (average of all task scores)
      const totalScore = submissions.reduce((sum, s) => sum + (s.score || 0), 0);
      const finalScore = Math.round(totalScore / submissions.length);

      // Calculate skill breakdown
      const skillBreakdown = this.calculateSkillBreakdown(submissions, simulation);

      // Generate resume snippet
      const resumeSnippet = this.generateResumeSnippet(simulation, finalScore, skillBreakdown);

      return {
        finalScore,
        skillBreakdown,
        resumeSnippet
      };
    } catch (error) {
      console.error('Error generating final report:', error);
      throw error;
    }
  },

  /**
   * Calculate skill breakdown from submissions
   * @param {Array} submissions - Array of submission objects
   * @param {Object} simulation - Simulation object
   * @returns {Object} Skill breakdown { "Skill Name": score }
   */
  calculateSkillBreakdown(submissions, simulation) {
    const skillMapping = simulation.skill_mapping || {};
    const skills = simulation.skills_tested || [];
    const breakdown = {};

    // Initialize all skills
    skills.forEach(skill => {
      breakdown[skill] = {
        score: 0,
        taskCount: 0
      };
    });

    // For each submission, add score to relevant skills
    submissions.forEach(submission => {
      const taskId = submission.task_id;
      const taskScore = submission.score || 0;
      
      // Find which skills this task tests
      const taskSkills = [];
      Object.entries(skillMapping).forEach(([skill, taskIds]) => {
        if (Array.isArray(taskIds) && taskIds.includes(taskId)) {
          taskSkills.push(skill);
        }
      });

      // Distribute task score to skills
      if (taskSkills.length > 0) {
        const scorePerSkill = taskScore / taskSkills.length;
        taskSkills.forEach(skill => {
          if (breakdown[skill]) {
            breakdown[skill].score += scorePerSkill;
            breakdown[skill].taskCount += 1;
          }
        });
      }
    });

    // Calculate average scores
    const result = {};
    Object.entries(breakdown).forEach(([skill, data]) => {
      if (data.taskCount > 0) {
        result[skill] = Math.round(data.score / data.taskCount);
      } else {
        result[skill] = 0;
      }
    });

    return result;
  },

  /**
   * Generate resume snippet
   * @param {Object} simulation - Simulation object
   * @param {number} finalScore - Final score
   * @param {Object} skillBreakdown - Skill breakdown object
   * @returns {string} Resume snippet text
   */
  generateResumeSnippet(simulation, finalScore, skillBreakdown) {
    const topSkills = Object.entries(skillBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([skill]) => skill);

    const companyName = simulation.company_info?.fullName || simulation.company_info?.name || 'the company';
    const simulationTitle = simulation.title;

    return `Led end-to-end product development for ${companyName} ${simulationTitle}, demonstrating expertise in ${topSkills.join(', ')}. ` +
      `Achieved ${finalScore}/100 overall score across ${simulation.tasks?.length || 0} comprehensive tasks including market research, strategic planning, and data analysis.`;
  },

  /**
   * Get user's progress for a simulation
   * @param {string} simulationId - Simulation UUID
   * @param {string} sessionId - Session UUID
   * @returns {Promise<Object|null>} Progress object or null
   */
  async getProgress(simulationId, sessionId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null; // Return null if not logged in (fallback to localStorage)
      }

      if (!simulationId || !sessionId) {
        return null;
      }

      const { data, error } = await supabase
        .from('task_based_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('simulation_id', simulationId)
        .eq('session_id', sessionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting progress:', error);
      return null; // Return null on error (fallback to localStorage)
    }
  },

  /**
   * Get all task submissions for a session
   * @param {string} simulationId - Simulation UUID
   * @param {string} sessionId - Session UUID
   * @returns {Promise<Array>} Array of submission objects
   */
  async getTaskSubmissions(simulationId, sessionId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }

      if (!simulationId || !sessionId) {
        return [];
      }

      const { data, error } = await supabase
        .from('task_submissions')
        .select('*')
        .eq('user_id', user.id)
        .eq('simulation_id', simulationId)
        .eq('session_id', sessionId)
        .order('task_id', { ascending: true });

      if (error) {
        console.error('Error getting submissions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting task submissions:', error);
      return [];
    }
  },

  /**
   * Get a specific task submission
   * @param {string} simulationId - Simulation UUID
   * @param {string} sessionId - Session UUID
   * @param {string} taskId - Task ID
   * @returns {Promise<Object|null>} Submission object or null
   */
  async getTaskSubmission(simulationId, sessionId, taskId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('task_submissions')
        .select('*')
        .eq('user_id', user.id)
        .eq('simulation_id', simulationId)
        .eq('session_id', sessionId)
        .eq('task_id', taskId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting task submission:', error);
      return null;
    }
  },

  /**
   * Resume a previous session
   * @param {string} simulationId - Simulation UUID
   * @returns {Promise<Object|null>} { session, progress } or null
   */
  async resumeSession(simulationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      const progress = await this.getActiveProgress(simulationId, user.id);
      if (!progress) {
        return null;
      }

      const { data: session } = await supabase
        .from('simulation_sessions')
        .select('*')
        .eq('id', progress.session_id)
        .single();

      return { session, progress };
    } catch (error) {
      console.error('Error resuming session:', error);
      return null;
    }
  }
};

