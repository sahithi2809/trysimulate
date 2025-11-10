import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { authService } from '../services/authService';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
          setLoading(false);
          setTimeout(() => navigate('/auth'), 2000);
          return;
        }

        if (session && session.user) {
          // Check if user profile exists and is complete
          try {
            const isComplete = await authService.isProfileComplete(session.user.id);
            
            if (!isComplete) {
              // Redirect to complete profile (for Google OAuth users)
              navigate('/complete-profile');
            } else {
              navigate('/');
            }
          } catch (profileError) {
            console.error('Profile check error:', profileError);
            // Still redirect to home, profile will be created by trigger
            navigate('/');
          }
        } else {
          setError('No session found');
          setLoading(false);
          setTimeout(() => navigate('/auth'), 2000);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err.message);
        setLoading(false);
        setTimeout(() => navigate('/auth'), 2000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Completing sign in...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-600 mb-2">Error: {error}</p>
          <p className="text-slate-600 text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;



