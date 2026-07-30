import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  EventLayoutProject,
  PlacedEstablishment,
  RoadPath,
  Waypoint,
  ActiveTool,
  RoadType,
  WaypointType,
  ZoneOverlay,
} from '../types';
import { checkCollision, snapToGrid } from '../utils/spatialUtils';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCw,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Move,
  Info,
  ShieldAlert,
  LogIn,
  LogOut,
  Navigation,
  Edit3,
  Sliders,
  DollarSign,
  Layers,
  ChevronRight,
  Maximize2,
  Eye,
  EyeOff,
} from 'lucide-react';

interface CanvasMapProps {
  project: EventLayoutProject;
  activeTool: ActiveTool;
  selectedRoadType: RoadType;
  roadWidth: number;
  selectedWaypointType: WaypointType;
  selectedEstablishmentId: string | null;
  onSelectEstablishment: (id: string | null) => void;
  onUpdateEstablishment: (updated: PlacedEstablishment) => void;
  onDeleteEstablishment: (id: string) => void;
  onDuplicateEstablishment: (id: string) => void;
  onAddRoad: (road: RoadPath) => void;
  onUpdateRoad: (updated: RoadPath) => void;
  onDeleteRoad: (id: string) => void;
  onAddWaypoint: (waypoint: Waypoint) => void;
  onDeleteWaypoint: (id: string) => void;
  onAddZoneOverlay: (zone: ZoneOverlay) => void;
  onDeleteZoneOverlay: (id: string) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
}

