import React, { useRef, useState, useEffect } from 'react';

/**
 * Whiteboard Canvas Component
 * Allows users to draw wireframes/sketches directly in the browser
 */
const WhiteboardCanvas = ({ onDrawingChange, initialDrawing = null }) => {
  const canvasRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen'); // 'pen', 'eraser', 'clear'
  const [penColor, setPenColor] = useState('#000000');
  const [penWidth, setPenWidth] = useState(3);
  const [drawingData, setDrawingData] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 600; // Fixed height for drawing area

    // Set default styles
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Load initial drawing if provided
    if (initialDrawing) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = initialDrawing;
    }
  }, [initialDrawing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
  }, [penColor, penWidth]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Handle both mouse and touch events
    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e);

    if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = penWidth * 2;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = penWidth;
      ctx.strokeStyle = penColor;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Throttle save operations
    if (!saveTimeoutRef.current) {
      saveTimeoutRef.current = setTimeout(() => {
        saveDrawingState();
        saveTimeoutRef.current = null;
      }, 500); // Save every 500ms
    }
  };

  const stopDrawing = (e) => {
    if (e) e.preventDefault();
    if (isDrawing) {
      setIsDrawing(false);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      saveDrawingState();
    }
  };

  const saveDrawingState = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Convert canvas to base64 image
      const dataURL = canvas.toDataURL('image/png');
      setDrawingData(dataURL);
      
      // Notify parent component
      if (onDrawingChange) {
        onDrawingChange(dataURL);
      }
    } catch (error) {
      console.error('Error saving drawing:', error);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawingData(null);
    if (onDrawingChange) {
      onDrawingChange(null);
    }
  };

  const exportAsImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const dataURL = canvas.toDataURL('image/png');
      return dataURL;
    } catch (error) {
      console.error('Error exporting image:', error);
      return null;
    }
  };

  // Expose export function via ref (if needed)
  React.useImperativeHandle(React.forwardRef(() => null), () => ({
    exportAsImage
  }));

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          {/* Tool Selection */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">Tool:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentTool('pen')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  currentTool === 'pen'
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
                }`}
              >
                ✏️ Pen
              </button>
              <button
                onClick={() => setCurrentTool('eraser')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  currentTool === 'eraser'
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
                }`}
              >
                🧹 Eraser
              </button>
              <button
                onClick={clearCanvas}
                className="px-4 py-2 rounded-lg font-semibold text-sm bg-white text-red-600 border-2 border-red-300 hover:bg-red-50 transition-all"
              >
                🗑️ Clear
              </button>
            </div>
          </div>

          {/* Color Picker */}
          {currentTool === 'pen' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-700">Color:</label>
              <input
                type="color"
                value={penColor}
                onChange={(e) => setPenColor(e.target.value)}
                className="w-12 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
              />
              <div className="flex gap-1">
                {['#000000', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'].map(color => (
                  <button
                    key={color}
                    onClick={() => setPenColor(color)}
                    className={`w-8 h-8 rounded-lg border-2 ${
                      penColor === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pen Width */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">Size:</label>
            <input
              type="range"
              min="1"
              max="10"
              value={penWidth}
              onChange={(e) => setPenWidth(parseInt(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-600 w-8">{penWidth}px</span>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="border-4 border-gray-300 rounded-xl bg-white shadow-inner overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full cursor-crosshair"
          style={{ height: '600px', touchAction: 'none' }}
        />
      </div>

      {/* Drawing Status */}
      {drawingData && (
        <p className="mt-2 text-sm text-green-600 font-medium">
          ✓ Drawing saved
        </p>
      )}
    </div>
  );
};

export default WhiteboardCanvas;

