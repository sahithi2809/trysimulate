import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createSimulationFromPrompt } from '../services/secureAiService';

const resolveSupabaseUrl = () => {
  if (import.meta.env?.VITE_SUPABASE_URL) {
    return import.meta.env.VITE_SUPABASE_URL;
  }

  if (typeof process !== 'undefined' && process?.env) {
    return (
      process.env.VITE_SUPABASE_URL ||
      process.env.REACT_APP_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      ''
    );
  }

  return '';
};

const BuilderTest = () => {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [previewUrl, setPreviewUrl] = useState('');
  const [iframeSrc, setIframeSrc] = useState('');
  const iframeUrlRef = useRef(null);

  const fullPreviewUrl = useMemo(() => {
    if (!previewUrl) return '';
    if (previewUrl.startsWith('http')) return previewUrl;

    const supabaseUrl = resolveSupabaseUrl();

    if (!supabaseUrl) return '';

    return `${supabaseUrl.replace(/\/$/, '')}/functions/v1/create-simulation${previewUrl}`;
  }, [previewUrl]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to describe the simulation.');
      return;
    }

    setLoading(true);
    setError(null);
    setPreviewUrl('');
    if (iframeUrlRef.current) {
      URL.revokeObjectURL(iframeUrlRef.current);
      iframeUrlRef.current = null;
    }
    setIframeSrc('');

    try {
      const payload = await createSimulationFromPrompt({
        title: title.trim() || 'Untitled Simulation',
        prompt,
      });

      setPreviewUrl(payload.preview_url);

      if (payload.preview_html) {
        if (iframeUrlRef.current) {
          URL.revokeObjectURL(iframeUrlRef.current);
        }
        const objectUrl = URL.createObjectURL(new Blob([payload.preview_html], { type: 'text/html' }));
        iframeUrlRef.current = objectUrl;
        setIframeSrc(objectUrl);
      } else {
        if (iframeUrlRef.current) {
          URL.revokeObjectURL(iframeUrlRef.current);
        }
        iframeUrlRef.current = null;
        setIframeSrc('');
      }
    } catch (err) {
      setError(err.message || 'Failed to create simulation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (iframeUrlRef.current) {
        URL.revokeObjectURL(iframeUrlRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                Simulation Builder (Test)
              </h1>
              <p className="text-slate-600 mt-1">
                Provide a detailed prompt and let the LLM craft a structured workplace simulation,
                complete with iframe preview and feedback evaluation.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
              Beta
            </span>
          </div>

          <div className="grid gap-5">
            <div className="grid gap-3">
              <label htmlFor="simulation-title" className="text-sm font-medium text-slate-700">
                Simulation Title
              </label>
              <input
                id="simulation-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Launch Strategy Simulation"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              />
            </div>

            <div className="grid gap-3">
              <label htmlFor="simulation-prompt" className="text-sm font-medium text-slate-700">
                Simulation Prompt
              </label>
              <textarea
                id="simulation-prompt"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Describe the scenario, audience, objectives, constraints, and skills to evaluate..."
                className="w-full h-48 rounded-xl border border-slate-300 px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow resize-none"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Create Simulation'}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}
        </div>

        {(iframeSrc || fullPreviewUrl) && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-900">Interactive Preview</h3>
              <a
                href={iframeSrc || fullPreviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-primary hover:text-primary/80"
              >
                Open in new tab
              </a>
            </div>
            <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              <iframe
                title="Simulation Preview"
                src={iframeSrc || fullPreviewUrl}
                className="h-[720px] w-full"
                allow="clipboard-write; clipboard-read"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuilderTest;

