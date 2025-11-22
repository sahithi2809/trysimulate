// Validation utilities for demo simulation - rule-based scoring

import { taskWeights, skillMapping } from '../data/demoSimulationData';

// Keyword lists for validation
const KEYWORDS = {
  task1: {
    targetMarket: ['persona', 'target', 'age', 'demographic', 'segment', 'user', 'customer'],
    userNeeds: ['need', 'requirement', 'want', 'desire', 'pain', 'problem', 'challenge'],
    competitive: ['competitor', 'competitive', 'differentiator', 'advantage', 'unique', 'vs', 'versus'],
    constraints: ['regulatory', 'hipaa', 'privacy', 'battery', 'price', 'cost', 'budget', 'constraint', 'limit', 'regulation']
  },
  task6: {
    battery: ['battery', 'power', 'charge', 'life', 'endurance'],
    accuracy: ['accuracy', 'accurate', 'step', 'count', 'sensor', 'measurement', 'precise'],
    onboarding: ['onboarding', 'setup', 'initial', 'first', 'tutorial', 'guide'],
    retention: ['retention', 'churn', 'drop', 'leave', 'abandon']
  }
};

// Convert 1-5 score to 0-100
const scaleTo100 = (score) => {
  return Math.round((score / 5) * 100);
};

// Check keyword presence in text
const checkKeywords = (text, keywordList) => {
  if (!text) return 0;
  const lowerText = text.toLowerCase();
  const found = keywordList.filter(keyword => 
    lowerText.includes(keyword.toLowerCase())
  ).length;
  return Math.min(found / keywordList.length, 1); // Normalize to 0-1
};

// Task 1 Validation
export const validateTask1 = (data) => {
  const { targetMarket, userNeeds, competitiveDiff, constraints } = data;
  const allText = `${targetMarket || ''} ${userNeeds || ''} ${competitiveDiff || ''} ${constraints || ''}`.toLowerCase();

  // Target Market & Persona (30%)
  const targetMarketScore = Math.min(
    checkKeywords(targetMarket, KEYWORDS.task1.targetMarket) * 5,
    5
  ) + (targetMarket && targetMarket.length > 50 ? 1 : 0);

  // User Needs Mapping (30%)
  const userNeedsScore = Math.min(
    checkKeywords(userNeeds, KEYWORDS.task1.userNeeds) * 5,
    5
  ) + (userNeeds && userNeeds.split(',').length >= 3 ? 1 : 0);

  // Competitive Differentiation (20%)
  const competitiveScore = Math.min(
    checkKeywords(competitiveDiff, KEYWORDS.task1.competitive) * 5,
    5
  ) + (competitiveDiff && competitiveDiff.length > 30 ? 0.5 : 0);

  // Feasibility/Constraints (20%)
  const constraintsScore = Math.min(
    checkKeywords(constraints || allText, KEYWORDS.task1.constraints) * 5,
    5
  );

  const scores = {
    targetMarket: Math.min(targetMarketScore, 5),
    userNeeds: Math.min(userNeedsScore, 5),
    competitive: Math.min(competitiveScore, 5),
    constraints: Math.min(constraintsScore, 5)
  };

  const weightedScore = (
    scores.targetMarket * 0.3 +
    scores.userNeeds * 0.3 +
    scores.competitive * 0.2 +
    scores.constraints * 0.2
  );

  return {
    score: scaleTo100(weightedScore),
    breakdown: scores,
    strengths: generateStrengths(scores, 'task1'),
    improvements: generateImprovements(scores, 'task1')
  };
};

