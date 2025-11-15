import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { staticSimulations } from '../data/staticSimulations'

const StaticSimulationRenderer = () => {
  const { slug } = useParams()
  const navigate = useNavigate()

  const simulation = staticSimulations.find((item) => item.slug === slug)

  if (!simulation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">Simulation not found</div>
          <p className="text-slate-600 mb-6">
            The simulation you&apos;re looking for isn&apos;t available in the static library.
          </p>
          <button
            onClick={() => navigate('/browse')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors"
          >
            Back to Browse
          </button>
        </div>
      </div>
    )
  }

  const learningObjectives = simulation.learning_objectives || simulation.learningObjectives || []
  const skillsTested = simulation.skills_tested || simulation.skillsTested || []

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
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
            <span className="px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-sm font-medium">
              🗂️ Static Library
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {simulation.category}
            </span>
            {simulation.difficulty && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {simulation.difficulty}
              </span>
            )}
            {simulation.duration && (
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                {simulation.duration}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Title & description */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{simulation.title}</h1>
          <p className="text-slate-600 max-w-3xl">{simulation.description}</p>

          {(learningObjectives.length > 0 || skillsTested.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-4">
              {learningObjectives.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Learning Objectives:</h3>
                  <div className="flex flex-wrap gap-1">
                    {learningObjectives.map((objective, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        {objective}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {skillsTested.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Skills Tested:</h3>
                  <div className="flex flex-wrap gap-1">
                    {skillsTested.map((skill, index) => (
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

      {/* HTML Simulation */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <iframe
            srcDoc={simulation.htmlContent}
            title={simulation.title}
            className="w-full border-0"
            style={{ minHeight: '800px', height: '100vh' }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </div>
    </div>
  )
}

export default StaticSimulationRenderer




