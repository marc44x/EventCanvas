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
  RotateCcw,
  Sun,
  Moon,
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
    <header
      className="h-14 px-5 flex items-center justify-between shrink-0 z-30"
      style={{
        backgroundColor: '#faf8f4',
        borderBottom: '1.5px solid #c8c0b0',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
      }}
    >
      {/* Left — Logo & Event badge */}
      <div className="flex items-center gap-4">
        {/* Logo mark */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 flex items-center justify-center"
            style={{ border: '1.5px solid #4a6fa5', borderRadius: '4px', color: '#4a6fa5' }}
          >
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <p
              className="text-sm font-semibold leading-none"
              style={{ color: '#2c2825', fontFamily: 'Inter, sans-serif' }}
            >
              Event Retail Coordinator
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: '#9c9388', fontFamily: 'monospace' }}>
              layout planner
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-5" style={{ width: '1px', backgroundColor: '#c8c0b0' }} />

        {/* Event badge */}
        <div
          className="hidden lg:flex items-center gap-2 px-3 py-1 text-xs"
          style={{ backgroundColor: '#f0ede6', border: '1px solid #d0c8b8', borderRadius: '4px' }}
        >
          <span className="font-semibold" style={{ color: '#2c2825' }}>{project.title}</span>
          <span style={{ color: '#c8c0b0' }}>·</span>
          <span className="font-mono" style={{ color: '#5c5248' }}>
            {project.landDimensions.width}m × {project.landDimensions.height}m
          </span>
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-1.5">
        {/* Land Dimensions */}
        <button
          onClick={onOpenLandModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors"
          style={{
            color: '#5c5248',
            backgroundColor: 'transparent',
            border: '1px solid #c8c0b0',
            borderRadius: '4px',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0ede6')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          title="Edit land dimensions"
        >
          <Ruler className="w-3.5 h-3.5" style={{ color: '#4a6fa5' }} />
          <span className="hidden sm:inline">Dimensions</span>
        </button>

        {/* Templates dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPresetsMenu(!showPresetsMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              color: '#5c5248',
              backgroundColor: 'transparent',
              border: '1px solid #c8c0b0',
              borderRadius: '4px',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0ede6')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <FolderOpen className="w-3.5 h-3.5" style={{ color: '#b07030' }} />
            <span className="hidden sm:inline">Templates</span>
            <ChevronDown className="w-3 h-3 opacity-50" />
          </button>

          {showPresetsMenu && (
            <div
              className="absolute right-0 mt-1 w-60 z-50 py-1"
              style={{
                backgroundColor: '#faf8f4',
                border: '1.5px solid #c8c0b0',
                borderRadius: '4px',
                boxShadow: '2px 4px 12px rgba(44,40,37,0.12)',
              }}
            >
              <span
                className="block px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: '#9c9388' }}
              >
                Load Preset
              </span>
              {PRESET_PROJECT_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => { onLoadPreset(tpl); setShowPresetsMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs transition-colors"
                  style={{ color: '#2c2825' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0ede6')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div className="font-medium">{tpl.title}</div>
                  <div className="text-[10px] font-mono" style={{ color: '#9c9388' }}>
                    {tpl.landDimensions.width}m × {tpl.landDimensions.height}m · {tpl.establishments.length} stalls
                  </div>
                </button>
              ))}
              <div style={{ borderTop: '1px solid #e8e3d8', margin: '4px 0' }} />
              <button
                onClick={() => { onClearCanvas(); setShowPresetsMenu(false); }}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors"
                style={{ color: '#b94040' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fdf0f0')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <RotateCcw className="w-3 h-3" /> Clear canvas
              </button>
            </div>
          )}
        </div>

        {/* Blueprint toggle */}
        <button
          onClick={onToggleBlueprint}
          className="p-1.5 transition-colors"
          style={{
            color: project.blueprintMode ? '#4a6fa5' : '#9c9388',
            border: '1px solid #c8c0b0',
            borderRadius: '4px',
            backgroundColor: project.blueprintMode ? '#d9e5f5' : 'transparent',
          }}
          title="Toggle blueprint mode"
        >
          {project.blueprintMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* AI Advisor */}
        <button
          onClick={onOpenAIAdvisor}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors"
          style={{
            color: '#4a6fa5',
            backgroundColor: '#d9e5f5',
            border: '1px solid #4a6fa5',
            borderRadius: '4px',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#c5d8f0')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#d9e5f5')}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden md:inline">AI Advisor</span>
        </button>

        {/* Metrics */}
        <button
          onClick={onToggleAnalytics}
          className="p-1.5 transition-colors"
          style={{
            color: '#5c5248',
            border: '1px solid #c8c0b0',
            borderRadius: '4px',
            backgroundColor: 'transparent',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0ede6')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          title="Toggle metrics panel"
        >
          <BarChart3 className="w-4 h-4" />
        </button>

        {/* Export */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors"
          style={{
            color: '#ffffff',
            backgroundColor: '#3a7a50',
            border: '1px solid #2d6040',
            borderRadius: '4px',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#2d6040')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#3a7a50')}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