// Task 2 Validation
export const validateTask2 = (data) => {
  const { selectedRoles, techStack } = data;
  let score = 0;
  const breakdown = {};

  // Role coverage (40%)
  const hasEmbedded = selectedRoles?.some(r => r.id === 'embedded-eng');
  const hasCompliance = selectedRoles?.some(r => r.id === 'compliance');
  const hasBackend = selectedRoles?.some(r => r.id === 'backend-eng');
  const hasMobile = selectedRoles?.some(r => r.id === 'mobile-dev');
  const hasUX = selectedRoles?.some(r => r.id === 'ux-designer');
  
  const roleScore = (
    (hasEmbedded ? 1 : 0) * 0.2 +
    (hasCompliance ? 1 : 0) * 0.2 +
    (hasBackend ? 1 : 0) * 0.15 +
    (hasMobile ? 1 : 0) * 0.15 +
    (hasUX ? 1 : 0) * 0.15 +
    (selectedRoles?.length >= 5 ? 0.15 : 0)
  ) * 5;
  breakdown.roleCoverage = roleScore;
  score += roleScore * 0.4;

  // Stack suitability (30%)
  const hasBackendStack = techStack?.backend && techStack.backend.length > 0;
  const hasDatabase = techStack?.database && techStack.database.length > 0;
  const hasCloud = techStack?.cloud && techStack.cloud.length > 0;
  const stackScore = (
    (hasBackendStack ? 1 : 0) * 0.33 +
    (hasDatabase ? 1 : 0) * 0.33 +
    (hasCloud ? 1 : 0) * 0.34
  ) * 5;
  breakdown.stackSuitability = stackScore;
  score += stackScore * 0.3;

  // Resources & timeline (20%)
  const hasTimeline = data.hiringTimeline && parseInt(data.hiringTimeline) > 0;
  const timelineScore = (hasTimeline ? 4 : 2) + (data.hiringTimeline && parseInt(data.hiringTimeline) >= 8 ? 1 : 0);
  breakdown.resourcesTimeline = timelineScore;
  score += timelineScore * 0.2;

  // Cost awareness (10%)
  const costScore = data.budget ? 4 : 2;
  breakdown.costAwareness = costScore;
  score += costScore * 0.1;

  return {
    score: Math.min(Math.round(score), 100),
    breakdown,
    warnings: [
      !hasEmbedded && 'Warning: Embedded Engineer is essential for IoT device development',
      !hasCompliance && 'Warning: Regulatory/Compliance role is critical for healthcare products'
    ].filter(Boolean),
    strengths: generateStrengths(breakdown, 'task2'),
    improvements: generateImprovements(breakdown, 'task2')
  };
};

// Task 3 Validation
export const validateTask3 = (data) => {
  const { phases } = data;
  let score = 0;
  const breakdown = {};

  // Phase completeness (35%)
  const hasDiscovery = phases?.some(p => p.name.toLowerCase().includes('discovery') || p.name.toLowerCase().includes('ideation'));
  const hasDevelopment = phases?.some(p => p.name.toLowerCase().includes('development') || p.name.toLowerCase().includes('build'));
  const hasTesting = phases?.some(p => p.name.toLowerCase().includes('test') || p.name.toLowerCase().includes('certification'));
  const hasDeployment = phases?.some(p => p.name.toLowerCase().includes('deploy') || p.name.toLowerCase().includes('launch'));
  
  const completenessScore = (
    (hasDiscovery ? 1 : 0) * 0.25 +
    (hasDevelopment ? 1 : 0) * 0.25 +
    (hasTesting ? 1 : 0) * 0.25 +
    (hasDeployment ? 1 : 0) * 0.25
  ) * 5;
  breakdown.completeness = completenessScore;
  score += completenessScore * 0.35;

  // Realistic durations (25%)
  const totalWeeks = phases?.reduce((sum, p) => sum + (parseInt(p.duration) || 0), 0) || 0;
  const durationScore = totalWeeks >= 12 && totalWeeks <= 52 ? 5 : 
                       totalWeeks >= 8 && totalWeeks < 12 ? 3 :
                       totalWeeks > 52 ? 2 : 1;
  breakdown.durations = durationScore;
  score += durationScore * 0.25;

  // Prioritization (25%)
  const hasMVP = phases?.some(p => p.name.toLowerCase().includes('mvp') || p.deliverables?.toLowerCase().includes('mvp'));
  const prioritizationScore = (hasMVP ? 3 : 1) + (phases?.length >= 4 ? 2 : 1);
  breakdown.prioritization = prioritizationScore;
  score += prioritizationScore * 0.25;

  // Risk identification (15%)
  const hasRisks = phases?.some(p => p.risks && p.risks.length > 0) || data.overallRisks;
  const riskScore = hasRisks ? 4 : 2;
  breakdown.riskIdentification = riskScore;
  score += riskScore * 0.15;

  return {
    score: Math.min(Math.round(score), 100),
    breakdown,
    warnings: [
      totalWeeks < 12 && 'Warning: Timeline seems too short for IoT + app development',
      !hasTesting && 'Warning: Testing/certification phase is critical for healthcare devices'
    ].filter(Boolean),
    strengths: generateStrengths(breakdown, 'task3'),
    improvements: generateImprovements(breakdown, 'task3')
  };
};

