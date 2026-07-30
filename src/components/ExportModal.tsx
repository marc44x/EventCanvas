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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Export Event Land Map</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                High-resolution SVG, PNG image, or layout project download
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Format Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Export File Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormat('png')}
                className={`p-3 rounded-xl border text-left transition flex flex-col items-center justify-center gap-2 ${
                  format === 'png'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Image className="w-5 h-5" />
                <span className="text-xs font-bold">High-Res PNG</span>
                <span className="text-[10px] text-slate-400">Raster Image</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('svg')}
                className={`p-3 rounded-xl border text-left transition flex flex-col items-center justify-center gap-2 ${
                  format === 'svg'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <FileCode className="w-5 h-5" />
                <span className="text-xs font-bold">Vector SVG</span>
                <span className="text-[10px] text-slate-400">Lossless Vector</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('json')}
                className={`p-3 rounded-xl border text-left transition flex flex-col items-center justify-center gap-2 ${
                  format === 'json'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="text-xs font-bold">Layout JSON</span>
                <span className="text-[10px] text-slate-400">Editable Data</span>
              </button>
            </div>
          </div>

          {/* PNG Resolution Scale */}
          {format === 'png' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                PNG Export Resolution Quality
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPngScale(1)}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium font-mono transition ${
                    pngScale === 1
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Standard (1080p)
                </button>
                <button
                  type="button"
                  onClick={() => setPngScale(2)}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium font-mono transition ${
                    pngScale === 2
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  High DPI (2K)
                </button>
                <button
                  type="button"
                  onClick={() => setPngScale(4)}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium font-mono transition ${
                    pngScale === 4
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Ultra HD (4K / Print)
                </button>
              </div>
            </div>
          )}

          {/* Theme Style */}
          {format !== 'json' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Visual Theme Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium transition ${
                    theme === 'light'
                      ? 'border-blue-600 bg-slate-100 dark:bg-slate-800 text-blue-600 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Architectural Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('blueprint')}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium transition ${
                    theme === 'blueprint'
                      ? 'border-blue-600 bg-slate-900 text-blue-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Dark Blueprint
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('monochrome')}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium transition ${
                    theme === 'monochrome'
                      ? 'border-slate-900 bg-white text-slate-900 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Monochrome
                </button>
              </div>
            </div>
          )}

          {/* Include Toggles */}
          {format !== 'json' && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Export Options & Overlays
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTitleBlock}
                    onChange={(e) => setIncludeTitleBlock(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span>Include Event Metadata Title Block & Host Info Banner</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeLegend}
                    onChange={(e) => setIncludeLegend(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span>Include Scale Bar & Map Legend Overlay</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Generating Download...' : `Download ${format.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
};
