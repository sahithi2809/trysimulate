import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { recruiterService } from '../services/recruiterService';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabaseClient';

const CreatorDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [simulations, setSimulations] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRecruiter, setIsRecruiter] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      checkUserRole();
      loadSimulations();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const checkUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_role')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        // Allow both recruiter and hiring_manager to access
        const isRecruiterOrHiringManager = data.user_role === 'recruiter' || data.user_role === 'hiring_manager';
        setIsRecruiter(isRecruiterOrHiringManager);
        setUserProfile(data);
      }
    } catch (err) {
      console.error('Error checking user role:', err);
    }
  };

  const loadSimulations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const sims = await recruiterService.getMySimulations();
      
      // For each simulation, get participant count and analytics
      const simsWithStats = await Promise.all(
        sims.map(async (sim) => {
          try {
            const participants = await recruiterService.getSimulationParticipants(sim.id);
            const analytics = await recruiterService.getSimulationAnalytics(sim.id);
            return {
              ...sim,
              participantCount: participants.length,
              completedCount: analytics.completedParticipants,
              averageScore: analytics.averageScore,
              completionRate: analytics.completionRate
            };
          } catch (err) {
            console.error(`Error loading stats for ${sim.id}:`, err);
            return {
              ...sim,
              participantCount: 0,
              completedCount: 0,
              averageScore: 0,
              completionRate: 0
            };
          }
        })
      );
      
      setSimulations(simsWithStats);
    } catch (err) {
      console.error('Error loading simulations:', err);
      setError('Failed to load simulations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('product')) return '📦';
    if (cat.includes('marketing')) return '📊';
    if (cat.includes('sales')) return '💼';
    if (cat.includes('engineering')) return '⚙️';
    if (cat.includes('design')) return '🎨';
    return '🎯';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-12 shadow-lg border border-slate-200 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Please Sign In</h3>
            <p className="text-slate-600 mb-6">You need to be signed in to view your simulations.</p>
            <Link
              to="/auth?mode=login"
              className="inline-block px-6 py-3 text-white bg-primary rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isRecruiter && userProfile) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-12 shadow-lg border border-slate-200 text-center">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Recruiter Access Required</h3>
            <p className="text-slate-600 mb-6">
              This dashboard is only available for recruiters and hiring managers. Your current role is: <strong>{userProfile.user_role}</strong>
            </p>
            <Link
              to="/browse"
              className="inline-block px-6 py-3 text-white bg-primary rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Browse Simulations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">
                Recruiter Dashboard
              </h1>
              <p className="text-lg text-slate-600">
                View and manage your simulations, track candidate performance, and analyze results
              </p>
            </div>
            <Link
              to="/creator/build"
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create New Simulation
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        {simulations.length > 0 && (
          <div className="grid md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Total Simulations</div>
              <div className="text-3xl font-bold text-slate-900">{simulations.length}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Total Participants</div>
              <div className="text-3xl font-bold text-blue-600">
                {simulations.reduce((sum, s) => sum + (s.participantCount || 0), 0)}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Completed</div>
              <div className="text-3xl font-bold text-green-600">
                {simulations.reduce((sum, s) => sum + (s.completedCount || 0), 0)}
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Avg. Score</div>
              <div className="text-3xl font-bold text-purple-600">
                {simulations.length > 0
                  ? Math.round(
                      simulations.reduce((sum, s) => sum + (s.averageScore || 0), 0) / simulations.length
                    )
                  : 0}%
              </div>
            </div>
          </div>
        )}

        {/* Simulations List */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">My Simulations</h2>

          {loading ? (
            <div className="bg-white rounded-xl p-12 shadow-lg border border-slate-200 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-slate-600">Loading your simulations...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl p-12 shadow-lg border border-red-200 text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Simulations</h3>
              <p className="text-slate-600 mb-6">{error}</p>
              <button
                onClick={loadSimulations}
                className="px-6 py-3 text-white bg-primary rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Try Again
              </button>
            </div>
          ) : simulations.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-lg border border-slate-200 text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No simulations yet</h3>
              <p className="text-slate-600 mb-6">
                Create your first simulation to start evaluating candidates
              </p>
              <Link
                to="/creator/build"
                className="inline-flex items-center px-6 py-3 text-white bg-gradient-to-r from-primary to-accent rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Simulation
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {simulations.map((sim) => (
                <div
                  key={sim.id}
                  className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
                >
                  {/* Icon & Category */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-4xl">{getCategoryIcon(sim.category)}</div>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {sim.category || 'General'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {sim.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {sim.description || 'No description available'}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-xs text-slate-600 mb-1">Participants</div>
                      <div className="text-lg font-bold text-blue-600">{sim.participantCount || 0}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-xs text-slate-600 mb-1">Completed</div>
                      <div className="text-lg font-bold text-green-600">{sim.completedCount || 0}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="text-xs text-slate-600 mb-1">Avg. Score</div>
                      <div className="text-lg font-bold text-purple-600">
                        {sim.averageScore ? Math.round(sim.averageScore) : 'N/A'}%
                      </div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <div className="text-xs text-slate-600 mb-1">Completion</div>
                      <div className="text-lg font-bold text-orange-600">
                        {sim.completionRate ? Math.round(sim.completionRate) : 0}%
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => navigate(`/creator/simulation/${sim.id}`)}
                      className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-lg hover:shadow-md transition-all"
                    >
                      View Details
                    </button>
                    <Link
                      to={`/simulation/${sim.slug}`}
                      className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
                    >
                      Preview
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
