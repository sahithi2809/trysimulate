import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSimulationById, saveProgress } from '../../utils/storage';

const SalesNegotiationSimulation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [simulation, setSimulation] = useState(null);
  const [reply, setReply] = useState('');
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const sim = getSimulationById(id);
    if (sim && sim.type === 'sales-negotiation') {
      setSimulation(sim);
    } else {
      alert('Simulation not found');
      navigate('/browse');
    }
  }, [id, navigate]);

  const scoreReply = (text) => {
    const WEIGHTS = { empathy: 25, value: 30, alternatives: 30, closing: 15 };

    const KW = {
      empathy: ['thanks', 'thank you', 'appreciate', 'understand', 'i appreciate', 'sorry', 'glad', 'happy to hear', 'great to hear'],
      value: ['roi', 'return on', 'outcome', 'saves', 'save', 'time', 'efficiency', 'productivity', 'uptime', 'support', 'integration', 'reduce cost', 'value', 'benefit', 'results'],
      alternatives: ['pilot', 'trial', '6-month', '6 month', '6 months', '12-month', '12 month', '12 months', 'commit', 'commitment', 'startup discount', 'discount', 'phased', 'limited', 'seat', 'seats', 'tier', 'bundle', 'option', 'pay monthly', 'monthly'],
      closing: ['call', 'jump on', 'shall i', 'shall we', 'which option', 'which would work', 'finalise', 'finalize', 'sign', 'ready to move', 'next step', 'let me know', 'confirm', 'send updated quote'],
    };

    const ratioMatches = (text, keywords) => {
      const t = (text || '').toLowerCase();
      if (!t) return 0;
      let hits = 0;
      for (const k of keywords) {
        if (t.includes(k)) hits++;
      }
      return Math.min(1, hits / keywords.length);
    };

    const hasUnconditionalLargeDiscount = (text) => {
      const t = (text || '').toLowerCase();
      const discountPattern = /\b(30%|30 percent|50%|50 percent)\b/;
      if (!discountPattern.test(t)) return false;
      const conditionWords = ['if', 'commit', 'commitment', 'sign', 'for 12', 'for 6', 'on 12', 'on 6', 'with a', 'subject to', 'upon', 'when you', 'if you'];
      for (const c of conditionWords) {
        if (t.includes(c)) return false;
      }
      return true;
    };

    const empathyRatio = ratioMatches(text, KW.empathy);
    const valueRatio = ratioMatches(text, KW.value);
    let altRatio = ratioMatches(text, KW.alternatives);
    const closingRatio = ratioMatches(text, KW.closing);

    const condKeywords = ['if you commit', 'if you sign', 'commit to', '12 months', '6 months', 'for 12 months', 'for 6 months', 'pilot', 'trial'];
    let condFound = false;
    for (const c of condKeywords) if (text.toLowerCase().includes(c)) condFound = true;
    if (condFound) altRatio = Math.min(1, altRatio * 1.2);

    const unconditionalDiscount = hasUnconditionalLargeDiscount(text);
    if (unconditionalDiscount) altRatio = Math.max(0, altRatio - 0.35);

    const empathyScore = Math.round(WEIGHTS.empathy * empathyRatio);
    const valueScore = Math.round(WEIGHTS.value * valueRatio);
    const altScore = Math.round(WEIGHTS.alternatives * altRatio);
    const closingScore = Math.round(WEIGHTS.closing * closingRatio);
    let finalTotal = empathyScore + valueScore + altScore + closingScore;
    finalTotal = Math.max(0, Math.min(100, finalTotal));

    const feedback = [];
    if (empathyRatio > 0.4) feedback.push('✅ Good empathy — you acknowledged their concern or thanked them.');
    else feedback.push('❌ Missing empathy — start with recognition of their budget concern.');

    if (valueRatio > 0.3) feedback.push('✅ You reinforced value — linked features to ROI/outcomes.');
    else feedback.push('❌ Value reinforcement is missing — reiterate key outcomes you deliver.');

    if (altRatio > 0.4) {
      if (unconditionalDiscount) feedback.push('⚠️ You offered a discount but it appeared unconditional — prefer conditional concessions.');
      else feedback.push('✅ Good — you proposed alternatives that protect margin while moving the deal forward.');
    } else {
      feedback.push('❌ No strong alternative offer — suggest conditional concessions (pilot, longer commitment, limited features).');
    }

    if (closingRatio > 0.3) feedback.push('✅ Nice close / next step — you asked for a decision or offered a call/quote.');
    else feedback.push('❌ Missing a clear call-to-action — close with a next-step.');

    return {
      finalTotal,
      empathyScore,
      valueScore,
      altScore,
      closingScore,
      feedback,
      WEIGHTS,
    };
  };

  const handleSubmit = () => {
    if (!reply.trim()) {
      alert('Please write your negotiation reply before submitting.');
      return;
    }

    const result = scoreReply(reply);
    setResult(result);
    setSubmitted(true);
    saveProgress(id, result.finalTotal, result.feedback);
  };

  const handleReset = () => {
    setReply('');
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

        {/* 2-Column Layout */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left: Scenario + Reply Editor */}
          <div className="lg:col-span-7 bg-white rounded-xl p-8 shadow-xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Scenario</h2>
            <p className="text-slate-600 mb-6">{simulation.scenario.context}</p>

            {/* Buyer Email */}
            <div className="mb-6">
              <div className="font-bold text-slate-900 mb-3">Buyer Email</div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="font-bold text-slate-900 mb-2">
                  From: {simulation.scenario.email.from}
                </div>
                {simulation.scenario.email.subject && (
                  <div className="text-sm text-slate-600 mb-2">
                    Subject: {simulation.scenario.email.subject}
                  </div>
                )}
                <div className="text-slate-700 mt-3">{simulation.scenario.email.body}</div>
              </div>
            </div>

            {/* Reply Editor */}
            <div>
              <div className="font-bold text-slate-900 mb-3">Your Reply</div>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                disabled={submitted}
                placeholder="Write your negotiation reply here..."
                rows={8}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:bg-slate-100"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSubmit}
                  disabled={submitted}
                  className={`flex-1 py-3 font-semibold text-white rounded-lg transition-all ${
                    submitted
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary to-accent hover:shadow-lg'
                  }`}
                >
                  Submit Reply
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
                >
                  Reset
                </button>
              </div>
              <div className="mt-3 text-sm text-slate-600">
                Focus on: empathy, reinforce key value, offer alternatives (pilot/terms), and close with a clear next step.
              </div>
            </div>
          </div>

          {/* Right: Scoring & Feedback */}
          <div className="lg:col-span-5 bg-white rounded-xl p-8 shadow-xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Scoring & Feedback</h2>

            {!result ? (
              <div className="text-slate-500 text-center py-12">
                No reply submitted yet. Your scoring and feedback will appear here after you submit your reply.
              </div>
            ) : (
              <div>
                {/* Per-Competency Scores */}
                <div className="mb-6">
                  <div className="text-sm font-bold text-slate-900 mb-4">Per-Competency Scores</div>

                  <div className="space-y-4">
                    {/* Empathy */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-slate-700">Empathy</span>
                        <span className="font-bold text-slate-900">
                          {result.empathyScore} / {result.WEIGHTS.empathy}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                          style={{ width: `${(result.empathyScore / result.WEIGHTS.empathy) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Value */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-slate-700">Value Reinforcement</span>
                        <span className="font-bold text-slate-900">
                          {result.valueScore} / {result.WEIGHTS.value}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                          style={{ width: `${(result.valueScore / result.WEIGHTS.value) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Alternatives */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-slate-700">Alternatives / Creativity</span>
                        <span className="font-bold text-slate-900">
                          {result.altScore} / {result.WEIGHTS.alternatives}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full"
                          style={{ width: `${(result.altScore / result.WEIGHTS.alternatives) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Closing */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-slate-700">Closing / Next Step</span>
                        <span className="font-bold text-slate-900">
                          {result.closingScore} / {result.WEIGHTS.closing}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"
                          style={{ width: `${(result.closingScore / result.WEIGHTS.closing) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Score */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 mb-6 text-center border border-primary/20">
                  <div className="text-sm font-semibold text-slate-600 mb-2">Final Score</div>
                  <div className="text-5xl font-bold text-primary">{result.finalTotal}</div>
                  <div className="text-sm text-slate-600 mt-1">out of 100</div>
                </div>

                {/* Feedback */}
                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 mb-6">
                  <div className="font-bold text-amber-900 mb-3">Feedback</div>
                  <div className="space-y-2">
                    {result.feedback.map((fb, idx) => (
                      <div key={idx} className="text-sm text-slate-700">
                        {fb}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Behind-the-scenes Actions */}
                <div>
                  <div className="font-bold text-slate-900 mb-3">Behind-the-scenes Actions</div>
                  <ul className="text-sm text-slate-600 space-y-2">
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Prepare updated quotes with conditional discounts</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Gather ROI examples tailored to the buyer</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary mr-2">•</span>
                      <span>Track internal KPIs: ARR, discount impact, pilot metrics</span>
                    </li>
                  </ul>
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

export default SalesNegotiationSimulation;



