# Quick Supabase Commands Reference

## 📦 Installation

```bash
# Install Supabase CLI globally
npm install -g supabase
```

## 🔐 Authentication

```bash
# Login to Supabase (opens browser)
supabase login

# Check login status
supabase projects list
```

## 🔗 Link Project

```bash
# Link to your Supabase project
supabase link --project-ref iryabjeigjtwitxfnfh
```

## 🗄️ Database Migrations

```bash
# Push all migrations to Supabase
supabase db push

# Create a new migration
supabase migration new migration_name

# Reset database (careful!)
supabase db reset
```

## ⚡ Edge Functions

```bash
# Deploy a single function
supabase functions deploy ai-generate

# Deploy all functions
supabase functions deploy

# View function logs (real-time)
supabase functions logs ai-generate

# Test function locally
supabase functions serve ai-generate
```

## 🔑 Secrets Management

```bash
# Set a secret for Edge Functions
supabase secrets set SECRET_NAME=secret_value

# Set multiple secrets
supabase secrets set SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx

# List all secrets
supabase secrets list

# Delete a secret
supabase secrets unset SECRET_NAME
```

## 🧪 Testing

```bash
# Test Edge Function locally
supabase functions serve ai-generate

# Then test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/ai-generate' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"action":"analyzePrompt","payload":{"userPrompt":"Test prompt"}}'
```

## 📊 Project Info

```bash
# List all your projects
supabase projects list

# Get project details
supabase projects api-keys --project-ref iryabjeigjtwitxfnfh

# Check database status
supabase db status
```

## 🔄 Complete Setup Workflow

```bash
# 1. Install CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Link project
supabase link --project-ref iryabjeigjtwitxfnfh

# 4. Push database migrations
supabase db push

# 5. Deploy Edge Functions
supabase functions deploy ai-generate

# 6. Set Edge Function secrets
supabase secrets set SUPABASE_URL=https://iryabjeigjtwitxfnfh.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# 7. Test
supabase functions logs ai-generate
```

## 📝 Your Project Details

- **Project Ref:** `iryabjeigjtwitxfnfh`
- **Project URL:** `https://iryabjeigjtwitxfnfh.supabase.co`
- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyeWFiamVpZ2p0d2RpdHhmbmZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NTk1MzksImV4cCI6MjA3NjMzNTUzOX0.i9TxNkVHCPCv6pVXrjsyVq64jpb_YyrY9v_7eXTvt-w`

**Get Service Role Key from:** Supabase Dashboard → Settings → API → Service Role Key

---

## 🚨 Common Issues

### Issue: "Project not linked"
```bash
supabase link --project-ref iryabjeigjtwitxfnfh
```

### Issue: "Function failed to deploy"
- Check function syntax in `supabase/functions/ai-generate/index.ts`
- View logs: `supabase functions logs ai-generate`

### Issue: "Cannot access secrets table"
- Make sure migration ran: `supabase db push`
- Check table exists in Dashboard: Table Editor → secrets

### Issue: "Edge Function timeout"
- OpenAI API might be slow
- Check function logs for errors
- Increase timeout in function config

---

**Save these commands for quick reference!** 📋

