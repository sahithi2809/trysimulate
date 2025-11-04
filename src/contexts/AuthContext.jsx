import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        const session = await authService.getSession();
        if (session?.user) {
          setUser(session.user);
          try {
            const userProfile = await authService.getUserProfile(session.user.id);
            setProfile(userProfile);
          } catch (err) {
            console.log('Profile not found yet');
          }
        }
      } catch (err) {
        // No session, user not logged in - this is fine
        console.log('No active session');
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      // Update loading state immediately
      setLoading(false);
      
      if (session?.user) {
        setUser(session.user);
        // Load profile in background (don't block UI update)
        authService.getUserProfile(session.user.id)
          .then(userProfile => {
            setProfile(userProfile);
          })
          .catch(err => {
            console.log('Profile not found');
            setProfile(null);
          });
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isProfileComplete: profile && profile.user_role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

