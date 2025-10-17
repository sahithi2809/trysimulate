# 🚀 TrySimulate — Quick Start Guide

## Step 1: Install Dependencies

Open your terminal in the `CODEBASE` folder and run:

```bash
npm install
```

This will install all required packages (React, Tailwind CSS, React Router, SortableJS, etc.)

## Step 2: Start Development Server

```bash
npm run dev
```

The app will start at `http://localhost:3000`

## Step 3: Explore the Platform

### As a Professional/Learner:
1. **Landing Page** (`/`) - Learn about TrySimulate
2. **Browse Simulations** (`/browse`) - View all available simulations
3. **Take a Simulation** - Click any simulation card to start
4. **Get Scored** - Complete the scenario and receive instant feedback

### As a Creator:
1. **Creator Dashboard** (`/creator`) - Manage your simulations
2. **Create New Simulation** - Click "Create New Simulation"
3. **AI Builder** - Fill in the form and click "Generate with AI"
4. **Publish** - Review and save your simulation

## 🎯 Try These Default Simulations

### 1. Customer Feedback Dashboard
- **Type**: Customer Comments
- **Category**: Product Management
- **What**: Reply to 3 customer complaints professionally
- **Scoring**: Empathy, Resolution, Clarity

### 2. SaaS Pricing Negotiation
- **Type**: Sales Negotiation
- **Category**: Sales
- **What**: Handle a 30% discount request
- **Scoring**: Empathy, Value, Alternatives, Closing

### 3. Task Prioritization — PM's Day
- **Type**: Prioritization
- **Category**: Product Management
- **What**: Drag-drop 10 tasks to prioritize correctly
- **Scoring**: Distance from ideal order

### 4. Team Conflict — Engineering vs Design
- **Type**: Team Conflict
- **Category**: Leadership
- **What**: Resolve a Slack discussion between team members
- **Scoring**: Empathy, Neutrality, Solution, De-escalation

## 🎨 Key Features to Explore

### AI Simulation Builder (Mocked)
1. Go to `/creator/build`
2. Select simulation type
3. Enter scenario details
4. Click "Generate with AI"
5. See auto-generated scenario structure

### localStorage Data Persistence
- All simulations saved locally
- Progress tracked per simulation
- Custom simulations persist across sessions

### Responsive Design
- Works on desktop, tablet, and mobile
- Modern Tailwind CSS styling
- Smooth animations and transitions

## 🛠️ Customization

### Add More Default Simulations
Edit `src/utils/storage.js` → `getDefaultSimulations()` function

### Modify Scoring Logic
Each simulation component has its own `scoreReply()` or `scoreResponse()` function

### Styling
- Global styles: `src/index.css`
- Tailwind config: `tailwind.config.js`
- Component-level: Tailwind classes in JSX

## 📦 Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder, ready to deploy.

## 🐛 Troubleshooting

**Port 3000 already in use?**
```bash
# Vite will suggest an alternative port, or you can specify:
npm run dev -- --port 3001
```

**Dependencies not installing?**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Changes not reflecting?**
- Hard refresh browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Check terminal for errors
- Restart dev server

## 🎓 Understanding the Code

### Routing (App.jsx)
All routes defined in `src/App.jsx` using React Router v6

### Storage (utils/storage.js)
- `getAllSimulations()` - Get all simulations
- `saveCustomSimulation()` - Save new simulation
- `getSimulationById()` - Retrieve specific simulation
- `saveProgress()` - Track user scores

### Simulations (pages/simulations/)
Each simulation type is a separate component with:
- State management
- Scoring logic
- Results display
- Navigation

## 🚀 Next Steps

1. **Integrate Real AI** - Replace mocked generation with OpenAI API
2. **Add Backend** - Build Node.js/Express API for persistence
3. **User Auth** - Implement login/signup system
4. **More Types** - Create additional simulation formats
5. **Analytics** - Track performance over time

---

**Need Help?** Check the main README.md for detailed documentation.

**Happy Simulating! 🎉**

