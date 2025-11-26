export const CURRENT_USER = {
  id: 'u_me',
  name: 'Alex (You)',
  avatar: 'https://ui-avatars.com/api/?name=Alex+PM&background=0D8ABC&color=fff',
  role: 'Product Manager',
  status: 'online',
};

export const INITIAL_USERS = [
  CURRENT_USER,
  {
    id: 'u_eng_lead',
    name: 'Dave Chen',
    avatar: 'https://picsum.photos/id/1012/200/200',
    role: 'Engineering Lead',
    status: 'online',
    bio: 'Experienced, slightly cynical backend engineer. Cares about scalability, hates technical debt and last minute changes. Protective of his team\'s time.',
  },
  {
    id: 'u_designer',
    name: 'Sarah Miller',
    avatar: 'https://picsum.photos/id/1027/200/200',
    role: 'Product Designer',
    status: 'busy',
    bio: 'Detail-oriented creative. Loves whitespace, hates when engineers un-align pixels. Often asks for "more time to explore" and pushes for perfect UX over speed.',
  },
  {
    id: 'u_vp',
    name: 'Karen Volt',
    avatar: 'https://picsum.photos/id/1011/200/200',
    role: 'VP of Product',
    status: 'online',
    bio: 'High energy, metrics-focused. Constantly asking "when is this shipping?" and "what is the impact on retention?". hates excuses.',
  },
  {
    id: 'u_sales',
    name: 'Jim Halpert',
    avatar: 'https://picsum.photos/id/1005/200/200',
    role: 'Sales Lead',
    status: 'offline',
    bio: 'Friendly but demanding. Always promising features to customers that do not exist yet. Thinks engineering can "just squeeze it in".',
  },
  {
    id: 'u_junior',
    name: 'Ryan Temp',
    avatar: 'https://picsum.photos/id/1006/200/200',
    role: 'Junior Dev',
    status: 'online',
    bio: 'Eager to please, asks a lot of questions, breaks production occasionally. Scared of Dave.',
  }
];

export const INITIAL_CHANNELS = [
  {
    id: 'c_general',
    name: 'general',
    type: 'public',
    memberIds: ['u_me', 'u_eng_lead', 'u_designer', 'u_vp', 'u_sales', 'u_junior'],
    purpose: 'Company-wide announcements and fun stuff',
  },
  {
    id: 'c_eng',
    name: 'engineering',
    type: 'public',
    memberIds: ['u_me', 'u_eng_lead', 'u_junior'],
    purpose: 'Code, deploys, and rubber ducks',
  },
  {
    id: 'c_design',
    name: 'design-system',
    type: 'public',
    memberIds: ['u_me', 'u_designer', 'u_junior'],
    purpose: 'Figma links and critiques',
  },
  {
    id: 'c_project_nexus',
    name: 'proj-nexus',
    type: 'private',
    memberIds: ['u_me', 'u_eng_lead', 'u_designer', 'u_vp'],
    purpose: 'War room for the Nexus launch (Q3)',
  },
  // Direct Messages
  { id: 'dm_dave', name: 'Dave Chen', type: 'dm', memberIds: ['u_me', 'u_eng_lead'] },
  { id: 'dm_sarah', name: 'Sarah Miller', type: 'dm', memberIds: ['u_me', 'u_designer'] },
  { id: 'dm_karen', name: 'Karen Volt', type: 'dm', memberIds: ['u_me', 'u_vp'] },
  { id: 'dm_jim', name: 'Jim Halpert', type: 'dm', memberIds: ['u_me', 'u_sales'] },
];

export const INITIAL_MESSAGES = {
  'c_general': [
    { id: 'm1', senderId: 'u_vp', text: 'Great job on the town hall everyone! Lets keep up the momentum.', timestamp: Date.now() - 10000000, channelId: 'c_general' },
  ],
  'c_eng': [
    { id: 'm2', senderId: 'u_eng_lead', text: 'Who broke the build on staging?', timestamp: Date.now() - 3600000, channelId: 'c_eng' },
    { id: 'm3', senderId: 'u_junior', text: 'I think that might have been me... fixing it now.', timestamp: Date.now() - 3500000, channelId: 'c_eng' },
  ],
  'c_project_nexus': [
    { id: 'm4', senderId: 'u_me', text: 'Hey team, just uploaded the new PRD for the dashboard widget.', timestamp: Date.now() - 86400000, channelId: 'c_project_nexus' },
    { id: 'm5', senderId: 'u_designer', text: 'Taking a look now. I have some thoughts on the layout constraints.', timestamp: Date.now() - 80000000, channelId: 'c_project_nexus' },
  ],
  'dm_dave': [
    { id: 'm6', senderId: 'u_eng_lead', text: 'Do we really need the export to PDF feature for V1? It is going to add 3 days.', timestamp: Date.now() - 500000, channelId: 'dm_dave' },
  ]
};

export const SCENARIOS = [
  {
    id: 'sc_scope_creep',
    title: 'The Sales Promise',
    description: 'Jim from Sales has promised a feature to a big client that is not on the roadmap. Engineering is already over capacity.',
    channelId: 'c_general',
    initiatorId: 'u_sales',
    initialMessage: 'Hey @Alex, I just got off the phone with Enterprise Corp. I told them we can definitely include the "Custom Reporting" module in the release next week. They\'re ready to sign a $50k deal if we do. Huge win!',
    stakeholders: ['u_sales', 'u_eng_lead', 'u_vp']
  },
  {
    id: 'sc_design_delay',
    title: 'Design Perfectionism',
    description: 'Sarah wants to delay the launch to fix "visual polish". Karen (VP) wants to launch now to hit quarterly goals.',
    channelId: 'c_project_nexus',
    initiatorId: 'u_designer',
    initialMessage: 'I\'ve been reviewing the staging build and the animations are just not snappy enough. It feels cheap. I strongly recommend we push the launch back by 3 days to refactor the transition layer. We only get one chance to make a first impression.',
    stakeholders: ['u_designer', 'u_vp', 'u_eng_lead']
  },
  {
    id: 'sc_tech_debt',
    title: 'The Critical Refactor',
    description: 'Dave wants to stop all feature work for a "Sprint of Stabilization". Karen thinks it\'s a waste of time.',
    channelId: 'c_eng',
    initiatorId: 'u_eng_lead',
    initialMessage: '@Alex we have a problem. The database latency is spiking. If we add the new notification feature without refactoring the schema first, the whole thing might go down. I need to pull 2 engineers off feature work to fix this ASAP.',
    stakeholders: ['u_eng_lead', 'u_vp']
  }
];

