// Sample data for Noah Healthcare Smart Fitness Watch simulation

export const companyInfo = {
  name: "Noah",
  fullName: "Noah Healthcare",
  description: "A mid-size healthcare products company, known for OTC medicines; now building a consumer Health & Fitness Smartwatch.",
  logo: "🏥" // Placeholder
};

export const personas = [
  {
    id: 1,
    name: "Young Fitness Enthusiast",
    ageRange: "25-35",
    occupation: "Software Engineer / Marketing Professional",
    goals: "Track daily steps, heart rate during workouts, sleep quality",
    painPoints: "Wants accurate fitness tracking, long battery life, comfortable for all-day wear",
    techComfort: "High - uses multiple apps daily",
    avatar: "🏃"
  },
  {
    id: 2,
    name: "Senior Wellness Monitor",
    ageRange: "55+",
    occupation: "Retired / Semi-retired professional",
    goals: "Monitor heart health, track medication reminders, emergency alerts",
    painPoints: "Needs large, readable display, simple interface, reliable health monitoring",
    techComfort: "Medium - comfortable with smartphones but prefers simplicity",
    avatar: "👴"
  }
];

export const competitors = [
  {
    name: "FitTrack Pro",
    features: ["Advanced heart rate monitoring", "7-day battery life", "Waterproof design"],
    price: "$120"
  },
  {
    name: "HealthSync Watch",
    features: ["FDA-approved health metrics", "Medical-grade sensors", "HIPAA-compliant data"],
    price: "$180"
  },
  {
    name: "ActiveLife Band",
    features: ["Budget-friendly", "Basic step counting", "Sleep tracking"],
    price: "$60"
  }
];

export const industryStats = {
  marketSize: "$45 billion",
  growthRate: "18% YoY",
  averagePrice: "$120",
  batteryExpectation: "5-7 days"
};

export const techStackOptions = {
  backend: ["Node.js", "Python (Django)", "Java (Spring)", "Go"],
  database: ["PostgreSQL", "MongoDB", "Redis", "InfluxDB"],
  mobile: ["React Native", "Flutter", "Native iOS/Android"],
  embedded: ["FreeRTOS", "Zephyr", "Custom RTOS"],
  cloud: ["AWS", "Google Cloud", "Azure", "Hybrid"],
  analytics: ["Mixpanel", "Amplitude", "Google Analytics", "Custom"]
};

export const roleOptions = [
  { id: "product-lead", name: "Product Lead", essential: true },
  { id: "backend-eng", name: "Backend Engineer", essential: true },
  { id: "embedded-eng", name: "Embedded/Firmware Engineer", essential: true },
  { id: "mobile-dev", name: "iOS/Android Developer", essential: true },
  { id: "ux-designer", name: "UX Designer", essential: true },
  { id: "qa", name: "QA Engineer", essential: false },
  { id: "data-eng", name: "Data Engineer", essential: false },
  { id: "compliance", name: "Regulatory/Compliance", essential: true },
  { id: "devops", name: "DevOps Engineer", essential: false },
  { id: "support", name: "Customer Support", essential: false }
];

export const ambassadorOptions = [
  {
    id: 1,
    type: "Fitness Influencer",
    name: "Alex Rivera",
    profile: "2M Instagram followers, fitness content creator, 28 years old",
    reach: "2M followers",
    cost: "$15,000",
    fit: "High - aligns with fitness enthusiast persona"
  },
  {
    id: 2,
    type: "Medical Professional",
    name: "Dr. Sarah Chen",
    profile: "Cardiologist, 150K LinkedIn followers, health education advocate",
    reach: "150K professional network",
    cost: "$8,000",
    fit: "High - builds trust with senior wellness segment"
  },
  {
    id: 3,
    type: "Lifestyle Celebrity",
    name: "Jordan Kim",
    profile: "Actor/TV personality, 5M followers, wellness lifestyle brand",
    reach: "5M followers",
    cost: "$50,000",
    fit: "Medium - broad reach but expensive"
  },
  {
    id: 4,
    type: "Fitness Celebrity",
    name: "Marcus Thompson",
    profile: "Former athlete, 1M YouTube subscribers, fitness coach",
    reach: "1M subscribers",
    cost: "$25,000",
    fit: "High - credible fitness authority"
  }
];

export const analyticsData = {
  dau: [
    { day: 1, users: 1200 },
    { day: 5, users: 1850 },
    { day: 10, users: 2100 },
    { day: 15, users: 1950 },
    { day: 20, users: 1800 },
    { day: 25, users: 1650 },
    { day: 30, users: 1500 }
  ],
  metrics: {
    onboardingCompletion: 70,
    setupDropoff: 30,
    crashRate: 0.5,
    avgSessionTime: 12, // minutes
    retention7Day: 30,
    retention30Day: 12
  },
  nps: {
    promoters: 4,
    passives: 60,
    detractors: 36
  },
  reviews: [
    {
      id: 1,
      rating: 2,
      text: "Battery dies in 2 days, not the 7 days promised. Very disappointed.",
      sentiment: "negative",
      issue: "battery"
    },
    {
      id: 2,
      rating: 2,
      text: "Step count is way off. Walked 5,000 steps but watch showed only 2,000. Accuracy is terrible.",
      sentiment: "negative",
      issue: "accuracy"
    },
    {
      id: 3,
      rating: 5,
      text: "Super comfortable to wear all day. Love the design and how lightweight it is!",
      sentiment: "positive",
      issue: "comfort"
    },
    {
      id: 4,
      rating: 5,
      text: "The app is really intuitive. Easy to set up and navigate. Great UX!",
      sentiment: "positive",
      issue: "app-ux"
    }
  ]
};

export const actionOptions = [
  { id: "battery-opt", label: "Battery optimization firmware update" },
  { id: "firmware-fix", label: "Firmware bug fix for step counting accuracy" },
  { id: "onboarding-simplify", label: "Onboarding flow simplification" },
  { id: "marketing-incentives", label: "Marketing incentives & referral program" },
  { id: "partner-discount", label: "Partner discount program" },
  { id: "support-responses", label: "Proactive customer support responses" }
];

export const taskWeights = {
  task1: 18,
  task2: 12,
  task3: 12,
  task4: 12,
  task5: 14,
  task6: 22,
  task7: 10
};

export const skillMapping = {
  task1: { "Product Sense": 0.4, "Data Insights": 0.3, "Communication": 0.3 },
  task2: { "Technical Feasibility": 0.5, "Teaming & Planning": 0.5 },
  task3: { "Teaming & Planning": 0.6, "Product Sense": 0.4 },
  task4: { "UX": 1.0 },
  task5: { "GTM & Marketing": 0.7, "Product Sense": 0.3 },
  task6: { "Data Insights": 0.5, "Communication": 0.5 },
  task7: { "Communication": 0.6, "Product Sense": 0.4 }
};


