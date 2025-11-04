import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { databaseService } from '../services/databaseService';
import { useAuth } from '../contexts/AuthContext';

const CreatorDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [customSimulations, setCustomSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadSimulations();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadSimulations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const simulations = await databaseService.getUserSimulations();
      setCustomSimulations(simulations);
    } catch (err) {
      console.error('Error loading simulations:', err);
      setError('Failed to load simulations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this simulation?')) {
      try {
        await databaseService.deleteSimulation(id);
        loadSimulations(); // Reload after deletion
      } catch (err) {
        console.error('Error deleting simulation:', err);
        alert('Failed to delete simulation. Please try again.');
      }
    }
  };

  const getTypeIcon = (category) => {
    // Use category for AI-generated simulations
    if (category) {
      const cat = category.toLowerCase();
      if (cat.includes('customer') || cat.includes('service')) return '💬';
      if (cat.includes('sales')) return '💼';
      if (cat.includes('priorit') || cat.includes('management')) return '📋';
      if (cat.includes('team') || cat.includes('conflict')) return '👥';
      if (cat.includes('product')) return '📦';
      if (cat.includes('leadership')) return '👔';
      if (cat.includes('marketing')) return '📢';
      if (cat.includes('hr') || cat.includes('human')) return '👤';
    }
    return '🎯';
  };

  const getSimulationPath = (sim) => {
    // All database simulations are HTML-based AI-generated
    if (sim.is_ai_generated || sim.html_content) {
      return `/simulation/html/${sim.id}`;
    }
    // Fallback (shouldn't happen for database simulations)
    return `/simulation/custom/${sim.id}`;
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Creator Dashboard
          </h1>
          <p className="text-lg text-slate-600">
            Build and manage your workplace simulations with AI assistance
          </p>
        </div>

        {/* Create New Button */}
        {isAuthenticated && (
          <Link
            to="/creator/build"
            className="inline-flex items-center px-8 py-4 mb-10 text-lg font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
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
        )}

        {/* Stats - Only show when authenticated */}
        {isAuthenticated && (
          <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 mb-1">Total Simulations</div>
                <div className="text-3xl font-bold text-slate-900">{customSimulations.length}</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 mb-1">Published</div>
                <div className="text-3xl font-bold text-slate-900">{customSimulations.length}</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* My Simulations */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            {isAuthenticated ? 'My Simulations' : 'Get Started'}
          </h2>

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
          ) : !isAuthenticated ? (
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
          ) : customSimulations.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-lg border border-slate-200 text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                No simulations yet
              </h3>
              <p className="text-slate-600 mb-6">
                Create your first simulation using our AI-powered builder
              </p>
              <Link
                to="/creator/build"
                className="inline-flex items-center px-6 py-3 text-white bg-gradient-to-r from-primary to-accent rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Your First Simulation
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customSimulations.map((sim) => (
                <div
                  key={sim.id}
                  className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
                >
                  {/* Icon & Type */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-4xl">{getTypeIcon(sim.category)}</div>
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

                  {/* Meta */}
                  <div className="flex items-center text-xs text-slate-500 mb-4">
                    <span className="flex items-center mr-4">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {sim.created_at ? new Date(sim.created_at).toLocaleDateString() : 'Recently'}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {sim.duration || '15-20 min'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-slate-200">
                    <Link
                      to={getSimulationPath(sim)}
                      className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-lg hover:shadow-md transition-all text-center"
                    >
                      Try Simulation
                    </Link>
                    <button
                      onClick={() => handleDelete(sim.id)}
                      className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="mt-10 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-8 border border-primary/20">
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            💡 Tips for Creating Great Simulations
          </h3>
          <ul className="space-y-2 text-slate-700">
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Describe scenarios clearly with specific roles and contexts</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Include realistic workplace challenges and decision points</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Define clear scoring criteria aligned with learning objectives</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">•</span>
              <span>Test your simulation before publishing to ensure quality</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;

