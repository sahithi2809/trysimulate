import { supabase } from '../config/supabaseClient';

export const authService = {
  // Sign up with email/password
  async signUp(email, password, userData) {
    // Ensure email is clean (trimmed and lowercase)
    const cleanEmail = email.trim().toLowerCase();
    
    // Disable email confirmation for development
    // This bypasses Supabase's SMTP restrictions on test emails
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: userData.fullName,
        },
        emailRedirectTo: `${window.location.origin}/trysimulate/auth/callback`,
        // Disable email confirmation to allow any email address
        // Note: This requires Supabase Auth settings to have "Confirm email" disabled
      }
    });

    if (error) throw error;

    // Update user profile with additional info if user is created
    // The trigger creates the profile, but we need to wait a moment for it
    if (data.user) {
      // Small delay to ensure trigger has run
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await this.updateUserProfile(data.user.id, {
        email: data.user.email, // Include email for upsert
        user_role: userData.userRole,
        how_heard_about_us: userData.howHeardAboutUs,
        marketing_purpose: userData.marketingPurpose,
        full_name: userData.fullName,
      });
    }

    return data;
  },

  // Sign in with email/password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    // Refresh session to ensure it's available immediately
    await supabase.auth.getSession();
    
    // Update last active (non-blocking)
    if (data.user) {
      this.updateLastActive(data.user.id).catch(err => console.log('Failed to update last active:', err));
    }
    
    return data;
  },

  // Sign in with Google
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/trysimulate/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error && error.message !== 'User not found') {
      throw error;
    }
    return data?.user || null;
  },

  // Get user session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Get user profile
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update user profile (upsert - creates if doesn't exist)
  async updateUserProfile(userId, updates) {
    // Get existing profile to preserve email (trigger creates it with email)
    let email = updates.email;
    if (!email) {
      try {
        const existing = await this.getUserProfile(userId);
        email = existing?.email;
      } catch (err) {
        // Profile doesn't exist yet, try to get from signup data
        // The trigger should have created it, but if not, we'll use upsert
        console.log('Profile not found, will create with upsert');
      }
    }
    
    // Use upsert to handle both create and update
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        email: email, // Email should be set by trigger, but include it for safety
        ...updates,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update last active timestamp
  async updateLastActive(userId) {
    await supabase
      .from('user_profiles')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', userId);
  },

  // Check if user profile is complete
  async isProfileComplete(userId) {
    const profile = await this.getUserProfile(userId);
    return profile && profile.user_role;
  },

  // Auth state listener
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

