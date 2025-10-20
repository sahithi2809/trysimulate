# TrySimulate — Workplace Simulations Platform

TrySimulate is a web-based simulation platform that allows anyone to create, publish, and experience realistic workplace simulations. Practice real-world behavioral intelligence through AI-powered scenarios.

## 🚀 Features

### For Professionals & Learners
- **Browse Simulations** by category (PM, Sales, HR, Leadership)
- **Interactive Scenarios** with realistic workplace challenges
- **AI-based Scoring** with instant feedback
- **Progress Tracking** to measure skill improvement

### For Creators & Educators
- **AI Simulation Builder** - Describe scenarios in natural language
- **Auto-generation** of complete simulations with scoring rubrics
- **Four Simulation Types**:
  - 💬 Customer Comments (reply to feedback)
  - 💼 Sales Negotiation (email scenarios)
  - 📋 Task Prioritization (drag-and-drop)
  - 👥 Team Conflict Resolution (Slack-style chat)

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   ```bash
   # Create a .env file in the root directory
   # Add the following variables:
   
   # OpenAI API Key
   # Get your API key from: https://platform.openai.com/api-keys
   VITE_OPENAI_API_KEY=your_actual_api_key_here
   
   # Supabase Configuration
   # Get these from your Supabase project settings
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to `http://localhost:3000`

## 🏗️ Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
CODEBASE/
├── src/
│   ├── components/          # Reusable components
│   │   └── Navbar.jsx       # Navigation bar
│   ├── pages/               # Main pages
│   │   ├── LandingPage.jsx
│   │   ├── BrowseSimulations.jsx
│   │   ├── CreatorDashboard.jsx
│   │   ├── SimulationBuilder.jsx
│   │   └── simulations/     # Individual simulation types
│   │       ├── CustomerCommentsSimulation.jsx
│   │       ├── SalesNegotiationSimulation.jsx
│   │       ├── PrioritizationSimulation.jsx
│   │       └── TeamConflictSimulation.jsx
│   ├── utils/
│   │   └── storage.js       # localStorage utilities
│   ├── App.jsx              # Main app with routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎯 How to Use

### Taking a Simulation
1. Click **"Browse Simulations"** in the navigation
2. Filter by category or search for a specific simulation
3. Click on a simulation card to start
4. Complete the interactive scenario
5. Receive instant AI-powered feedback and scoring

### Creating a Simulation
1. Go to **"Creator Dashboard"**
2. Click **"Create New Simulation"**
3. Select a simulation type
4. Fill in details (title, category, description)
5. Click **"Generate with AI"** (mocked generation)
6. Review and publish your simulation

## 🧪 Simulation Types

### 1. Customer Comments
- **Format**: 3-column layout (comments list | reply editor | scoring panel)
- **Scoring**: Empathy (40%), Resolution (40%), Clarity (20%)
- **Example**: Reply to customer complaints professionally

### 2. Sales Negotiation
- **Format**: Email scenario with reply editor
- **Scoring**: Empathy (25%), Value (30%), Alternatives (30%), Closing (15%)
- **Example**: Handle discount requests while protecting value

### 3. Task Prioritization
- **Format**: Drag-and-drop task list
- **Scoring**: Distance from ideal priority order
- **Example**: Prioritize 10 tasks as a Product Manager

### 4. Team Conflict Resolution
- **Format**: Slack-style chat interface
- **Scoring**: Empathy (25%), Neutrality (25%), Solution (30%), De-escalation (20%)
- **Example**: Resolve disagreements between team members

## 💾 Data Persistence

All data is stored in **browser localStorage**:
- `trysimulate_simulations` - Default simulations
- `trysimulate_custom` - User-created simulations
- `trysimulate_progress` - User progress and scores

## 🎨 Tech Stack

- **React 18** - UI framework
- **React Router 6** - Navigation
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **SortableJS** - Drag-and-drop functionality
- **Supabase** - Backend (Database, Auth, Storage)
- **OpenAI API** - AI-powered simulation generation

## 🔮 Future Enhancements

- Real AI integration (OpenAI API)
- User authentication system
- Multiplayer simulations
- Company workspaces
- Analytics dashboard
- Export/import simulations
- Video/audio responses
- Mobile app

## 📝 Notes

- **No Backend**: This is a UI-only MVP using localStorage
- **Mocked AI**: The "AI generation" uses predefined templates
- **Login/Signup**: Buttons are placeholders for future integration

## 🤝 Contributing

This is an MVP prototype. To extend:
1. Replace mocked AI with real API calls
2. Implement backend API for data persistence
3. Add authentication system
4. Create more simulation types
5. Enhance scoring algorithms

## 📄 License

MIT License - Feel free to use and modify

---

**Built with ❤️ for democratizing workplace learning**

