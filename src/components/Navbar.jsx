import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, loading } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const isActive = (path) => location.pathname === path;

  const handleSignOut = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (signingOut) return; // Prevent multiple clicks
    
    try {
      setSigningOut(true);
      setShowMenu(false); // Close menu first
      
      await authService.signOut();
      
      // AuthContext will automatically update the state via onAuthStateChange
      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      alert('Failed to sign out. Please try again.');
      setSigningOut(false);
    }
  };

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

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center space-x-3">
            {loading ? (
              // Show buttons during loading (they'll work fine)
              <>
                <Link
                  to="/auth?mode=login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            ) : isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-slate-700">
                    {profile?.full_name || user?.email?.split('@')[0]}
                  </span>
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-slate-200">
                      <p className="text-sm font-semibold text-slate-900">{profile?.full_name || 'User'}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                    <Link
                      to="/creator"
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      onClick={() => setShowMenu(false)}
                    >
                      Creator Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {signingOut ? 'Signing out...' : 'Sign Out'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/auth?mode=login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-primary transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Click outside to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;

