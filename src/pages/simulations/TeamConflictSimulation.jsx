import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSimulationById, saveProgress } from '../../utils/storage';

const TeamConflictSimulation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [simulation, setSimulation] = useState(null);
  const [response, setResponse] = useState('');
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const sim = getSimulationById(id);
    if (sim && sim.type === 'team-conflict') {
      setSimulation(sim);
    } else {
      alert('Simulation not found');
      navigate('/browse');
    }
  }, [id, navigate]);

  const scoreResponse = (text) => {
    const t = text.toLowerCase();

    // Scoring criteria for conflict resolution
    const hasEmpathy = /understand|acknowledge|hear|appreciate|thank|see|perspective|valid/.test(t);
    const hasNeutrality = /both|team|together|we|us|align|common|goal|objective/.test(t);
    const hasSolution = /suggest|propose|how about|let's|can we|meet|discuss|compromise|alternative|option/.test(t);
    const hasDeescalation = /calm|step back|pause|take a moment|focus on|priority|deadline/.test(t);
    const isAggressive = /wrong|fault|blame|always|never|should have|need to/.test(t);

    let empathyScore = hasEmpathy ? 25 : 0;
    let neutralityScore = hasNeutrality ? 25 : 0;
    let solutionScore = hasSolution ? 30 : 0;
    let deescalationScore = hasDeescalation ? 20 : 0;

    if (isAggressive) {
      empathyScore = Math.max(0, empathyScore - 15);
      neutralityScore = Math.max(0, neutralityScore - 15);
    }

    const totalScore = Math.min(100, empathyScore + neutralityScore + solutionScore + deescalationScore);

    const feedback = [];
    if (hasEmpathy) feedback.push('✅ Good empathy — you acknowledged both perspectives.');
    else feedback.push('❌ Missing empathy — acknowledge both team members\' viewpoints.');

    if (hasNeutrality) feedback.push('✅ Maintained neutrality — focused on team goals.');
    else feedback.push('❌ Could be more neutral — emphasize shared objectives.');

    if (hasSolution) feedback.push('✅ Proposed a solution or next step.');
    else feedback.push('❌ No clear solution offered — suggest a concrete next action.');

    if (hasDeescalation) feedback.push('✅ Helped de-escalate the situation.');
    else feedback.push('⚠️ Could add de-escalation language (e.g., "Let\'s focus on...").');

    if (isAggressive) feedback.push('⚠️ Tone may come across as taking sides or being aggressive.');

    return { totalScore, empathyScore, neutralityScore, solutionScore, deescalationScore, feedback };
  };

  const handleSubmit = () => {
    if (!response.trim()) {
      alert('Please type your response before submitting.');
      return;
    }

    const result = scoreResponse(response);
    setResult(result);
    setSubmitted(true);
    saveProgress(id, result.totalScore, result.feedback);
  };

  const handleReset = () => {
    setResponse('');
    setResult(null);
    setSubmitted(false);
  };

  if (!simulation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/browse')}
            className="text-primary hover:text-accent font-semibold mb-4 flex items-center"
          >
            ← Back to Browse
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{simulation.title}</h1>
          <p className="text-slate-600">{simulation.description}</p>
        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left: Slack-style Chat */}
          <div className="lg:col-span-7 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Chat Header */}
            <div className="bg-slate-800 text-white p-4 flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <div className="w-3 h-3 rounded-full bg-green-500 mr-4"></div>
              <div className="font-bold"># team-discussion</div>
            </div>

            {/* Messages */}
            <div className="p-6 bg-slate-50 min-h-[400px] max-h-[500px] overflow-y-auto">
              {simulation.scenario.messages.map((msg) => (
                <div key={msg.id} className="mb-4 flex items-start">
                  <div
                    className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg mr-3 flex-shrink-0"
                  >
                    {msg.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm">{msg.user}</span>
                      <span className="text-xs text-slate-500">{msg.time}</span>
                    </div>
                    <div className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}

              {/* User Response Preview (if submitted) */}
              {submitted && (
                <div className="mb-4 flex items-start border-t-2 border-primary pt-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg mr-3 flex-shrink-0">
                    Y
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm">You ({simulation.scenario.role})</span>
                      <span className="text-xs text-slate-500">Just now</span>
                    </div>
                    <div className="text-slate-700 bg-primary/5 p-3 rounded-lg border-2 border-primary/30 shadow-sm">
                      {response}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Response Input */}
            {!submitted && (
              <div className="p-4 bg-white border-t border-slate-200">
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response as the team lead..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-3"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-2 font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-lg hover:shadow-lg transition-all"
                  >
                    Send Response
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-2 font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Scoring & Feedback */}
          <div className="lg:col-span-5 bg-white rounded-xl p-8 shadow-xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Scoring & Feedback</h2>

            {!result ? (
              <div>
                <div className="text-slate-500 text-center py-8 mb-6">
                  Your response will be scored after submission.
                </div>

                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
                  <div className="font-bold text-slate-900 mb-3">Evaluation Criteria</div>
                  <div className="space-y-2 text-sm text-slate-700">
                    <div className="flex items-center">
                      <span className="w-24 font-semibold">Empathy:</span>
                      <span className="flex-1">25 points</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 font-semibold">Neutrality:</span>
                      <span className="flex-1">25 points</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 font-semibold">Solution:</span>
                      <span className="flex-1">30 points</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 font-semibold">De-escalation:</span>
                      <span className="flex-1">20 points</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="font-bold text-slate-900 mb-3">Tips</div>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Acknowledge both perspectives without taking sides</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Focus on team goals and shared objectives</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Propose a concrete next step or meeting</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Use calming, neutral language</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div>
                {/* Score Breakdown */}
                <div className="mb-6">
                  <div className="text-sm font-bold text-slate-900 mb-4">Score Breakdown</div>

                  <div className="space-y-4">
                    {/* Empathy */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-slate-700">Empathy</span>
                        <span className="font-bold text-slate-900">{result.empathyScore} / 25</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                          style={{ width: `${(result.empathyScore / 25) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Neutrality */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-slate-700">Neutrality</span>
                        <span className="font-bold text-slate-900">{result.neutralityScore} / 25</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                          style={{ width: `${(result.neutralityScore / 25) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Solution */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-slate-700">Solution Offered</span>
                        <span className="font-bold text-slate-900">{result.solutionScore} / 30</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full"
                          style={{ width: `${(result.solutionScore / 30) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* De-escalation */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-slate-700">De-escalation</span>
                        <span className="font-bold text-slate-900">{result.deescalationScore} / 20</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"
                          style={{ width: `${(result.deescalationScore / 20) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Score */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 mb-6 text-center border border-primary/20">
                  <div className="text-sm font-semibold text-slate-600 mb-2">Final Score</div>
                  <div className="text-5xl font-bold text-primary">{result.totalScore}</div>
                  <div className="text-sm text-slate-600 mt-1">out of 100</div>
                </div>

                {/* Feedback */}
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <div className="font-bold text-amber-900 mb-3">Feedback</div>
                  <div className="space-y-2">
                    {result.feedback.map((fb, idx) => (
                      <div key={idx} className="text-sm text-slate-700">
                        {fb}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons (after results) */}
        {result && (
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => navigate('/browse')}
              className="flex-1 py-3 font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-lg hover:shadow-lg transition-all"
            >
              Browse More Simulations
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 font-semibold text-slate-700 bg-white border-2 border-slate-300 rounded-lg hover:border-slate-400 transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamConflictSimulation;

