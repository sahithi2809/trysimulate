import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';
import { authService } from '../services/authService';

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode'); // 'login' or 'signup'
  const [isLogin, setIsLogin] = useState(mode !== 'signup');

  useEffect(() => {
    // Update form based on URL parameter
    if (mode === 'signup') {
      setIsLogin(false);
    } else if (mode === 'login') {
      setIsLogin(true);
    }
  }, [mode]);

  const handleSuccess = async () => {
    // Wait a moment for auth state to update
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check if profile is complete
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        const isComplete = await authService.isProfileComplete(user.id);
        if (!isComplete) {
          navigate('/complete-profile');
        } else {
          navigate('/');
        }
      } else {
        // If no user, navigate anyway (auth state will update)
        navigate('/');
      }
    } catch (err) {
      console.error('Error checking profile:', err);
      // Navigate anyway, auth state will update
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center py-12 px-4">
      {isLogin ? (
        <LoginForm 
          onSuccess={handleSuccess}
          onSwitchToSignUp={() => {
            setIsLogin(false);
            navigate('/auth?mode=signup', { replace: true });
          }}
        />
      ) : (
        <SignUpForm 
          onSuccess={handleSuccess}
          onSwitchToSignIn={() => {
            setIsLogin(true);
            navigate('/auth?mode=login', { replace: true });
          }}
        />
      )}
    </div>
  );
};

export default AuthPage;

