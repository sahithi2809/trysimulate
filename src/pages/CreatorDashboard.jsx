import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCustomSimulations, deleteCustomSimulation } from '../utils/storage';

const CreatorDashboard = () => {
  const [customSimulations, setCustomSimulations] = useState([]);

  useEffect(() => {
    loadSimulations();
  }, []);

  const loadSimulations = () => {
    setCustomSimulations(getCustomSimulations());
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this simulation?')) {
      deleteCustomSimulation(id);
      loadSimulations();
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'customer-comments':
        return '💬';
      case 'sales-negotiation':
        return '💼';
      case 'prioritization':
        return '📋';
      case 'team-conflict':
        return '👥';
      default:
        return '🎯';
    }
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

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
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

          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-600 mb-1">AI-Generated</div>
                <div className="text-3xl font-bold text-slate-900">{customSimulations.length}</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* My Simulations */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">My Simulations</h2>

          {customSimulations.length === 0 ? (
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
                    <div className="text-4xl">{getTypeIcon(sim.type)}</div>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {sim.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {sim.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {sim.description}
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
                      {sim.created}
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
                      {sim.duration}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-slate-200">
                    <Link
                      to={`/simulation/${sim.type}/${sim.id}`}
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

