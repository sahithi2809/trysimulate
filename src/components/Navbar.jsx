import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              TrySimulate
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/browse"
              className={`text-sm font-medium transition-colors ${
                isActive('/browse')
                  ? 'text-primary'
                  : 'text-slate-600 hover:text-primary'
              }`}
            >
              Browse Simulations
            </Link>
            <Link
              to="/creator"
              className={`text-sm font-medium transition-colors ${
                isActive('/creator')
                  ? 'text-primary'
                  : 'text-slate-600 hover:text-primary'
              }`}
            >
              Creator Dashboard
            </Link>
          </div>

          {/* Auth Buttons (Placeholder) */}
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-primary transition-colors">
              Login
            </button>
            <button className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

