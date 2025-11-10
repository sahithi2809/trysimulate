import { supabase } from '../config/supabaseClient';

export const activityService = {
  // Log user activity
  async logActivity(activityType, activityData = {}, metadata = {}) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('Cannot log activity: User not authenticated');
      return;
    }

    const { error } = await supabase
      .from('user_activity')
      .insert({
        user_id: user.id,
        activity_type: activityType,
        activity_data: activityData,
        metadata: {
          ...metadata,
          user_agent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        },
      });

    if (error) {
      console.error('Error logging activity:', error);
    }
  },

  // Track simulation start
  async startSimulation(simulationId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('simulation_sessions')
      .insert({
        user_id: user.id,
        simulation_id: simulationId,
        status: 'started',
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return null;
    }

    // Log activity
    await this.logActivity('simulation_started', {
      simulation_id: simulationId,
      session_id: session.id,
    });

    return session;
  },

  // Track simulation progress
  async updateProgress(sessionId, progress) {
    const { error } = await supabase
      .from('simulation_sessions')
      .update({
        current_step: progress.currentStep,
        progress_percentage: progress.percentage,
        simulation_state: progress.state,
        status: 'in_progress',
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating progress:', error);
    }
  },

  // Track simulation completion
  async completeSimulation(sessionId, score, responses) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('simulation_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        final_score: score.final,
        max_score: score.max,
        progress_percentage: 100,
        user_responses: responses,
      })
      .eq('id', sessionId);

    if (error) {
      console.error('Error completing session:', error);
      return;
    }

    // Log activity
    await this.logActivity('simulation_completed', {
      session_id: sessionId,
      score: score.final,
      max_score: score.max,
    });
  },

  // Get user's simulation history
  async getUserSimulationHistory(userId) {
    const { data, error } = await supabase
      .from('simulation_sessions')
      .select(`
        *,
        simulations (
          id,
          title,
          category,
          difficulty
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get user's created simulations
  async getUserCreatedSimulations(userId) {
    const { data, error } = await supabase
      .from('simulations')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};



