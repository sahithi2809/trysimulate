# 🔐 Signup Flow Explained

## Overview

Your app supports **two signup methods**:
1. **Email/Password Signup** - Traditional form-based signup
2. **Google OAuth Signup** - One-click Google sign-in

---

## 📧 Email/Password Signup Flow

### 1. User fills out form (`SignUpForm.jsx`)
- Full Name
- Email
- Password
- User Role (hiring_manager, student, etc.)
- How they heard about us
- Marketing purpose

### 2. Form submission (`SignUpForm.jsx` → `authService.signUp()`)
```javascript
// Location: CODEBASE/src/components/SignUpForm.jsx (line 52)
await authService.signUp(trimmedEmail, formData.password, {
  fullName: formData.fullName,
  userRole: formData.userRole,
  howHeardAboutUs: formData.howHeardAboutUs,
  marketingPurpose: formData.marketingPurpose,
});
```

### 3. Supabase Auth creates user (`authService.js`)
```javascript
// Location: CODEBASE/src/services/authService.js (line 11)
const { data, error } = await supabase.auth.signUp({
  email: cleanEmail,
  password,
  options: {
    data: {
      full_name: userData.fullName,
    },
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  }
});
```

**No API keys needed** - Supabase handles authentication internally.

### 4. Database trigger creates profile
When a user is created in `auth.users`, the `handle_new_user()` trigger automatically:
- Creates a row in `user_profiles` table
- Sets `id` = user's UUID
- Sets `email` = user's email
- Sets `full_name` = from signup data

**Location:** Database trigger on `auth.users` table

### 5. Profile is updated with additional data
```javascript
// Location: CODEBASE/src/services/authService.js (line 32)
await this.updateUserProfile(data.user.id, {
  email: data.user.email,
  user_role: userData.userRole,
  how_heard_about_us: userData.howHeardAboutUs,
  marketing_purpose: userData.marketingPurpose,
  full_name: userData.fullName,
});
```

---

## 🔵 Google OAuth Signup Flow

### 1. User clicks "Sign up with Google" button
```javascript
// Location: CODEBASE/src/components/SignUpForm.jsx (line 73-83)
const handleGoogleSignUp = async () => {
  await authService.signInWithGoogle();
};
```

### 2. Supabase redirects to Google
```javascript
// Location: CODEBASE/src/services/authService.js (line 65-79)
async signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
}
```

### 3. Google OAuth Configuration
**Google API keys are NOT in your code!** They're configured in Supabase Dashboard:

1. Go to: **Supabase Dashboard → Authentication → Providers → Google**
2. Enable Google provider
3. Add:
   - **Client ID** (from Google Cloud Console)
   - **Client Secret** (from Google Cloud Console)
4. Add redirect URL:
   - `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local dev)

**Location:** Supabase Dashboard, NOT in your codebase

### 4. User authenticates with Google
- User is redirected to Google
- User grants permission
- Google redirects back to your app

### 5. Callback handler (`AuthCallback.jsx`)
```javascript
// Location: CODEBASE/src/pages/AuthCallback.jsx
// Gets session from URL hash
const { data: { session } } = await supabase.auth.getSession();

// Check if profile is complete
const isComplete = await authService.isProfileComplete(session.user.id);

if (!isComplete) {
  // Redirect to profile completion (for Google OAuth users)
  navigate('/complete-profile');
} else {
  navigate('/');
}
```

### 6. Profile creation
- **Trigger creates basic profile** (same as email signup)
- **User completes profile** if missing data (via `/complete-profile` page)

---

## 🔑 Where Are API Keys?

### ❌ NOT in your code:
- Google OAuth credentials are in **Supabase Dashboard**
- No API keys in your frontend code
- Supabase handles OAuth flow server-side

### ✅ In Supabase Dashboard:
1. **Google OAuth**: Authentication → Providers → Google
   - Client ID
   - Client Secret
   - Redirect URLs

2. **Supabase Keys**: Settings → API
   - `VITE_SUPABASE_URL` (in your `.env` file)
   - `VITE_SUPABASE_ANON_KEY` (in your `.env` file)

### ✅ In your code:
- Only Supabase client keys (anon key) - safe to expose
- No Google API keys
- No secrets

---

## 📁 Key Files

### Signup Components
- `CODEBASE/src/components/SignUpForm.jsx` - Signup form UI
- `CODEBASE/src/components/LoginForm.jsx` - Login form UI
- `CODEBASE/src/pages/AuthPage.jsx` - Auth page container

### Auth Services
- `CODEBASE/src/services/authService.js` - All auth functions
  - `signUp()` - Email/password signup
  - `signInWithGoogle()` - Google OAuth
  - `updateUserProfile()` - Update user profile

### Callback Handler
- `CODEBASE/src/pages/AuthCallback.jsx` - Handles OAuth redirect

### Database
- `handle_new_user()` trigger - Auto-creates profile on signup
- `user_profiles` table - Stores user data

---

## 🔄 Complete Signup Flow Diagram

```
Email Signup:
User → SignUpForm → authService.signUp() 
  → Supabase Auth → auth.users table
  → handle_new_user() trigger → user_profiles table
  → authService.updateUserProfile() → Updates profile with role/marketing data
  → Navigate to home

Google Signup:
User → SignUpForm → authService.signInWithGoogle()
  → Supabase redirects to Google
  → User authenticates with Google
  → Google redirects to /auth/callback
  → AuthCallback.jsx → Gets session
  → handle_new_user() trigger → user_profiles table
  → Check if profile complete
  → If not: Navigate to /complete-profile
  → If yes: Navigate to home
```

---

## 🛠️ Setup Required

### For Email/Password Signup:
✅ Already works - no setup needed

### For Google OAuth Signup:
1. **Create Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs

2. **Configure in Supabase:**
   - Dashboard → Authentication → Providers → Google
   - Enable Google
   - Add Client ID and Client Secret
   - Add redirect URLs

3. **That's it!** No code changes needed.

---

## 🐛 Current Issue: RLS Policy Error

The error `"new row violates row-level security policy for table user_profiles"` happens because:

1. User signs up → `auth.users` row created
2. `handle_new_user()` trigger tries to insert into `user_profiles`
3. RLS policy blocks the insert (even though function is SECURITY DEFINER)

**Fix:** Run `CODEBASE/scripts/sync-user-profiles-from-prod.sql` in your DEV Supabase Dashboard to match production exactly.


