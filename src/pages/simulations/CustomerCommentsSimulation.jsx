import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSimulationById, saveProgress } from '../../utils/storage';

const CustomerCommentsSimulation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [simulation, setSimulation] = useState(null);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [replies, setReplies] = useState({});
  const [currentReply, setCurrentReply] = useState('');
  const [scores, setScores] = useState({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const sim = getSimulationById(id);
    if (sim && sim.type === 'customer-comments') {
      setSimulation(sim);
      if (sim.scenario.comments.length > 0) {
        setSelectedCommentId(sim.scenario.comments[0].id);
      }
    } else {
      alert('Simulation not found');
      navigate('/browse');
    }
  }, [id, navigate]);

  const scoreReply = (text) => {
    const t = text.toLowerCase();
    let empathy = /sorry|apolog|understand|thank|appreciate/.test(t);
    let resolution = /refund|replace|voucher|help|fix|send|arrange|process|resolve|solution/.test(t);
    let clarity = /order|id|tomorrow|within|confirm|please|share|contact|follow/.test(t);
    let rude = /stupid|hate|angry|idiot|trash|terrible|awful/.test(t);

    let total = 0;
    total += empathy ? 40 : 0;
    total += resolution ? 40 : 0;
    total += clarity ? 20 : 0;
    if (rude) total -= 30;
    if (total < 0) total = 0;

    let feedback = [];
    if (empathy) feedback.push('✅ Shows empathy / understanding.');
    else feedback.push('❌ Missing empathy — start with an apology or acknowledgment.');

    if (resolution) feedback.push('✅ Offered some form of help or solution.');
    else feedback.push('❌ No clear resolution or action proposed.');

    if (clarity) feedback.push('✅ Clear or asks for necessary info / next steps.');
    else feedback.push('❌ Could be clearer or ask for order details.');

    if (rude) feedback.push('⚠️ Avoid negative tone or harsh words.');

    return { total, feedback };
  };

  const handleSendReply = () => {
    if (!currentReply.trim()) {
      alert('Please type a reply before submitting.');
      return;
    }

    const score = scoreReply(currentReply);
    setReplies({ ...replies, [selectedCommentId]: currentReply });
    setScores({ ...scores, [selectedCommentId]: score });
    setCurrentReply('');

    // Move to next comment if available
    const currentIndex = simulation.scenario.comments.findIndex((c) => c.id === selectedCommentId);
    if (currentIndex < simulation.scenario.comments.length - 1) {
      setSelectedCommentId(simulation.scenario.comments[currentIndex + 1].id);
    }
  };

  const handleFinish = () => {
    const totalScore = Object.values(scores).reduce((sum, s) => sum + s.total, 0);
    const avgScore = Math.round(totalScore / Object.values(scores).length);
    saveProgress(id, avgScore, scores);
    setShowResults(true);
  };

  const selectedComment = simulation?.scenario.comments.find((c) => c.id === selectedCommentId);
  const allReplied = simulation?.scenario.comments.every((c) => replies[c.id]);

  if (!simulation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  if (showResults) {
    const totalScore = Object.values(scores).reduce((sum, s) => sum + s.total, 0);
    const avgScore = Math.round(totalScore / Object.values(scores).length);

    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Simulation Complete!</h2>
              <p className="text-slate-600">Here's how you performed</p>
            </div>

            {/* Overall Score */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 mb-8 text-center border border-primary/20">
              <div className="text-sm font-semibold text-slate-600 mb-2">Average Score</div>
              <div className="text-5xl font-bold text-primary">{avgScore}</div>
              <div className="text-sm text-slate-600 mt-1">out of 100</div>
            </div>

            {/* Per-Comment Breakdown */}
            <div className="space-y-6 mb-8">
              <h3 className="text-xl font-bold text-slate-900">Per-Comment Feedback</h3>
              {simulation.scenario.comments.map((comment) => {
                const score = scores[comment.id];
                if (!score) return null;

                return (
                  <div key={comment.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-bold text-slate-900">{comment.user}</div>
                        <div className="text-sm text-slate-600 mt-1">{comment.text}</div>
                      </div>
                      <div className="text-2xl font-bold text-primary">{score.total}/100</div>
                    </div>

                    <div className="bg-white rounded-lg p-4 mb-3">
                      <div className="text-sm font-semibold text-slate-700 mb-2">Your Reply:</div>
                      <div className="text-sm text-slate-600">{replies[comment.id]}</div>
                    </div>

                    <div className="space-y-2">
                      {score.feedback.map((fb, idx) => (
                        <div key={idx} className="text-sm text-slate-700">
                          {fb}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/browse')}
                className="flex-1 py-3 font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-lg hover:shadow-lg transition-all"
              >
                Browse More Simulations
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 font-semibold text-slate-700 bg-white border-2 border-slate-300 rounded-lg hover:border-slate-400 transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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

        {/* 3-Column Layout */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left: Comments List */}
          <div className="lg:col-span-3 bg-white rounded-xl p-6 shadow-lg border border-slate-200 h-fit">
            <h3 className="font-bold text-slate-900 mb-4">Customer Comments</h3>
            <div className="space-y-3">
              {simulation.scenario.comments.map((comment) => (
                <div
                  key={comment.id}
                  onClick={() => setSelectedCommentId(comment.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedCommentId === comment.id
                      ? 'border-primary bg-primary/5'
                      : replies[comment.id]
                      ? 'border-green-300 bg-green-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-slate-900 text-sm">{comment.user}</div>
                    {replies[comment.id] && <span className="text-green-600">✓</span>}
                  </div>
                  <div className="text-xs text-slate-600 line-clamp-2">{comment.text}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-slate-500">Click a comment to reply</div>
          </div>

          {/* Center: Reply Editor */}
          <div className="lg:col-span-6 bg-white rounded-xl p-6 shadow-lg border border-slate-200">
            {selectedComment ? (
              <>
                <h3 className="font-bold text-slate-900 mb-4">From: {selectedComment.user}</h3>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-6">
                  <p className="text-slate-700">{selectedComment.text}</p>
                </div>

                {replies[selectedCommentId] ? (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-green-900">Your Reply (Submitted)</div>
                      <div className="text-2xl font-bold text-green-600">{scores[selectedCommentId].total}/100</div>
                    </div>
                    <p className="text-slate-700 mb-4">{replies[selectedCommentId]}</p>
                    <div className="space-y-2">
                      {scores[selectedCommentId].feedback.map((fb, idx) => (
                        <div key={idx} className="text-sm text-slate-700">
                          {fb}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <label className="block font-semibold text-slate-900 mb-2">Your Reply</label>
                    <textarea
                      value={currentReply}
                      onChange={(e) => setCurrentReply(e.target.value)}
                      placeholder="Type your professional response..."
                      rows={6}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                    <button
                      onClick={handleSendReply}
                      className="mt-4 w-full py-3 font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-lg hover:shadow-lg transition-all"
                    >
                      Send Reply
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-slate-500">Select a comment to reply</div>
            )}
          </div>

          {/* Right: Score Panel */}
          <div className="lg:col-span-3 bg-white rounded-xl p-6 shadow-lg border border-slate-200 h-fit">
            <h3 className="font-bold text-slate-900 mb-4">Your Progress</h3>
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 mb-6 text-center border border-primary/20">
              <div className="text-sm text-slate-600 mb-1">Replies Submitted</div>
              <div className="text-3xl font-bold text-primary">
                {Object.keys(replies).length}/{simulation.scenario.comments.length}
              </div>
            </div>

            {allReplied && (
              <button
                onClick={handleFinish}
                className="w-full py-3 font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:shadow-lg transition-all mb-4"
              >
                Finish & See Results
              </button>
            )}

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Tips</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Start with empathy ("Sorry / I understand")</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Offer a solution (refund, replacement, follow-up)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Be polite and clear</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCommentsSimulation;

