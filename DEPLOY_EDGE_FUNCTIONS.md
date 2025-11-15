# Edge Functions Deployment Guide

Edge Functions are deployed **separately** to each Supabase project (prod and dev).

## Current Edge Functions

**In Codebase:**
1. `ai-generate` - Generates AI simulations using Gemini (✅ exists in codebase)

**In Production (may be deprecated/removed):**
- `generate-simulation` - (Not in codebase, may be deprecated)
- `create-simulation` - (Not in codebase, may have been removed)

**Note:** Only deploy functions that exist in your codebase. Old functions in production can be left as-is or deleted if no longer needed.

## Deployment Steps

### 1. Deploy to Production

```bash
cd CODEBASE

# Link to production (if not already linked)
supabase link --project-ref iryabjeigjtwditxfnfh

# Deploy the function
supabase functions deploy ai-generate
```

### 2. Deploy to Dev

```bash
cd CODEBASE

# Link to dev project
supabase link --project-ref qwhzvupmyjabkgbmvoxo

# Deploy the function
supabase functions deploy ai-generate
```

### 3. Set Environment Variables/Secrets

Each project needs its own secrets. Set them in Supabase Dashboard:

**Production** (https://supabase.com/dashboard/project/iryabjeigjtwditxfnfh/settings/secrets):
- `GEMINI_API_KEY` - Your Gemini API key (required for `ai-generate`)

**Dev** (https://supabase.com/dashboard/project/qwhzvupmyjabkgbmvoxo/settings/secrets):
- `GEMINI_API_KEY` - Your Gemini API key (can be same as prod or a separate dev key)

## Environment Variables in Edge Functions

Edge Functions automatically have access to:
- `SUPABASE_URL` - Auto-injected
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-injected
- Any secrets you set in Dashboard → Settings → Edge Functions → Secrets

## Best Practices

1. **Same Code, Different Secrets**: Deploy the same function code to both projects, but use different API keys/secrets if needed
2. **Test in Dev First**: Always test Edge Functions in dev before deploying to production
3. **Version Control**: Keep all Edge Function code in your repository
4. **Environment-Specific Logic**: If you need different behavior, use environment variables or check the `SUPABASE_URL` to determine which project you're in

## Quick Commands

```bash
# Switch between projects
supabase link --project-ref <project-ref>

# Deploy the function
supabase functions deploy ai-generate

# View function logs
supabase functions logs ai-generate --project-ref <project-ref>
```

## Troubleshooting

- **Function not found**: Make sure you're linked to the correct project (`supabase link`)
- **Secrets not available**: Check Dashboard → Settings → Edge Functions → Secrets
- **Deployment fails**: Check that you're in the `CODEBASE` directory and the function folder exists

