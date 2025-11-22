# Troubleshooting: Recruiter Dashboard Not Showing Participants

## Current Issue
The recruiter dashboard is not showing users who completed simulations.

## Root Cause Analysis

### What We Found:
1. ✅ Simulations are correctly mapped to recruiter (`created_by` is set)
2. ✅ RLS policies are updated to allow access
3. ❌ **No progress records exist for `dev@gmail.com`**
4. ❌ **No submissions exist for `dev@gmail.com`**

### Why This Happens:
Users can complete simulations in two ways:
1. **While logged in** → Data saved to backend → Recruiter can see it ✅
2. **While NOT logged in** → Data saved to localStorage only → Recruiter CANNOT see it ❌

If `dev@gmail.com` completed the simulation while not logged in, the data is only in their browser's localStorage, not in the database.

## Solutions

### Solution 1: User Must Complete While Logged In (Recommended)

**For the user (`dev@gmail.com`):**
1. Sign in to the application
2. Complete the simulation again (or start fresh)
3. All progress will be saved to the backend
4. Recruiter will be able to see it immediately

**Why this is best:**
- Ensures data is properly saved
- Works with RLS policies
- Provides accurate tracking
- No manual intervention needed

### Solution 2: Check if User Was Logged In

Run this to check:
```bash
npm run check:dev
```

This will show:
- If progress records exist
- If submissions exist
- If `completed_at` is set

### Solution 3: Apply RLS Policies (If Not Applied)

The RLS policies must be applied in Supabase. Run this SQL in Supabase Dashboard:

```sql
-- Run: supabase/migrations/009_add_recruiter_rls_policies.sql
```

Or apply via Supabase CLI:
```bash
supabase db push
```

### Solution 4: Create Progress from Submissions (If Submissions Exist)

If submissions exist but progress is missing:
```bash
npm run create:progress
```

This will:
- Find all submissions for the user
- Create progress records from submissions
- Mark as completed if all tasks are done
- Calculate final scores

## Verification Steps

### Step 1: Verify User Has Progress
```bash
npm run check:dev
```

**Expected output if working:**
```
📊 Found X progress records for dev user
   ✅ Already completed
```

**If no progress:**
```
⚠️  No progress records found
```
→ User needs to complete simulation while logged in

### Step 2: Verify Recruiter Can See It
```bash
npm run verify:ownership
```

**Expected output:**
```
📈 Total completed participants: 1
   ✅ dev@gmail.com (Score: XX%, Completed: ...)
```

### Step 3: Check Browser Console
When recruiter views dashboard, check browser console for:
```
✅ Found X simulations for recruiter
🔍 Fetching participants for simulation...
✅ Verified ownership for simulation: ...
📊 Found X completed progress records
✅ Returning X participants
```

## Common Issues & Fixes

### Issue: "No participants showing"
**Possible causes:**
1. User completed while not logged in → **Fix:** User must complete while logged in
2. `completed_at` is NULL → **Fix:** Run `npm run fix:completed`
3. RLS policies not applied → **Fix:** Apply migration `009_add_recruiter_rls_policies.sql`
4. Simulation not mapped → **Fix:** Run `npm run map:simulations`

### Issue: "RLS policy blocked access"
**Fix:**
1. Ensure migration `009_add_recruiter_rls_policies.sql` is applied
2. Verify simulation has `created_by` set to recruiter ID (or NULL)
3. Check that progress has `completed_at IS NOT NULL`

### Issue: "User says they completed but nothing shows"
**Most likely cause:** User completed while NOT logged in

**Fix:**
1. Ask user to sign in
2. Have them complete the simulation again
3. Verify with `npm run check:dev`

## Prevention

### For Users:
- **Always sign in before starting a simulation**
- Check that you're logged in (look for your name/avatar in navbar)
- If you see "Sign In" button, you're not logged in

### For Recruiters:
- Verify users are logged in before they start
- Check dashboard regularly to see completion status
- Use verification scripts to diagnose issues

## Quick Fix Commands

```bash
# Check what's wrong
npm run verify:ownership

# Check specific user
npm run check:dev

# Fix missing completed_at
npm run fix:completed

# Create progress from submissions (if submissions exist)
npm run create:progress

# Map simulations to recruiter
npm run map:simulations
```

## Next Steps for dev@gmail.com

Since no progress/submissions exist, the user needs to:

1. **Sign in** to the application as `dev@gmail.com`
2. **Start and complete** the simulation again
3. **Verify** completion by checking the final report card
4. **Recruiter** should then see them in the dashboard

## Testing Checklist

- [ ] User is signed in
- [ ] User completes all tasks in simulation
- [ ] Final report card is shown
- [ ] Run `npm run check:dev` - should show progress
- [ ] Run `npm run verify:ownership` - should show 1 participant
- [ ] Recruiter dashboard shows the user
- [ ] Browser console shows detailed logs

## Support

If issues persist after following these steps:
1. Check Supabase logs for RLS violations
2. Verify environment variables are correct
3. Ensure all migrations are applied
4. Check browser console for detailed error messages


