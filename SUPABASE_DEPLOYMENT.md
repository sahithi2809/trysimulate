# Supabase Deployment Guide - Secure API Keys Setup

This guide will help you set up secure API key storage and Edge Functions in Supabase.

## 🎯 Overview

Instead of exposing the OpenAI API key in the browser, we:
1. Store all secrets (API keys) in a secure Supabase table
2. Use Edge Functions (serverless) to call OpenAI
3. The browser calls the Edge Function, which fetches the key securely

## 📋 Prerequisites

- Supabase account and project created
- Supabase CLI installed (we'll do this)

## 🚀 Step-by-Step Setup

### Step 1: Install Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Or using Homebrew on Mac
brew install supabase/tap/supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

This will open your browser to authenticate.

### Step 3: Link Your Project

```bash
cd /Users/sahithi/Desktop/CURSOR/TrySimulate/CODEBASE

# Link to your Supabase project
supabase link --project-ref iryabjeigjtwitxfnfh
```

Replace `iryabjeigjtwitxfnfh` with your actual project reference ID.

### Step 4: Run Database Migration

This creates the `secrets` table:

```bash
# Push the migration to Supabase
supabase db push
```

Or manually run the SQL in Supabase Dashboard:
1. Go to your Supabase project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/001_create_secrets_table.sql`
5. Click **Run**

### Step 5: Verify Secrets Table

Check if the secrets table was created:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see a `secrets` table
3. It should have one row with `OPENAI_API_KEY`

### Step 6: Deploy Edge Function

```bash
# Deploy the ai-generate Edge Function
supabase functions deploy ai-generate

# Set required environment variables for the function
supabase secrets set SUPABASE_URL=https://iryabjeigjtwitxfnfh.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Important:** Get your Service Role Key from:
- Supabase Dashboard → Settings → API → Service Role Key (secret)
- ⚠️ **NEVER expose this key in the browser!**

### Step 7: Update Your React App

The app is already set up to use the secure service. You just need to update the imports:

**Option A: Update existing AIBuilder.jsx**

Replace the import in `/src/components/AIBuilder.jsx`:

```javascript
// OLD (insecure)
// import { analyzePrompt, generateSimulation, regenerateSimulation } from '../services/aiService';

// NEW (secure)
import { analyzePrompt, generateSimulation, regenerateSimulation } from '../services/secureAiService';
```

**Option B: Switch entire app**

If you want to switch all AI calls to use the secure service, update all files that import from `aiService.js` to import from `secureAiService.js` instead.

### Step 8: Test the Setup

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Open browser console and test:
   ```javascript
   import('/src/services/secureAiService.js').then(async (module) => {
     await module.testEdgeFunctionConnection();
   });
   ```

## 📁 File Structure

```
CODEBASE/
├── supabase/
│   ├── migrations/
│   │   └── 001_create_secrets_table.sql    # Database schema for secrets
│   └── functions/
│       └── ai-generate/
│           └── index.ts                     # Edge Function for AI calls
├── src/
│   ├── services/
│   │   ├── aiService.js                    # OLD: Direct OpenAI calls (insecure)
│   │   └── secureAiService.js              # NEW: Calls via Edge Function (secure)
│   └── ...
└── ...
```

## 🔒 Security Benefits

### Before (Insecure):
```
Browser → OpenAI API (key exposed in browser JS)
```

### After (Secure):
```
Browser → Supabase Edge Function → Fetch key from DB → OpenAI API
```

- ✅ API key never leaves the server
- ✅ Row Level Security prevents browser access to secrets table
- ✅ Edge Functions run on Supabase's servers (serverless)
- ✅ Can easily rotate keys without redeploying the app

## 🔑 Managing Secrets

### Add a New Secret via SQL

```sql
INSERT INTO secrets (key_name, key_value, description, environment) 
VALUES ('NEW_API_KEY', 'value_here', 'Description', 'production');
```

### Update an Existing Secret

```sql
UPDATE secrets 
SET key_value = 'new_value_here', updated_at = NOW()
WHERE key_name = 'OPENAI_API_KEY';
```

### Disable a Secret

```sql
UPDATE secrets 
SET is_active = false
WHERE key_name = 'OPENAI_API_KEY';
```

### View All Secrets (Dashboard only)

Go to: **Table Editor** → **secrets** table

**Note:** You can only view this in the Supabase dashboard. The browser app cannot access this table due to RLS policies.

## 🧪 Testing

### Test in Browser Console

```javascript
// Test secure AI service
import('/src/services/secureAiService.js').then(async (module) => {
  // Test connection
  await module.testEdgeFunctionConnection();
  
  // Test prompt analysis
  const analysis = await module.analyzePrompt('Create a PM prioritization simulation');
  console.log('Analysis:', analysis);
});
```

## 🚨 Troubleshooting

### Error: "Failed to invoke function"
- Make sure you deployed the Edge Function: `supabase functions deploy ai-generate`
- Check Edge Function logs: `supabase functions logs ai-generate`

### Error: "Failed to fetch API key from secrets table"
- Run the migration to create the secrets table
- Verify the secrets table has data in Table Editor

### Error: "Missing Supabase environment variables"
- Make sure you set secrets: `supabase secrets set SUPABASE_URL=...`

## 🔄 Switching Back to Direct Calls (Not Recommended)

If you need to switch back to direct OpenAI calls for testing:

1. Change imports from `secureAiService.js` back to `aiService.js`
2. Make sure OpenAI key is in `aiService.js` (already hardcoded)

## 📊 Cost Comparison

- **Direct OpenAI calls:** API costs only
- **Via Edge Functions:** API costs + Supabase Edge Function costs (free tier: 500K requests/month)

For most use cases, this is negligible and worth the security benefit.

## ✅ Next Steps

1. Deploy the Edge Function
2. Update AIBuilder to use `secureAiService`
3. Test the integration
4. Remove hardcoded API key from `aiService.js`
5. Deploy to GitHub Pages with secure setup

---

**Your API keys are now secure!** 🔒🎉