export const CanvasMap: React.FC<CanvasMapProps> = ({
  project,
  activeTool,
  selectedRoadType,
  roadWidth,
  selectedWaypointType,
  selectedEstablishmentId,
  onSelectEstablishment,
  onUpdateEstablishment,
  onDeleteEstablishment,
  onDuplicateEstablishment,
  onAddRoad,
  onUpdateRoad,
  onDeleteRoad,
  onAddWaypoint,
  onDeleteWaypoint,
  onAddZoneOverlay,
  onDeleteZoneOverlay,
  svgRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom & Pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Dragging Establishment state
  const [draggingInstId, setDraggingInstId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Resizing state
  const [resizingInstId, setResizingInstId] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; w: number; d: number }>({
    x: 0,
    y: 0,
    w: 0,
    d: 0,
  });

  // Road drawing active points
  const [activeRoadPoints, setActiveRoadPoints] = useState<{ x: number; y: number }[]>([]);

  // Road editing state
  const [selectedRoadId, setSelectedRoadId] = useState<string | null>(null);
  const [draggingPointInfo, setDraggingPointInfo] = useState<{ roadId: string; pointIndex: number } | null>(null);

  // Zone creation state
  const [zoneStartPoint, setZoneStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentZoneBox, setCurrentZoneBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Meter-to-Pixel scaling factor (1 meter = 16px at zoom 1)
  const METERS_TO_PX = 16;
  const landW = project.landDimensions.width;
  const landH = project.landDimensions.height;
  const landPixelW = landW * METERS_TO_PX;
  const landPixelH = landH * METERS_TO_PX;

  // Selected establishment object
  const selectedInst = project.establishments.find((e) => e.instanceId === selectedEstablishmentId);

  // Convert mouse event coordinates to Land Meters (x, y in meters)
  const getLandCoordinates = useCallback(
    (e: React.MouseEvent<SVGSVGElement | HTMLDivElement>): { x: number; y: number } => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - pan.x;
      const mouseY = e.clientY - rect.top - pan.y;

      const meterX = mouseX / (METERS_TO_PX * zoom);
      const meterY = mouseY / (METERS_TO_PX * zoom);

      // Clamp inside land boundary
      const clampedX = Math.max(0, Math.min(landW, meterX));
      const clampedY = Math.max(0, Math.min(landH, meterY));

      const step = project.landDimensions.gridSnap || 1;
      return {
        x: snapToGrid(clampedX, step),
        y: snapToGrid(clampedY, step),
      };
    },
    [pan, zoom, landW, landH, project.landDimensions.gridSnap]
  );

  // Reset zoom & pan to fit land
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 40, y: 40 });
  };

  // Mouse Down handler for Canvas
  const handleCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    // If middle click or holding spacebar, pan canvas
    if (e.button === 1 || e.shiftKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    const coords = getLandCoordinates(e);

    if (activeTool === 'draw_road') {
      setActiveRoadPoints((prev) => [...prev, coords]);
    } else if (activeTool === 'place_waypoint') {
      const newWp: Waypoint = {
        id: `wp-${Date.now()}`,
        name: `${selectedWaypointType.replace('_', ' ').toUpperCase()} #${project.waypoints.length + 1}`,
        type: selectedWaypointType,
        x: coords.x,
        y: coords.y,
        color:
          selectedWaypointType === 'main_entrance'
            ? '#10b981'
            : selectedWaypointType === 'emergency_exit'
            ? '#ef4444'
            : '#3b82f6',
        icon: selectedWaypointType === 'main_entrance' ? 'LogIn' : 'Navigation',
      };
      onAddWaypoint(newWp);
    } else if (activeTool === 'add_zone') {
      if (!zoneStartPoint) {
        setZoneStartPoint(coords);
      } else {
        // Complete zone creation
        const x = Math.min(zoneStartPoint.x, coords.x);
        const y = Math.min(zoneStartPoint.y, coords.y);
        const w = Math.max(2, Math.abs(coords.x - zoneStartPoint.x));
        const h = Math.max(2, Math.abs(coords.y - zoneStartPoint.y));

        const newZone: ZoneOverlay = {
          id: `zone-${Date.now()}`,
          name: `Zone ${project.zoneOverlays ? project.zoneOverlays.length + 1 : 1}`,
          color: '#3b82f6',
          x,
          y,
          width: w,
          height: h,
        };
        onAddZoneOverlay(newZone);
        setZoneStartPoint(null);
        setCurrentZoneBox(null);
      }
    } else if (activeTool === 'select') {
      // If clicking background canvas, clear selection
      if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'svg') {
        onSelectEstablishment(null);
        setSelectedRoadId(null);
      }
    }
  };

  // Mouse Move handler
  const handleCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    const coords = getLandCoordinates(e);

    if (activeTool === 'add_zone' && zoneStartPoint) {
      const x = Math.min(zoneStartPoint.x, coords.x);
      const y = Math.min(zoneStartPoint.y, coords.y);
      const w = Math.abs(coords.x - zoneStartPoint.x);
      const h = Math.abs(coords.y - zoneStartPoint.y);
      setCurrentZoneBox({ x, y, w, h });
    }

    if (draggingInstId && activeTool === 'select') {
      const inst = project.establishments.find((item) => item.instanceId === draggingInstId);
      if (inst && !inst.isLocked) {
        const step = project.landDimensions.gridSnap || 1;
        const newX = Math.max(0, Math.min(landW - inst.width, snapToGrid(coords.x - dragOffset.x, step)));
        const newY = Math.max(0, Math.min(landH - inst.depth, snapToGrid(coords.y - dragOffset.y, step)));

        onUpdateEstablishment({ ...inst, x: newX, y: newY });
      }
    }

    if (resizingInstId && activeTool === 'select') {
      const inst = project.establishments.find((item) => item.instanceId === resizingInstId);
      if (inst && !inst.isLocked) {
        const newW = Math.max(1, snapToGrid(coords.x - inst.x, 0.5));
        const newD = Math.max(1, snapToGrid(coords.y - inst.y, 0.5));
        onUpdateEstablishment({ ...inst, width: newW, depth: newD });
      }
    }

    // Road point dragging
    if (draggingPointInfo && activeTool === 'select') {
      const road = project.roads.find((r) => r.id === draggingPointInfo.roadId);
      if (road) {
        const step = project.landDimensions.gridSnap || 1;
        const newPoints = road.points.map((pt, idx) =>
          idx === draggingPointInfo.pointIndex
            ? { x: snapToGrid(Math.max(0, Math.min(landW, coords.x)), step), y: snapToGrid(Math.max(0, Math.min(landH, coords.y)), step) }
            : pt
        );
        onUpdateRoad({ ...road, points: newPoints });
      }
    }
  };

  // Mouse Up handler
  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDraggingInstId(null);
    setResizingInstId(null);
    setDraggingPointInfo(null);
  };

  // Finish road path on double click or enter
  const handleFinishRoad = () => {
    if (activeRoadPoints.length >= 2) {
      const newRoad: RoadPath = {
        id: `road-${Date.now()}`,
        name: `${selectedRoadType.replace('_', ' ').toUpperCase()} Path`,
        roadType: selectedRoadType,
        width: roadWidth,
        color:
          selectedRoadType === 'main_avenue'
            ? '#475569'
            : selectedRoadType === 'emergency_corridor'
            ? '#ef4444'
            : '#94a3b8',
        points: [...activeRoadPoints],
      };
      onAddRoad(newRoad);
    }
    setActiveRoadPoints([]);
  };

  // Establishment click/drag initialization
  const handleEstablishmentMouseDown = (
    e: React.MouseEvent,
    inst: PlacedEstablishment
  ) => {
    e.stopPropagation();
    onSelectEstablishment(inst.instanceId);

    if (activeTool === 'select' && !inst.isLocked) {
      const coords = getLandCoordinates(e);
      setDraggingInstId(inst.instanceId);
      setDragOffset({
        x: coords.x - inst.x,
        y: coords.y - inst.y,
      });
    }
  };

  const handleResizeHandleMouseDown = (
    e: React.MouseEvent,
    inst: PlacedEstablishment
  ) => {
    e.stopPropagation();
    setResizingInstId(inst.instanceId);
  };

  // Find all colliding establishments
  const collidingIds = new Set<string>();
  for (let i = 0; i < project.establishments.length; i++) {
    for (let j = i + 1; j < project.establishments.length; j++) {
      if (checkCollision(project.establishments[i], project.establishments[j])) {
        collidingIds.add(project.establishments[i].instanceId);
        collidingIds.add(project.establishments[j].instanceId);
      }
    }
  }

  // Generate grid line positions
  const gridLinesX = [];
  const gridLinesY = [];
  const gridStep = project.landDimensions.gridSnap || 1;

  for (let x = 0; x <= landW; x += gridStep) {
    gridLinesX.push(x);
  }
  for (let y = 0; y <= landH; y += gridStep) {
    gridLinesY.push(y);
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex-1 h-full overflow-hidden select-none`}
      style={{ backgroundColor: project.blueprintMode ? '#0f1a2e' : '#f5f2eb' }}
    >
      {/* Selected Establishment Quick Inspector Bar — sketch style */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {selectedInst ? (
          <div
            className="pointer-events-auto flex items-center gap-3 text-xs animate-in"
            style={{
              backgroundColor: '#faf8f4',
              border: '1.5px solid #c8c0b0',
              borderRadius: '4px',
              padding: '6px 10px',
              boxShadow: '1px 2px 8px rgba(44,40,37,0.10)',
            }}
          >
            <div
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: selectedInst.color, border: '1px solid #c8c0b0' }}
            />
            <div className="flex flex-col">
              <input
                type="text"
                value={selectedInst.name}
                onChange={(e) => onUpdateEstablishment({ ...selectedInst, name: e.target.value })}
                style={{
                  fontWeight: 600,
                  fontSize: 12,
                  color: '#2c2825',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px dashed #c8c0b0',
                  outline: 'none',
                  padding: '0 2px',
                  minWidth: 100,
                }}
              />
              <span style={{ fontSize: 10, color: '#9c9388', fontFamily: 'monospace' }}>#{selectedInst.stallNumber}</span>
            </div>

            <div style={{ width: 1, height: 20, backgroundColor: '#c8c0b0' }} />

            {/* Size Controls */}
            <div className="flex items-center gap-1.5 font-mono">
              <span style={{ color: '#9c9388', fontSize: 10 }}>W:</span>
              <input
                type="number" min="1"
                value={selectedInst.width}
                onChange={(e) => onUpdateEstablishment({ ...selectedInst, width: Math.max(1, Number(e.target.value)) })}
                style={{ width: 44, fontSize: 11, padding: '2px 4px', border: '1px solid #c8c0b0', borderRadius: 3, fontFamily: 'monospace', backgroundColor: '#f0ede6', color: '#2c2825' }}
              />
              <span style={{ color: '#9c9388', fontSize: 10 }}>D:</span>
              <input
                type="number" min="1"
                value={selectedInst.depth}
                onChange={(e) => onUpdateEstablishment({ ...selectedInst, depth: Math.max(1, Number(e.target.value)) })}
                style={{ width: 44, fontSize: 11, padding: '2px 4px', border: '1px solid #c8c0b0', borderRadius: 3, fontFamily: 'monospace', backgroundColor: '#f0ede6', color: '#2c2825' }}
              />
              <span style={{ color: '#9c9388', fontSize: 10 }}>m</span>
            </div>

            <div style={{ width: 1, height: 20, backgroundColor: '#c8c0b0' }} />

            {/* Rotation */}
            <button
              onClick={() => onUpdateEstablishment({ ...selectedInst, rotation: (selectedInst.rotation + 90) % 360 })}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 8px', border: '1px solid #c8c0b0', borderRadius: 3, backgroundColor: '#f0ede6', cursor: 'pointer', fontFamily: 'monospace', color: '#2c2825' }}
              title="Rotate 90°"
            >
              <RotateCw style={{ width: 12, height: 12, color: '#4a6fa5' }} />
              {selectedInst.rotation}°
            </button>

            {/* Rental Fee */}
            <div className="flex items-center gap-1 font-mono">
              <DollarSign style={{ width: 12, height: 12, color: '#3a7a50' }} />
              <input
                type="number"
                value={selectedInst.rentalFee || 0}
                onChange={(e) => onUpdateEstablishment({ ...selectedInst, rentalFee: Number(e.target.value) })}
                style={{ width: 60, fontSize: 11, padding: '2px 4px', border: '1px solid #c8c0b0', borderRadius: 3, fontFamily: 'monospace', backgroundColor: '#f0ede6', color: '#2c2825' }}
                title="Daily rental fee"
              />
            </div>

            <div style={{ width: 1, height: 20, backgroundColor: '#c8c0b0' }} />

            {/* Lock / Dupe / Delete */}
            <button
              onClick={() => onUpdateEstablishment({ ...selectedInst, isLocked: !selectedInst.isLocked })}
              style={{ padding: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: selectedInst.isLocked ? '#b07030' : '#9c9388' }}
              title={selectedInst.isLocked ? 'Unlock' : 'Lock'}
            >
              {selectedInst.isLocked ? <Lock style={{ width: 14, height: 14 }} /> : <Unlock style={{ width: 14, height: 14 }} />}
            </button>
            <button
              onClick={() => onDuplicateEstablishment(selectedInst.instanceId)}
              style={{ padding: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#4a6fa5' }}
              title="Duplicate"
            >
              <Copy style={{ width: 14, height: 14 }} />
            </button>
            <button
              onClick={() => onDeleteEstablishment(selectedInst.instanceId)}
              style={{ padding: '4px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#b94040' }}
              title="Delete"
            >
              <Trash2 style={{ width: 14, height: 14 }} />
            </button>
          </div>
        ) : (
          <div />
        )}

        {/* Zoom controls — sketch style */}
        <div
          className="pointer-events-auto flex items-center gap-0.5"
          style={{ backgroundColor: '#faf8f4', border: '1.5px solid #c8c0b0', borderRadius: '4px', padding: '3px' }}
        >
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
            style={{ padding: '4px 8px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 14, color: '#5c5248' }}
            title="Zoom In"
          >
            <ZoomIn style={{ width: 14, height: 14 }} />
          </button>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#9c9388', padding: '0 4px' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))}
            style={{ padding: '4px 8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#5c5248' }}
            title="Zoom Out"
          >
            <ZoomOut style={{ width: 14, height: 14 }} />
          </button>
          <div style={{ width: 1, height: 16, backgroundColor: '#c8c0b0', margin: '0 2px' }} />
          <button
            onClick={handleResetView}
            style={{ padding: '4px 8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#5c5248' }}
            title="Reset view"
          >
            <Maximize style={{ width: 14, height: 14 }} />
          </button>
        </div>
      </div>

      {/* Road Inspector Panel — sketch style */}
      {(() => {
        const selectedRoad = selectedRoadId ? project.roads.find((r) => r.id === selectedRoadId) : null;
        if (!selectedRoad) return null;
        return (
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex flex-wrap items-center gap-3 text-xs animate-in"
            style={{
              backgroundColor: '#faf8f4',
              border: '1.5px solid #4a6fa5',
              borderRadius: '4px',
              padding: '6px 12px',
              boxShadow: '1px 3px 10px rgba(44,40,37,0.12)',
              maxWidth: '90vw',
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: selectedRoad.color, border: '1px solid #c8c0b0' }} />
            <span style={{ fontWeight: 600, color: '#4a6fa5', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Road</span>

            <div style={{ width: 1, height: 16, backgroundColor: '#c8c0b0' }} />

            <input
              type="text"
              value={selectedRoad.name}
              onChange={(e) => onUpdateRoad({ ...selectedRoad, name: e.target.value })}
              style={{ fontSize: 11, padding: '2px 6px', border: '1px solid #c8c0b0', borderRadius: 3, backgroundColor: '#f0ede6', color: '#2c2825', width: 140 }}
            />

            <select
              value={selectedRoad.roadType}
              onChange={(e) => {
                const rt = e.target.value as RoadType;
                const color = rt === 'main_avenue' ? '#6b7280' : rt === 'emergency_corridor' ? '#b94040' : '#a0a0a0';
                onUpdateRoad({ ...selectedRoad, roadType: rt, color });
              }}
              style={{ fontSize: 11, padding: '2px 6px', border: '1px solid #c8c0b0', borderRadius: 3, backgroundColor: '#f0ede6', color: '#2c2825', fontFamily: 'monospace' }}
            >
              <option value="main_avenue">Main Avenue</option>
              <option value="pedestrian_path">Pedestrian</option>
              <option value="service_road">Service Road</option>
              <option value="emergency_corridor">Emergency</option>
            </select>

            <select
              value={selectedRoad.width}
              onChange={(e) => onUpdateRoad({ ...selectedRoad, width: Number(e.target.value) })}
              style={{ fontSize: 11, padding: '2px 6px', border: '1px solid #c8c0b0', borderRadius: 3, backgroundColor: '#f0ede6', color: '#2c2825', fontFamily: 'monospace' }}
            >
              {[3,4,6,8,10].map(w => <option key={w} value={w}>{w}m</option>)}
            </select>

            <input
              type="color"
              value={selectedRoad.color}
              onChange={(e) => onUpdateRoad({ ...selectedRoad, color: e.target.value })}
              style={{ width: 24, height: 24, border: '1px solid #c8c0b0', borderRadius: 3, cursor: 'pointer', padding: 0 }}
            />

            <div style={{ width: 1, height: 16, backgroundColor: '#c8c0b0' }} />

            <span style={{ fontSize: 10, color: '#9c9388', fontStyle: 'italic' }}>{selectedRoad.points.length} pts · drag to reshape</span>

            <button
              onClick={() => { onDeleteRoad(selectedRoad.id); setSelectedRoadId(null); }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 8px', border: '1px solid #b94040', borderRadius: 3, backgroundColor: 'transparent', color: '#b94040', cursor: 'pointer' }}
            >
              <Trash2 style={{ width: 12, height: 12 }} /> Delete
            </button>
            <button
              onClick={() => setSelectedRoadId(null)}
              style={{ fontSize: 10, padding: '3px 8px', border: '1px solid #c8c0b0', borderRadius: 3, backgroundColor: 'transparent', color: '#9c9388', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        );
      })()}

      {/* Road drawing hint */}
      {activeTool === 'draw_road' && activeRoadPoints.length > 0 && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 text-xs"
          style={{
            backgroundColor: '#faf8f4',
            border: '1.5px solid #4a6fa5',
            borderRadius: '4px',
            padding: '6px 14px',
            boxShadow: '1px 2px 8px rgba(44,40,37,0.12)',
            color: '#2c2825',
          }}
        >
          <span>Adding road — {activeRoadPoints.length} point{activeRoadPoints.length > 1 ? 's' : ''}</span>
          <button
            onClick={handleFinishRoad}
            style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', border: '1px solid #4a6fa5', borderRadius: 3, backgroundColor: '#d9e5f5', color: '#4a6fa5', cursor: 'pointer' }}
          >
            Finish
          </button>
        </div>
      )}

      {/* Main SVG Map Canvas */}
      <svg
        ref={svgRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        className="w-full h-full cursor-crosshair"
      >
        <defs>
          {/* Paper graph-paper grid */}
          <pattern
            id="gridPattern"
            width={gridStep * METERS_TO_PX}
            height={gridStep * METERS_TO_PX}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridStep * METERS_TO_PX} 0 L 0 0 0 ${gridStep * METERS_TO_PX}`}
              fill="none"
              stroke={project.blueprintMode ? 'rgba(100,160,220,0.2)' : 'rgba(160,150,130,0.25)'}
              strokeWidth="0.6"
            />
          </pattern>
          {/* Hatch pattern for establishments */}
          <pattern id="hatch" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(44,40,37,0.18)" strokeWidth="1" />
          </pattern>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Land boundary — pencil-stroke style */}
          <rect
            x={0} y={0}
            width={landPixelW}
            height={landPixelH}
            fill={project.blueprintMode ? '#0d1e38' : '#fffef9'}
            stroke={project.blueprintMode ? '#5a8fc0' : '#8a7d6a'}
            strokeWidth="2"
            rx={project.landDimensions.shape === 'oval' ? landPixelW / 2 : 2}
          />
           {/* Grid overlay — graph paper */}
          {project.landDimensions.gridVisible && (
            <rect x={0} y={0} width={landPixelW} height={landPixelH} fill="url(#gridPattern)" pointerEvents="none" />
          )}

          {/* Dimension marks — thin ink lines */}
          {project.dimensionsVisible && (
            <g pointerEvents="none" style={{ fontSize: 10, fontFamily: 'monospace' }}>
              <line x1={0} y1={-10} x2={landPixelW} y2={-10} stroke={project.blueprintMode ? '#5a8fc0' : '#8a7d6a'} strokeWidth="1" />
              <line x1={0} y1={-14} x2={0} y2={-6} stroke={project.blueprintMode ? '#5a8fc0' : '#8a7d6a'} strokeWidth="1" />
              <line x1={landPixelW} y1={-14} x2={landPixelW} y2={-6} stroke={project.blueprintMode ? '#5a8fc0' : '#8a7d6a'} strokeWidth="1" />
              <text x={landPixelW / 2} y={-13} fill={project.blueprintMode ? '#5a8fc0' : '#5c5248'} textAnchor="middle" fontSize={9}>
                {landW}{project.landDimensions.unit === 'meters' ? 'm' : 'ft'}
              </text>
              <line x1={-10} y1={0} x2={-10} y2={landPixelH} stroke={project.blueprintMode ? '#5a8fc0' : '#8a7d6a'} strokeWidth="1" />
              <line x1={-14} y1={0} x2={-6} y2={0} stroke={project.blueprintMode ? '#5a8fc0' : '#8a7d6a'} strokeWidth="1" />
              <line x1={-14} y1={landPixelH} x2={-6} y2={landPixelH} stroke={project.blueprintMode ? '#5a8fc0' : '#8a7d6a'} strokeWidth="1" />
              <text x={-13} y={landPixelH / 2} fill={project.blueprintMode ? '#5a8fc0' : '#5c5248'} textAnchor="middle" transform={`rotate(-90,-13,${landPixelH/2})`} fontSize={9}>
                {landH}{project.landDimensions.unit === 'meters' ? 'm' : 'ft'}
              </text>
            </g>
          )}

          {/* Zone Overlays */}
          {project.zoneOverlays?.map((zone) => (
            <g key={zone.id}>
              <rect
                x={zone.x * METERS_TO_PX}
                y={zone.y * METERS_TO_PX}
                width={zone.width * METERS_TO_PX}
                height={zone.height * METERS_TO_PX}
                fill={zone.color}
                fillOpacity={0.15}
                stroke={zone.color}
                strokeWidth="2"
                strokeDasharray="6 4"
                rx="8"
              />
              <text
                x={zone.x * METERS_TO_PX + 8}
                y={zone.y * METERS_TO_PX + 20}
                fill={zone.color}
                className="font-bold text-xs font-mono uppercase tracking-wider"
              >
                {zone.name}
              </text>
            </g>
          ))}

          {/* Active Zone Creation Drawing Box */}
          {currentZoneBox && (
            <rect
              x={currentZoneBox.x * METERS_TO_PX}
              y={currentZoneBox.y * METERS_TO_PX}
              width={currentZoneBox.w * METERS_TO_PX}
              height={currentZoneBox.h * METERS_TO_PX}
              fill="#3b82f6"
              fillOpacity={0.2}
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )}

          {/* Roads — sketch thin lines */}
          {project.roads.map((road) => {
            if (road.points.length < 2) return null;
            const pathData = road.points
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * METERS_TO_PX} ${p.y * METERS_TO_PX}`)
              .join(' ');
            const isSelectedRoad = selectedRoadId === road.id;
            const sketchColor = road.roadType === 'emergency_corridor' ? '#b94040'
              : road.roadType === 'pedestrian_path' ? '#7a9a6a'
              : road.roadType === 'service_road' ? '#9a8a5a'
              : '#6b7280';

            return (
              <g key={road.id}>
                {/* Hit area */}
                <path d={pathData} fill="none" stroke="transparent"
                  strokeWidth={Math.max(road.width * METERS_TO_PX, 20)}
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{ cursor: activeTool === 'select' ? 'pointer' : 'default' }}
                  onClick={(e) => {
                    if (activeTool !== 'select') return;
                    e.stopPropagation();
                    setSelectedRoadId(isSelectedRoad ? null : road.id);
                    onSelectEstablishment(null);
                  }}
                />
                {/* Road fill — muted fill */}
                <path d={pathData} fill="none"
                  stroke={road.color || sketchColor}
                  strokeWidth={road.width * METERS_TO_PX}
                  strokeLinecap="round" strokeLinejoin="round"
                  opacity={0.25}
                  style={{ pointerEvents: 'none' }}
                />
                {/* Road edge lines — thin sketch strokes */}
                <path d={pathData} fill="none"
                  stroke={road.color || sketchColor}
                  strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"
                  opacity={0.7}
                  strokeDasharray={road.roadType === 'pedestrian_path' ? '4 3' : 'none'}
                  style={{ pointerEvents: 'none' }}
                />
                {/* Selection highlight */}
                {isSelectedRoad && (
                  <path d={pathData} fill="none" stroke="#4a6fa5"
                    strokeWidth={road.width * METERS_TO_PX + 4}
                    strokeLinecap="round" strokeLinejoin="round"
                    opacity={0.2} style={{ pointerEvents: 'none' }}
                  />
                )}
                {/* Label */}
                <text
                  x={(road.points[0].x + road.points[road.points.length - 1].x) * 0.5 * METERS_TO_PX}
                  y={(road.points[0].y + road.points[road.points.length - 1].y) * 0.5 * METERS_TO_PX - road.width * METERS_TO_PX * 0.5 - 4}
                  fill={road.color || sketchColor}
                  textAnchor="middle"
                  style={{ pointerEvents: 'none', fontSize: 9, fontFamily: 'monospace', opacity: 0.8 }}
                >
                  {road.name}
                </text>
                {/* Control handles */}
                {isSelectedRoad && road.points.map((pt, ptIdx) => (
                  <g key={ptIdx}>
                    <circle cx={pt.x * METERS_TO_PX} cy={pt.y * METERS_TO_PX} r={6}
                      fill="#faf8f4" stroke="#4a6fa5" strokeWidth="1.5"
                      style={{ cursor: 'grab' }}
                      onMouseDown={(e) => { e.stopPropagation(); setDraggingPointInfo({ roadId: road.id, pointIndex: ptIdx }); }}
                    />
                    <text x={pt.x * METERS_TO_PX} y={pt.y * METERS_TO_PX + 3}
                      fill="#4a6fa5" textAnchor="middle"
                      style={{ pointerEvents: 'none', fontSize: 7, fontFamily: 'monospace' }}
                    >{ptIdx + 1}</text>
                  </g>
                ))}
              </g>
            );
          })}

          {/* Active road drawing preview */}
          {activeRoadPoints.length > 0 && (
            <path
              d={activeRoadPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * METERS_TO_PX} ${p.y * METERS_TO_PX}`).join(' ')}
              fill="none" stroke="#4a6fa5"
              strokeWidth={roadWidth * METERS_TO_PX}
              strokeDasharray="5 4" opacity={0.35}
            />
          )}

          {/* Waypoints — simple pin marks */}
          {project.waypoints.map((wp) => {
            const px = wp.x * METERS_TO_PX;
            const py = wp.y * METERS_TO_PX;
            const col = wp.type === 'main_entrance' ? '#3a7a50'
              : wp.type === 'emergency_exit' ? '#b94040'
              : '#4a6fa5';
            const abbr = wp.type === 'main_entrance' ? 'G' : wp.type === 'emergency_exit' ? 'X' : '·';
            return (
              <g key={wp.id} style={{ cursor: 'pointer' }}>
                <circle cx={px} cy={py} r={10} fill={col} opacity={0.15} />
                <circle cx={px} cy={py} r={7} fill="#faf8f4" stroke={col} strokeWidth="1.5" />
                <text x={px} y={py + 3} fill={col} textAnchor="middle" style={{ fontSize: 8, fontFamily: 'monospace', fontWeight: 700 }}>{abbr}</text>
                <text x={px} y={py + 20} fill={col} textAnchor="middle" style={{ fontSize: 8, fontFamily: 'monospace' }}>{wp.name}</text>
              </g>
            );
          })}

          {/* Establishments — sketch hatched boxes */}
          {project.establishments.map((inst) => {
            const isSelected = selectedEstablishmentId === inst.instanceId;
            const isColliding = collidingIds.has(inst.instanceId);

            const px = inst.x * METERS_TO_PX;
            const py = inst.y * METERS_TO_PX;
            const pw = inst.width * METERS_TO_PX;
            const pd = inst.depth * METERS_TO_PX;

            // Muted sketch colors
            const sketchFill = inst.color + '28'; // very transparent fill
            const sketchStroke = isColliding ? '#b94040' : isSelected ? '#4a6fa5' : '#8a7d6a';
            const sketchStrokeW = isSelected ? 1.5 : 1;

            return (
              <g
                key={inst.instanceId}
                transform={`rotate(${inst.rotation}, ${px + pw / 2}, ${py + pd / 2})`}
                onMouseDown={(e) => handleEstablishmentMouseDown(e, inst)}
                style={{ cursor: 'move' }}
              >
                {/* Hatch fill */}
                <rect x={px} y={py} width={pw} height={pd} fill="url(#hatch)" opacity={0.4} />
                {/* Color tint */}
                <rect x={px} y={py} width={pw} height={pd} fill={sketchFill} />
                {/* Border */}
                <rect
                  x={px} y={py} width={pw} height={pd}
                  fill="none"
                  stroke={sketchStroke}
                  strokeWidth={sketchStrokeW}
                  strokeDasharray={isColliding ? '4 2' : 'none'}
                  rx={1}
                />

                {/* Stall number — top-left corner */}
                <text
                  x={px + 4} y={py + 10}
                  fill={sketchStroke}
                  style={{ fontSize: 8, fontFamily: 'monospace', fontWeight: 600 }}
                >
                  {inst.stallNumber}
                </text>

                {/* Name inside if large enough */}
                {pw >= 40 && pd >= 30 && (
                  <text
                    x={px + pw / 2} y={py + pd / 2 + 2}
                    fill="#2c2825" textAnchor="middle"
                    style={{ fontSize: 9, fontFamily: 'Inter, sans-serif', opacity: 0.8 }}
                  >
                    {inst.name.length > 16 ? inst.name.substring(0, 14) + '…' : inst.name}
                  </text>
                )}
                {pw >= 40 && pd >= 42 && (
                  <text
                    x={px + pw / 2} y={py + pd / 2 + 14}
                    fill="#5c5248" textAnchor="middle"
                    style={{ fontSize: 8, fontFamily: 'monospace', opacity: 0.7 }}
                  >
                    {inst.width}×{inst.depth}m
                  </text>
                )}

                {/* Lock mark */}
                {inst.isLocked && (
                  <text x={px + pw - 10} y={py + 10} fill="#b07030" style={{ fontSize: 8 }}>🔒</text>
                )}

                {/* Resize handle */}
                {isSelected && !inst.isLocked && (
                  <rect
                    x={px + pw - 6} y={py + pd - 6} width={6} height={6}
                    fill="#4a6fa5" stroke="#faf8f4" strokeWidth={1}
                    style={{ cursor: 'nwse-resize' }}
                    onMouseDown={(e) => handleResizeHandleMouseDown(e, inst)}
                  />
                )}
              </g>
            );
          })}

          {/* Title block for export — sketch style */}
          {project.legendVisible && (
            <g transform="translate(16, 16)" style={{ pointerEvents: 'none' }}>
              <rect x={0} y={0} width={220} height={62}
                fill="#faf8f4" fillOpacity={0.92}
                stroke="#c8c0b0" strokeWidth={1}
                rx={2}
              />
              <text x={10} y={20} fill="#2c2825" style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
                {project.title}
              </text>
              <text x={10} y={36} fill="#5c5248" style={{ fontSize: 9, fontFamily: 'monospace' }}>
                {project.hostName} · {project.eventDate}
              </text>
              <text x={10} y={52} fill="#4a6fa5" style={{ fontSize: 9, fontFamily: 'monospace' }}>
                {landW}m × {landH}m = {landW * landH}m² · {project.establishments.length} stalls
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
