import React, { useState, useEffect } from 'react';
import { saveTaskData, getTaskData, markTaskComplete } from '../../utils/demoStorage';
import { validateTask4 } from '../../utils/demoValidation';
import WhiteboardCanvas from './WhiteboardCanvas';

const Task4Wireframe = ({ onNext, onPrevious, onComplete, taskId, canGoNext, canGoPrevious, simulation, taskData }) => {
  const [inputMethod, setInputMethod] = useState('draw'); // 'draw' or 'upload'
  const [fileUploaded, setFileUploaded] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [drawingData, setDrawingData] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    const saved = getTaskData(taskId);
    if (saved) {
      setInputMethod(saved.inputMethod || 'draw');
      setFileUploaded(saved.fileUploaded || false);
      setUploadedFile(saved.uploadedFile || null);
      setDrawingData(saved.drawingData || null);
      setExplanation(saved.explanation || '');
      setSubmitted(saved.submitted || false);
    }
  }, [taskId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setUploadedFile(base64String);
        setFileUploaded(true);
        setDrawingData(null); // Clear drawing if file uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrawingChange = (drawing) => {
    setDrawingData(drawing);
    if (drawing) {
      setFileUploaded(false); // Clear file upload if drawing exists
      setUploadedFile(null);
    }
  };

  const handleSubmit = () => {
    // Validate that user has either drawing or file
    if (!drawingData && !fileUploaded) {
      alert('Please either draw a wireframe or upload a file before submitting.');
      return;
    }

    const data = {
      inputMethod,
      fileUploaded,
      uploadedFile,
      drawingData,
      explanation,
      hasWireframe: !!(drawingData || fileUploaded)
    };
    
    saveTaskData(taskId, { ...data, submitted: true });
    const result = validateTask4(data);
    setValidationResult(result);
    setSubmitted(true);
    markTaskComplete(taskId);
    onComplete(taskId);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Task 4: Low-fidelity Wireframe / UX Sketch</h2>
        <p className="text-gray-700 mb-6">
          Sketch 3 key screens for the Smart Fitness Watch app: onboarding, home summary, and activity detail.
        </p>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Design Requirements</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• <strong>Onboarding screen:</strong> Welcome flow, permissions setup, initial configuration</li>
            <li>• <strong>Home summary:</strong> Daily metrics overview, key stats at a glance</li>
            <li>• <strong>Activity detail:</strong> Detailed view of steps, heart rate, sleep data</li>
          </ul>
        </div>

        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Design Tips</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Show key metrics prominently on each screen</li>
            <li>• Consider accessibility (font sizes, color contrast)</li>
            <li>• Design for glanceability - users should see info quickly</li>
            <li>• Think about edge cases (empty states, error messages)</li>
          </ul>
        </div>

        {/* Input Method Selection */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
          <label className="block text-base font-bold text-gray-900 mb-4">
            Choose Input Method
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setInputMethod('draw')}
              className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${
                inputMethod === 'draw'
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
              }`}
            >
              🎨 Draw on Whiteboard
            </button>
            <button
              onClick={() => setInputMethod('upload')}
              className={`flex-1 px-6 py-4 rounded-xl font-semibold transition-all ${
                inputMethod === 'upload'
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
              }`}
            >
              📁 Upload File
            </button>
          </div>
        </div>

        {/* Whiteboard Drawing */}
        {inputMethod === 'draw' && (
          <div className="mb-6">
            <label className="block text-base font-bold text-gray-900 mb-4">
              Draw Your Wireframe
            </label>
            <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200">
              <WhiteboardCanvas
                onDrawingChange={handleDrawingChange}
                initialDrawing={drawingData}
              />
            </div>
            {drawingData && (
              <p className="mt-2 text-sm text-green-600 font-medium">
                ✓ Drawing saved automatically
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Draw your wireframe directly on the canvas above. Your drawing is saved automatically.
            </p>
          </div>
        )}

        {/* File Upload */}
        {inputMethod === 'upload' && (
          <div className="mb-6">
            <label className="block text-base font-bold text-gray-900 mb-2">
              Upload Wireframe/Sketch (PNG, JPG, or PDF)
            </label>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-primary file:to-accent file:text-white hover:file:opacity-90 transition-all"
            />
            {fileUploaded && uploadedFile && (
              <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                <p className="text-sm text-green-700 font-semibold mb-2">✓ File uploaded successfully</p>
                <img 
                  src={uploadedFile} 
                  alt="Uploaded wireframe" 
                  className="max-w-full h-auto rounded-lg border-2 border-gray-200"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
              You can sketch on paper and take a photo, use a design tool, or create a simple wireframe.
            </p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Explanation of Design Choices (50-150 words)
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            rows="6"
            placeholder="Explain your design rationale: Why did you prioritize certain information? How does the layout support user needs? What accessibility considerations did you make?..."
          />
          <p className="mt-1 text-xs text-gray-500">{explanation.length} characters</p>
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Task Score: {validationResult.score}/100</h4>
            {validationResult.warnings && validationResult.warnings.length > 0 && (
              <div className="mb-2">
                {validationResult.warnings.map((w, i) => (
                  <p key={i} className="text-sm text-yellow-700">⚠ {w}</p>
                ))}
              </div>
            )}
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

export default Task4Wireframe;