// Task 4 Validation
export const validateTask4 = (data) => {
  const { explanation } = data;
  let score = 0;
  const breakdown = {};

  // Clarity of user flow (30%)
  const flowScore = explanation && explanation.length > 50 ? 4 : 2;
  breakdown.userFlow = flowScore;
  score += flowScore * 0.3;

  // Glanceability & info prioritization (25%)
  const hasMetrics = explanation?.toLowerCase().includes('metric') || explanation?.toLowerCase().includes('data');
  const glanceabilityScore = (hasMetrics ? 2 : 1) + (explanation && explanation.length > 100 ? 2 : 1);
  breakdown.glanceability = glanceabilityScore;
  score += glanceabilityScore * 0.25;

  // Accessibility (15%)
  const hasAccessibility = explanation?.toLowerCase().includes('accessibility') || 
                          explanation?.toLowerCase().includes('font') ||
                          explanation?.toLowerCase().includes('contrast');
  const accessibilityScore = hasAccessibility ? 4 : 2;
  breakdown.accessibility = accessibilityScore;
  score += accessibilityScore * 0.15;

  // Rationale quality (30%)
  const hasRationale = explanation && explanation.length > 50;
  const rationaleScore = hasRationale ? 4 : 1;
  breakdown.rationale = rationaleScore;
  score += rationaleScore * 0.3;

  return {
    score: Math.min(Math.round(score), 100),
    breakdown,
    warnings: [
      !explanation && 'Warning: Explanation text is required for full credit'
    ].filter(Boolean),
    strengths: generateStrengths(breakdown, 'task4'),
    improvements: generateImprovements(breakdown, 'task4')
  };
};

// Task 5 Validation
export const validateTask5 = (data) => {
  const { positioning, pricing, channels, ambassador, ambassadorJustification } = data;
  let score = 0;
  const breakdown = {};

  // Positioning clarity (30%)
  const positioningScore = positioning && positioning.length > 20 ? 4 : 2;
  breakdown.positioning = positioningScore;
  score += positioningScore * 0.3;

  // Channel & KPI choice (30%)
  const hasChannels = channels && channels.length > 0;
  const hasKPIs = data.kpis && data.kpis.length > 0;
  const channelScore = (hasChannels ? 2 : 1) + (hasKPIs ? 2 : 1);
  breakdown.channelsKPIs = channelScore;
  score += channelScore * 0.3;

  // Ambassador fit (25%)
  const hasAmbassador = ambassador && ambassador.id;
  const hasJustification = ambassadorJustification && ambassadorJustification.length > 30;
  const ambassadorScore = (hasAmbassador ? 2 : 0) + (hasJustification ? 3 : 1);
  breakdown.ambassador = ambassadorScore;
  score += ambassadorScore * 0.25;

  // Pricing realism (15%)
  const pricingScore = pricing ? 4 : 2;
  breakdown.pricing = pricingScore;
  score += pricingScore * 0.15;

  return {
    score: Math.min(Math.round(score), 100),
    breakdown,
    strengths: generateStrengths(breakdown, 'task5'),
    improvements: generateImprovements(breakdown, 'task5')
  };
};

