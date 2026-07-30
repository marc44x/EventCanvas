import React, { useState } from 'react';
import { EventLayoutProject, AIAnalysisResult } from '../types';
import { Sparkles, ShieldCheck, TrendingUp, AlertCircle, CheckCircle2, X, RefreshCw, Layers } from 'lucide-react';

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: EventLayoutProject;
}

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({ isOpen, onClose, project }) => {
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/analyze-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landDimensions: project.landDimensions,
          establishments: project.establishments,
          roads: project.roads,
          waypoints: project.waypoints,
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        setAnalysisResult(json.data);
      } else {
        setError(json.error || 'Failed to analyze layout with AI.');
      }
    } catch (err: any) {
      console.error('AI Analysis error:', err);
      setError('Unable to reach server AI endpoint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold">Gemini Event Master Plan Advisor</h2>
              <p className="text-xs text-blue-100">
                AI Spatial optimization, safety compliance & crowd flow analysis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-900 dark:text-slate-100 text-xs">
          {!analysisResult && !loading && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-sm font-bold">Ready to analyze event land layout</h3>
                <p className="text-slate-500">
                  Gemini AI will evaluate your {project.landDimensions.width}m x {project.landDimensions.height}m grounds, {project.establishments.length} placed establishments, road network, and safety exit routes.
                </p>
              </div>
              <button
                onClick={handleRunAnalysis}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition inline-flex items-center gap-2 text-xs"
              >
                <Sparkles className="w-4 h-4" /> Run AI Layout Evaluation
              </button>
            </div>
          )}

          {loading && (
            <div className="py-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="font-bold text-sm">Evaluating spatial footprint & crowd safety...</p>
              <p className="text-slate-400">Inspecting clearance, road widths, and commercial distribution</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-900 dark:text-red-200 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold">Analysis Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-6">
              {/* Score Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-blue-900 dark:text-blue-200 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4" /> Spatial Efficiency
                    </span>
                    <span className="text-xl font-mono">{analysisResult.spatialEfficiencyScore}/100</span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${analysisResult.spatialEfficiencyScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-emerald-900 dark:text-emerald-200 font-bold">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Crowd Safety & Clearance
                    </span>
                    <span className="text-xl font-mono">{analysisResult.crowdSafetyScore}/100</span>
                  </div>
                  <div className="w-full bg-emerald-200 dark:bg-emerald-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${analysisResult.crowdSafetyScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Commercial Potential */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Commercial & Revenue Analysis
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {analysisResult.commercialPotential}
                </p>
              </div>

              {/* Master Planning Recommendations */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Actionable Master Planning Recommendations
                </h4>
                <div className="space-y-1.5">
                  {analysisResult.recommendations?.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg flex items-start gap-2 text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Additions */}
              {analysisResult.suggestedAdditions?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                    Suggested Missing Amenities or Stalls
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.suggestedAdditions.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 rounded-lg font-medium"
                      >
                        + {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          {analysisResult && (
            <button
              onClick={handleRunAnalysis}
              disabled={loading}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-evaluate Layout
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
