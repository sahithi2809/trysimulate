/**
 * Database Service for Simulations
 * Handles all database operations for simulations
 */

import { supabase } from '../config/supabaseClient';

export const databaseService = {
  /**
   * Get all published simulations from database
   * @returns {Promise<Array>} Array of simulation objects
   */
  async getAllSimulations() {
    try {
      const { data, error } = await supabase
        .from('simulations')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Database error fetching simulations:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getAllSimulations:', error);
      throw error;
    }
  },

  /**
   * Get simulation by ID from database
   * @param {string} id - Simulation ID
   * @returns {Promise<Object>} Simulation object
   */
  async getSimulationById(id) {
    try {
      const { data, error } = await supabase
        .from('simulations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Database error fetching simulation:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getSimulationById:', error);
      throw error;
    }
  },

  /**
   * Save new simulation to database (from AI Builder)
   * @param {Object} simulationData - Simulation data to save
   * @returns {Promise<Object>} Saved simulation object
   */
  async saveSimulation(simulationData) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user profile for creator name
      let creatorName = null;
      if (user) {
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
          creatorName = profile?.full_name || user.email?.split('@')[0] || 'Anonymous';
        } catch (err) {
          creatorName = user.email?.split('@')[0] || 'Anonymous';
        }
      }

      const { data, error } = await supabase
        .from('simulations')
        .insert({
          title: simulationData.title,
          description: simulationData.description,
          category: simulationData.category,
          difficulty: simulationData.difficulty,
          duration: simulationData.duration,
          learning_objectives: simulationData.learningObjectives || [],
          skills_tested: simulationData.skillsTested || [],
          html_content: simulationData.htmlContent,
          is_ai_generated: true,
          is_published: true,
          tags: simulationData.tags || [],
          created_by: user?.id || null,
          creator_name: creatorName,
          metadata: {
            ai_model: 'gemini-2.5-pro',
            generation_prompt: simulationData.userPrompt || '',
            version: '1.0',
            created_via: 'ai_builder'
          }
        })
        .select()
        .single();
      
      if (error) {
        console.error('Database error saving simulation:', error);
        throw error;
      }
      
      console.log('✅ Simulation saved to database:', data.id);
      return data;
    } catch (error) {
      console.error('Error in saveSimulation:', error);
      throw error;
    }
  },

  /**
   * Update existing simulation
   * @param {string} id - Simulation ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} Updated simulation object
   */
  async updateSimulation(id, updates) {
    try {
      const { data, error } = await supabase
        .from('simulations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Database error updating simulation:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in updateSimulation:', error);
      throw error;
    }
  },

  /**
   * Get simulations created by current user
   * @returns {Promise<Array>} Array of simulation objects
   */
  async getUserSimulations() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('simulations')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Database error fetching user simulations:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getUserSimulations:', error);
      throw error;
    }
  },

  /**
   * Delete simulation from database
   * @param {string} id - Simulation ID
   * @returns {Promise<void>}
   */
  async deleteSimulation(id) {
    try {
      const { error } = await supabase
        .from('simulations')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Database error deleting simulation:', error);
        throw error;
      }
      
      console.log('✅ Simulation deleted from database:', id);
    } catch (error) {
      console.error('Error in deleteSimulation:', error);
      throw error;
    }
  },

  /**
   * Test database connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('simulations')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Database connection test failed:', error);
        return false;
      }
      
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('Error testing database connection:', error);
      return false;
    }
  }
};
