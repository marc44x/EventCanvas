import React from 'react';
import { EventLayoutProject } from '../types';
import { computeSpatialStats } from '../utils/spatialUtils';
import {
  PieChart,
  BarChart3,
  DollarSign,
  Maximize2,
  AlertTriangle,
  CheckCircle2,
  Footprints,
  Store,
  Layers,
  X,
  Sparkles,
} from 'lucide-react';

interface AnalyticsPanelProps {
  project: EventLayoutProject;
  isOpen: boolean;
  onClose: () => void;
  onOpenAIAdvisor: () => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  project,
  isOpen,
  onClose,
  onOpenAIAdvisor,
}) => {
  if (!isOpen) return null;

  const stats = computeSpatialStats(
    project.landDimensions,
    project.establishments,
    project.roads
  );

  // Group by category
  const categoryCounts: Record<string, { count: number; area: number; revenue: number }> = {};
  project.establishments.forEach((est) => {
    if (!categoryCounts[est.category]) {
      categoryCounts[est.category] = { count: 0, area: 0, revenue: 0 };
    }
    categoryCounts[est.category].count += 1;
    categoryCounts[est.category].area += est.width * est.depth;
    categoryCounts[est.category].revenue += est.rentalFee || 0;
  });

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Spatial Metrics & Revenue</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
        {/* Gemini AI Advisor Callout */}
        <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Sparkles className="w-4 h-4" /> Gemini Spatial Advisor
            </div>
            <p className="text-[11px] opacity-90 mt-0.5">
              Analyze safety compliance, crowd flow & revenue potential.
            </p>
          </div>
          <button
            onClick={onOpenAIAdvisor}
            className="px-3 py-1.5 bg-white text-blue-700 font-bold rounded-lg text-xs shadow hover:bg-blue-50 transition"
          >
            Analyze
          </button>
        </div>

        {/* Spatial Footprint Metrics */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5" /> Land Utilization
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase">Total Land Area</span>
              <p className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1">
                {stats.totalLandArea.toLocaleString()} m²
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase">Retail Stalls Footprint</span>
              <p className="text-base font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">
                {stats.allocatedRetailArea.toLocaleString()} m²
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase">Roads & Walkways</span>
              <p className="text-base font-bold font-mono text-slate-700 dark:text-slate-300 mt-1">
                {Math.round(stats.roadArea).toLocaleString()} m²
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase">Open Assembly Space</span>
              <p className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {Math.round(stats.openSpaceArea).toLocaleString()} m²
              </p>
            </div>
          </div>

          {/* Utilization Progress bar */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between font-medium">
              <span>Ground Density Efficiency:</span>
              <span className="font-bold font-mono">{stats.utilizationPercentage}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${stats.utilizationPercentage}%` }}
              />
              <div
                className="bg-emerald-500 h-full opacity-60 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((stats.roadArea / stats.totalLandArea) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Safety & Spatial Collision Checker */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Safety & Collision Status
          </h3>

          {stats.hasCollisionWarning ? (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-900 dark:text-red-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Overlapping Stalls Detected ({stats.collisionsList.length})</span>
              </div>
              <ul className="list-disc list-inside text-[11px] space-y-0.5 opacity-90">
                {stats.collisionsList.slice(0, 3).map((col, idx) => (
                  <li key={idx}>
                    "{col.name1}" overlaps with "{col.name2}"
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-900 dark:text-emerald-200 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero spatial collisions detected! Clearance is optimal.</span>
            </div>
          )}
        </div>

        {/* Financial Revenue Potential */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" /> Host Rental Revenue Estimate
          </h3>

          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-xl space-y-1">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium uppercase">
              Total Estimated Daily Rental Income
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              ${stats.totalEstimatedRevenue.toLocaleString()} / day
            </div>
            <p className="text-[10px] text-slate-500">
              Calculated from {stats.totalEstablishmentsCount} active retail & food stall fees.
            </p>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5" /> Retail Category Breakdown
          </h3>

          <div className="space-y-2">
            {Object.entries(categoryCounts).map(([cat, info]) => (
              <div
                key={cat}
                className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white capitalize">
                    {cat.replace('_', ' & ')}
                  </span>
                  <div className="text-[10px] text-slate-500">
                    {info.count} stalls | {info.area} m² total
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  ${info.revenue}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