// Task 6 Validation
export const validateTask6 = (data) => {
  const { insights, prioritizedActions, customerReplies } = data;
  let score = 0;
  const breakdown = {};

  // Insight accuracy (40%)
  const insightText = insights?.toLowerCase() || '';
  const hasBattery = checkKeywords(insightText, KEYWORDS.task6.battery) > 0;
  const hasAccuracy = checkKeywords(insightText, KEYWORDS.task6.accuracy) > 0;
  const hasRetention = checkKeywords(insightText, KEYWORDS.task6.retention) > 0;
  const insightScore = (
    (hasBattery ? 1 : 0) * 0.4 +
    (hasAccuracy ? 1 : 0) * 0.4 +
    (hasRetention ? 0.2 : 0)
  ) * 5;
  breakdown.insights = insightScore;
  score += insightScore * 0.4;

  // Prioritization (30%)
  const hasActions = prioritizedActions && prioritizedActions.length >= 3;
  const hasBatteryAction = prioritizedActions?.some(a => 
    a.toLowerCase().includes('battery') || a.toLowerCase().includes('firmware')
  );
  const prioritizationScore = (hasActions ? 2 : 1) + (hasBatteryAction ? 3 : 1);
  breakdown.prioritization = prioritizationScore;
  score += prioritizationScore * 0.3;

  // Customer communication (30%)
  const hasReplies = customerReplies && customerReplies.length >= 2;
  const replyLengths = customerReplies?.map(r => r.length) || [];
  const avgLength = replyLengths.length > 0 ? replyLengths.reduce((a, b) => a + b, 0) / replyLengths.length : 0;
  const hasEmpathy = customerReplies?.some(r => 
    r.toLowerCase().includes('sorry') || 
    r.toLowerCase().includes('apologize') ||
    r.toLowerCase().includes('understand')
  );
  const communicationScore = (hasReplies ? 2 : 0) + (avgLength > 50 ? 2 : 1) + (hasEmpathy ? 1 : 0);
  breakdown.communication = communicationScore;
  score += communicationScore * 0.3;

  return {
    score: Math.min(Math.round(score), 100),
    breakdown,
    strengths: generateStrengths(breakdown, 'task6'),
    improvements: generateImprovements(breakdown, 'task6')
  };
};

// Task 7 Validation
export const validateTask7 = (data) => {
  const { pitch, consolidatedReport } = data;
  let score = 0;
  const breakdown = {};

  // Synthesis completeness (40%)
  const hasKPIs = consolidatedReport?.toLowerCase().includes('kpi') || 
                 consolidatedReport?.toLowerCase().includes('metric');
  const hasRoadmap = consolidatedReport?.toLowerCase().includes('roadmap') ||
                     consolidatedReport?.toLowerCase().includes('timeline');
  const hasBudget = consolidatedReport?.toLowerCase().includes('budget') ||
                   consolidatedReport?.toLowerCase().includes('cost');
  const synthesisScore = (
    (hasKPIs ? 1 : 0) * 0.33 +
    (hasRoadmap ? 1 : 0) * 0.33 +
    (hasBudget ? 1 : 0) * 0.34
  ) * 5;
  breakdown.synthesis = synthesisScore;
  score += synthesisScore * 0.4;

  // Convincing pitch (40%)
  const pitchLength = pitch?.length || 0;
  const hasAsk = pitch?.toLowerCase().includes('invest') || 
                pitch?.toLowerCase().includes('fund') ||
                pitch?.toLowerCase().includes('support');
  const pitchScore = (pitchLength > 100 ? 2 : 1) + (pitchLength > 200 ? 2 : 1) + (hasAsk ? 1 : 0);
  breakdown.pitch = pitchScore;
  score += pitchScore * 0.4;

  // Practical next steps (20%)
  const hasNextSteps = pitch?.toLowerCase().includes('next') ||
                      consolidatedReport?.toLowerCase().includes('next') ||
                      consolidatedReport?.toLowerCase().includes('action');
  const nextStepsScore = hasNextSteps ? 4 : 2;
  breakdown.nextSteps = nextStepsScore;
  score += nextStepsScore * 0.2;

  return {
    score: Math.min(Math.round(score), 100),
    breakdown,
    strengths: generateStrengths(breakdown, 'task7'),
    improvements: generateImprovements(breakdown, 'task7')
  };
};

