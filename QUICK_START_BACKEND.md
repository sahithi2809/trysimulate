# Quick Start: Task-Based Simulations Backend

## 🚀 Get Started in 3 Steps

### Step 1: Run Database Migration

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy contents of `supabase/migrations/008_create_task_based_tables.sql`
4. Paste and run

**Option B: Using Supabase CLI**
```bash
cd CODEBASE
supabase db push
```

### Step 2: Seed Noah Simulation

```bash
# Make sure you have .env.development.local with:
# VITE_SUPABASE_URL=https://qwhzvupmyjabkgbmvoxo.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

npm run seed:task-based
```

Expected output:
```
🌱 Seeding task-based simulations...
   Supabase URL: https://qwhzvupmyjabkgbmvoxo.supabase.co
✅ Successfully seeded simulation: Noah Smart Fitness Watch - Product Management
   Slug: noah-smart-fitness-watch
   ID: [uuid]
   Tasks: 8
   Skills: 7
```

### Step 3: Test It!

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Go to browse page:**
   - Visit `http://localhost:3000/browse`
   - You should see Noah simulation loaded from database

3. **Start simulation:**
   - Click on Noah simulation
   - Click "Try Simulation"
   - Complete a task
   - Check Supabase Dashboard → `task_submissions` table
   - You should see your submission!

## ✅ Verification Checklist

- [ ] Migration ran successfully (check Supabase Dashboard → Tables)
- [ ] Seed script completed without errors
- [ ] Noah simulation appears in `/browse`
- [ ] Can start simulation and see progress
- [ ] Task submissions save to database (if logged in)
- [ ] Falls back to localStorage if not logged in

## 🔍 Troubleshooting

### Migration fails
- Check you're connected to dev database
- Verify RLS is enabled in Supabase
- Check for syntax errors in SQL

### Seed script fails
- Verify `.env.development.local` exists
- Check `SUPABASE_SERVICE_ROLE_KEY` is correct
- Ensure migration ran first

### Simulation not loading
- Check browser console for errors
- Verify simulation exists in `task_based_simulations` table
- Check slug matches: `noah-smart-fitness-watch`

### Progress not saving
- Check if user is logged in
- Verify session was created in `simulation_sessions`
- Check browser console for errors
- System falls back to localStorage automatically

## 📚 Next Steps

- Read `TASK_BASED_SIMULATIONS_SETUP.md` for detailed docs
- Read `BACKEND_IMPLEMENTATION_SUMMARY.md` for architecture
- Add more simulations using the seed script as template
- Enable LLM-based scoring when ready

## 🎉 You're Ready!

The system is now fully set up and ready to:
- Support multiple simulations
- Track multiple users
- Handle different tasks and skills per simulation
- Scale to production


