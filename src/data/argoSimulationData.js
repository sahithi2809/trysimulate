// Company data for Argo Marketing Foundations simulation

export const argoCompanyInfo = {
  name: "Argo",
  fullName: "Argo Financial",
  description: "A modern fintech company building innovative savings and financial wellness tools for Gen Z and young professionals.",
  logo: "💰", // Financial/money emoji
  tagline: "Making saving simple, smart, and fun",
  industry: "Fintech",
  targetAudience: "Gen Z and young professionals (18-30)"
};

// Campaign data for Task 2 (Marketing Analyst)
export const campaignData = {
  traffic: "High",
  conversion: "Low",
  emailClickRate: "Medium",
  churn: "High"
};

// Customer quote for Task 3
export const customerQuote = {
  text: "I waste time entering receipts manually — if your app auto-categorized spending I'd use it daily.",
  source: "User Feedback Survey",
  date: "2024"
};

// SEO keywords for Task 4
export const seoKeywords = {
  correct: "opt1", // "budgeting apps for teens"
  options: [
    { id: "opt1", text: "budgeting apps for teens", isCorrect: true },
    { id: "opt2", text: "how to save money for college", isCorrect: false },
    { id: "opt3", text: "best budget spreadsheet 2025", isCorrect: false },
    { id: "opt4", text: "saving tips for students", isCorrect: false }
  ]
};

// Creative headlines for Task 1
export const creativeHeadlines = {
  correct: "opt4", // "Make saving fun — start today."
  options: [
    { id: "opt1", text: "Start saving now — tomorrow thanks you.", isCorrect: false },
    { id: "opt2", text: "Adulting? We've got tips. Save smarter.", isCorrect: false },
    { id: "opt3", text: "Be boring. Be safe. Save later.", isCorrect: false },
    { id: "opt4", text: "Make saving fun — start today.", isCorrect: true }
  ]
};

// Task weights for scoring
export const argoTaskWeights = {
  task1: 15,  // MCQ - Creative Strategist
  task2: 25,  // Short text - Marketing Analyst
  task3: 20,  // Short text - Customer Insight
  task4: 15,  // MCQ - SEO
  task5: 25   // Reflection
};

// Skill mapping for Argo
export const argoSkillMapping = {
  'Creative Writing': ['task1'],
  'Brand Tone': ['task1'],
  'Analytics': ['task2'],
  'Data Insight': ['task2'],
  'Customer Insight': ['task3'],
  'Product Recommendation': ['task3'],
  'SEO': ['task4'],
  'Keyword Selection': ['task4'],
  'Reflection': ['task5']
};