// Generate strengths and improvements
const generateStrengths = (breakdown, taskId) => {
  const strengths = [];
  const avgScore = Object.values(breakdown).reduce((a, b) => a + b, 0) / Object.keys(breakdown).length;
  
  if (avgScore >= 4) {
    strengths.push('Strong overall performance across all criteria');
  }
  if (Object.values(breakdown).some(s => s >= 4.5)) {
    strengths.push('Excellent performance in key areas');
  }
  if (avgScore >= 3.5) {
    strengths.push('Good understanding of core concepts');
  }
  
  return strengths.length > 0 ? strengths : ['Completed the task'];
};

const generateImprovements = (breakdown, taskId) => {
  const improvements = [];
  const avgScore = Object.values(breakdown).reduce((a, b) => a + b, 0) / Object.keys(breakdown).length;
  
  if (avgScore < 3) {
    improvements.push('Consider providing more detailed responses');
  }
  if (Object.values(breakdown).some(s => s < 2)) {
    improvements.push('Some areas need more attention to detail');
  }
  if (avgScore < 4) {
    improvements.push('Review the example answers for guidance');
  }
  
  return improvements.length > 0 ? improvements : ['Continue practicing'];
};

// Calculate final score
export const calculateFinalScore = (taskScores) => {
  const weights = taskWeights;
  let totalScore = 0;
  let totalWeight = 0;

  Object.keys(weights).forEach(taskKey => {
    const taskNum = taskKey.replace('task', '');
    const score = taskScores[`task${taskNum}`]?.score || 0;
    const weight = weights[taskKey] / 100;
    totalScore += score * weight;
    totalWeight += weight;
  });

  return Math.round(totalScore / totalWeight);
};

// Persona Simulation Validations
export const validatePersonaTask1 = (data) => {
  // Loop 1 - Divergence: Any choice is valid, but track budget
  const { selectedOption, budgetRemaining } = data;
  let score = 60; // Base score for making a decision
  
  // Bonus for choosing free option (smart budget management)
  if (selectedOption === 'B' || selectedOption === 'D') {
    score += 10; // Free options
  }
  
  // Bonus for choosing ad-test (strong signal)
  if (selectedOption === 'C') {
    score += 15;
  }
  
  return {
    score: Math.min(score, 100),
    breakdown: {
      decision: score * 0.5,
      budgetManagement: score * 0.3,
      signalQuality: score * 0.2
    },
    strengths: ['Made a decision under pressure', 'Explored initial signals'],
    improvements: ['Consider budget implications for future loops']
  };
};

export const validatePersonaTask2 = (data) => {
  // Loop 2 - Convergence: Better choices based on Loop 1
  const { selectedOption } = data;
  let score = 65;
  
  // Better choices get higher scores
  if (selectedOption === 'B' || selectedOption === 'C') {
    score += 20; // Ad-test or landing page (strong signals)
  } else if (selectedOption === 'A') {
    score += 10; // Targeted survey (good)
  }
  
  return {
    score: Math.min(score, 100),
    breakdown: {
      strategicThinking: score * 0.4,
      dataAnalysis: score * 0.3,
      budgetManagement: score * 0.3
    },
    strengths: ['Chose a strategic follow-up method'],
    improvements: ['Consider which signals complement your first loop']
  };
};

export const validatePersonaTask3 = (data) => {
  // Loop 3 - Persona Decision: Option A (Young Working Women) is best
  const { selectedOption } = data;
  let score = 50;
  
  if (selectedOption === 'A') {
    score = 95; // Best choice
  } else if (selectedOption === 'B') {
    score = 60; // College women - low purchasing power
  } else if (selectedOption === 'C') {
    score = 55; // Parents - weak evidence
  } else if (selectedOption === 'D') {
    score = 50; // Sensitive skin - too niche
  }
  
  return {
    score: Math.min(score, 100),
    breakdown: {
      decisionQuality: score * 0.5,
      stakeholderAlignment: score * 0.3,
      evidenceBased: score * 0.2
    },
    strengths: selectedOption === 'A' 
      ? ['Excellent persona choice - aligns with market reality and evidence']
      : ['Made a decisive choice under pressure'],
    improvements: selectedOption === 'A'
      ? ['Continue validating this persona']
      : ['Consider evidence strength and market viability when choosing personas']
  };
};

