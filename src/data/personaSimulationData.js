/**
 * Persona Finding Simulation Data
 * "Finding the Ideal Persona for a Day-1 Product"
 */

export const personaCompanyInfo = {
  name: "GlowUp",
  fullName: "GlowUp Skincare",
  description: "A startup building innovative 2-in-1 skincare products for busy professionals.",
  logo: "✨",
  tagline: "Skincare made simple",
  industry: "Beauty & Skincare",
  targetAudience: "Busy professionals seeking time-saving solutions"
};

export const personaSimulationConfig = {
  totalBudget: 15000, // ₹15,000
  currency: "₹",
  horizon: "7 days",
  product: "2-in-1 Moisturizer + SPF 30",
  role: "Marketing Associate",
  pressure: "CEO wants initial persona signals for investor pitch"
};

// Loop 1 - Divergence
export const loop1Decisions = {
  context: "Day 1 at the startup. The CEO gives a vague brief. You have ₹15,000 for the entire mission. You need your first signal now.",
  options: [
    {
      id: "A",
      title: "Build a Quick Survey (₹2,000)",
      description: "Write 5-7 survey questions (1 on habits, 1 on fears, 1 on willingness to pay). Avoid leading questions.",
      cost: 2000,
      budgetRemaining: 13000
    },
    {
      id: "B",
      title: "Build an Interview Script & Conduct 5 Interviews (₹0)",
      description: "Write 6-8 probing questions with opening and closing script. Questions uncovering: routine, emotions, sunscreen behavior.",
      cost: 0,
      budgetRemaining: 15000
    },
    {
      id: "C",
      title: "Run Broad Meta Ad-Test (₹5,000)",
      description: "Choose 2 creatives (time-saving vs skincare protection). Write short primary text + CTA. Define which signals matter: CTR or CPC.",
      cost: 5000,
      budgetRemaining: 10000
    },
    {
      id: "D",
      title: "Conduct Competitor Review Mining (₹0)",
      description: "Review 4 competitors and produce: 5 pain points, 5 feature gaps, who complains and why.",
      cost: 0,
      budgetRemaining: 15000
    }
  ],
  feedback: {
    A: {
      title: "Survey Results",
      data: "62 responses. Only 14% mention 'time-saving'. 38% mention 'greasiness'. 24% mention 'white cast'. Respondents: 50% women 18-28, 30% men 25-35.",
      insight: "Helpful, but confusing. No clear persona emerges.",
      signals: ["50% women 18-28", "38% greasiness concern", "24% white cast concern"]
    },
    B: {
      title: "Interview Insights",
      data: "You spoke to 5 people. 2 say 'SPF is essential'. 3 say 'I forget to apply anything'. One says, 'I buy whatever is on discount.'",
      insight: "Deep but inconsistent data. You now know human motivations but no segmentation clarity.",
      signals: ["SPF importance varies", "Forgetfulness is common", "Price sensitivity exists"]
    },
    C: {
      title: "Ad-Test Results",
      data: "Creative A (time-saving): CTR 1.4%. Creative B (lightweight feel): CTR 2.1%. Traffic mostly women 18-24.",
      insight: "Behavior data, but may be creative bias. Strong early signal but incomplete.",
      signals: ["Lightweight benefit wins (2.1% CTR)", "Women 18-24 respond best"]
    },
    D: {
      title: "Competitor Review Analysis",
      data: "Common complaints: greasy feel, white cast, skin irritation. No clear persona. Lots of emotion in reviews.",
      insight: "Useful for pain points, not target group.",
      signals: ["Greasiness is top pain point", "White cast is concern", "Skin irritation mentioned"]
    }
  }
};

// Loop 2 - Convergence
export const loop2Decisions = {
  context: "You present your initial findings. Leadership reactions vary. You must choose the second signal.",
  options: [
    {
      id: "A",
      title: "Targeted Survey for Women 20-30 (₹2,000)",
      description: "Useful if Loop 1 was interviews or competitor analysis",
      cost: 2000,
      recommendedAfter: ["B", "D"]
    },
    {
      id: "B",
      title: "3-Creative Ad-Test (₹6,000)",
      description: "Useful if Loop 1 was survey or competitor analysis",
      cost: 6000,
      recommendedAfter: ["A", "D"]
    },
    {
      id: "C",
      title: "Landing Page Test (₹1,000)",
      description: "Useful if Loop 1 was interviews",
      cost: 1000,
      recommendedAfter: ["B"]
    },
    {
      id: "D",
      title: "Niche Interviews (Sensitive Skin) (₹0)",
      description: "Useful if Loop 1 was ad-test",
      cost: 0,
      recommendedAfter: ["C"]
    }
  ],
  feedback: {
    A: {
      title: "Targeted Survey Results",
      data: "65% say 'I already use sunscreen daily'. 35% say 'Too lazy in morning routine'.",
      insight: "Good signals, still not a full persona.",
      signals: ["65% already use sunscreen", "35% struggle with routine"]
    },
    B: {
      title: "3-Creative Ad-Test Results",
      data: "CTR results: Time-saving: 2.3%. Lightweight feel: 3.0%. Non-greasy: 2.5%.",
      insight: "Lightweight benefit wins. Women 22-28 strongest responders.",
      signals: ["Lightweight feel wins (3.0% CTR)", "Women 22-28 respond best"]
    },
    C: {
      title: "Landing Page Test Results",
      data: "78 visitors. 14 signups. 18% conversion.",
      insight: "Very strong early signal. Messaging seems to resonate.",
      signals: ["18% conversion rate", "Strong messaging resonance"]
    },
    D: {
      title: "Sensitive Skin Interviews",
      data: "3/5 say 2-in-1 irritates them.",
      insight: "Eliminates this as ideal persona.",
      signals: ["Sensitive skin segment not viable"]
    }
  }
};

