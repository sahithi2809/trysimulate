import { supabase } from '../config/supabaseClient';

export const recruiterService = {
  /**
   * Get all task-based simulations created by the current user (recruiter)
   * Also includes simulations where created_by is null (for backward compatibility)
   */
  async getMySimulations() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get simulations where user is the creator OR where created_by is null (legacy)
      const { data, error } = await supabase
        .from('task_based_simulations')
        .select('*')
        .or(`created_by.eq.${user.id},created_by.is.null`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recruiter simulations:', error);
        throw error;
      }

      console.log(`✅ Found ${data?.length || 0} simulations for recruiter ${user.id}`);
      return data || [];
    } catch (error) {
      console.error('Error fetching recruiter simulations:', error);
      throw error;
    }
  },

  /**
   * Get all participants for a specific simulation (only completed)
   * This function respects RLS policies - only shows participants for simulations the recruiter owns
   */
  async getSimulationParticipants(simulationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log(`🔍 Fetching participants for simulation ${simulationId} (recruiter: ${user.id})`);

      // First verify the recruiter owns this simulation
      const { data: sim, error: simError } = await supabase
        .from('task_based_simulations')
        .select('id, created_by, title')
        .eq('id', simulationId)
        .single();

      if (simError) {
        console.error('Error verifying simulation ownership:', simError);
        throw simError;
      }

      if (!sim) {
        console.warn(`⚠️ Simulation ${simulationId} not found`);
        return [];
      }

      // Check if user owns this simulation (or if created_by is null for backward compatibility)
      if (sim.created_by && sim.created_by !== user.id) {
        console.warn(`⚠️ User ${user.id} does not own simulation ${simulationId} (owner: ${sim.created_by})`);
        return [];
      }

      console.log(`✅ Verified ownership for simulation: ${sim.title}`);

      // Get the progress records (RLS will filter based on ownership)
      // Use pagination for scalability (limit to 1000 records per query)
      const { data: progressData, error: progressError } = await supabase
        .from('task_based_progress')
        .select('*')
        .eq('simulation_id', simulationId)
        .not('completed_at', 'is', null) // Only completed
        .order('completed_at', { ascending: false })
        .limit(1000); // Limit for scalability

      if (progressError) {
        console.error('Error fetching progress:', progressError);
        // If RLS blocks, try to get more info
        if (progressError.code === '42501' || progressError.message?.includes('permission')) {
          console.error('❌ RLS policy blocked access. Check that the simulation is mapped to this recruiter.');
        }
        throw progressError;
      }

      console.log(`📊 Found ${progressData?.length || 0} completed progress records`);

      if (!progressData || progressData.length === 0) {
        return [];
      }

      // Get user IDs
      const userIds = [...new Set(progressData.map(p => p.user_id))]; // Remove duplicates
      console.log(`👥 Fetching profiles for ${userIds.length} users`);

      // Get user profiles (RLS will filter based on recruiter policies)
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, avatar_url, user_role, created_at')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue with empty profiles if RLS blocks
        console.warn('⚠️ Continuing without profile data due to RLS restrictions');
      }

      // Combine progress with profiles
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const participants = progressData.map(progress => ({
        ...progress,
        user_profiles: profilesMap.get(progress.user_id) || {
          id: progress.user_id,
          full_name: 'Anonymous',
          email: 'N/A',
          user_role: null,
          created_at: null
        }
      }));

      console.log(`✅ Returning ${participants.length} participants`);
      return participants;
    } catch (error) {
      console.error('Error fetching participants:', error);
      throw error;
    }
  },

  /**
   * Get all task submissions for a specific simulation (only from completed progress)
   */
  async getSimulationSubmissions(simulationId) {
    try {
      // First get all completed progress for this simulation
      const { data: completedProgress, error: progressError } = await supabase
        .from('task_based_progress')
        .select('user_id')
        .eq('simulation_id', simulationId)
        .not('completed_at', 'is', null);

      if (progressError) throw progressError;

      const completedUserIds = completedProgress?.map(p => p.user_id) || [];

      if (completedUserIds.length === 0) {
        return [];
      }

      // Get submissions only for users who completed
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('task_submissions')
        .select('*')
        .eq('simulation_id', simulationId)
        .in('user_id', completedUserIds)
        .order('submitted_at', { ascending: false });

      if (submissionsError) throw submissionsError;

      if (!submissionsData || submissionsData.length === 0) {
        return [];
      }

      // Get user profiles for submissions
      const { data: submissionProfiles, error: submissionProfilesError } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', completedUserIds);

      if (submissionProfilesError) throw submissionProfilesError;

      // Combine submissions with profiles
      const submissionProfilesMap = new Map(submissionProfiles?.map(p => [p.id, p]) || []);
      const submissions = submissionsData.map(submission => ({
        ...submission,
        user_profiles: submissionProfilesMap.get(submission.user_id) || null
      }));

      return submissions;
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  },

  /**
   * Get analytics/insights for a simulation
   * Only includes completed participants
   */
  async getSimulationAnalytics(simulationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Verify ownership first
      const { data: sim } = await supabase
        .from('task_based_simulations')
        .select('id, created_by')
        .eq('id', simulationId)
        .single();

      if (!sim || (sim.created_by && sim.created_by !== user.id)) {
        // Return empty analytics if not owner
        return {
          totalParticipants: 0,
          completedParticipants: 0,
          completionRate: 0,
          averageScore: 0,
          topPerformers: [],
          scoreDistribution: { '90-100': 0, '80-89': 0, '70-79': 0, '60-69': 0, '0-59': 0 },
          averageDurationHours: 0,
          taskPerformance: {}
        };
      }

      // Get all progress records (RLS will filter)
      const { data: progressData, error: progressError } = await supabase
        .from('task_based_progress')
        .select('*')
        .eq('simulation_id', simulationId);

      if (progressError) throw progressError;

      // Get all submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('task_submissions')
        .select('*')
        .eq('simulation_id', simulationId);

      if (submissionsError) throw submissionsError;

      // Only count completed participants (RLS already filters, but double-check)
      const completedProgressData = progressData?.filter(p => p.completed_at !== null) || [];
      const totalParticipants = completedProgressData.length;
      const completedParticipants = totalParticipants;
      const completionRate = totalParticipants > 0 
        ? (completedParticipants / totalParticipants) * 100 
        : 0;

      // Calculate average score (all are completed at this point)
      const completedWithScores = completedProgressData.filter(p => p.final_score !== null);
      const averageScore = completedWithScores.length > 0
        ? completedWithScores.reduce((sum, p) => sum + (p.final_score || 0), 0) / completedWithScores.length
        : 0;

      // Get top performers (top 10)
      const topPerformers = [...completedWithScores]
        .sort((a, b) => (b.final_score || 0) - (a.final_score || 0))
        .slice(0, 10);

      // Calculate score distribution
      const scoreRanges = {
        '90-100': 0,
        '80-89': 0,
        '70-79': 0,
        '60-69': 0,
        '0-59': 0
      };

      completedWithScores.forEach(p => {
        const score = p.final_score || 0;
        if (score >= 90) scoreRanges['90-100']++;
        else if (score >= 80) scoreRanges['80-89']++;
        else if (score >= 70) scoreRanges['70-79']++;
        else if (score >= 60) scoreRanges['60-69']++;
        else scoreRanges['0-59']++;
      });

      // Calculate average time to complete (in hours)
      const completedWithDuration = completedProgressData.filter(p => 
        p.completed_at && p.started_at
      );
      const avgDurationHours = completedWithDuration.length > 0
        ? completedWithDuration.reduce((sum, p) => {
            const duration = new Date(p.completed_at) - new Date(p.started_at);
            return sum + (duration / (1000 * 60 * 60)); // Convert to hours
          }, 0) / completedWithDuration.length
        : 0;

      // Per-task performance (from submissions)
      const taskPerformance = {};
      submissionsData?.forEach(sub => {
        if (!taskPerformance[sub.task_id]) {
          taskPerformance[sub.task_id] = {
            taskId: sub.task_id,
            totalSubmissions: 0,
            averageScore: 0,
            scores: []
          };
        }
        taskPerformance[sub.task_id].totalSubmissions++;
        if (sub.score !== null) {
          taskPerformance[sub.task_id].scores.push(sub.score);
        }
      });

      // Calculate average scores per task
      Object.keys(taskPerformance).forEach(taskId => {
        const task = taskPerformance[taskId];
        if (task.scores.length > 0) {
          task.averageScore = task.scores.reduce((sum, s) => sum + s, 0) / task.scores.length;
        }
      });

      return {
        totalParticipants,
        completedParticipants,
        completionRate: Math.round(completionRate * 100) / 100,
        averageScore: Math.round(averageScore * 100) / 100,
        topPerformers,
        scoreDistribution: scoreRanges,
        averageDurationHours: Math.round(avgDurationHours * 100) / 100,
        taskPerformance
      };
    } catch (error) {
      console.error('Error calculating analytics:', error);
      throw error;
    }
  },

  /**
   * Get user profile details
   */
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Get all simulations a user has participated in
   */
  async getUserSimulationHistory(userId) {
    try {
      const { data, error } = await supabase
        .from('task_based_progress')
        .select(`
          *,
          task_based_simulations!inner (
            id,
            title,
            slug,
            category,
            company_info
          )
        `)
        .eq('user_id', userId)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user history:', error);
      throw error;
    }
  }
};

