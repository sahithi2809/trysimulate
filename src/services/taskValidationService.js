// Dynamic Task Validation Service
// Handles different validation methods (rule-based, LLM-based) per simulation/task

/**
 * Task Validation Service
 * Supports both rule-based and LLM-based validation
 * Handles edge cases and fallbacks gracefully
 */
export const taskValidationService = {
  /**
   * Validate a task based on its configuration
   * @param {Object} task - Task definition object
   * @param {Object} taskData - User's task submission data
   * @param {Object} simulation - Simulation object
   * @returns {Promise<Object>} Validation result with score, breakdown, strengths, improvements
   */
  async validateTask(task, taskData, simulation) {
    try {
      if (!task || !taskData) {
        return this.getDefaultResult('Invalid task or task data');
      }

      const validationRule = simulation.validation_rules?.[task.id] || task.validation;
      
      if (!validationRule) {
        console.warn(`No validation rule found for task ${task.id}, using default`);
        return this.getDefaultResult();
      }

      // Route to appropriate validation method
      if (validationRule.method === 'llm-based') {
        return await this.llmBasedValidation(task, taskData, validationRule, simulation);
      } else {
        // Default to rule-based
        return await this.ruleBasedValidation(task, taskData, validationRule, simulation);
      }
    } catch (error) {
      console.error('Validation error:', error);
      return this.getDefaultResult(`Validation failed: ${error.message}`);
    }
  },

  /**
   * Rule-based validation (current system)
   * @param {Object} task - Task definition
   * @param {Object} taskData - User submission
   * @param {Object} rule - Validation rule
   * @param {Object} simulation - Simulation object
   * @returns {Promise<Object>} Validation result
   */
  async ruleBasedValidation(task, taskData, rule, simulation) {
    try {
      // If validator function name specified, use it
      if (rule.validator) {
        try {
          const validators = await import('../utils/demoValidation');
          const validatorFn = validators[rule.validator];
          
          if (validatorFn && typeof validatorFn === 'function') {
            const result = validatorFn(taskData);
            return this.normalizeResult(result);
          }
        } catch (importError) {
          console.warn(`Validator function ${rule.validator} not found, using rubric`);
        }
      }

      // Use inline rubric if available
      if (rule.rubric) {
        return this.calculateScoreFromRubric(taskData, rule.rubric, rule.keywords);
      }

      // Fallback: simple length-based scoring
      return this.simpleLengthBasedScoring(taskData);
    } catch (error) {
      console.error('Rule-based validation error:', error);
      return this.getDefaultResult(`Rule-based validation failed: ${error.message}`);
    }
  },

  /**
   * LLM-based validation (future)
   * @param {Object} task - Task definition
   * @param {Object} taskData - User submission
   * @param {Object} rule - Validation rule
   * @param {Object} simulation - Simulation object
   * @returns {Promise<Object>} Validation result
   */
  async llmBasedValidation(task, taskData, rule, simulation) {
    try {
      const { supabase } = await import('../config/supabaseClient');
      
      // Call Edge Function for LLM-based scoring
      const { data, error } = await supabase.functions.invoke('score-task-llm', {
        body: {
          taskId: task.id,
          taskData: taskData,
          rubric: rule.rubric,
          prompt: rule.prompt,
          simulationId: simulation.id,
          taskName: task.name
        }
      });

      if (error) {
        console.error('LLM validation error:', error);
        // Fallback to rule-based if LLM fails
        console.warn('Falling back to rule-based validation');
        return await this.ruleBasedValidation(task, taskData, rule, simulation);
      }

      return this.normalizeResult(data);
    } catch (error) {
      console.error('LLM validation error:', error);
      // Fallback to rule-based
      return await this.ruleBasedValidation(task, taskData, rule, simulation);
    }
  },

  /**
   * Calculate score from rubric
   * @param {Object} taskData - User submission
   * @param {Object} rubric - Scoring rubric
   * @param {Object} keywords - Keyword lists for validation
   * @returns {Object} Validation result
   */
  calculateScoreFromRubric(taskData, rubric, keywords = {}) {
    let totalScore = 0;
    const breakdown = {};
    const strengths = [];
    const improvements = [];
    
    try {
      for (const [key, criteria] of Object.entries(rubric)) {
        const value = taskData[key] || '';
        const keywordList = keywords[key] || [];
        
        // Calculate score for this criterion
        let criterionScore = 0;
        
        // Keyword-based scoring
        if (keywordList.length > 0) {
          const keywordScore = this.checkKeywords(value, keywordList);
          criterionScore += keywordScore * (criteria.maxScore || 0);
        }
        
        // Length-based scoring
        if (criteria.minLength && value.length >= criteria.minLength) {
          criterionScore += (criteria.maxScore || 0) * 0.3;
        }
        
        // Content quality (simple heuristics)
        if (value.length > 50) {
          criterionScore += (criteria.maxScore || 0) * 0.2;
        }
        
        // Cap at max score
        criterionScore = Math.min(criterionScore, criteria.maxScore || 0);
        breakdown[key] = Math.round(criterionScore);
        totalScore += criterionScore;
        
        // Generate feedback
        if (criterionScore >= (criteria.maxScore || 0) * 0.8) {
          strengths.push(`Strong ${key} analysis`);
        } else if (criterionScore < (criteria.maxScore || 0) * 0.5) {
          improvements.push(`Improve ${key} - add more detail and analysis`);
        }
      }

      // Normalize to 0-100
      const maxPossibleScore = Object.values(rubric).reduce(
        (sum, c) => sum + (c.maxScore || 0), 
        0
      );
      
      const finalScore = maxPossibleScore > 0 
        ? Math.round((totalScore / maxPossibleScore) * 100)
        : 0;

      return {
        score: Math.min(Math.max(finalScore, 0), 100),
        breakdown,
        strengths: strengths.length > 0 ? strengths : ['Good effort on the task'],
        improvements: improvements.length > 0 ? improvements : ['Continue practicing']
      };
    } catch (error) {
      console.error('Rubric calculation error:', error);
      return this.getDefaultResult('Scoring calculation failed');
    }
  },

  /**
   * Simple length-based scoring (fallback)
   * @param {Object} taskData - User submission
   * @returns {Object} Validation result
   */
  simpleLengthBasedScoring(taskData) {
    const totalLength = Object.values(taskData)
      .filter(v => typeof v === 'string')
      .reduce((sum, v) => sum + v.length, 0);
    
    // Simple heuristic: more content = higher score (capped)
    const score = Math.min(Math.round((totalLength / 500) * 100), 100);
    
    return {
      score: Math.max(score, 20), // Minimum 20 points for any submission
      breakdown: {},
      strengths: totalLength > 200 ? ['Good detail in your response'] : [],
      improvements: totalLength < 100 ? ['Add more detail to your response'] : ['Keep practicing']
    };
  },

  /**
   * Check keywords in text
   * @param {string} text - Text to check
   * @param {Array<string>} keywordList - List of keywords
   * @returns {number} Score between 0 and 1
   */
  checkKeywords(text, keywordList) {
    if (!text || !keywordList || keywordList.length === 0) {
      return 0;
    }

    try {
      const lowerText = text.toLowerCase();
      const found = keywordList.filter(kw => 
        lowerText.includes(kw.toLowerCase())
      ).length;
      
      return Math.min(found / keywordList.length, 1);
    } catch (error) {
      console.error('Keyword check error:', error);
      return 0;
    }
  },

  /**
   * Normalize validation result to standard format
   * @param {Object} result - Raw validation result
   * @returns {Object} Normalized result
   */
  normalizeResult(result) {
    if (!result || typeof result !== 'object') {
      return this.getDefaultResult('Invalid validation result');
    }

    return {
      score: Math.min(Math.max(parseInt(result.score) || 0, 0), 100),
      breakdown: result.breakdown || result.score_breakdown || {},
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      improvements: Array.isArray(result.improvements) ? result.improvements : []
    };
  },

  /**
   * Get default validation result
   * @param {string} message - Error message
   * @returns {Object} Default result
   */
  getDefaultResult(message = null) {
    return {
      score: 50,
      breakdown: {},
      strengths: [],
      improvements: message ? [message] : ['Please review your submission and try again']
    };
  }
};


