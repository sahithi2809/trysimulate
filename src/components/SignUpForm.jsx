import React, { useState } from 'react';
import { authService } from '../services/authService';
import { activityService } from '../services/activityService';

const SignUpForm = ({ onSuccess, onSwitchToSignIn }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    userRole: '',
    howHeardAboutUs: '',
    marketingPurpose: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    // Trim email (allow numbers, letters, dots, hyphens, underscores, plus signs)
    const trimmedEmail = formData.email.trim().toLowerCase();
    // Basic validation - just check it has @ and a domain
    if (!trimmedEmail.includes('@') || trimmedEmail.split('@').length !== 2) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    
    const [localPart, domain] = trimmedEmail.split('@');
    if (!localPart || !domain || !domain.includes('.')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      await authService.signUp(trimmedEmail, formData.password, {
        fullName: formData.fullName,
        userRole: formData.userRole,
        howHeardAboutUs: formData.howHeardAboutUs,
        marketingPurpose: formData.marketingPurpose,
      });
      
      // Log signup activity (non-blocking)
      activityService.logActivity('page_viewed', {
        page: 'signup',
        method: 'email',
      }).catch(err => console.log('Activity log failed:', err));
      
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setLoading(true);
      await authService.signInWithGoogle();
      // Note: After Google OAuth, user will be redirected to callback
      // Profile completion will happen there if needed
    } catch (err) {
      setError(err.message || 'Failed to sign up with Google');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-center text-slate-900 mb-6">Create Account</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Password *
          </label>
          <input
            type="password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Confirm Password *
          </label>
          <input
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* User Role */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            I am a... *
          </label>
          <select
            value={formData.userRole}
            onChange={(e) => setFormData({ ...formData, userRole: e.target.value })}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select your role</option>
            <option value="hiring_manager">Hiring Manager</option>
            <option value="student">Student</option>
            <option value="professional">Professional</option>
            <option value="professor">Professor</option>
            <option value="recruiter">Recruiter</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* How did you hear about us */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            How did you hear about us? *
          </label>
          <select
            value={formData.howHeardAboutUs}
            onChange={(e) => setFormData({ ...formData, howHeardAboutUs: e.target.value })}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select an option</option>
            <option value="google_search">Google Search</option>
            <option value="social_media">Social Media</option>
            <option value="friend_referral">Friend/Colleague Referral</option>
            <option value="linkedin">LinkedIn</option>
            <option value="email_campaign">Email Campaign</option>
            <option value="blog_article">Blog Article</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Marketing Purpose */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            What would you like to use TrySimulate for?
            <span className="text-slate-400 text-xs ml-1">(Optional, for marketing insights)</span>
          </label>
          <textarea
            placeholder="e.g., Training my team, Personal skill development, Evaluating candidates..."
            value={formData.marketingPurpose}
            onChange={(e) => setFormData({ ...formData, marketingPurpose: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-slate-500">Or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={loading}
        className="w-full bg-white border-2 border-slate-300 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign up with Google
      </button>

      <p className="text-center text-sm text-slate-600 mt-6">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="text-primary hover:underline font-medium"
        >
          Sign in
        </button>
      </p>
    </div>
  );
};

export default SignUpForm;

