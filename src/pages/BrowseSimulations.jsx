import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllSimulations } from '../utils/storage';

const BrowseSimulations = () => {
  const [simulations, setSimulations] = useState([]);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSimulations(getAllSimulations());
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
    return `/simulation/${sim.type}/${sim.id}`;
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
                <div className="text-4xl">{getTypeIcon(sim.type)}</div>
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

