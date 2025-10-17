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
        email: {
          from: 'Rahul — Head of Ops, AcmeStartup',
          subject: 'Re: Demo Follow-up',
          body: 'Thanks for the demo — product looks useful. However, your quoted annual price is above our budget. Can you do a 30% discount for our startup? If not, we may need to consider other options.',
        },
        rubric: {
          empathy: 25,
          value: 30,
          alternatives: 30,
          closing: 15,
        },
      },
    },
    {
      id: 'default-prioritization-1',
      title: 'Task Prioritization — A Busy PM\'s Day',
      type: 'prioritization',
      category: 'Product Management',
      description: 'Reorder 10 tasks by priority under time pressure.',
      difficulty: 'Intermediate',
      duration: '12 min',
      created: '2025-01-13',
      isDefault: true,
      scenario: {
        role: 'Product Manager',
        context: 'You have 10 tasks competing for attention. Prioritize them correctly.',
        tasks: [
          { id: 1, title: 'Reply to CEO email about release go/no-go', est_time: 10, ideal_rank: 1, note: 'High business impact; time-sensitive (CEO asked for update)' },
          { id: 2, title: 'Review high-severity customer bug & assign triage', est_time: 20, ideal_rank: 2, note: 'Customer-visible; may require hotfix' },
          { id: 3, title: 'Attend company Town Hall (mandatory)', est_time: 60, ideal_rank: 3, note: 'Fixed time — must attend' },
          { id: 4, title: 'Schedule requirements-gathering call for PI planning', est_time: 10, ideal_rank: 4, note: 'Enables PI planning; schedule soon' },
          { id: 5, title: 'Approve marketing campaign copy launching tomorrow', est_time: 15, ideal_rank: 5, note: 'Deadline-bound; blocks publish' },
          { id: 6, title: 'Update roadmap slide and share with stakeholders', est_time: 30, ideal_rank: 6, note: 'Important for alignment' },
          { id: 7, title: 'One-on-one with direct report (scheduled)', est_time: 30, ideal_rank: 7, note: 'People management; scheduled' },
          { id: 8, title: 'Respond to vendor on contract renewal/pricing', est_time: 20, ideal_rank: 8, note: 'Renewal in 7 days; can delegate if needed' },
          { id: 9, title: 'Review analytics dashboard for KPI anomalies', est_time: 25, ideal_rank: 9, note: 'Monitor for anomalies; lower unless issue found' },
          { id: 10, title: 'Prepare optional cross-vertical demo (can skip)', est_time: 45, ideal_rank: 10, note: 'Optional; postpone if busy' },
        ],
      },
    },
    {
      id: 'default-team-conflict-1',
      title: 'Team Conflict — Engineering vs Design Disagreement',
      type: 'team-conflict',
      category: 'Leadership',
      description: 'Resolve a heated Slack discussion between team members.',
      difficulty: 'Advanced',
      duration: '20 min',
      created: '2025-01-12',
      isDefault: true,
      scenario: {
        role: 'Project Manager / Team Lead',
        context: 'Two team members are in conflict over a design decision in the team Slack channel.',
        messages: [
          { id: 1, user: 'Sarah (Designer)', avatar: 'S', text: 'We need to stick with the original design. We user-tested it for 2 weeks.', time: '10:23 AM' },
          { id: 2, user: 'Dev (Engineer)', avatar: 'D', text: 'The original design will take 3 extra weeks to build. We don\'t have that time.', time: '10:25 AM' },
          { id: 3, user: 'Sarah (Designer)', avatar: 'S', text: 'So we\'re just ignoring user research now? This is exactly what happened last quarter.', time: '10:27 AM' },
          { id: 4, user: 'Dev (Engineer)', avatar: 'D', text: 'I\'m not ignoring research. I\'m being realistic about our sprint capacity.', time: '10:28 AM' },
        ],
      },
    },
  ];
};

// Get custom simulations created by user
export const getCustomSimulations = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_SIMULATIONS);
  return stored ? JSON.parse(stored) : [];
};

// Save a custom simulation
export const saveCustomSimulation = (simulation) => {
  const custom = getCustomSimulations();
  const newSim = {
    ...simulation,
    id: `custom-${Date.now()}`,
    created: new Date().toISOString().split('T')[0],
    isDefault: false,
  };
  custom.push(newSim);
  localStorage.setItem(STORAGE_KEYS.CUSTOM_SIMULATIONS, JSON.stringify(custom));
  return newSim;
};

// Get simulation by ID
export const getSimulationById = (id) => {
  const all = getAllSimulations();
  return all.find((sim) => sim.id === id);
};

// Save user progress for a simulation
export const saveProgress = (simulationId, score, feedback) => {
  const progress = getUserProgress();
  progress[simulationId] = {
    score,
    feedback,
    completedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
};

// Get user progress
export const getUserProgress = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
  return stored ? JSON.parse(stored) : {};
};

// Delete custom simulation
export const deleteCustomSimulation = (id) => {
  const custom = getCustomSimulations();
  const filtered = custom.filter((sim) => sim.id !== id);
  localStorage.setItem(STORAGE_KEYS.CUSTOM_SIMULATIONS, JSON.stringify(filtered));
};