export const validatePersonaTask4 = (data) => {
  // Loop 4 - Final Validation: Landing page (C) is strongest
  const { selectedOption, budgetRemaining } = data;
  let score = 70;
  
  if (selectedOption === 'C') {
    score = 95; // Landing page - strongest conversion signal
  } else if (selectedOption === 'A') {
    score = 85; // Ad-test - good behavioral signal
  } else if (selectedOption === 'B') {
    score = 75; // Survey - self-reported
  } else if (selectedOption === 'D') {
    score = 70; // Interviews - qualitative
  }
  
  // Bonus for budget management
  if (budgetRemaining >= 5000) {
    score += 5;
  }
  
  return {
    score: Math.min(score, 100),
    breakdown: {
      validationMethod: score * 0.4,
      budgetManagement: score * 0.3,
      signalStrength: score * 0.3
    },
    strengths: ['Completed validation experiment', 'Delivered results under pressure'],
    improvements: ['Consider conversion signals for strongest validation']
  };
};

// Calculate skill breakdown
export const calculateSkillBreakdown = (taskScores) => {
  const skills = {
    "Product Sense": 0,
    "Technical Feasibility": 0,
    "Teaming & Planning": 0,
    "UX": 0,
    "GTM & Marketing": 0,
    "Data Insights": 0,
    "Communication": 0
  };

  const skillCounts = { ...skills };

  Object.keys(skillMapping).forEach(taskKey => {
    const taskNum = taskKey.replace('task', '');
    const score = taskScores[`task${taskNum}`]?.score || 0;
    const mappings = skillMapping[taskKey];

    Object.keys(mappings).forEach(skill => {
      const weight = mappings[skill];
      skills[skill] += score * weight;
      skillCounts[skill] += weight;
    });
  });

  // Normalize
  Object.keys(skills).forEach(skill => {
    if (skillCounts[skill] > 0) {
      skills[skill] = Math.round(skills[skill] / skillCounts[skill]);
    }
  });

  return skills;
};

// ============================================================================
// ARGO MARKETING FOUNDATIONS VALIDATION FUNCTIONS
// ============================================================================

// Task 1: MCQ - Creative Strategist
export const validateArgoTask1 = (data) => {
  const { selectedOption } = data;
  const correctAnswer = 'opt4'; // "Make saving fun — start today."
  
  const isCorrect = selectedOption === correctAnswer;
  const score = isCorrect ? 100 : 0;
  
  return {
    score,
    breakdown: {
      selection: score
    },
    strengths: isCorrect ? [
      'Correctly identified the headline that matches the brand tone (friendly, modern, reassuring)',
      'Recognized the importance of making saving fun and approachable for Gen Z'
    ] : [],
    improvements: isCorrect ? [] : [
      'Consider the target audience (Gen Z) and brand tone (friendly, modern, reassuring)',
      'The correct answer emphasizes making saving "fun" which aligns with Gen Z values',
      'Review the brief: goal is to build trust + get signups with a friendly, modern tone'
    ],
    feedback: isCorrect 
      ? 'Excellent choice! This headline captures the friendly, modern tone while making saving approachable for Gen Z.'
      : 'Not quite. Consider which headline best matches a friendly, modern, reassuring tone for Gen Z.'
  };
};

