# ✅ Setup Checklist - TrySimulate Secure Backend

Follow these steps in order to deploy the secure API key storage system.

---

## 📦 Prerequisites

- [ ] Supabase account created at https://supabase.com
- [ ] Supabase project created
- [ ] Node.js installed on your machine
- [ ] Terminal/Command Prompt access

---

## 🔧 Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

**Verify installation:**
```bash
supabase --version
```

✅ **Expected:** Version number displays (e.g., `1.x.x`)

---

## 🔐 Step 2: Login to Supabase

```bash
supabase login
```

- [ ] Browser opens automatically
- [ ] Click "Authorize" in browser
- [ ] Terminal shows "Logged in successfully"

**Verify login:**
```bash
supabase projects list
```

✅ **Expected:** See your project `iryabjeigjtwitxfnfh` in the list

---

## 🔗 Step 3: Link Your Project

```bash
cd /Users/sahithi/Desktop/CURSOR/TrySimulate/CODEBASE
supabase link --project-ref iryabjeigjtwitxfnfh
```

- [ ] Terminal asks for database password
- [ ] Enter your database password (from Supabase project settings)
- [ ] Shows "Linked to project iryabjeigjtwitxfnfh"

✅ **Expected:** "Finished supabase link"

---

## 🗄️ Step 4: Deploy Database Migration

```bash
supabase db push
```

- [ ] Shows "Applying migration 001_create_secrets_table.sql"
- [ ] No errors displayed

**Verify in Supabase Dashboard:**
1. Go to https://supabase.com
2. Open your project
3. Click "Table Editor" in sidebar
4. [ ] See `secrets` table
5. [ ] Table has 2 rows (OPENAI_API_KEY, OPENAI_MODEL)

✅ **Expected:** Secrets table exists with data

---

## ⚡ Step 5: Deploy Edge Function

```bash
supabase functions deploy ai-generate
```

- [ ] Shows "Deploying function ai-generate"
- [ ] Shows "Deployed function ai-generate"
- [ ] No errors

**Verify in Supabase Dashboard:**
1. Click "Edge Functions" in sidebar
2. [ ] See `ai-generate` function
3. [ ] Status shows "Active" or "Deployed"

✅ **Expected:** Function deployed successfully

---

## 🔑 Step 6: Get Service Role Key

1. Go to Supabase Dashboard
2. Click "Settings" (⚙️) in sidebar
3. Click "API"
4. Scroll to "Project API keys"
5. Find "service_role" key (long string starting with `eyJ...`)
6. [ ] Copy the Service Role Key

⚠️ **IMPORTANT:** This key is secret! Don't share it.

---

## 🔐 Step 7: Set Edge Function Secrets

```bash
supabase secrets set SUPABASE_URL=https://iryabjeigjtwitxfnfh.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key_here
```

Replace `paste_your_service_role_key_here` with the key from Step 6.

- [ ] First command shows "Set secret SUPABASE_URL"
- [ ] Second command shows "Set secret SUPABASE_SERVICE_ROLE_KEY"

**Verify:**
```bash
supabase secrets list
```

✅ **Expected:** See both secrets listed

---

## 🧪 Step 8: Test Edge Function

```bash
# View function logs
supabase functions logs ai-generate --follow
```

Keep this terminal open. In a new terminal:

```bash
# Start your dev server
cd /Users/sahithi/Desktop/CURSOR/TrySimulate/CODEBASE
npm run dev
```

1. [ ] Dev server starts on `http://localhost:3001`
2. Open browser to `http://localhost:3001`
3. Open browser console (F12)
4. Paste this test code:

```javascript
import('/src/services/secureAiService.js').then(async (module) => {
  await module.testEdgeFunctionConnection();
});
```

5. [ ] Check console for "✅ Edge Function connection successful!"
6. [ ] Check the other terminal for Edge Function logs

✅ **Expected:** Test passes, logs show activity

---

## 🔄 Step 9: Update React App

**Option A: Switch AIBuilder to secure service**

Edit `/src/components/AIBuilder.jsx`:

