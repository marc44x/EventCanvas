import React, { useState } from 'react';
import { EventLayoutProject } from '../types';
import { PRESET_PROJECT_TEMPLATES } from '../data/defaultVariables';
import {
  Ruler,
  Download,
  BarChart3,
  Sparkles,
  Layers,
  FolderOpen,
  ChevronDown,
  Sun,
  Moon,
  RotateCcw,
  PlusCircle,
} from 'lucide-react';

interface HeaderNavbarProps {
  project: EventLayoutProject;
  onOpenLandModal: () => void;
  onOpenExportModal: () => void;
  onToggleAnalytics: () => void;
  onOpenAIAdvisor: () => void;
  onLoadPreset: (preset: EventLayoutProject) => void;
  onToggleBlueprint: () => void;
  onClearCanvas: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  project,
  onOpenLandModal,
  onOpenExportModal,
  onToggleAnalytics,
  onOpenAIAdvisor,
  onLoadPreset,
  onToggleBlueprint,
  onClearCanvas,
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);

  return (
    <header className="h-16 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-30 shrink-0 text-slate-900 dark:text-slate-100 shadow-sm">
      {/* Left Branding & Event Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
              Event Retail Coordinator
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Land Visualizer & Retail System Editor
            </p>
          </div>
        </div>

        <div className="hidden lg:block h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* Current Event Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-medium">
          <span className="font-bold text-slate-800 dark:text-slate-200">{project.title}</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500 dark:text-slate-400 font-mono">
            {project.landDimensions.width}m x {project.landDimensions.height}m ({project.landDimensions.width * project.landDimensions.height} m²)
          </span>
        </div>
      </div>

      {/* Right Action Toolbar */}
      <div className="flex items-center gap-2">
        {/* Host's Land Setup Button */}
        <button
          onClick={onOpenLandModal}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition flex items-center gap-1.5"
          title="Host's Intention & Land Dimensions Setup"
        >
          <Ruler className="w-4 h-4 text-blue-500" />
          <span className="hidden sm:inline">Land Dimensions</span>
        </button>

        {/* Presets Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPresetsMenu(!showPresetsMenu)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition flex items-center gap-1.5"
          >
            <FolderOpen className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Templates</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {showPresetsMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-in fade-in duration-150">
              <span className="block px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Load Preset Ground Templates
              </span>
              {PRESET_PROJECT_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => {
                    onLoadPreset(tpl);
                    setShowPresetsMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition space-y-0.5"
                >
                  <div className="font-bold text-slate-900 dark:text-white">{tpl.title}</div>
                  <div className="text-[10px] text-slate-500">
                    {tpl.landDimensions.width}m x {tpl.landDimensions.height}m • {tpl.establishments.length} Stalls
                  </div>
                </button>
              ))}

              <hr className="border-slate-200 dark:border-slate-800" />

              <button
                onClick={() => {
                  onClearCanvas();
                  setShowPresetsMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear All Stalls & Roads
              </button>
            </div>
          )}
        </div>

        {/* Blueprint Mode Toggle */}
        <button
          onClick={onToggleBlueprint}
          className={`p-2 text-xs rounded-xl transition ${
            project.blueprintMode
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
          title="Toggle Blueprint Mode"
        >
          {project.blueprintMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* AI Advisor Button */}
        <button
          onClick={onOpenAIAdvisor}
          className="px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="hidden md:inline">AI Layout Advisor</span>
        </button>

        {/* Metrics Toggle */}
        <button
          onClick={onToggleAnalytics}
          className="p-2 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
          title="Toggle Metrics & Revenue Panel"
        >
          <BarChart3 className="w-4 h-4" />
        </button>

        {/* High-Res Export Button */}
        <button
          onClick={onOpenExportModal}
          className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" />
          <span>Export SVG / PNG</span>
        </button>
      </div>
    </header>
  );
};
