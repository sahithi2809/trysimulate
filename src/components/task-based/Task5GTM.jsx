import React, { useState, useEffect } from 'react';
import { ambassadorOptions } from '../../data/demoSimulationData';
import { saveTaskData, getTaskData, markTaskComplete } from '../../utils/demoStorage';
import { validateTask5 } from '../../utils/demoValidation';

const Task5GTM = ({ onNext, onPrevious, onComplete, taskId, canGoNext, canGoPrevious }) => {
  const [positioning, setPositioning] = useState('');
  const [pricing, setPricing] = useState('');
  const [channels, setChannels] = useState('');
  const [kpis, setKpis] = useState('');
  const [selectedAmbassador, setSelectedAmbassador] = useState(null);
  const [ambassadorJustification, setAmbassadorJustification] = useState('');
  const [fileUploaded, setFileUploaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    const saved = getTaskData(taskId);
    if (saved) {
      setPositioning(saved.positioning || '');
      setPricing(saved.pricing || '');
      setChannels(saved.channels || '');
      setKpis(saved.kpis || '');
      setSelectedAmbassador(saved.selectedAmbassador || null);
      setAmbassadorJustification(saved.ambassadorJustification || '');
      setFileUploaded(saved.fileUploaded || false);
      setSubmitted(saved.submitted || false);
    }
  }, [taskId]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileUploaded(true);
      setTimeout(() => {
        alert('Creative uploaded successfully!');
      }, 100);
    }
  };

  const handleSubmit = () => {
    const data = {
      positioning,
      pricing,
      channels,
      kpis,
      ambassador: selectedAmbassador,
      ambassadorJustification,
      fileUploaded
    };
    saveTaskData(taskId, { ...data, submitted: true });
    const result = validateTask5(data);
    setValidationResult(result);
    setSubmitted(true);
    markTaskComplete(taskId);
    onComplete(taskId);
    
    alert('Task 5 completed successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Task 5: Go-To-Market Strategy & Partnerships</h2>
        <p className="text-gray-700 mb-6">
          Craft your marketing positioning, select distribution channels, choose an ambassador, and define pricing strategy.
        </p>

        <div className="space-y-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Positioning Statement (1 sentence)
            </label>
            <input
              type="text"
              value={positioning}
              onChange={(e) => setPositioning(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., 'Noah Smart Watch: Medical-grade health monitoring at consumer prices, designed for active lifestyles.'"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Pricing Model
            </label>
            <select
              value={pricing}
              onChange={(e) => setPricing(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select pricing model...</option>
              <option value="one-time">One-time purchase ($100-$150)</option>
              <option value="subscription">Subscription + device ($50 device + $10/month)</option>
              <option value="care-plan">Care plan bundle ($120/year includes device + premium features)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Distribution Channels
            </label>
            <textarea
              value={channels}
              onChange={(e) => setChannels(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows="3"
              placeholder="e.g., Direct-to-consumer (website), Pharmacies, Retail partnerships (Best Buy, Target), Healthcare provider partnerships..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Launch Channels & KPIs
            </label>
            <textarea
              value={kpis}
              onChange={(e) => setKpis(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows="3"
              placeholder="e.g., Social media campaigns, influencer partnerships, PR launch event. KPIs: 10K pre-orders in first month, 4.5+ app store rating, 30% conversion rate..."
            />
          </div>
        </div>

        {/* Ambassador Selection */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Select Brand Ambassador</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {ambassadorOptions.map(amb => (
              <div
                key={amb.id}
                onClick={() => setSelectedAmbassador(amb)}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedAmbassador?.id === amb.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{amb.name}</h4>
                    <p className="text-sm text-gray-600">{amb.type}</p>
                  </div>
                  <span className="text-xs text-gray-500">{amb.cost}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{amb.profile}</p>
                <div className="text-xs text-gray-600">
                  <p><strong>Reach:</strong> {amb.reach}</p>
                  <p><strong>Fit:</strong> {amb.fit}</p>
                </div>
              </div>
            ))}
          </div>

          {selectedAmbassador && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Justify Your Ambassador Choice (30-80 words)
              </label>
              <textarea
                value={ambassadorJustification}
                onChange={(e) => setAmbassadorJustification(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows="3"
                placeholder="Explain why this ambassador aligns with your target persona and budget..."
              />
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Optional: Upload One-Liner Creative / Tagline
          </label>
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {fileUploaded && (
            <p className="mt-2 text-sm text-green-600">✓ File uploaded successfully</p>
          )}
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Task Score: {validationResult.score}/100</h4>
            {validationResult.strengths.length > 0 && (
              <div className="mb-2">
                <strong className="text-sm text-gray-700">Strengths:</strong>
                <ul className="text-sm text-gray-600 ml-4 list-disc">
                  {validationResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
            {validationResult.improvements.length > 0 && (
              <div>
                <strong className="text-sm text-gray-700">Improvements:</strong>
                <ul className="text-sm text-gray-600 ml-4 list-disc">
                  {validationResult.improvements.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitted}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitted ? 'Completed ✓' : 'Submit Task'}
            </button>
            {submitted && canGoNext && (
              <button
                onClick={onNext}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Next Task →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task5GTM;


