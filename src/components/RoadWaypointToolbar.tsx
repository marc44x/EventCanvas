import React from 'react';
import { ActiveTool, RoadType, WaypointType } from '../types';
import { MousePointer, Footprints, Navigation, Layers } from 'lucide-react';

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
  landmarkName: string;
  onSetLandmarkName: (name: string) => void;
  landmarkColor: string;
  onSetLandmarkColor: (color: string) => void;
}

const toolBtn = (active: boolean) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  padding: '5px 10px',
  fontSize: '11px',
  fontWeight: active ? '600' : '400',
  borderRadius: '3px',
  border: active ? '1.5px solid #4a6fa5' : '1px solid transparent',
  backgroundColor: active ? '#d9e5f5' : 'transparent',
  color: active ? '#2c2825' : '#5c5248',
  cursor: 'pointer',
  transition: 'all 0.1s',
} as React.CSSProperties);

export const RoadWaypointToolbar: React.FC<RoadWaypointToolbarProps> = ({
  activeTool,
  onSelectTool,
  selectedRoadType,
  onSelectRoadType,
  roadWidth,
  onChangeRoadWidth,
  selectedWaypointType,
  onSelectWaypointType,
}) => {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      style={{
        backgroundColor: '#faf8f4',
        border: '1.5px solid #c8c0b0',
        borderRadius: '4px',
        padding: '6px 10px',
        boxShadow: '1px 2px 6px rgba(44,40,37,0.08)',
      }}
    >
      {/* Tool buttons */}
      <div className="flex items-center gap-0.5" style={{ backgroundColor: '#f0ede6', borderRadius: '3px', padding: '2px' }}>
        <button style={toolBtn(activeTool === 'select')} onClick={() => onSelectTool('select')}>
          <MousePointer style={{ width: 12, height: 12 }} />
          <span>Select</span>
        </button>
        <button style={toolBtn(activeTool === 'draw_road')} onClick={() => onSelectTool('draw_road')}>
          <Footprints style={{ width: 12, height: 12 }} />
          <span>Road</span>
        </button>
        <button style={toolBtn(activeTool === 'place_waypoint')} onClick={() => onSelectTool('place_waypoint')}>
          <Navigation style={{ width: 12, height: 12 }} />
          <span>Waypoint</span>
        </button>
        <button style={toolBtn(activeTool === 'add_zone')} onClick={() => onSelectTool('add_zone')}>
          <Layers style={{ width: 12, height: 12 }} />
          <span>Landmark Area</span>
        </button>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, backgroundColor: '#c8c0b0' }} />

      {/* Road sub-options */}
      {activeTool === 'draw_road' && (
        <div className="flex items-center gap-2">
          <select
            value={selectedRoadType}
            onChange={(e) => onSelectRoadType(e.target.value as RoadType)}
            style={{
              fontSize: 11,
              padding: '3px 6px',
              border: '1px solid #c8c0b0',
              borderRadius: 3,
              backgroundColor: '#faf8f4',
              color: '#2c2825',
              fontFamily: 'monospace',
            }}
          >
            <option value="main_avenue">Main Avenue</option>
            <option value="pedestrian_path">Pedestrian Path</option>
            <option value="service_road">Service Road</option>
            <option value="emergency_corridor">Emergency Corridor</option>
          </select>
          <select
            value={roadWidth}
            onChange={(e) => onChangeRoadWidth(Number(e.target.value))}
            style={{
              fontSize: 11,
              padding: '3px 6px',
              border: '1px solid #c8c0b0',
              borderRadius: 3,
              backgroundColor: '#faf8f4',
              color: '#2c2825',
              fontFamily: 'monospace',
            }}
          >
            <option value={3}>3m</option>
            <option value={4}>4m</option>
            <option value={6}>6m</option>
            <option value={8}>8m</option>
            <option value={10}>10m</option>
          </select>
        </div>
      )}

      {/* Waypoint sub-options */}
      {activeTool === 'place_waypoint' && (
        <select
          value={selectedWaypointType}
          onChange={(e) => onSelectWaypointType(e.target.value as WaypointType)}
          style={{
            fontSize: 11,
            padding: '3px 6px',
            border: '1px solid #c8c0b0',
            borderRadius: 3,
            backgroundColor: '#faf8f4',
            color: '#2c2825',
            fontFamily: 'monospace',
          }}
        >
          <option value="main_entrance">Main Entrance</option>
          <option value="emergency_exit">Emergency Exit</option>
          <option value="info_sign">Info Sign</option>
          <option value="service_gate">Service Gate</option>
          <option value="crowd_node">Crowd Node</option>
          <option value="stage_view">Stage View</option>
        </select>
      )}

      {/* Landmark Area sub-options */}
      {activeTool === 'add_zone' && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={landmarkName}
            onChange={(e) => onSetLandmarkName(e.target.value)}
            placeholder="e.g. Main Stage"
            style={{
              fontSize: 11,
              padding: '3px 6px',
              border: '1px solid #c8c0b0',
              borderRadius: 3,
              backgroundColor: '#faf8f4',
              color: '#2c2825',
              fontFamily: 'monospace',
              width: 140,
            }}
          />
          <input
            type="color"
            value={landmarkColor}
            onChange={(e) => onSetLandmarkColor(e.target.value)}
            style={{ width: 22, height: 22, border: '1px solid #c8c0b0', borderRadius: 3, cursor: 'pointer', padding: 0 }}
            title="Landmark Color"
          />
        </div>
      )}

      {/* Hint text */}
      {activeTool === 'select' && (
        <span style={{ fontSize: 10, color: '#9c9388', fontStyle: 'italic', marginLeft: 'auto' }}>
          click road to edit · press delete to remove
        </span>
      )}
      {activeTool === 'draw_road' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <span style={{ fontSize: 10, color: '#9c9388', fontStyle: 'italic' }}>
            click 2 points to draw 90° road
          </span>
          <button
            onClick={() => { if(confirm('Clear all roads?')) clearAllRoads(); }}
            style={{ fontSize: 10, padding: '3px 8px', border: '1px solid #b94040', borderRadius: 3, backgroundColor: 'transparent', color: '#b94040', cursor: 'pointer' }}
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};
