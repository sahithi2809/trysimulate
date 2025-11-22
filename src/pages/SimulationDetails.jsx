import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { recruiterService } from '../services/recruiterService';
import { useAuth } from '../contexts/AuthContext';

const SimulationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [simulation, setSimulation] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  useEffect(() => {
    if (isAuthenticated && id) {
      loadData();
    }
  }, [isAuthenticated, id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔍 Loading simulation details for ID: ${id}`);

      // Load simulation
      const sims = await recruiterService.getMySimulations();
      console.log(`📋 Found ${sims.length} simulations, looking for ID: ${id}`);
      console.log(`📋 Available simulation IDs:`, sims.map(s => ({ id: s.id, title: s.title })));
      
      const sim = sims.find(s => s.id === id);
      if (!sim) {
        console.error(`❌ Simulation ${id} not found in recruiter's simulations`);
        setError(`Simulation not found or you do not have access. Available simulations: ${sims.length}`);
        setLoading(false);
        return;
      }
      
      console.log(`✅ Found simulation: ${sim.title}`);
      setSimulation(sim);

      // Load participants and analytics in parallel
      // Use Promise.allSettled to handle partial failures gracefully
      const [participantsResult, analyticsResult] = await Promise.allSettled([
        recruiterService.getSimulationParticipants(id),
        recruiterService.getSimulationAnalytics(id)
      ]);

      // Handle participants
      if (participantsResult.status === 'fulfilled') {
        const participantsData = participantsResult.value || [];
        console.log(`✅ Loaded ${participantsData.length} participants`);
        setParticipants(participantsData);
      } else {
        console.error('❌ Error loading participants:', participantsResult.reason);
        console.error('Error details:', participantsResult.reason?.message, participantsResult.reason?.code);
        setParticipants([]);
        // Don't set error here, just log - page can still show simulation info
      }

      // Handle analytics
      if (analyticsResult.status === 'fulfilled') {
        const analyticsData = analyticsResult.value;
        console.log(`✅ Loaded analytics:`, {
          totalParticipants: analyticsData.totalParticipants,
          averageScore: analyticsData.averageScore
        });
        setAnalytics(analyticsData);
      } else {
        console.error('❌ Error loading analytics:', analyticsResult.reason);
        console.error('Error details:', analyticsResult.reason?.message, analyticsResult.reason?.code);
        // Set default analytics if failed
        const defaultAnalytics = {
          totalParticipants: 0,
          completedParticipants: 0,
          completionRate: 0,
          averageScore: 0,
          topPerformers: [],
          scoreDistribution: { '90-100': 0, '80-89': 0, '70-79': 0, '60-69': 0, '0-59': 0 },
          averageDurationHours: 0,
          taskPerformance: {}
        };
        console.log('⚠️ Using default analytics due to error');
        setAnalytics(defaultAnalytics);
      }
    } catch (err) {
      console.error('Error loading simulation details:', err);
      setError(err.message || 'Failed to load simulation details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (startedAt, completedAt) => {
    if (!startedAt || !completedAt) return 'N/A';
    const duration = new Date(completedAt) - new Date(startedAt);
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getScoreColor = (score) => {
    if (!score) return 'text-gray-500';
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (!score) return 'bg-gray-100';
    if (score >= 90) return 'bg-green-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-yellow-100';
    if (score >= 60) return 'bg-orange-100';
    return 'bg-red-100';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-slate-600">Please sign in to view this page.</p>
            <Link to="/auth?mode=login" className="text-primary hover:underline mt-4 inline-block">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-slate-600">Loading simulation details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !simulation) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-12 shadow-lg border border-red-200 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Simulation</h3>
            <p className="text-slate-600 mb-4">{error || 'Simulation not found'}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left max-w-2xl mx-auto">
              <p className="text-sm font-semibold text-red-900 mb-2">Debug Info:</p>
              <p className="text-xs text-red-800 font-mono">Simulation ID: {id}</p>
              <p className="text-xs text-red-800 mt-2">Check browser console (F12) for detailed logs</p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/creator')}
                className="px-6 py-3 text-white bg-primary rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Back to Dashboard
              </button>
              <button
                onClick={loadData}
                className="px-6 py-3 text-slate-700 bg-slate-100 rounded-lg font-semibold hover:bg-slate-200 transition-all"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show page even if simulation is null but no error (loading state)
  if (!simulation && !error) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl p-12 shadow-lg border border-slate-200 text-center">
            <div className="text-4xl mb-4">❓</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Simulation Not Found</h3>
            <p className="text-slate-600 mb-6">The simulation you're looking for doesn't exist or you don't have access to it.</p>
            <button
              onClick={() => navigate('/creator')}
              className="px-6 py-3 text-white bg-primary rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const topPerformers = analytics?.topPerformers || [];
  const sortedParticipants = [...participants].sort((a, b) => {
    const scoreA = a.final_score || 0;
    const scoreB = b.final_score || 0;
    return scoreB - scoreA;
  });

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/creator')}
            className="text-slate-600 hover:text-slate-900 mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{simulation.title}</h1>
          <p className="text-lg text-slate-600">{simulation.description}</p>
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Total Participants</div>
              <div className="text-3xl font-bold text-slate-900">{analytics.totalParticipants}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Completed</div>
              <div className="text-3xl font-bold text-green-600">{analytics.completedParticipants}</div>
              <div className="text-xs text-slate-500 mt-1">
                {analytics.completionRate}% completion rate
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Average Score</div>
              <div className="text-3xl font-bold text-blue-600">{Math.round(analytics.averageScore)}%</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
              <div className="text-sm text-slate-600 mb-1">Avg. Duration</div>
              <div className="text-3xl font-bold text-purple-600">
                {analytics.averageDurationHours > 0
                  ? `${Math.round(analytics.averageDurationHours * 10) / 10}h`
                  : 'N/A'}
              </div>
            </div>
          </div>
        )}

        {/* Score Distribution */}
        {analytics && analytics.scoreDistribution && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Score Distribution</h2>
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(analytics.scoreDistribution).map(([range, count]) => (
                <div key={range} className="text-center">
                  <div className="text-2xl font-bold text-slate-900 mb-1">{count}</div>
                  <div className="text-sm text-slate-600">{range}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Performers */}
        {topPerformers.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">🏆 Top Performers</h2>
            <div className="space-y-3">
              {topPerformers.slice(0, 5).map((performer, idx) => {
                // Find participant by user_id (topPerformers are progress records with user_id)
                const participant = participants.find(p => p.user_id === performer.user_id);
                const profile = participant?.user_profiles;
                return (
                  <div
                    key={performer.id || performer.user_id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {profile?.full_name || profile?.email || 'Anonymous'}
                        </div>
                        <div className="text-sm text-slate-600">{profile?.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(performer.final_score)}`}>
                        {performer.final_score || 0}%
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatDate(performer.completed_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Participants */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            All Participants {participants.length > 0 && `(${participants.length})`}
          </h2>
          {participants.length === 0 ? (
            <div className="text-center py-12 text-slate-600">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-lg font-semibold mb-2">No completed participants yet</p>
              <p className="text-sm mb-4">Participants will appear here once they complete the simulation.</p>
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left max-w-2xl mx-auto">
                <p className="text-sm font-semibold text-blue-900 mb-2">💡 Important Note:</p>
                <p className="text-sm text-blue-800">
                  Only participants who completed the simulation <strong>while logged in</strong> will appear here. 
                  If someone completed it without signing in, their data is stored locally and won't be visible to recruiters.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Score</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Progress</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Started</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Completed</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Duration</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedParticipants.map((participant) => {
                    const profile = participant.user_profiles;
                    const isCompleted = participant.completed_at !== null;
                    return (
                      <tr
                        key={participant.id}
                        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                        onClick={() => setSelectedParticipant(participant)}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">
                            {profile?.full_name || 'Anonymous'}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">{profile?.email || 'N/A'}</td>
                        <td className="py-3 px-4 text-center">
                          {isCompleted && participant.final_score !== null ? (
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getScoreBgColor(participant.final_score)} ${getScoreColor(participant.final_score)}`}>
                              {participant.final_score}%
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="text-sm font-semibold text-slate-900">
                            {Math.round(participant.progress_percentage || 0)}%
                          </div>
                          <div className="text-xs text-slate-500">
                            {participant.completed_tasks?.length || 0} tasks
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-slate-600">
                          {formatDate(participant.started_at)}
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-slate-600">
                          {isCompleted ? formatDate(participant.completed_at) : (
                            <span className="text-orange-600">In Progress</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-slate-600">
                          {formatDuration(participant.started_at, participant.completed_at)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedParticipant(participant);
                            }}
                            className="px-3 py-1 text-sm font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Participant Detail Modal */}
        {selectedParticipant && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedParticipant(null)}>
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-slate-900">Participant Details</h3>
                <button
                  onClick={() => setSelectedParticipant(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <ParticipantDetails participant={selectedParticipant} simulationId={id} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Participant Details Component
const ParticipantDetails = ({ participant, simulationId }) => {
  const profile = participant.user_profiles;
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, [participant.user_id, simulationId]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const allSubmissions = await recruiterService.getSimulationSubmissions(simulationId);
      const userSubmissions = allSubmissions.filter(s => s.user_id === participant.user_id);
      setSubmissions(userSubmissions);
    } catch (err) {
      console.error('Error loading submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Profile Info */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg">
        <h4 className="font-bold text-slate-900 mb-3">Profile Information</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-600">Name:</span>
            <span className="ml-2 font-medium text-slate-900">{profile?.full_name || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-600">Email:</span>
            <span className="ml-2 font-medium text-slate-900">{profile?.email || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-600">Role:</span>
            <span className="ml-2 font-medium text-slate-900">{profile?.user_role || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-600">Joined:</span>
            <span className="ml-2 font-medium text-slate-900">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-slate-900 mb-3">Performance Summary</h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-slate-600">Final Score</div>
            <div className="text-2xl font-bold text-blue-600">
              {participant.final_score !== null ? `${participant.final_score}%` : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-600">Progress</div>
            <div className="text-2xl font-bold text-slate-900">
              {Math.round(participant.progress_percentage || 0)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-600">Tasks Completed</div>
            <div className="text-2xl font-bold text-slate-900">
              {participant.completed_tasks?.length || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Task Submissions */}
      <div>
        <h4 className="font-bold text-slate-900 mb-3">Task Submissions</h4>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-slate-600">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-8 text-slate-600">No submissions yet</div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-slate-900">Task {submission.task_id}</div>
                    <div className="text-sm text-slate-600">
                      Submitted: {new Date(submission.submitted_at).toLocaleString()}
                    </div>
                  </div>
                  {submission.score !== null && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {submission.score}%
                    </span>
                  )}
                </div>
                {submission.strengths && submission.strengths.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm font-semibold text-green-700 mb-1">Strengths:</div>
                    <ul className="text-sm text-slate-700 list-disc list-inside">
                      {submission.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {submission.improvements && submission.improvements.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm font-semibold text-orange-700 mb-1">Improvements:</div>
                    <ul className="text-sm text-slate-700 list-disc list-inside">
                      {submission.improvements.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationDetails;

