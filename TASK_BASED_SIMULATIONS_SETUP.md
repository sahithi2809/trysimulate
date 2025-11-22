# Task-Based Simulations Backend Setup Guide

This guide explains how to set up and use the scalable task-based simulation system.

## Overview

The system supports:
- ✅ Multiple simulations with different tasks
- ✅ Multiple users with separate progress tracking
- ✅ Different skills tested per simulation
- ✅ Flexible validation (rule-based now, LLM-based ready)
- ✅ Automatic fallback to localStorage if backend unavailable

## Architecture

### Database Tables

1. **`task_based_simulations`** - Stores simulation definitions
   - Flexible task structure (JSON)
   - Skills tested per simulation
   - Validation rules per task
   - Reference data (personas, competitors, etc.)

2. **`task_submissions`** - Stores individual task completions
   - User's answers
   - Scores and feedback
   - Validation method used

3. **`task_based_progress`** - Tracks overall progress
   - Completed tasks
   - Final score
   - Skill breakdown
   - Resume snippet

## Setup Steps

### 1. Run Database Migration

```bash
# Apply the migration to create tables
supabase db push

# Or manually run the SQL file
psql -h your-db-host -U postgres -d postgres -f supabase/migrations/008_create_task_based_tables.sql
```

### 2. Seed Noah Simulation

```bash
# Make sure you have .env.development.local with:
# VITE_SUPABASE_URL=https://your-dev-project.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

npm run seed:task-based
```

This will:
- Create the Noah simulation in the database
- Set up all tasks with their configurations
- Add validation rules
- Map skills to tasks

### 3. Verify Setup

Check in Supabase Dashboard:
- `task_based_simulations` table should have 1 row (Noah)
- Tables should have proper RLS policies
- Indexes should be created

## Usage

### For Users

1. **Browse Simulations**
   - Go to `/browse`
   - Task-based simulations appear with 🏥 icon
   - Click to go to landing page

2. **Start Simulation**
   - Landing page: `/simulation/noah-smart-fitness-watch`
   - Click "Try Simulation"
   - Automatically creates session and progress records

3. **Complete Tasks**
   - Progress is saved to database automatically
   - Can resume from any device (if logged in)
   - Falls back to localStorage if not authenticated

4. **View Final Report**
   - After completing all tasks
   - Shows scores, skill breakdown, certificate
   - Data loaded from backend or localStorage

### For Developers

#### Adding a New Simulation

1. **Create simulation data** (similar to `demoSimulationData.js`)

2. **Run seed script** or insert directly:

```javascript
const newSimulation = {
  title: 'Amazon Product Launch',
  slug: 'amazon-product-launch',
  category: 'Product Management',
  difficulty: 'Intermediate',
  estimated_duration: '4-6 hours',
  company_info: { /* ... */ },
  tasks: [
    {
      id: 'task1',
      type: 'user-stories',
      name: 'Write User Stories',
      // ... config
    }
  ],
  skills_tested: ['Prioritization', 'Stakeholder Management'],
  skill_mapping: {
    'Prioritization': ['task2'],
    'Stakeholder Management': ['task3']
  },
  validation_rules: {
    task1: { method: 'rule-based', validator: 'validateTask1' }
  },
  is_published: true,
  is_active: true
};

// Insert via Supabase client or SQL
```

3. **Update routes** (if needed)
   - Routes automatically support slug-based routing
   - `/simulation/:slug` → Landing page
   - `/simulation/:slug/start` → Simulation

#### Adding New Task Types

1. **Create task component** in `src/components/task-based/`
2. **Add to taskComponentMap** in `DemoSimulation.jsx`
3. **Update task type** in simulation definition

#### Using LLM-Based Validation

1. **Update validation rule**:
```javascript
validation_rules: {
  task1: {
    method: 'llm-based',
    prompt: 'Evaluate this submission...',
    rubric: { /* scoring criteria */ }
  }
}
```

2. **Deploy Edge Function** (when ready):
```bash
supabase functions deploy score-task-llm
```

## Edge Cases Handled

### ✅ Authentication
- Works without login (uses localStorage)
- Automatically uses backend when logged in
- Seamless fallback if auth fails

### ✅ Network Errors
- Falls back to localStorage on connection issues
- Retries backend operations
- Shows user-friendly error messages

### ✅ Missing Data
- Handles missing simulations gracefully
- Defaults to hardcoded tasks if DB unavailable
- Validates all inputs before saving

### ✅ Concurrent Sessions
- One active session per user per simulation
- Resumes existing session if found
- Prevents duplicate progress records

### ✅ Data Migration
- Backward compatible with localStorage
- Can migrate localStorage data to backend
- Supports both data sources simultaneously

## API Reference

### `taskBasedService`

```javascript
// Get all simulations
await taskBasedService.getAllSimulations()

// Get simulation by slug
await taskBasedService.getSimulationBySlug('noah-smart-fitness-watch')

// Start session
const { session, progress } = await taskBasedService.startSession(simulationId)

// Save task submission
await taskBasedService.saveTaskSubmission(simulationId, sessionId, taskId, taskData)

// Get progress
const progress = await taskBasedService.getProgress(simulationId, sessionId)

// Get submissions
const submissions = await taskBasedService.getTaskSubmissions(simulationId, sessionId)
```

## Future Enhancements

- [ ] Generic task renderers (currently using existing components)
- [ ] LLM-based scoring Edge Function
- [ ] Admin dashboard for managing simulations
- [ ] Analytics and reporting
- [ ] Multi-language support
- [ ] Task templates library

## Troubleshooting

### Migration fails
- Check Supabase connection
- Verify RLS policies are enabled
- Check for existing tables

### Seed script fails
- Verify environment variables
- Check service role key has permissions
- Ensure migration ran successfully

### Backend not working
- Check `.env.development.local` file
- Verify Supabase URL and keys
- Check browser console for errors
- System automatically falls back to localStorage

### Progress not saving
- Check user authentication
- Verify session was created
- Check browser console for errors
- Try refreshing the page

## Support

For issues or questions:
1. Check browser console for errors
2. Verify database connection
3. Check Supabase logs
4. Review RLS policies


