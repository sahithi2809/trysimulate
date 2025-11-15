import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { databaseService } from '../services/databaseService';

const BrowseSimulations = () => {
  const [simulations, setSimulations] = useState([]);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSimulations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Loading simulations from database...');
        
        // Load all published simulations from database
        const dbSimulations = await databaseService.getAllSimulations();
        console.log('✅ Loaded simulations from database:', dbSimulations.length);
        
        // Add Noah simulation (task-based demo)
        const noahSimulation = {
          id: 'noah-demo',
          title: 'Noah Smart Fitness Watch - Product Management',
          description: 'End-to-end product management simulation: from market research to post-launch analytics. Practice real PM skills with 7 comprehensive tasks.',
          category: 'Product Management',
          difficulty: 'Intermediate',
          duration: '6-8 hours',
          is_ai_generated: false,
          isDefault: false,
          isTaskBased: true // Flag to identify task-based simulation
        };
        
        // Combine Noah simulation with database results (Noah first)
        setSimulations([noahSimulation, ...dbSimulations]);
        
      } catch (err) {
        console.error('❌ Error loading from database:', err);
        setError('Failed to load simulations. Please refresh the page.');
        // Still show Noah simulation even if DB fails
        const noahSimulation = {
          id: 'noah-demo',
          title: 'Noah Smart Fitness Watch - Product Management',
          description: 'End-to-end product management simulation: from market research to post-launch analytics. Practice real PM skills with 7 comprehensive tasks.',
          category: 'Product Management',
          difficulty: 'Intermediate',
          duration: '6-8 hours',
          is_ai_generated: false,
          isDefault: false,
          isTaskBased: true
        };
        setSimulations([noahSimulation]);
      } finally {
        setLoading(false);
      }
    };

    loadSimulations();
  }, []);

  const categories = ['All', 'Product Management', 'Sales', 'Leadership', 'Marketing', 'HR'];

  const filteredSimulations = simulations.filter((sim) => {
    const matchesCategory = filter === 'All' || sim.category === filter;
    const matchesSearch =
      searchQuery === '' ||
      sim.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sim.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-700';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'Advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getSimulationPath = (sim) => {
    // Task-based simulation (Noah demo) - goes to landing page
    if (sim.isTaskBased || sim.id === 'noah-demo') {
      return '/demosimulation';
    }
    // All database simulations are HTML-based AI-generated
    if (sim.is_ai_generated || sim.html_content) {
      return `/simulation/html/${sim.id}`;
    }
    // Fallback (shouldn't happen for database simulations)
    return `/simulation/custom/${sim.id}`;
  };

  const getTypeIcon = (sim) => {
    // Task-based simulation (Noah)
    if (sim.isTaskBased || sim.id === 'noah-demo') {
      return '🏥';
    }
    // All database simulations are AI-generated
    if (sim.is_ai_generated) {
      return '🤖';
    }
    // Use category to determine icon
    if (sim.category) {
      const cat = sim.category.toLowerCase();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg text-slate-600">Loading simulations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Error message if database failed */}
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.725-1.36 3.49 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Browse Simulations
          </h1>
          <p className="text-lg text-slate-600">
            Choose a simulation to practice real-world workplace skills
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search simulations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 pl-12 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-3.5 w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  filter === cat
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-slate-600">
          Showing <span className="font-semibold text-slate-900">{filteredSimulations.length}</span> simulation
          {filteredSimulations.length !== 1 ? 's' : ''}
        </div>

        {/* Simulations Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSimulations.map((sim) => (
            <div
              key={sim.id}
              className="group bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-2xl hover:border-primary transition-all duration-200 transform hover:scale-105"
            >
              {/* Icon & Category */}
              <div className="flex justify-between items-start mb-4">
                <div className="text-4xl">{getTypeIcon(sim)}</div>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                  {sim.category}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                {sim.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {sim.description}
              </p>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-xs">
                <span
                  className={`px-3 py-1 rounded-full font-semibold ${getDifficultyColor(
                    sim.difficulty
                  )}`}
                >
                  {sim.difficulty}
                </span>
                <span className="text-slate-500 flex items-center">
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

              {/* Try Simulation Button */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <Link
                  to={getSimulationPath(sim)}
                  className="block w-full py-2 px-4 text-center text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
                >
                  Try Simulation
                </Link>
              </div>

              {/* Custom Badge */}
              {!sim.isDefault && (
                <div className="mt-2">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                    Custom Simulation
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredSimulations.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              No simulations found
            </h3>
            <p className="text-slate-600 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setFilter('All');
                setSearchQuery('');
              }}
              className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseSimulations;

