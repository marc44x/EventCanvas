import React from 'react';
import { ActiveTool, RoadType, WaypointType } from '../types';
import {
  MousePointer,
  Footprints,
  Navigation,
  MapPin,
  Ruler,
  Plus,
  ShieldAlert,
  LogIn,
  Info,
  Layers,
  Radio,
} from 'lucide-react';

interface RoadWaypointToolbarProps {
  activeTool: ActiveTool;
  onSelectTool: (tool: ActiveTool) => void;
  selectedRoadType: RoadType;
  onSelectRoadType: (type: RoadType) => void;
  roadWidth: number;
  onChangeRoadWidth: (width: number) => void;
  selectedWaypointType: WaypointType;
  onSelectWaypointType: (type: WaypointType) => void;
  clearAllRoads: () => void;
  clearAllWaypoints: () => void;
}

export const RoadWaypointToolbar: React.FC<RoadWaypointToolbarProps> = ({
  activeTool,
  onSelectTool,
  selectedRoadType,
  onSelectRoadType,
  roadWidth,
  onChangeRoadWidth,
  selectedWaypointType,
  onSelectWaypointType,
  clearAllRoads,
  clearAllWaypoints,
}) => {
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 flex flex-wrap items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
      {/* Primary Tool Mode Toggles */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
        <button
          onClick={() => onSelectTool('select')}
          className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
            activeTool === 'select'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Select, Drag, Rotate, and Edit Establishments"
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span>Select & Move</span>
        </button>

        <button
          onClick={() => onSelectTool('draw_road')}
          className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
            activeTool === 'draw_road'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Draw Roads and Pedestrian Walkways"
        >
          <Footprints className="w-3.5 h-3.5" />
          <span>Draw Road</span>
        </button>

        <button
          onClick={() => onSelectTool('place_waypoint')}
          className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
            activeTool === 'place_waypoint'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Place Waypoints, Entrances, and Exits"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Place Waypoint</span>
        </button>

        <button
          onClick={() => onSelectTool('add_zone')}
          className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
            activeTool === 'add_zone'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Draw Zoned Areas (Food Zone, Retail Zone)"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Zone Overlay</span>
        </button>
      </div>

      <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

      {/* Sub-controls based on active tool */}
      {activeTool === 'draw_road' && (
        <div className="flex items-center gap-2 animate-in fade-in duration-150">
          <span className="font-semibold text-slate-500 text-[11px]">Road Type:</span>
          <select
            value={selectedRoadType}
            onChange={(e) => onSelectRoadType(e.target.value as RoadType)}
            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium"
          >
            <option value="main_avenue">Main Promenade Avenue</option>
            <option value="pedestrian_path">Pedestrian Walkway</option>
            <option value="service_road">Service & Logistics Road</option>
            <option value="emergency_corridor">Emergency Access Corridor</option>
          </select>

          <span className="font-semibold text-slate-500 text-[11px]">Width:</span>
          <select
            value={roadWidth}
            onChange={(e) => onChangeRoadWidth(Number(e.target.value))}
            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium font-mono"
          >
            <option value={3}>3 meters</option>
            <option value={4}>4 meters</option>
            <option value={6}>6 meters (Standard)</option>
            <option value={8}>8 meters (Wide Promenade)</option>
            <option value={10}>10 meters (Avenue)</option>
          </select>
        </div>
      )}

      {activeTool === 'place_waypoint' && (
        <div className="flex items-center gap-2 animate-in fade-in duration-150">
          <span className="font-semibold text-slate-500 text-[11px]">Waypoint:</span>
          <select
            value={selectedWaypointType}
            onChange={(e) => onSelectWaypointType(e.target.value as WaypointType)}
            className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium"
          >
            <option value="main_entrance">Main Gate Entrance</option>
            <option value="emergency_exit">Emergency Exit Gate</option>
            <option value="info_sign">Information & Map Signpost</option>
            <option value="service_gate">VIP & Logistics Gate</option>
            <option value="crowd_node">Crowd Flow Direction Node</option>
            <option value="stage_view">Main Stage Viewing Point</option>
          </select>
        </div>
      )}

      {activeTool === 'select' && (
        <span className="text-[11px] text-slate-400 italic">
          Click any stall to move, resize, rotate, or edit properties.
        </span>
      )}
    </div>
  );
};
