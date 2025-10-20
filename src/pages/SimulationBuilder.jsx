import React from 'react';
import { useNavigate } from 'react-router-dom';
import AIBuilder from '../components/AIBuilder';

const SimulationBuilder = () => {
  const navigate = useNavigate();

  const handleSimulationCreated = (simulation) => {
    // Navigate to creator dashboard after successful creation
    navigate('/creator');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            AI Simulation Builder
          </h1>
          <p className="text-lg text-slate-600">
            Describe your simulation idea in natural language, and our AI will create a complete, professional simulation for you.
          </p>
        </div>

        <AIBuilder onSimulationCreated={handleSimulationCreated} />
      </div>
    </div>
  );
};

export default SimulationBuilder;