import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSimulationById, saveProgress } from '../../utils/storage';
import Sortable from 'sortablejs';

const PrioritizationSimulation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [simulation, setSimulation] = useState(null);
  const [taskOrder, setTaskOrder] = useState([]);
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showIdeal, setShowIdeal] = useState(false);
  const taskListRef = useRef(null);
  const sortableRef = useRef(null);

  useEffect(() => {
    const sim = getSimulationById(id);
    if (sim && sim.type === 'prioritization') {
      setSimulation(sim);
      // Initialize with ideal order
      const sorted = [...sim.scenario.tasks].sort((a, b) => a.ideal_rank - b.ideal_rank);
      setTaskOrder(sorted);
    } else {
      alert('Simulation not found');
      navigate('/browse');
    }
  }, [id, navigate]);

  useEffect(() => {
    if (taskListRef.current && !sortableRef.current && !submitted) {
      sortableRef.current = new Sortable(taskListRef.current, {
        animation: 160,
        handle: '.drag-handle',
        onEnd: (evt) => {
          const newOrder = [...taskOrder];
          const [movedItem] = newOrder.splice(evt.oldIndex, 1);
          newOrder.splice(evt.newIndex, 0, movedItem);
          setTaskOrder(newOrder);
        },
      });
    }

    return () => {
      if (sortableRef.current) {
        sortableRef.current.destroy();
        sortableRef.current = null;
      }
    };
  }, [taskOrder, submitted]);

  const PALETTE = ['#2563eb', '#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#3b82f6', '#fb7185', '#f97316'];

  const getColor = (taskId) => {
    return PALETTE[(taskId - 1) % PALETTE.length];
  };

  const hexToRgba = (hex, alpha) => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  const computeResults = () => {
    const idealMap = {};
    simulation.scenario.tasks.forEach((t) => (idealMap[t.id] = t.ideal_rank));

    let totalDistance = 0;
    const perTask = taskOrder.map((task, idx) => {
      const userRank = idx + 1;
      const idealRank = idealMap[task.id];
      const distance = Math.abs(userRank - idealRank);
      totalDistance += distance;
      return { ...task, userRank, idealRank, distance };
    });

    const maxDistance = simulation.scenario.tasks.length * (simulation.scenario.tasks.length - 1) / 2;
    const score = Math.round((1 - totalDistance / maxDistance) * 100);

    return { score, totalDistance, maxDistance, perTask };
  };

  const generateFeedback = (perTask) => {
    const feedback = perTask.map((p) => {
      let msg = '';
      if (p.distance === 0) msg = `✅ Good: placed correctly at #${p.userRank}.`;
      else if (p.distance === 1) msg = `⚠️ Acceptable: slightly off (placed #${p.userRank}, ideal #${p.idealRank}).`;
      else msg = `❌ Problem: placed #${p.userRank} but ideal is #${p.idealRank} — consider moving this.`;
      return { ...p, msg };
    });

    return feedback;
  };

  const handleSubmit = () => {
    const results = computeResults();
    const feedback = generateFeedback(results.perTask);
    setResult({ ...results, feedback });
    setSubmitted(true);
    saveProgress(id, results.score, feedback);
  };

  const handleReset = () => {
    const sorted = [...simulation.scenario.tasks].sort((a, b) => a.ideal_rank - b.ideal_rank);
    setTaskOrder(sorted);
    setResult(null);
    setSubmitted(false);
    setShowIdeal(false);
  };

  const handleShowIdeal = () => {
    setShowIdeal(!showIdeal);
  };

  if (!simulation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200 mb-6">
          <button
            onClick={() => navigate('/browse')}
            className="text-primary hover:text-accent font-semibold mb-4 flex items-center"
          >
            ← Back to Browse
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{simulation.title}</h1>
              <p className="text-slate-600">{simulation.description}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
              >
                Reset
              </button>
              <button
                onClick={handleShowIdeal}
                className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
              >
                {showIdeal ? 'Hide' : 'Reveal'} Ideal Order
              </button>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left: Task List */}
          <div className="lg:col-span-7 bg-white rounded-xl p-8 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <div className="font-bold text-slate-900 text-lg">Your Task List</div>
              <div className="text-xs text-slate-500">Drag the colored handle to reorder</div>
            </div>

            <ol ref={taskListRef} className="space-y-4 mb-6">
              {taskOrder.map((task, idx) => {
                const color = getColor(task.id);
                return (
                  <li
                    key={task.id}
                    className="flex items-center gap-4 p-4 rounded-xl border bg-gradient-to-r from-white to-slate-50 shadow-md hover:shadow-lg transition-shadow"
                    style={{ borderLeft: `6px solid ${hexToRgba(color, 0.3)}` }}
                  >
                    <div
                      className="drag-handle w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg cursor-grab active:cursor-grabbing flex-shrink-0"
                      style={{ background: color, boxShadow: `0 8px 18px ${hexToRgba(color, 0.2)}` }}
                    >
                      {task.id}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-bold text-slate-900 text-sm">#{idx + 1}</div>
                        <div className="font-semibold text-slate-900">{task.title}</div>
                        <div
                          className="ml-auto px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ background: hexToRgba(color, 0.15), color: color }}
                        >
                          est {task.est_time}m
                        </div>
                      </div>
                      <div className="text-sm text-slate-600">{task.note}</div>
                    </div>
                  </li>
                );
              })}
            </ol>

            <button
              onClick={handleSubmit}
              disabled={submitted}
              className={`w-full py-3 font-semibold text-white rounded-lg transition-all ${
                submitted
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-accent hover:shadow-lg'
              }`}
            >
              Submit Priorities
            </button>

            <div className="mt-4 text-sm text-slate-600">
              💡 Tip: Quick wins, mandatory events, and customer-impacting items should be near the top.
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-5 bg-white rounded-xl p-8 shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <div className="font-bold text-slate-900 text-lg">Results</div>
              <div className="text-xs text-slate-500">Lower distance → better match</div>
            </div>

            {!result ? (
              <div className="text-slate-500 text-center py-12">
                No submission yet — submit to view your score and feedback.
              </div>
            ) : (
              <div>
                {/* Score Display */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Total Distance</div>
                    <div className="text-lg font-bold text-slate-900">
                      {result.totalDistance} / {result.maxDistance}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600 mb-1">Final Score</div>
                    <div className="text-5xl font-bold text-primary">{result.score}</div>
                    <div className="text-sm text-slate-600">out of 100</div>
                  </div>
                </div>

                {/* Per-Task Feedback */}
                <div className="mb-6">
                  <div className="font-bold text-slate-900 mb-3">Per-Task Feedback</div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {result.feedback.map((task) => {
                      const bgClass =
                        task.distance === 0
                          ? 'bg-green-50 border-green-200'
                          : task.distance === 1
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-amber-50 border-amber-200';

                      return (
                        <div key={task.id} className={`p-3 rounded-lg border ${bgClass}`}>
                          <div className="font-semibold text-slate-900 text-sm mb-1">{task.title}</div>
                          <div className="text-xs text-slate-700 mb-2">{task.msg}</div>
                          <div className="text-xs text-slate-600">
                            Your rank: {task.userRank} • Ideal: {task.idealRank}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Tips */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
                  <div className="font-bold text-slate-900 mb-2">Quick Tips</div>
                  <ul className="text-sm text-slate-700 space-y-1">
                    <li>• Handle time-sensitive, CEO-level items first</li>
                    <li>• Schedule fixed-time meetings early</li>
                    <li>• Delegate or postpone optional work</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Ideal Order (collapsible) */}
            {showIdeal && (
              <div className="mt-6 bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="font-bold text-slate-900 mb-3">Ideal Priority Order</div>
                <div className="space-y-2">
                  {[...simulation.scenario.tasks]
                    .sort((a, b) => a.ideal_rank - b.ideal_rank)
                    .map((task) => (
                      <div key={task.id} className="text-sm">
                        <span className="font-bold text-slate-900">#{task.ideal_rank}.</span> {task.title}
                        <div className="text-xs text-slate-600 ml-5">{task.note}</div>
                      </div>
                    ))}
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

export default PrioritizationSimulation;

