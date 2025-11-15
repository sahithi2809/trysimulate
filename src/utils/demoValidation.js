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

