import React, { useState, useEffect } from 'react';
import { getAllTaskData, getProgress } from '../../utils/demoStorage';
import { validateTask1, validateTask2, validateTask3, validateTask4, validateTask5, validateTask6, validateTask7, calculateFinalScore, calculateSkillBreakdown } from '../../utils/demoValidation';
import { validateArgoTask1, validateArgoTask2, validateArgoTask3, validateArgoTask4, validateArgoTask5 } from '../../utils/demoValidation';
import { companyInfo } from '../../data/demoSimulationData';
import { taskBasedService } from '../../services/taskBasedService';
import jsPDF from 'jspdf';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const FinalReportCard = ({ onClose, simulation, sessionId, simulationId, usingBackend = false }) => {
  const [taskScores, setTaskScores] = useState({});
  const [finalScore, setFinalScore] = useState(0);
  const [skillBreakdown, setSkillBreakdown] = useState({});
  const [strengths, setStrengths] = useState([]);
  const [improvements, setImprovements] = useState([]);
  const [resumeSnippet, setResumeSnippet] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true);

        if (usingBackend && simulationId && sessionId) {
          // Load from backend
          const progress = await taskBasedService.getProgress(simulationId, sessionId);
          const submissions = await taskBasedService.getTaskSubmissions(simulationId, sessionId);

          if (progress && submissions) {
            // Use backend data
            setFinalScore(progress.final_score || 0);
            setSkillBreakdown(progress.skill_breakdown || {});
            setResumeSnippet(progress.resume_snippet || '');

            // Convert submissions to taskScores format
            const scores = {};
            submissions.forEach(sub => {
              scores[sub.task_id] = {
                score: sub.score || 0,
                breakdown: sub.score_breakdown || {},
                strengths: sub.strengths || [],
                improvements: sub.improvements || []
              };
            });
            setTaskScores(scores);

            // Aggregate strengths and improvements
            const allStrengths = [];
            const allImprovements = [];
            submissions.forEach(sub => {
              if (sub.strengths) allStrengths.push(...sub.strengths);
              if (sub.improvements) allImprovements.push(...sub.improvements);
            });
            setStrengths([...new Set(allStrengths)].slice(0, 3));
            setImprovements([...new Set(allImprovements)].slice(0, 3));
          } else {
            // Fallback to localStorage
            loadFromLocalStorage();
          }
        } else {
          // Use localStorage
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error('Error loading report data:', error);
        // Fallback to localStorage
        loadFromLocalStorage();
      } finally {
        setLoading(false);
      }
    };

    const loadFromLocalStorage = () => {
      const allData = getAllTaskData();
      
      // Detect if this is Argo simulation (different validators)
      const isArgo = simulation?.slug === 'argo-marketing-foundations' || 
                     simulation?.company_info?.name === 'Argo' ||
                     simulation?.category === 'Marketing';
      
      // Validate all tasks based on simulation type
      let scores = {};
      if (isArgo) {
        // Use Argo validators
        scores = {
          task1: validateArgoTask1(allData.task1 || {}),
          task2: validateArgoTask2(allData.task2 || {}),
          task3: validateArgoTask3(allData.task3 || {}),
          task4: validateArgoTask4(allData.task4 || {}),
          task5: validateArgoTask5(allData.task5 || {})
        };
      } else {
        // Use Noah validators (default)
        scores = {
          task1: validateTask1(allData.task1 || {}),
          task2: validateTask2(allData.task2 || {}),
          task3: validateTask3(allData.task3 || {}),
          task4: validateTask4(allData.task4 || {}),
          task5: validateTask5(allData.task5 || {}),
          task6: validateTask6(allData.task6 || {}),
          task7: validateTask7(allData.task7 || {})
        };
      }

      setTaskScores(scores);
      const final = calculateFinalScore(scores);
      setFinalScore(final);
      const skills = calculateSkillBreakdown(scores);
      setSkillBreakdown(skills);

      // Generate strengths and improvements
      const allStrengths = [];
      const allImprovements = [];
      Object.values(scores).forEach(result => {
        if (result.strengths) allStrengths.push(...result.strengths);
        if (result.improvements) allImprovements.push(...result.improvements);
      });
      setStrengths([...new Set(allStrengths)].slice(0, 3));
      setImprovements([...new Set(allImprovements)].slice(0, 3));

      // Generate resume snippet
      const topSkills = Object.entries(skills)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([skill]) => skill);
      
      const companyName = simulation?.company_info?.fullName || simulation?.company_info?.name || 'Noah Healthcare';
      setResumeSnippet(
        `Led end-to-end product development for ${companyName} ${simulation?.title || 'Smart Fitness Watch'}, demonstrating expertise in ${topSkills.join(', ')}. ` +
        `Achieved ${final}/100 overall score across market research, team planning, roadmap development, UX design, GTM strategy, and post-launch analytics.`
      );
    };

    loadReportData();
  }, [usingBackend, simulationId, sessionId, simulation]);

  const downloadCertificate = () => {
    const doc = new jsPDF('landscape', 'pt', [1200, 800]);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Get company info
    const currentCompanyInfo = simulation?.company_info || companyInfo;
    const simulationTitle = simulation?.title || 'Smart Fitness Watch Product Management Simulation';

    // Gradient background (simulated with rectangles) - different colors for Argo vs Noah
    const isArgo = simulation?.slug === 'argo-marketing-foundations' || 
                   currentCompanyInfo?.name === 'Argo' ||
                   simulation?.category === 'Marketing';
    
    if (isArgo) {
      // Purple/pink gradient for Argo
      doc.setFillColor(147, 51, 234); // purple-600 (#9333ea)
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.setFillColor(219, 39, 119); // pink-600 (#db2777)
      doc.rect(0, 0, pageWidth, pageHeight * 0.6, 'F');
    } else {
      // Blue gradient for Noah
      doc.setFillColor(37, 99, 235); // primary (#2563eb)
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.setFillColor(59, 130, 246); // accent (#3b82f6)
      doc.rect(0, 0, pageWidth, pageHeight * 0.6, 'F');
    }

    // Decorative border
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(8);
    doc.rect(40, 40, pageWidth - 80, pageHeight - 80, 'S');

    // White content area
    doc.setFillColor(255, 255, 255);
    doc.rect(60, 60, pageWidth - 120, pageHeight - 120, 'F');

    // Decorative elements
    if (isArgo) {
      doc.setFillColor(147, 51, 234); // purple-600
      doc.circle(pageWidth - 150, 150, 60, 'F');
      doc.setFillColor(219, 39, 119); // pink-600
      doc.circle(150, pageHeight - 150, 60, 'F');
    } else {
      doc.setFillColor(37, 99, 235); // primary
      doc.circle(pageWidth - 150, 150, 60, 'F');
      doc.setFillColor(59, 130, 246); // accent
      doc.circle(150, pageHeight - 150, 60, 'F');
    }

    // Title
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(42);
    doc.setFont('helvetica', 'bold');
    doc.text('Certificate of Completion', pageWidth / 2, 180, { align: 'center' });

    // Company
    doc.setFontSize(24);
    doc.setFont('helvetica', 'normal');
    doc.text(`${currentCompanyInfo.fullName || currentCompanyInfo.name || 'Company'}`, pageWidth / 2, 230, { align: 'center' });

    // Simulation name
    doc.setFontSize(20);
    doc.text(simulationTitle, pageWidth / 2, 270, { align: 'center' });

    // Score with decorative box
    if (isArgo) {
      doc.setFillColor(219, 39, 119); // pink-600
    } else {
      doc.setFillColor(59, 130, 246); // accent
    }
    doc.roundedRect(pageWidth / 2 - 150, 320, 300, 100, 10, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'normal');
    doc.text('Final Score', pageWidth / 2, 350, { align: 'center' });
    doc.setFontSize(48);
    doc.setFont('helvetica', 'bold');
    doc.text(`${finalScore}/100`, pageWidth / 2, 390, { align: 'center' });

    // Date
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(`Completed on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, 480, { align: 'center' });

    // Signature line
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text('This certificate verifies successful completion of the simulation.', pageWidth / 2, 550, { align: 'center' });
    doc.text('Add this achievement to your resume and LinkedIn profile.', pageWidth / 2, 570, { align: 'center' });

    // Decorative line
    if (isArgo) {
      doc.setDrawColor(219, 39, 119); // pink-600
    } else {
      doc.setDrawColor(59, 130, 246); // accent
    }
    doc.setLineWidth(2);
    doc.line(pageWidth / 2 - 200, 620, pageWidth / 2 + 200, 620);

    const fileName = isArgo ? 'argo-simulation-certificate.pdf' : 'noah-simulation-certificate.pdf';
    doc.save(fileName);
  };

  const copyResumeSnippet = () => {
    navigator.clipboard.writeText(resumeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const taskNames = {
    task1: 'Market Research',
    task2: 'Team & Tech Stack',
    task3: 'Roadmap & Phases',
    task4: 'Wireframe Design',
    task5: 'GTM Strategy',
    task6: 'Post-Launch Analytics',
    task7: 'Final Submission'
  };

  const taskData = Object.entries(taskScores).map(([taskId, result]) => ({
    name: taskNames[taskId] || taskId,
    score: result.score,
    fullScore: 100
  }));

  const skillNames = Object.keys(skillBreakdown);
  const skillValues = Object.values(skillBreakdown);
  const maxSkill = Math.max(...skillValues, 100);

  const skillData = skillNames.map((name, idx) => ({
    name,
    value: skillValues[idx]
  }));

  const COLORS = ['#3b82f6', '#2563eb', '#1d4ed8', '#10b981', '#f59e0b', '#06b6d4'];

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-blue-500 to-indigo-600';
    if (score >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-600';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading report...</div>
        </div>
      </div>
    );
  }

  const currentCompanyInfo = simulation?.company_info || companyInfo;
  const simulationTitle = simulation?.title || 'Smart Fitness Watch Product Management Simulation';
  
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
  const primaryBorder = isArgo
    ? 'border-purple-200'
    : 'border-blue-200';
  const primaryBg = isArgo
    ? 'bg-purple-600'
    : 'bg-blue-600';
  const primaryHover = isArgo
    ? 'hover:from-purple-700 hover:to-pink-700'
    : 'hover:from-blue-700 hover:to-blue-600';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${isArgo ? 'from-slate-50 via-purple-50 to-pink-50' : 'from-slate-50 via-blue-50 to-cyan-50'} p-6`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Certificate Section */}
        <div className={`bg-gradient-to-r ${primaryGradient} rounded-3xl shadow-2xl p-12 text-center text-white relative overflow-hidden`}>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
          
          <div className="relative z-10">
            <div className="mb-8">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-5xl mx-auto mb-6 shadow-lg">
                {currentCompanyInfo.logo || '🏢'}
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Certificate of Completion</h1>
              <p className={`text-2xl ${isArgo ? 'text-purple-100' : 'text-blue-100'} mb-2`}>{currentCompanyInfo.fullName || currentCompanyInfo.name || 'Company'}</p>
              <p className={`text-lg ${isArgo ? 'text-pink-200' : 'text-blue-200'} mb-8`}>{simulationTitle}</p>
              
              <div className="inline-block bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-6 mb-6 border-2 border-white/30">
                <div className={`text-sm ${isArgo ? 'text-purple-100' : 'text-blue-100'} mb-2 uppercase tracking-wide`}>Final Score</div>
                <div className={`text-6xl font-bold bg-gradient-to-r ${getScoreColor(finalScore)} bg-clip-text text-transparent`}>
                  {finalScore}
                </div>
                <div className={`text-2xl ${isArgo ? 'text-purple-100' : 'text-blue-100'} mt-2`}>/ 100</div>
                <div className="text-lg font-semibold text-white mt-3">{getScoreLabel(finalScore)}</div>
              </div>
              
              <p className={`text-sm ${isArgo ? 'text-purple-100' : 'text-blue-100'}`}>Completed on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <button
              onClick={downloadCertificate}
              className={`px-8 py-4 bg-white ${isArgo ? 'text-purple-600 hover:bg-purple-50' : 'text-primary hover:bg-blue-50'} rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all flex items-center gap-3 mx-auto`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF Certificate
            </button>
          </div>
        </div>

        {/* Performance Report */}
        <div className="bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900">Performance Report Card</h2>
              <p className="text-gray-600 mt-1">Detailed breakdown of your performance across all tasks</p>
            </div>
          </div>

          {/* Overall Score Summary */}
          <div className={`mb-10 p-8 bg-gradient-to-r ${primaryGradientLight} rounded-2xl border-2 ${primaryBorder}`}>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2 uppercase tracking-wide font-semibold">Overall Score</div>
                <div className={`text-5xl font-bold bg-gradient-to-r ${getScoreColor(finalScore)} bg-clip-text text-transparent`}>
                  {finalScore}
                </div>
                <div className="text-xl text-gray-600 mt-1">/ 100</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2 uppercase tracking-wide font-semibold">Performance</div>
                <div className="text-3xl font-bold text-gray-900">{getScoreLabel(finalScore)}</div>
                <div className="text-sm text-gray-500 mt-2">Keep up the great work!</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2 uppercase tracking-wide font-semibold">Tasks Completed</div>
                <div className="text-3xl font-bold text-gray-900">{Object.keys(taskScores).length}</div>
                <div className="text-sm text-gray-500 mt-2">out of {Object.keys(taskScores).length} tasks</div>
              </div>
            </div>
          </div>

          {/* Task Scores with Chart */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Task Scores</h3>
            </div>
            
            {/* Bar Chart */}
            <div className="mb-8 p-6 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={taskData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis stroke="#6b7280" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #3b82f6', 
                      borderRadius: '12px',
                      padding: '12px'
                    }}
                    labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="score" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                    {taskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Task List */}
            <div className="space-y-4">
              {Object.entries(taskScores).map(([taskId, result], idx) => (
                <div key={taskId} className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg bg-gradient-to-br ${getScoreColor(result.score)}`}>
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">{taskNames[taskId] || taskId}</h4>
                        <p className="text-sm text-gray-600">{getScoreLabel(result.score)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold bg-gradient-to-r ${getScoreColor(result.score)} bg-clip-text text-transparent`}>
                        {result.score}
                      </div>
                      <div className="text-sm text-gray-600">/ 100</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                    <div
                      className={`h-4 rounded-full bg-gradient-to-r ${getScoreColor(result.score)} transition-all duration-1000 shadow-lg`}
                      style={{ width: `${result.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Breakdown */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Skill Breakdown</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Pie Chart */}
              <div className={`p-6 bg-gradient-to-br ${primaryGradientLight} rounded-xl border-2 ${primaryBorder}`}>
                <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">Skill Distribution</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={skillData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {skillData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Skill Bars */}
              <div className="space-y-4">
                {skillNames.map((skill, idx) => (
                  <div key={skill} className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-base font-bold text-gray-900">{skill}</span>
                      <span className={`text-lg font-bold bg-gradient-to-r ${getScoreColor(skillValues[idx])} bg-clip-text text-transparent`}>
                        {skillValues[idx]}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                      <div
                        className={`h-3 rounded-full bg-gradient-to-r ${getScoreColor(skillValues[idx])} transition-all duration-1000 shadow-md`}
                        style={{ width: `${(skillValues[idx] / maxSkill) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Strengths</h3>
              </div>
              <ul className="space-y-3">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-base text-gray-700">
                    <span className="text-green-600 text-xl mt-0.5">✓</span>
                    <span className="font-medium">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Areas for Improvement</h3>
              </div>
              <ul className="space-y-3">
                {improvements.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-base text-gray-700">
                    <span className="text-yellow-600 text-xl mt-0.5">→</span>
                    <span className="font-medium">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Resume Snippet */}
          <div className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Resume Snippet</h3>
            </div>
            <div className="bg-white rounded-xl p-6 border-2 border-blue-200 mb-4">
              <p className="text-base text-gray-700 italic leading-relaxed">{resumeSnippet}</p>
            </div>
            <button
              onClick={copyResumeSnippet}
              className={`px-6 py-3 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all flex items-center gap-2 ${
                copied
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : `bg-gradient-to-r ${primaryGradient} text-white ${primaryHover}`
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy to Clipboard
                </>
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pb-8">
          <button
            onClick={onClose}
            className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-bold text-lg transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Simulation
          </button>
          <button
            onClick={() => window.location.href = '/browse'}
            className={`px-8 py-4 bg-gradient-to-r ${primaryGradient} text-white rounded-xl ${primaryHover} font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2`}
          >
            Browse More Simulations
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalReportCard;