// Task 2: Short Text - Marketing Analyst
export const validateArgoTask2 = (data) => {
  const { response } = data;
  if (!response) {
    return {
      score: 0,
      breakdown: {},
      strengths: [],
      improvements: ['Please provide an answer'],
      feedback: 'No response provided'
    };
  }

  const lowerResponse = response.toLowerCase();
  let score = 0;
  const breakdown = {};

  // Check for conversion/low conversion mention (+30%)
  if (lowerResponse.includes('conversion') || lowerResponse.includes('low conversion')) {
    score += 30;
    breakdown.conversion = 30;
  }

  // Check for churn/high churn mention (+20%)
  if (lowerResponse.includes('churn') || lowerResponse.includes('high churn')) {
    score += 20;
    breakdown.churn = 20;
  }

  // Check for email/click rate mention (+10%)
  if (lowerResponse.includes('email') || lowerResponse.includes('click rate')) {
    score += 10;
    breakdown.email = 10;
  }

  // Check length (min 12 words for +10%)
  const wordCount = response.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount >= 12) {
    score += 10;
    breakdown.length = 10;
  }

  // Additional keywords (+5% each, max +30%)
  const additionalKeywords = ['optimize', 'checkout', 'cart', 'mobile', 'drop', 'funnel'];
  let additionalScore = 0;
  additionalKeywords.forEach(keyword => {
    if (lowerResponse.includes(keyword)) {
      additionalScore += 5;
    }
  });
  additionalScore = Math.min(additionalScore, 30);
  score += additionalScore;
  if (additionalScore > 0) {
    breakdown.keywords = additionalScore;
  }

  // Cap at 100%
  score = Math.min(score, 100);

  const strengths = [];
  const improvements = [];

  if (score >= 70) {
    strengths.push('Identified key conversion and churn issues');
    strengths.push('Demonstrated understanding of campaign metrics');
  } else if (score >= 40) {
    strengths.push('Recognized some important metrics');
    improvements.push('Consider investigating conversion rates and churn more deeply');
  } else {
    improvements.push('Focus on the most critical problem: low conversion and high churn');
    improvements.push('Consider how email click rates and traffic relate to conversion');
  }

  if (!lowerResponse.includes('conversion') && !lowerResponse.includes('churn')) {
    improvements.push('The most critical issues are low conversion and high churn - these should be prioritized');
  }

  return {
    score,
    breakdown,
    strengths,
    improvements,
    feedback: score >= 70 
      ? 'Great analysis! You identified the key problems: conversion and churn.'
      : 'Good start. Consider focusing on conversion rates and churn as the primary concerns.'
  };
};

// Task 3: Short Text - Customer Insight
export const validateArgoTask3 = (data) => {
  const { response } = data;
  if (!response) {
    return {
      score: 0,
      breakdown: {},
      strengths: [],
      improvements: ['Please provide an answer'],
      feedback: 'No response provided'
    };
  }

  const lowerResponse = response.toLowerCase();
  let score = 0;
  const breakdown = {};

  // Check for automation/auto-categorize mention (+30%)
  if (lowerResponse.includes('auto-categorize') || lowerResponse.includes('automation') || 
      lowerResponse.includes('automatic') || lowerResponse.includes('auto categorize')) {
    score += 30;
    breakdown.automation = 30;
  }

  // Check for time saving mention (+20%)
  if (lowerResponse.includes('time') && (lowerResponse.includes('save') || lowerResponse.includes('waste') || 
      lowerResponse.includes('saving') || lowerResponse.includes('efficient'))) {
    score += 20;
    breakdown.timeSaving = 20;
  }

  // Check for daily/consistent use mention (+10%)
  if (lowerResponse.includes('daily') || lowerResponse.includes('consistent') || 
      lowerResponse.includes('regular') || lowerResponse.includes('every day')) {
    score += 10;
    breakdown.dailyUse = 10;
  }

  // Check for effort/ease mention (+10%)
  if (lowerResponse.includes('effort') || lowerResponse.includes('easy') || 
      lowerResponse.includes('simple') || lowerResponse.includes('convenient')) {
    score += 10;
    breakdown.effort = 10;
  }

  // Check for receipt/manual mention (+10%)
  if (lowerResponse.includes('receipt') || lowerResponse.includes('manual')) {
    score += 10;
    breakdown.receipt = 10;
  }

  // Base score for any response (+20%)
  score += 20;
  breakdown.base = 20;

  // Cap at 100%
  score = Math.min(score, 100);

  const strengths = [];
  const improvements = [];

  if (score >= 70) {
    strengths.push('Correctly identified automation as the key value');
    strengths.push('Understood the time-saving benefit');
  } else if (score >= 40) {
    strengths.push('Recognized some customer needs');
    improvements.push('Focus on what the customer explicitly mentioned: auto-categorization');
  } else {
    improvements.push('The customer values automation - specifically auto-categorizing receipts');
    improvements.push('Consider the pain point: manual entry is time-consuming');
  }

  return {
    score,
    breakdown,
    strengths,
    improvements,
    feedback: score >= 70
      ? 'Excellent insight! You identified that the customer values automation and time-saving.'
      : 'Good attempt. The customer specifically mentioned auto-categorization as the key value.'
  };
};

