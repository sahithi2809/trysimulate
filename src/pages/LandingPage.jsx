import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
              Practice Real Work
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Master Real Skills
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10">
              The world's first platform to create, share, and experience workplace simulations.
              Build behavioral intelligence through AI-powered scenarios.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/browse"
                className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
              >
                Browse Simulations
              </Link>
              <Link
                to="/creator"
                className="px-8 py-4 text-lg font-semibold text-slate-700 bg-white border-2 border-slate-300 rounded-xl hover:border-primary hover:text-primary transition-all duration-200"
              >
                Create Your Own
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200">
              <div className="text-4xl font-bold text-primary mb-2">4</div>
              <div className="text-slate-600 font-medium">Simulation Types</div>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200">
              <div className="text-4xl font-bold text-primary mb-2">10+</div>
              <div className="text-slate-600 font-medium">Ready Scenarios</div>
            </div>
            <div className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200">
              <div className="text-4xl font-bold text-primary mb-2">AI</div>
              <div className="text-slate-600 font-medium">Powered Scoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How TrySimulate Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Whether you're a creator or a learner, TrySimulate makes workplace simulations accessible to everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* For Professionals */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                For Professionals & Learners
              </h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Browse simulations by category (PM, Sales, HR, Leadership)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Practice realistic workplace scenarios</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Get instant AI feedback and scoring</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Track progress and skill improvement</span>
                </li>
              </ul>
            </div>

            {/* For Creators */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                For Creators & Educators
              </h3>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Describe scenarios in natural language</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>AI generates complete simulations instantly</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Customize scoring rubrics and feedback</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Publish to TrySimulate library</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Simulation Types */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Four Simulation Types
            </h2>
            <p className="text-lg text-slate-600">
              Practice different workplace skills through interactive scenarios
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-2xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg mb-4"></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Customer Comments</h3>
              <p className="text-sm text-slate-600">
                Reply to customer feedback with empathy and provide solutions
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-2xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg mb-4"></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Sales Negotiation</h3>
              <p className="text-sm text-slate-600">
                Navigate pricing discussions while protecting value
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-2xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg mb-4"></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Prioritization</h3>
              <p className="text-sm text-slate-600">
                Drag-and-drop tasks to prioritize under time pressure
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-2xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg mb-4"></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Team Conflict</h3>
              <p className="text-sm text-slate-600">
                Resolve disagreements between team members diplomatically
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-accent">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Build Your Skills?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join TrySimulate today and start practicing real workplace scenarios.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/browse"
              className="px-8 py-4 text-lg font-semibold text-primary bg-white rounded-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
            >
              Start Practicing Now
            </Link>
            <Link
              to="/creator"
              className="px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              Create Simulations
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-400">
            © 2025 TrySimulate. Building the future of workplace learning.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

