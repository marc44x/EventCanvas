import React, { useState } from 'react';
import { EventLayoutProject, AIAnalysisResult } from '../types';
import { Sparkles, ShieldCheck, TrendingUp, AlertCircle, CheckCircle2, X, RefreshCw, Layers } from 'lucide-react';

interface AIAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: EventLayoutProject;
}

const card: React.CSSProperties = {
  backgroundColor: '#f5f2eb',
  border: '1px solid #ddd8ce',
  borderRadius: 3,
  padding: '10px 12px',
};

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(44,40,37,0.45)' }}
    >
      <div
        className="w-full max-w-2xl flex flex-col overflow-hidden"
        style={{
          backgroundColor: '#faf8f4',
          border: '1.5px solid #c8c0b0',
          borderRadius: 4,
          boxShadow: '2px 6px 24px rgba(44,40,37,0.18)',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ backgroundColor: '#f0ede6', borderBottom: '1px solid #ddd8ce' }}
        >
          <div className="flex items-center gap-2">
            <Sparkles style={{ width: 16, height: 16, color: '#4a6fa5' }} />
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#2c2825' }}>AI Layout Advisor</p>
              <p style={{ fontSize: 10, color: '#9c9388', fontFamily: 'monospace' }}>
                Spatial optimisation · safety · crowd flow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#9c9388', padding: 4 }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Ready state */}
          {!analysisResult && !loading && (
            <div style={{ textAlign: 'center', padding: '32px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 52, height: 52, border: '1.5px solid #c8c0b0', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#f0ede6',
              }}>
                <Sparkles style={{ width: 22, height: 22, color: '#4a6fa5' }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#2c2825', marginBottom: 4 }}>
                  Ready to analyse your layout
                </p>
                <p style={{ fontSize: 11, color: '#9c9388', maxWidth: 360 }}>
                  Gemini will evaluate your {project.landDimensions.width}m × {project.landDimensions.height}m grounds,{' '}
                  {project.establishments.length} establishments, road network, and safety exits.
                </p>
              </div>
              <button
                onClick={handleRunAnalysis}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 18px', fontSize: 12, fontWeight: 700,
                  border: '1px solid #4a6fa5', borderRadius: 3,
                  backgroundColor: '#d9e5f5', color: '#2c4a7a', cursor: 'pointer',
                }}
              >
                <Sparkles style={{ width: 13, height: 13 }} />
                Run AI Evaluation
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <RefreshCw style={{ width: 24, height: 24, color: '#4a6fa5', animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: 12, fontWeight: 600, color: '#2c2825' }}>Evaluating spatial footprint & crowd safety…</p>
              <p style={{ fontSize: 10, color: '#9c9388', fontStyle: 'italic' }}>Inspecting clearance, road widths, commercial distribution</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ ...card, border: '1px solid #b94040', backgroundColor: '#fdf0f0', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <AlertCircle style={{ width: 14, height: 14, color: '#b94040', flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#b94040', marginBottom: 2 }}>Analysis Error</p>
                <p style={{ fontSize: 11, color: '#b94040' }}>{error}</p>
              </div>
            </div>
          )}

          {/* Results */}
          {analysisResult && (
            <>
              {/* Score cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {/* Spatial Efficiency */}
                <div style={card}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: '#4a6fa5', textTransform: 'uppercase' }}>
                      <Layers style={{ width: 11, height: 11 }} /> Spatial
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: '#2c2825' }}>
                      {analysisResult.spatialEfficiencyScore}<span style={{ fontSize: 10, color: '#9c9388' }}>/100</span>
                    </span>
                  </div>
                  <div style={{ height: 4, backgroundColor: '#e8e3d8', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${analysisResult.spatialEfficiencyScore}%`, backgroundColor: '#4a6fa5', borderRadius: 2 }} />
                  </div>
                </div>

                {/* Crowd Safety */}
                <div style={card}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: '#3a7a50', textTransform: 'uppercase' }}>
                      <ShieldCheck style={{ width: 11, height: 11 }} /> Safety
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace', color: '#2c2825' }}>
                      {analysisResult.crowdSafetyScore}<span style={{ fontSize: 10, color: '#9c9388' }}>/100</span>
                    </span>
                  </div>
                  <div style={{ height: 4, backgroundColor: '#e8e3d8', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${analysisResult.crowdSafetyScore}%`, backgroundColor: '#3a7a50', borderRadius: 2 }} />
                  </div>
                </div>
              </div>

              {/* Commercial potential */}
              <div style={card}>
                <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9c9388', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <TrendingUp style={{ width: 10, height: 10 }} /> Commercial & Revenue
                </p>
                <p style={{ fontSize: 11, color: '#5c5248', lineHeight: 1.6 }}>{analysisResult.commercialPotential}</p>
              </div>

              {/* Recommendations */}
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9c9388', marginBottom: 6 }}>
                  Recommendations
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {analysisResult.recommendations?.map((rec, idx) => (
                    <div key={idx} style={{ ...card, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <CheckCircle2 style={{ width: 12, height: 12, color: '#4a6fa5', flexShrink: 0, marginTop: 1 }} />
                      <span style={{ fontSize: 11, color: '#5c5248', lineHeight: 1.5 }}>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested additions */}
              {analysisResult.suggestedAdditions?.length > 0 && (
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9c9388', marginBottom: 6 }}>
                    Suggested Additions
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {analysisResult.suggestedAdditions.map((item, idx) => (
                      <span key={idx} style={{
                        fontSize: 10, padding: '3px 8px',
                        border: '1px solid #b07030', borderRadius: 2,
                        backgroundColor: '#fdf6ee', color: '#b07030',
                      }}>
                        + {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3 shrink-0"
          style={{ backgroundColor: '#f0ede6', borderTop: '1px solid #ddd8ce' }}
        >
          {analysisResult ? (
            <button
              onClick={handleRunAnalysis}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#4a6fa5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              <RefreshCw style={{ width: 11, height: 11 }} /> Re-evaluate
            </button>
          ) : <div />}
          <button
            onClick={onClose}
            style={{
              fontSize: 11, fontWeight: 600, padding: '5px 14px',
              border: '1px solid #c8c0b0', borderRadius: 3,
              backgroundColor: 'transparent', color: '#5c5248', cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
