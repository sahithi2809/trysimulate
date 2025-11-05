import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    userRole: '',
    howHeardAboutUs: '',
    marketingPurpose: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!currentUser) {
          navigate('/auth');
          return;
        }
        
        setUser(currentUser);
        
        // Check if profile already exists
        try {
          const profile = await authService.getUserProfile(currentUser.id);
          if (profile && profile.user_role) {
            // Profile already complete, redirect
            navigate('/');
          } else {
            // Pre-fill if partial data exists
            setFormData({
              userRole: profile?.user_role || '',
              howHeardAboutUs: profile?.how_heard_about_us || '',
              marketingPurpose: profile?.marketing_purpose || '',
            });
          }
        } catch (err) {
          // Profile doesn't exist yet, that's fine
          console.log('No profile found, will create new one');
        }
      } catch (err) {
        console.error('Error loading user:', err);
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await authService.updateUserProfile(user.id, {
        user_role: formData.userRole,
        how_heard_about_us: formData.howHeardAboutUs,
        marketing_purpose: formData.marketingPurpose,
      });

      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-2">Complete Your Profile</h2>
        <p className="text-center text-slate-600 mb-6">Just a few more details to get started</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
              What would you like to use Simulate for?
              <span className="text-slate-400 text-xs ml-1">(Optional)</span>
            </label>
            <textarea
              placeholder="e.g., Training my team, Personal skill development..."
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
            disabled={saving}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;

