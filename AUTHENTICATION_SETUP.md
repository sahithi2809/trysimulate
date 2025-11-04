# 🔐 Authentication & User Tracking Setup Guide

## ✅ What's Been Implemented

### 1. **Database Schema** (Migrations Applied ✅)
- `user_profiles` - Extended user information (role, marketing data)
- `simulation_sessions` - Tracks user progress on simulations
- `user_activity` - Comprehensive activity logging
- Updated `simulations` table with creator tracking

### 2. **Authentication Services**
- **Email/Password** signup and login
- **Google OAuth** integration
- Profile completion flow
- Session management

### 3. **User Data Collection**
On signup, users provide:
- Full Name
- Email/Password
- User Role (hiring_manager, student, professional, professor, recruiter, other)
- How they heard about us (google_search, social_media, friend_referral, linkedin, etc.)
- Marketing purpose (free text)

### 4. **Activity Tracking**
All user actions are logged:
- Simulation started/completed/abandoned
- Simulation created/published
- Step completion
- Button clicks
- Page views
- Search/filter actions

### 5. **Progress Tracking**
- Each simulation attempt creates a session
- Tracks progress percentage
- Stores user responses
- Records completion time and scores

---

## 🚀 Setup Steps

### Step 1: Configure Google OAuth in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Authentication → Providers**
3. Find **Google** and click it
4. Enable Google provider
5. Add your credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
6. Add redirect URL:
   ```
   https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback
   ```
   For local development, also add:
   ```
   http://localhost:3001/trysimulate/auth/callback
   ```
7. Click **Save**

### Step 2: Verify Database Tables

All migrations have been applied. Verify in Supabase Dashboard → Table Editor:
- ✅ `user_profiles`
- ✅ `simulation_sessions`
- ✅ `user_activity`
- ✅ `simulations` (should have `created_by` and `creator_name` columns)

### Step 3: Test Authentication

1. Start your dev server: `npm run dev`
2. Navigate to: `http://localhost:3001/trysimulate/auth`
3. Test signup with email/password
4. Test Google OAuth signup
5. Verify profile completion flow

---

## 📊 User Data Flow

### Signup Flow:
```
User Signs Up (Email/Password or Google)
    ↓
Auth Trigger Creates user_profiles record
    ↓
Profile Updated with Role, Marketing Info
    ↓
User Redirected to Complete Profile (if missing data)
    ↓
User Can Access App
```

### Activity Tracking Flow:
```
User Action (e.g., starts simulation)
    ↓
activityService.logActivity()
    ↓
Stored in user_activity table
    ↓
Available for analytics
```

### Progress Tracking Flow:
```
User Starts Simulation
    ↓
activityService.startSimulation()
    ↓
Creates simulation_sessions record
    ↓
Updates Progress via updateProgress()
    ↓
Completes via completeSimulation()
```

---

## 🎯 Key Features

### ✅ User Profiles
- Extended user information
- Role-based personalization
- Marketing attribution
- Last active tracking

### ✅ Simulation Ownership
- Each simulation tracks creator (`created_by`)
- Creators can manage their simulations
- Public simulations show creator name

### ✅ Progress Tracking
- Every simulation attempt is tracked
- Progress percentage
- User responses stored
- Completion times and scores

### ✅ Activity Logging
- Comprehensive user action tracking
- Scalable architecture
- Ready for analytics dashboard

---

## 📝 Usage Examples

### Check if user is authenticated:
```javascript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, profile } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return <div>Welcome, {profile?.full_name}!</div>;
};
```

### Log user activity:
```javascript
import { activityService } from '../services/activityService';

await activityService.logActivity('button_clicked', {
  button_name: 'publish',
  page: 'creator_dashboard'
});
```

### Track simulation start:
```javascript
const session = await activityService.startSimulation(simulationId);
// Use session.id for progress updates
```

---

## 🔒 Security Features

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Creators can manage only their simulations
- Secure API key storage (via Edge Functions)

---

## 🎉 Next Steps

1. **Test the complete flow**:
   - Sign up → Complete profile → Create simulation → Track progress

2. **Add analytics dashboard** (future):
   - Query `user_activity` for insights
   - Show user progress graphs
   - Display creator analytics

3. **Enhancements** (future):
   - Email verification
   - Password reset
   - Profile editing
   - User preferences

---

## 📚 Files Created/Modified

### New Files:
- `supabase/migrations/004_create_user_profiles.sql`
- `supabase/migrations/005_add_creator_to_simulations.sql`
- `supabase/migrations/006_create_simulation_sessions.sql`
- `supabase/migrations/007_create_user_activity.sql`
- `src/services/authService.js`
- `src/services/activityService.js`
- `src/components/SignUpForm.jsx`
- `src/components/LoginForm.jsx`
- `src/pages/AuthPage.jsx`
- `src/pages/AuthCallback.jsx`
- `src/pages/CompleteProfile.jsx`
- `src/contexts/AuthContext.jsx`

### Modified Files:
- `src/App.jsx` - Added auth routes and AuthProvider
- `src/components/Navbar.jsx` - Added auth buttons and user menu
- `src/services/databaseService.js` - Added creator tracking
- `src/components/AIBuilder.jsx` - Added activity logging

---

**🎊 Authentication system is ready! Users can now sign up, log in, and all their activity is being tracked!**

