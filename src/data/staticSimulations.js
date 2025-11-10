import pmPrioritizationHtml from '../simulations/pm_prioritization_simulation.html?raw'
import salesNegotiationHtml from '../simulations/sales_negotiation1.html?raw'
import commentSimulationHtml from '../simulations/comment_simulation3.html?raw'

export const staticSimulations = [
  {
    id: 'static_pm_prioritization',
    slug: 'pm-prioritization',
    title: 'PM Prioritization Simulation',
    description:
      "Drag-and-drop a product manager's hectic day into the right order while balancing urgent customer issues, leadership updates, and scheduled commitments.",
    category: 'Product Management',
    difficulty: 'Intermediate',
    duration: '15-20 min',
    learningObjectives: [
      'Practice prioritising competing product tasks based on impact and urgency',
      'Balance stakeholder expectations with mandatory deadlines',
      'Recognise when to defer or delegate lower value work',
    ],
    learning_objectives: [
      'Practice prioritising competing product tasks based on impact and urgency',
      'Balance stakeholder expectations with mandatory deadlines',
      'Recognise when to defer or delegate lower value work',
    ],
    skillsTested: ['Prioritisation', 'Decision Making', 'Stakeholder Management'],
    skills_tested: ['Prioritisation', 'Decision Making', 'Stakeholder Management'],
    htmlContent: pmPrioritizationHtml,
    isStatic: true,
    tags: ['prioritisation', 'product management', 'daily planning'],
    icon: '📋',
    isDefault: true,
  },
  {
    id: 'static_sales_negotiation_pushback',
    slug: 'sales-negotiation-pushback',
    title: 'Sales Negotiation: Price Pushback',
    description:
      'Respond to a SaaS buyer who is requesting a steep discount, protect your pricing, and keep the deal moving toward close.',
    category: 'Sales',
    difficulty: 'Intermediate',
    duration: '10-15 min',
    learningObjectives: [
      'Demonstrate empathetic tone while addressing pricing objections',
      'Reinforce product value with relevant outcomes and proof points',
      'Offer creative, conditional alternatives instead of blanket discounts',
      'Drive to a clear next step that maintains deal momentum',
    ],
    learning_objectives: [
      'Demonstrate empathetic tone while addressing pricing objections',
      'Reinforce product value with relevant outcomes and proof points',
      'Offer creative, conditional alternatives instead of blanket discounts',
      'Drive to a clear next step that maintains deal momentum',
    ],
    skillsTested: ['Negotiation', 'Value Selling', 'Closing Skills'],
    skills_tested: ['Negotiation', 'Value Selling', 'Closing Skills'],
    htmlContent: salesNegotiationHtml,
    isStatic: true,
    tags: ['negotiation', 'value based selling', 'discount handling'],
    icon: '💼',
    isDefault: true,
  },
  {
    id: 'static_customer_comment_responses',
    slug: 'customer-comment-responses',
    title: 'Customer Comment Response Simulation',
    description:
      'Reply to a trio of frustrated customers and craft clear, empathetic responses that acknowledge issues and provide next steps.',
    category: 'Customer Support',
    difficulty: 'Beginner',
    duration: '10 min',
    learningObjectives: [
      'Respond to customer complaints with empathy and ownership',
      'Provide concise resolutions and next steps for different scenarios',
      'Maintain a consistent, brand-aligned tone across multiple replies',
    ],
    learning_objectives: [
      'Respond to customer complaints with empathy and ownership',
      'Provide concise resolutions and next steps for different scenarios',
      'Maintain a consistent, brand-aligned tone across multiple replies',
    ],
    skillsTested: ['Customer Communication', 'Empathy', 'Issue Resolution'],
    skills_tested: ['Customer Communication', 'Empathy', 'Issue Resolution'],
    htmlContent: commentSimulationHtml,
    isStatic: true,
    tags: ['customer experience', 'support', 'communication'],
    icon: '💬',
    isDefault: true,
  },
]


