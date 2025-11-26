import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const SlackSimulationLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <div className="text-6xl md:text-7xl mb-6">💬</div>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
              Slack Simulation
              <span className="block text-4xl md:text-5xl mt-2 text-pink-200">
                Conflict Management & Decision Making
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 leading-relaxed font-light max-w-3xl mx-auto mb-8">
              Experience a realistic Slack workspace where you play a Product Manager navigating workplace conflicts, stakeholder disagreements, and high-pressure decision-making scenarios.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <span className="bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-semibold border border-white/30">
                💼 Conflict Management
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-semibold border border-white/30">
                🎯 Decision Making
              </span>
              <span className="bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-semibold border border-white/30">
                ⏱️ 30-45 min
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/slack_simulation/start')}
                className="px-8 py-4 bg-white text-purple-700 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all duration-200 transform hover:scale-105 shadow-xl"
              >
                Try Simulation
              </button>
              <Link
                to="/browse"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-200"
              >
                Browse Other Simulations
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* What You'll Practice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">What You'll Practice</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Navigate realistic workplace conflicts and make strategic decisions under pressure
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-purple-100">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Stakeholder Management</h3>
            <p className="text-slate-600">
              Balance competing interests from engineering, design, sales, and leadership teams while keeping projects on track.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-pink-100">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Conflict Resolution</h3>
            <p className="text-slate-600">
              Handle disagreements diplomatically, mediate between team members, and find solutions that satisfy multiple stakeholders.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-purple-100">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Decision Making</h3>
            <p className="text-slate-600">
              Make critical product decisions under pressure, prioritize features, and communicate trade-offs effectively.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-pink-100">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Communication</h3>
            <p className="text-slate-600">
              Practice clear, professional communication in a Slack-like environment with real-time messaging and team interactions.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-purple-100">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">AI-Powered Scenarios</h3>
            <p className="text-slate-600">
              Experience dynamic, AI-generated responses from team members with distinct personalities and motivations.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-pink-100">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Performance Evaluation</h3>
            <p className="text-slate-600">
              Receive detailed feedback on your conflict management approach, decision quality, and communication effectiveness.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Enter the Workspace</h3>
              <p className="text-slate-600">
                You'll join a realistic Slack workspace as a Product Manager with access to multiple channels and direct messages.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Face Challenges</h3>
              <p className="text-slate-600">
                Random scenarios will appear - from sales promises to design delays to technical debt debates. Navigate these conflicts in real-time.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Get Evaluated</h3>
              <p className="text-slate-600">
                After resolving a scenario, receive AI-powered feedback on your approach, decision-making, and communication skills.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-4">Ready to Test Your Skills?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Step into a realistic workplace scenario and practice conflict management in a safe, interactive environment.
          </p>
          <button
            onClick={() => navigate('/slack_simulation/start')}
            className="px-10 py-4 bg-white text-purple-700 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all duration-200 transform hover:scale-105 shadow-xl"
          >
            Start Simulation
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlackSimulationLanding;

