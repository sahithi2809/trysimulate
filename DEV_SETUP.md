# Development Environment Setup

This project now supports separate Supabase projects for local development and production.  
Follow the checklist below to create and use a dedicated **dev** environment without touching the live data.

---

## 1. Create a Dev Supabase Project
1. Log in to [Supabase](https://supabase.com/).
2. Create a new project (for example `simulate-dev`).
3. Run the schema migrations or copy data from production:
   - Simplest option: `supabase db pull` from prod, then `supabase db push --project-ref <dev-ref>`.
   - Alternatively, manually import the tables you need.

## 2. Store Dev Credentials Locally
1. Copy `ENV_TEMPLATE.txt` to `.env.development.local`.  
   Fill in the dev project values for:
   ```bash
   VITE_SUPABASE_URL=https://YOUR_DEV_PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=dev-anon-key
   ```
2. Optionally create `.env.production.local` with prod keys (used only when you build/deploy).
3. Scripts that require service-role access use shell vars:
   ```bash
   export SUPABASE_URL=https://YOUR_DEV_PROJECT.supabase.co
   export SUPABASE_SERVICE_ROLE_KEY=dev-service-role
   ```

## 3. Run the App Against Dev
Just use the regular Vite commands:
```bash
npm install          # first time only
npm run dev          # uses .env.development* automatically
```
Any data or edge-function changes now hit the dev Supabase project.

## 4. Promote Changes to Production
When the dev changes are ready:
1. Temporarily export the production service-role key.
2. Run your scripts (`npm run import:simulations`, etc.) with the prod environment variables.
3. Deploy the production build:
   ```bash
   VITE_SUPABASE_URL=https://YOUR_PROD_PROJECT.supabase.co \
   VITE_SUPABASE_ANON_KEY=prod-anon-key \
   npm run build
   ```
4. Upload the contents of `dist/` to your hosting provider (GoDaddy, Netlify, etc.).

---

> ⚠️ **Never commit real Supabase keys.** Keep `.env.*` files in `.gitignore` (already configured).  
> The app will throw a clear error if required environment variables are missing.



