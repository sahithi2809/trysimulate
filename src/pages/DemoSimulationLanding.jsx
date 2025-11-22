import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { companyInfo } from '../data/demoSimulationData';
import { taskBasedService } from '../services/taskBasedService';

const DemoSimulationLanding = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSimulation = async () => {
      try {
        setLoading(true);
        const simulationSlug = slug || 'noah-smart-fitness-watch';
        
        try {
          const sim = await taskBasedService.getSimulationBySlug(simulationSlug);
          if (sim) {
            setSimulation(sim);
          }
        } catch (error) {
          console.warn('Could not load simulation from database:', error);
          // Continue with default companyInfo
        }
      } catch (error) {
        console.error('Error loading simulation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSimulation();
  }, [slug]);

  const handleStartSimulation = () => {
    const simulationSlug = slug || 'noah-smart-fitness-watch';
    if (simulationSlug) {
      navigate(`/simulation/${simulationSlug}/start`);
    } else {
      navigate('/demosimulation/start');
    }
  };

  const currentCompanyInfo = simulation?.company_info || companyInfo;
  const simulationTitle = simulation?.title || 'Noah Smart Fitness Watch - Product Management';
  const simulationDescription = simulation?.description || 'End-to-end product management simulation...';
  
  // Detect if this is Argo simulation (different branding)
  const isArgo = simulation?.slug === 'argo-marketing-foundations' || 
                 currentCompanyInfo?.name === 'Argo' ||
                 simulation?.category === 'Marketing';
  
  // Use purple/pink for Argo, blue for Noah
  const primaryGradient = isArgo 
    ? 'from-purple-600 to-pink-600' 
    : 'from-primary to-accent';
  const primaryGradientLight = isArgo
    ? 'from-purple-50 to-pink-50'
    : 'from-blue-50 to-indigo-50';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Navbar />

      {/* Hero Section with Gradient Background */}
      <div className={`relative overflow-hidden bg-gradient-to-r ${primaryGradient} text-white`}>
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span className="text-2xl">{currentCompanyInfo.logo || '🏢'}</span>
                <span>{(currentCompanyInfo.name || companyInfo.name).toUpperCase()}</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
                {isArgo ? 'Marketing Foundations' : 'Smart Fitness Watch'}
                <span className={`block text-4xl md:text-5xl mt-2 ${isArgo ? 'text-pink-200' : 'text-blue-200'}`}>
                  {isArgo ? 'Marketing Simulation' : 'Product Management'}
                </span>
              </h1>
              
              <p className={`text-xl md:text-2xl ${isArgo ? 'text-purple-100' : 'text-blue-100'} leading-relaxed font-light`}>
                {simulationDescription}
              </p>
              
              <div className="flex flex-wrap gap-3">
                <span className="bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-semibold border border-white/30">
                  {isArgo ? '📊 Marketing' : '📦 Product Management'}
                </span>
                <span className="bg-green-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg">
                  ✓ Free
                </span>
                <span className="bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-semibold border border-white/30">
                  ⏱️ {simulation?.estimated_duration || (isArgo ? '50-60 min' : '6-8 hours')}
                </span>
              </div>
            </div>

            {/* Right Side - CTA Card */}
            <div className="bg-white text-gray-900 rounded-2xl shadow-2xl p-8 max-w-md transform hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-full inline-block mb-6 shadow-lg">
                ✨ AVAILABLE NOW
              </div>
                <h3 className={`text-3xl font-bold mb-6 bg-gradient-to-r ${primaryGradient} bg-clip-text text-transparent`}>
                  {simulationTitle}
                </h3>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700 leading-relaxed">Complete work that simulates life on the job. <strong>6-8 hours</strong> and self-paced.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <span className="text-gray-700 leading-relaxed">Earn a <strong>certificate</strong> and add it to your resume and LinkedIn.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <span className="text-gray-700 leading-relaxed">Stand out in applications. Build <strong>confidence</strong> to ace interviews.</span>
                </li>
              </ul>
              <button
                onClick={handleStartSimulation}
                className={`w-full bg-gradient-to-r ${primaryGradient} text-white py-4 px-6 rounded-xl font-bold text-lg ${isArgo ? 'hover:from-purple-700 hover:to-pink-700' : 'hover:from-blue-700 hover:to-blue-600'} transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105`}
              >
                Try Simulation →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-8">
            <a href="#overview" className="py-5 border-b-3 border-blue-600 text-blue-600 font-semibold flex items-center gap-2 text-sm">
              Overview
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#about" className="py-5 text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm">About Us</a>
            <a href="#tasks" className="py-5 text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm">Tasks</a>
            <a href="#reviews" className="py-5 text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm">Reviews</a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Left Column - Main Content */}
          <div className="md:col-span-2 space-y-16">
            {/* Why Complete Section */}
            <section id="overview" className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 bg-gradient-to-br ${primaryGradient} rounded-xl flex items-center justify-center`}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-gray-900">Why complete this Job Simulation</h2>
              </div>
              
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                A <strong className="text-blue-600">risk-free way</strong> to experience work on the job. Practice your skills with example tasks 
                and build your confidence to ace your applications.
              </p>
              
              <div className="flex flex-wrap gap-4 text-base text-gray-600 mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <span className="font-semibold text-gray-900">Self-paced <span className="text-blue-600">6-8 hours</span></span>
                <span className="text-gray-400">•</span>
                <span>No grades</span>
                <span className="text-gray-400">•</span>
                <span>No assessments</span>
                <span className="text-gray-400">•</span>
                <span className="font-semibold">Intermediate</span>
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  Welcome to the {simulationTitle}!
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {simulationDescription || 'We are thrilled to have you here. This simulation will take you through the complete product development lifecycle.'}
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  <strong className="text-gray-900">{currentCompanyInfo.fullName || currentCompanyInfo.name}</strong> {currentCompanyInfo.description || 'is a company building innovative products, and you\'ll lead the product management for this exciting new venture.'}
                </p>
                <a href="#tasks" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-lg group">
                  View All Tasks
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </section>

            {/* How it Works */}
            <section className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-gray-900">How it works</h2>
              </div>
              
              <div className="space-y-8">
                <div className="flex gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Self-Paced Learning</h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      Complete tasks guided by detailed instructions and example answers. No live sessions, all self-paced.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Earn a Certificate</h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      Earn a certificate and add it to your resume and LinkedIn as an extracurricular activity.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex-shrink-0">
                    <div className={`w-16 h-16 bg-gradient-to-br ${primaryGradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Stand Out</h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      Stand out in applications. Confidently answer interview questions and explain why you're a good fit for the job.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Tasks Preview */}
            <section id="tasks" className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-4xl font-bold text-gray-900">Tasks in this program</h2>
              </div>
              
              <div className="space-y-4">
                {[
                  { num: 0, title: 'Introduction & Onboarding', desc: 'Meet your role, company context, and simulation overview', time: '5 min', level: 'Overview' },
                  { num: 1, title: 'Market Research', desc: 'Define target segments, user needs, and competitive analysis', time: '60-90 min', level: 'Intermediate' },
                  { num: 2, title: 'Team & Tech Stack', desc: 'Plan team composition and technology choices', time: '30-45 min', level: 'Intermediate' },
                  { num: 3, title: 'Roadmap & Phases', desc: 'Create development roadmap with phases and timelines', time: '30-45 min', level: 'Intermediate' },
                  { num: 4, title: 'Wireframe Design', desc: 'Design key user interface screens', time: '30-60 min', level: 'Intermediate' },
                  { num: 5, title: 'GTM Strategy', desc: 'Plan go-to-market and partnerships', time: '45-60 min', level: 'Intermediate' },
                  { num: 6, title: 'Post-Launch Analytics', desc: 'Analyze data and respond to customers', time: '60-90 min', level: 'Intermediate' },
                  { num: 7, title: 'Final Submission', desc: 'Consolidate report and create pitch', time: '30-45 min', level: 'Intermediate' }
                ].map((task, idx) => (
                  <div 
                    key={task.num}
                    className={`border-2 rounded-xl p-6 transition-all hover:shadow-lg ${
                      idx === 0 
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50' 
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                        idx === 0 
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                          : 'bg-gradient-to-br from-gray-400 to-gray-500'
                      }`}>
                        {task.num}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
                    </div>
                    <p className="text-gray-700 mb-3 leading-relaxed">{task.desc}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">⏱️ {task.time}</span>
                      <span className="text-gray-400">•</span>
                      <span className="font-semibold text-gray-600">{task.level}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews Section */}
            <section id="reviews" className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
              <div className="flex flex-col md:flex-row items-start gap-12">
                <div className="flex-shrink-0">
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">Reviews</h2>
                  <p className="text-2xl font-bold text-gray-600 mb-2">Over 100+</p>
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400 text-2xl">
                      {'★★★★★'.split('').map((star, i) => (
                        <span key={i}>{star}</span>
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-gray-700">5 Star Reviews</span>
                  </div>
                </div>
                <div className="flex-1 border-l-2 border-gray-200 pl-8 md:pl-12">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                    <svg className="w-12 h-12 text-blue-500 mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-lg text-gray-700 italic mb-6 leading-relaxed">
                      "This simulation gave me practical exposure to real product management workflows. 
                      I understood the real-time commitments to the industry and how to approach complex 
                      product decisions systematically."
                    </p>
                    <p className="text-base font-semibold text-gray-900">- Product Management Student</p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="md:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Skills Section */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 bg-gradient-to-br ${primaryGradient} rounded-lg flex items-center justify-center`}>
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Skills you will learn</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {['Product Sense', 'Technical Feasibility', 'Teaming & Planning', 'UX Design', 'GTM Strategy', 'Data Insights', 'Communication'].map((skill) => (
                    <span key={skill} className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700 rounded-lg text-sm font-semibold border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
                      {skill}
                    </span>
                  ))}
                </div>
                <a href="#skills" className="inline-flex items-center gap-2 text-blue-600 text-sm mt-6 font-semibold hover:text-blue-700 group">
                  View All
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className={`bg-gradient-to-r ${primaryGradient} text-white py-16 mt-16`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h3 className="text-3xl font-bold mb-3">Do not like the Simulation?</h3>
              <p className="text-xl text-blue-100">Explore other simulations to find your perfect fit.</p>
            </div>
            <Link
              to="/browse"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all flex items-center gap-3 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Browse Other Simulations
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoSimulationLanding;
