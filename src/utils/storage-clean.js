// LocalStorage utility functions for TrySimulate

const STORAGE_KEYS = {
  SIMULATIONS: 'trysimulate_simulations',
  USER_PROGRESS: 'trysimulate_progress',
  CUSTOM_SIMULATIONS: 'trysimulate_custom',
};

// Get all simulations (default + custom)
export const getAllSimulations = () => {
  const custom = getCustomSimulations();
  return [...getDefaultSimulations(), ...custom];
};

// Get default simulations
export const getDefaultSimulations = () => {
  return [
    {
      id: 'default-customer-comments-1',
      title: 'Customer Feedback Dashboard — Food Delivery App',
      type: 'customer-comments',
      category: 'Product Management',
      description: 'Handle customer complaints with empathy and provide solutions.',
      difficulty: 'Beginner',
      duration: '10 min',
      created: '2025-01-15',
      isDefault: true,
      scenario: {
        role: 'Product/Marketing Manager',
        context: 'You manage a food delivery app. Three customer comments need professional replies.',
        comments: [
          { id: 1, user: 'Rina', text: 'My order arrived cold. Really disappointed.' },
          { id: 2, user: 'Amit', text: 'Promo code DIDN\'T apply. I lost money.' },
          { id: 3, user: 'Sonal', text: 'The app crashed when I tried to pay.' },
        ],
      },
    },
    {
      id: 'default-sales-negotiation-1',
      title: 'SaaS Pricing Negotiation — Startup Discount Request',
      type: 'sales-negotiation',
      category: 'Sales',
      description: 'Navigate a 30% discount request while protecting value.',
      difficulty: 'Intermediate',
      duration: '15 min',
      created: '2025-01-14',
      isDefault: true,
      scenario: {
        role: 'Sales Executive',
        context: 'You pitched a collaboration SaaS to an early-stage startup. After the demo, the buyer requests a 30% discount.',
        situation: 'The startup loves the product but claims budget constraints. They want 30% off the annual plan.',
        objectives: ['Close the deal', 'Protect pricing integrity', 'Build long-term relationship'],
        constraints: ['Company policy limits discounts to 15%', 'Competitor offers 20% off', 'Startup has 50 employees'],
      },
    },
    {
      id: 'default-prioritization-1',
      title: 'Product Roadmap Prioritization — E-commerce Platform',
      type: 'prioritization',
      category: 'Product Management',
      description: 'Prioritize features for an e-commerce platform with limited resources.',
      difficulty: 'Intermediate',
      duration: '20 min',
      created: '2025-01-13',
      isDefault: true,
      scenario: {
        role: 'Product Manager',
        context: 'You manage an e-commerce platform. Your team can only build 3 features this quarter.',
        features: [
          { id: 1, name: 'Advanced Search Filters', impact: 'High', effort: 'Medium', users: 12000 },
          { id: 2, name: 'Mobile App Push Notifications', impact: 'High', effort: 'Low', users: 15000 },
          { id: 3, name: 'AI Product Recommendations', impact: 'Very High', effort: 'High', users: 8000 },
          { id: 4, name: 'Social Media Integration', impact: 'Medium', effort: 'Low', users: 5000 },
          { id: 5, name: 'Advanced Analytics Dashboard', impact: 'Medium', effort: 'High', users: 2000 },
          { id: 6, name: 'One-Click Checkout', impact: 'Very High', effort: 'Medium', users: 18000 },
        ],
      },
    },
    {
      id: 'default-team-conflict-1',
      title: 'Team Conflict Resolution — Design vs Engineering',
      type: 'team-conflict',
      category: 'Leadership',
      description: 'Resolve a conflict between design and engineering teams over project scope.',
      difficulty: 'Advanced',
      duration: '25 min',
      created: '2025-01-12',
      isDefault: true,
      scenario: {
        role: 'Engineering Manager',
        context: 'Your design and engineering teams are in conflict over a new feature implementation.',
        situation: 'Design wants a complex, beautiful interface. Engineering says it will take too long to build.',
        participants: [
          { id: 1, user: 'Sarah (Designer)', avatar: 'S', text: 'This design will increase user engagement by 40%. We need to build it exactly as specified.', time: '10:20 AM' },
          { id: 2, user: 'Dev (Engineer)', avatar: 'D', text: 'The original design will take 3 extra weeks to build. We don\'t have that time.', time: '10:25 AM' },
          { id: 3, user: 'Sarah (Designer)', avatar: 'S', text: 'So we\'re just ignoring user research now? This is exactly what happened last quarter.', time: '10:27 AM' },
          { id: 4, user: 'Dev (Engineer)', avatar: 'D', text: 'I\'m not ignoring research. I\'m being realistic about our sprint capacity.', time: '10:28 AM' },
        ],
      },
    },
    {
      id: 'default-amason-sales-1',
      title: 'The First 90 Days at Amason — Sales Manager Simulation',
      type: 'amason-sales',
      category: 'Sales',
      description: 'Play as Riya Mehta, a new Sales Manager at Amason. Build your sales pipeline by selecting and prioritizing leads.',
      difficulty: 'Intermediate',
      duration: '15 min',
      created: '2025-01-20',
      isDefault: true,
      isHTMLSimulation: true,
      htmlContent: '', // Will be loaded from file
    },
  ];
};

// Get custom simulations created by user
export const getCustomSimulations = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_SIMULATIONS);
  return stored ? JSON.parse(stored) : [];
};

// Save custom simulation
export const saveCustomSimulation = (simulation) => {
  const custom = getCustomSimulations();
  const newSimulation = {
    ...simulation,
    id: `custom-${Date.now()}`,
    created: new Date().toISOString().split('T')[0],
    isDefault: false,
  };
  custom.push(newSimulation);
  localStorage.setItem(STORAGE_KEYS.CUSTOM_SIMULATIONS, JSON.stringify(custom));
  return newSimulation;
};

// Get simulation by ID
export const getSimulationById = (id) => {
  const allSimulations = getAllSimulations();
  return allSimulations.find(sim => sim.id === id);
};

// Save user progress
export const saveProgress = (simulationId, progress) => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
  const allProgress = stored ? JSON.parse(stored) : {};
  allProgress[simulationId] = {
    ...progress,
    lastUpdated: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(allProgress));
};

// Get user progress
export const getProgress = (simulationId) => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
  const allProgress = stored ? JSON.parse(stored) : {};
  return allProgress[simulationId] || null;
};

// Clear all data (for testing)
export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.SIMULATIONS);
  localStorage.removeItem(STORAGE_KEYS.USER_PROGRESS);
  localStorage.removeItem(STORAGE_KEYS.CUSTOM_SIMULATIONS);
};