// Loop 3 - Persona Decision
export const loop3Decisions = {
  context: "CEO sends you a Slack message: 'Investors meeting tomorrow. Give me ONE persona — don't say we need more data.'",
  options: [
    {
      id: "A",
      title: "Young Working Women (22-30)",
      description: "Evidence: strong ad-signals + survey",
      cost: 0,
      isBest: true
    },
    {
      id: "B",
      title: "College Women (18-22)",
      description: "Evidence: early ad-test traffic",
      cost: 0,
      isBest: false
    },
    {
      id: "C",
      title: "Parents / Homemakers (28-40)",
      description: "Evidence: interviews mention time pressure",
      cost: 0,
      isBest: false
    },
    {
      id: "D",
      title: "Sensitive Skin Users",
      description: "Evidence: PM suggestion, competitor reviews",
      cost: 0,
      isBest: false
    }
  ],
  feedback: {
    A: {
      title: "CEO Response",
      data: "CEO: 'Good. Put this in the deck.' Growth Lead: 'We can validate this easily.' Brand Lead: 'This aligns with market reality.'",
      insight: "Internal alignment created. You gain credibility.",
      outcome: "positive"
    },
    B: {
      title: "CEO Response",
      data: "CEO: 'Low purchasing power. Not viable.'",
      insight: "You get pushback + asked to revise.",
      outcome: "negative"
    },
    C: {
      title: "CEO Response",
      data: "Growth Lead: 'Zero evidence for this.'",
      insight: "Feels like guessing. Slight credibility drop.",
      outcome: "negative"
    },
    D: {
      title: "CEO Response",
      data: "PM happy. Everyone else: 'This is too niche.'",
      insight: "You're asked to create alternate slides.",
      outcome: "negative"
    }
  }
};

// Loop 4 - Final Validation
export const loop4Decisions = {
  context: "You have remaining budget. CEO says: 'Test the chosen persona quickly. One experiment. I want results tonight.'",
  options: [
    {
      id: "A",
      title: "Instagram Ad-Test (₹5,000)",
      description: "Behavioral signal.",
      cost: 5000
    },
    {
      id: "B",
      title: "Persona-Specific Survey (₹2,000)",
      description: "Self-reported signal.",
      cost: 2000
    },
    {
      id: "C",
      title: "Persona-targeted Landing Page (₹1,000)",
      description: "Conversion signal.",
      cost: 1000
    },
    {
      id: "D",
      title: "5 Quick Interviews (₹0)",
      description: "Qualitative signal.",
      cost: 0
    }
  ],
  feedback: {
    A: {
      title: "Ad-Test Results",
      data: "CTR 3.2%. CPC acceptable.",
      insight: "Strong validation.",
      outcome: "strong"
    },
    B: {
      title: "Survey Results",
      data: "72% say product is useful.",
      insight: "But self-reported, not behavior.",
      outcome: "moderate"
    },
    C: {
      title: "Landing Page Results",
      data: "21% conversion.",
      insight: "Strongest proof for early adopters.",
      outcome: "strong"
    },
    D: {
      title: "Interview Insights",
      data: "Strong qualitative signals on routine.",
      insight: "Good for messaging, not numbers.",
      outcome: "moderate"
    }
  }
};

// Endings
export const endings = {
  high: {
    title: "High Ending",
    ceoMessage: "Good work today. Your persona hypothesis is clear and your validation was strong. Investors liked the direction. Let's start building messaging experiments next week.",
    growthLeadMessage: "Nice job. You're learning fast. Keep this pace.",
    outcome: "You passed. You gain trust."
  },
  low: {
    title: "Low Ending",
    ceoMessage: "Thanks for your effort, but this was not strong enough. We needed clearer direction. Please tighten your approach next week.",
    growthLeadMessage: "We'll go over decision-making frameworks tomorrow.",
    outcome: "Not fired. Not humiliated. Just realistic startup disappointment."
  }
};

// Skill mapping
export const personaSkillMapping = {
  "Market Research": ["task1", "task2"],
  "Data Analysis": ["task1", "task2", "task4"],
  "Strategic Thinking": ["task2", "task3"],
  "Decision Making": ["task3"],
  "Validation": ["task4"]
};

// Task weights
export const personaTaskWeights = {
  task1: 20, // Loop 1
  task2: 25, // Loop 2
  task3: 30, // Loop 3 (most important - persona decision)
  task4: 25  // Loop 4
};

