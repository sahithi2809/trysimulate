import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databaseService } from '../services/databaseService';

const UniversalHTMLSimulationRenderer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSimulation = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Fetching simulation from database:', id);
        const sim = await databaseService.getSimulationById(id);
        
        if (sim) {
          console.log('✅ Simulation loaded from database:', sim.title);
          setSimulation(sim);
        } else {
          throw new Error('Simulation not found in database');
        }
      } catch (err) {
        console.error('❌ Error fetching simulation from database:', err);
        setError('Simulation not found in database');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSimulation();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg text-slate-600">Loading simulation...</div>
        </div>
      </div>
    );
  }

  if (error || !simulation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">Simulation not found</div>
          <p className="text-slate-600 mb-6">The simulation you're looking for doesn't exist in the database.</p>
          <button
            onClick={() => navigate('/browse')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with simulation info and back button */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/browse')}
            className="flex items-center text-slate-600 hover:text-primary transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Simulations
          </button>
          
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {simulation.is_ai_generated ? '🤖 AI Generated' : '📝 Template'}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {simulation.category}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {simulation.difficulty}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
              {simulation.duration}
            </span>
          </div>
        </div>
      </div>

      {/* Simulation title and description */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{simulation.title}</h1>
          <p className="text-slate-600">{simulation.description}</p>
          
          {/* Learning objectives and skills if available */}
          {(simulation.learning_objectives?.length > 0 || simulation.skills_tested?.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-4">
              {simulation.learning_objectives?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Learning Objectives:</h3>
                  <div className="flex flex-wrap gap-1">
                    {simulation.learning_objectives.map((objective, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        {objective}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {simulation.skills_tested?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Skills Tested:</h3>
                  <div className="flex flex-wrap gap-1">
                    {simulation.skills_tested.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Render the HTML content in an iframe for security and isolation */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <iframe
            srcDoc={simulation.html_content}
            title={simulation.title}
            className="w-full border-0"
            style={{ minHeight: '800px', height: '100vh' }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </div>
    </div>
  );
};

export default UniversalHTMLSimulationRenderer;
