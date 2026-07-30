import React, { useState } from 'react';
import { EventLayoutProject } from '../types';
import { ExportOptions, downloadSVG, downloadPNG, downloadJSONProject } from '../utils/exportUtils';
import { Download, FileCode, Image, FileText, X, Check, Sparkles } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: EventLayoutProject;
  svgRef: React.RefObject<SVGSVGElement | null>;
}

const COLORS = {
  paper: '#faf8f4',
  pencil: '#c8c0b0',
  ink: '#2c2825',
  mutedInk: '#5c5248',
  greyInk: '#9c9388',
  blue: '#4a6fa5',
  green: '#3a7a50',
  red: '#b94040',
  headerBg: '#f0ede6',
  cardBorder: '#ddd8ce',
  divider: '#e8e3d8',
  blueBg: '#d9e5f5',
  blueText: '#2c4a7a',
};

const sectionLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 9,
  fontWeight: 700,
  color: COLORS.greyInk,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  fontFamily: 'monospace',
  marginBottom: 8,
};

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, project, svgRef }) => {
  const [format, setFormat] = useState<'svg' | 'png' | 'json'>('png');
  const [pngScale, setPngScale] = useState<number>(2); // 2x high dpi default
  const [includeLegend, setIncludeLegend] = useState(true);
  const [includeTitleBlock, setIncludeTitleBlock] = useState(true);
  const [includeGrid, setIncludeGrid] = useState(true);
  const [theme, setTheme] = useState<'light' | 'blueprint' | 'monochrome'>('light');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (format === 'json') {
        downloadJSONProject(project);
      } else if (format === 'svg' && svgRef.current) {
        downloadSVG(svgRef.current, project, {
          format: 'svg',
          pngScale,
          includeLegend,
          includeTitleBlock,
          includeGrid,
          theme,
        });
      } else if (format === 'png' && svgRef.current) {
        await downloadPNG(svgRef.current, project, {
          format: 'png',
          pngScale,
          includeLegend,
          includeTitleBlock,
          includeGrid,
          theme,
        });
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  const formatBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 8px',
    border: active ? `1px solid ${COLORS.blue}` : `1px solid ${COLORS.pencil}`,
    backgroundColor: active ? COLORS.blueBg : 'transparent',
    color: active ? COLORS.blueText : COLORS.mutedInk,
    borderRadius: 3,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition: 'border-color 0.15s, background-color 0.15s',
  });

  const scaleBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 10px',
    border: active ? `1px solid ${COLORS.blue}` : `1px solid ${COLORS.pencil}`,
    backgroundColor: active ? COLORS.blueBg : 'transparent',
    color: active ? COLORS.blueText : COLORS.mutedInk,
    borderRadius: 3,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: active ? 700 : 500,
    cursor: 'pointer',
    transition: 'border-color 0.15s, background-color 0.15s',
  });

  const themeBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 10px',
    border: active ? `1px solid ${COLORS.blue}` : `1px solid ${COLORS.pencil}`,
    backgroundColor: active ? COLORS.blueBg : 'transparent',
    color: active ? COLORS.blueText : COLORS.mutedInk,
    borderRadius: 3,
    fontSize: 11,
    fontWeight: active ? 700 : 500,
    cursor: 'pointer',
    transition: 'border-color 0.15s, background-color 0.15s',
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 16,
      }}
      className="animate-in fade-in duration-200"
    >
      <div
        style={{
          backgroundColor: COLORS.paper,
          border: `1.5px solid ${COLORS.pencil}`,
          borderRadius: 4,
          boxShadow: '2px 4px 16px rgba(44,40,37,0.15)',
          width: '100%',
          maxWidth: 512,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: COLORS.headerBg,
            borderBottom: `1px solid ${COLORS.cardBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ color: COLORS.blue, display: 'flex' }}>
              <Download style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink, margin: 0 }}>Export Event Land Map</h2>
              <p style={{ fontSize: 11, color: COLORS.greyInk, margin: '2px 0 0' }}>
                High-resolution SVG, PNG image, or layout project download
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '4px 6px',
              color: COLORS.greyInk,
              background: 'transparent',
              border: `1px solid ${COLORS.pencil}`,
              borderRadius: 3,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
          {/* Format Selection */}
          <div>
            <label style={sectionLabelStyle}>Export File Format</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <button
                type="button"
                onClick={() => setFormat('png')}
                style={formatBtnStyle(format === 'png')}
              >
                <Image style={{ width: 18, height: 18 }} />
                <span style={{ fontSize: 11, fontWeight: 700 }}>High-Res PNG</span>
                <span style={{ fontSize: 10, color: COLORS.greyInk }}>Raster Image</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('svg')}
                style={formatBtnStyle(format === 'svg')}
              >
                <FileCode style={{ width: 18, height: 18 }} />
                <span style={{ fontSize: 11, fontWeight: 700 }}>Vector SVG</span>
                <span style={{ fontSize: 10, color: COLORS.greyInk }}>Lossless Vector</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                style={formatBtnStyle(format === 'json')}
              >
                <FileText style={{ width: 18, height: 18 }} />
                <span style={{ fontSize: 11, fontWeight: 700 }}>Layout JSON</span>
                <span style={{ fontSize: 10, color: COLORS.greyInk }}>Editable Data</span>
              </button>
            </div>
          </div>

          {/* PNG Resolution Scale */}
          {format === 'png' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={sectionLabelStyle}>PNG Export Resolution Quality</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setPngScale(1)}
                  style={scaleBtnStyle(pngScale === 1)}
                >
                  Standard (1080p)
                </button>
                <button
                  type="button"
                  onClick={() => setPngScale(2)}
                  style={scaleBtnStyle(pngScale === 2)}
                >
                  High DPI (2K)
                </button>
                <button
                  type="button"
                  onClick={() => setPngScale(4)}
                  style={scaleBtnStyle(pngScale === 4)}
                >
                  Ultra HD (4K / Print)
                </button>
              </div>
            </div>
          )}

          {/* Theme Style */}
          {format !== 'json' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={sectionLabelStyle}>Visual Theme Style</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  style={themeBtnStyle(theme === 'light')}
                >
                  Architectural Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('blueprint')}
                  style={themeBtnStyle(theme === 'blueprint')}
                >
                  Dark Blueprint
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('monochrome')}
                  style={themeBtnStyle(theme === 'monochrome')}
                >
                  Monochrome
                </button>
              </div>
            </div>
          )}

          {/* Include Toggles */}
          {format !== 'json' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8, borderTop: `1px solid ${COLORS.divider}` }}>
              <label style={sectionLabelStyle}>Export Options &amp; Overlays</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 11,
                    color: COLORS.mutedInk,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={includeTitleBlock}
                    onChange={(e) => setIncludeTitleBlock(e.target.checked)}
                    style={{ width: 14, height: 14 }}
                  />
                  <span>Include Event Metadata Title Block &amp; Host Info Banner</span>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 11,
                    color: COLORS.mutedInk,
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={includeLegend}
                    onChange={(e) => setIncludeLegend(e.target.checked)}
                    style={{ width: 14, height: 14 }}
                  />
                  <span>Include Scale Bar &amp; Map Legend Overlay</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: COLORS.headerBg,
            borderTop: `1px solid ${COLORS.cardBorder}`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '7px 14px',
              fontSize: 12,
              fontWeight: 500,
              color: COLORS.greyInk,
              backgroundColor: 'transparent',
              border: `1px solid ${COLORS.pencil}`,
              borderRadius: 3,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            style={{
              padding: '7px 16px',
              fontSize: 12,
              fontWeight: 700,
              color: '#ffffff',
              backgroundColor: COLORS.green,
              border: `1px solid #2d6040`,
              borderRadius: 3,
              cursor: isExporting ? 'not-allowed' : 'pointer',
              opacity: isExporting ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Download style={{ width: 14, height: 14 }} />
            {isExporting ? 'Generating Download...' : `Download ${format.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
};