// Task 4: MCQ - SEO
export const validateArgoTask4 = (data) => {
  const { selectedOption } = data;
  const correctAnswer = 'opt1'; // "budgeting apps for teens"
  
  const isCorrect = selectedOption === correctAnswer;
  const score = isCorrect ? 100 : 0;
  
  return {
    score,
    breakdown: {
      selection: score
    },
    strengths: isCorrect ? [
      'Correctly identified the best keyword for the target audience (parents teaching teens)',
      'Recognized that "budgeting apps for teens" directly matches the search intent'
    ] : [],
    improvements: isCorrect ? [] : [
      'Consider the target audience: parents who want to teach teens money skills',
      'The keyword should directly match what parents would search for',
      '"budgeting apps for teens" is the most specific and relevant keyword for this goal'
    ],
    feedback: isCorrect
      ? 'Perfect! This keyword directly targets parents searching for budgeting tools for their teens.'
      : 'Not quite. Think about what parents would search for when looking to teach teens about money.'
  };
};

// Task 5: Reflection
export const validateArgoTask5 = (data) => {
  const { response } = data;
  if (!response) {
    return {
      score: 0,
      breakdown: {},
      strengths: [],
      improvements: ['Please provide a reflection'],
      feedback: 'No response provided'
    };
  }

  const lowerResponse = response.toLowerCase();
  let score = 0;
  const breakdown = {};

  // Check length (min 30 words for +30%)
  const wordCount = response.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount >= 30) {
    score += 30;
    breakdown.length = 30;
  } else if (wordCount >= 20) {
    score += 20;
    breakdown.length = 20;
  } else {
    score += 10;
    breakdown.length = 10;
  }

  // Check for role name mention (+30%)
  const roleNames = ['creative', 'analyst', 'marketer', 'customer', 'seo', 'strategist', 'coordinator', 'insights'];
  const hasRoleName = roleNames.some(role => lowerResponse.includes(role));
  if (hasRoleName) {
    score += 30;
    breakdown.roleMention = 30;
  }

  // Check for clear reason (because, I liked, enjoy, strength) (+20%)
  const reasonKeywords = ['because', 'i liked', 'i enjoy', 'strength', 'reason', 'why', 'appeal'];
  const hasReason = reasonKeywords.some(keyword => lowerResponse.includes(keyword));
  if (hasReason) {
    score += 20;
    breakdown.reason = 20;
  }

  // Check for application mention (+10%)
  const applicationKeywords = ['apply', 'use', 'practice', 'implement', 'work', 'career'];
  const hasApplication = applicationKeywords.some(keyword => lowerResponse.includes(keyword));
  if (hasApplication) {
    score += 10;
    breakdown.application = 10;
  }

  // Cap at 100%
  score = Math.min(score, 100);

  const strengths = [];
  const improvements = [];

  if (score >= 70) {
    strengths.push('Well-structured reflection with clear reasoning');
    strengths.push('Demonstrated understanding of different marketing roles');
  } else if (score >= 40) {
    strengths.push('Good reflection');
    improvements.push('Consider mentioning which specific role you liked and why');
    improvements.push('Add more detail about how you might apply these skills');
  } else {
    improvements.push('Expand your reflection to 3-4 sentences (30+ words)');
    improvements.push('Mention which marketing role you found most interesting');
    improvements.push('Explain why you liked that role and how you might apply the skills');
  }

  return {
    score,
    breakdown,
    strengths,
    improvements,
    feedback: score >= 70
      ? 'Excellent reflection! You clearly articulated your preferences and reasoning.'
      : 'Good start. Consider expanding your reflection with more specific details about which role you liked and why.'
  };
};