Find:
```javascript
import { analyzePrompt, generateSimulation, regenerateSimulation } from '../services/aiService';
```

Replace with:
```javascript
import { analyzePrompt, generateSimulation, regenerateSimulation } from '../services/secureAiService';
```

- [ ] File updated
- [ ] Save file
- [ ] Dev server reloads automatically

**Option B: Let me do it (switch to agent mode)**

---

## ✅ Step 10: Test Full Flow

1. [ ] Go to `http://localhost:3001`
2. [ ] Click "Create Your Own" or "Creator Dashboard"
3. [ ] Click "Create New Simulation"
4. [ ] Enter test prompt: "Create a customer service simulation"
5. [ ] Click "Analyze with AI"
6. [ ] Wait for analysis (check console for logs)
7. [ ] Click "Generate Simulation"
8. [ ] Simulation generates successfully
9. [ ] Click "Publish"
10. [ ] Can view and take the simulation

✅ **Expected:** Everything works smoothly

---

## 🚀 Step 11: Deploy to Production

### Update .env for local development

Create `/Users/sahithi/Desktop/CURSOR/TrySimulate/CODEBASE/.env`:

```env
VITE_SUPABASE_URL=https://iryabjeigjtwitxfnfh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyeWFiamVpZ2p0d2RpdHhmbmZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTk1MzksImV4cCI6MjA3NjMzNTUzOX0.i9TxNkVHCPCv6pVXrjsyVq64jpb_YyrY9v_7eXTvt-w
```

- [ ] .env file created

### Remove hardcoded API key (optional but recommended)

Edit `/src/services/aiService.js`:

Find:
```javascript
const API_KEY = 'sk-proj-eAy3vZjtMe0GcT5j2CN862...';
```

Replace with:
```javascript
const API_KEY = 'REMOVED_FOR_SECURITY'; // Now using Edge Functions
```

- [ ] Key removed

### Deploy to GitHub Pages

```bash
npm run build
npm run deploy
```

- [ ] Build succeeds
- [ ] Deploy succeeds
- [ ] Visit https://sahithi2809.github.io/trysimulate/
- [ ] Test the app in production

✅ **Expected:** App works on GitHub Pages with secure API calls

---

## 🎉 Success Checklist

- [ ] Supabase CLI installed and logged in
- [ ] Project linked
- [ ] Secrets table created
- [ ] Edge Function deployed
- [ ] Secrets configured
- [ ] Local testing passed
- [ ] React app updated
- [ ] Production deployment successful
- [ ] No API keys exposed in browser

---

## 🚨 If Something Goes Wrong

### "Failed to link project"
```bash
supabase projects list
# Make sure you see your project
supabase link --project-ref iryabjeigjtwitxfnfh
```

### "Migration failed"
- Go to Supabase Dashboard → SQL Editor
- Manually run the SQL from `supabase/migrations/001_create_secrets_table.sql`

### "Edge Function not found"
```bash
supabase functions deploy ai-generate
supabase functions list
```

### "Secrets not set"
```bash
supabase secrets list
# If empty, set them again:
supabase secrets set SUPABASE_URL=https://iryabjeigjtwitxfnfh.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_key
```

### "Test fails in browser"
- Check browser console for errors
- Check Edge Function logs: `supabase functions logs ai-generate`
- Verify secrets table has data in Dashboard

---

## 📚 Reference Files

- 📖 Full Guide: `SUPABASE_DEPLOYMENT.md`
- 📝 Commands: `SUPABASE_COMMANDS.md`
- 📊 Summary: `SECURITY_SETUP_SUMMARY.md`
- ✅ Checklist: `SETUP_CHECKLIST.md` (this file)

---

## ✨ Final Notes

Once complete, your app will:
- ✅ Store API keys securely in Supabase database
- ✅ Use Edge Functions to call OpenAI (never exposing keys)
- ✅ Be production-ready and deployable to GitHub Pages
- ✅ Have proper security with Row Level Security
- ✅ Be easy to maintain and update keys

**Estimated setup time: 15-20 minutes**

Good luck! 🚀

