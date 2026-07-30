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
      className={`relative flex-1 h-full overflow-hidden select-none transition-colors duration-300 ${
        project.blueprintMode
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-100 dark:bg-slate-950 text-slate-900'
      }`}
    >
      {/* Top Floating Control Bar & Selected Inspector */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Selected Establishment Quick Inspector Bar */}
        {selectedInst ? (
          <div className="pointer-events-auto bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-2xl p-2.5 flex items-center gap-3 text-xs animate-in slide-in-from-top-3">
            <div
              className="w-4 h-4 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: selectedInst.color }}
            />
            <div className="flex flex-col">
              <input
                type="text"
                value={selectedInst.name}
                onChange={(e) => onUpdateEstablishment({ ...selectedInst, name: e.target.value })}
                className="font-bold text-slate-900 dark:text-white bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 px-1 rounded focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 font-mono">
                Stall #{selectedInst.stallNumber}
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

            {/* Size Controls */}
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-slate-400 text-[10px]">W:</span>
              <input
                type="number"
                min="1"
                value={selectedInst.width}
                onChange={(e) =>
                  onUpdateEstablishment({ ...selectedInst, width: Math.max(1, Number(e.target.value)) })
                }
                className="w-12 px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border rounded font-mono text-xs"
              />
              <span className="text-slate-400 text-[10px]">D:</span>
              <input
                type="number"
                min="1"
                value={selectedInst.depth}
                onChange={(e) =>
                  onUpdateEstablishment({ ...selectedInst, depth: Math.max(1, Number(e.target.value)) })
                }
                className="w-12 px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border rounded font-mono text-xs"
              />
              <span className="text-slate-400 text-[10px]">m</span>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

            {/* Rotation button */}
            <button
              onClick={() =>
                onUpdateEstablishment({
                  ...selectedInst,
                  rotation: (selectedInst.rotation + 90) % 360,
                })
              }
              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1 font-mono text-xs"
              title="Rotate 90 degrees"
            >
              <RotateCw className="w-3.5 h-3.5 text-blue-500" />
              <span>{selectedInst.rotation}°</span>
            </button>

            {/* Rental Fee */}
            <div className="flex items-center gap-1 font-mono text-xs">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <input
                type="number"
                value={selectedInst.rentalFee || 0}
                onChange={(e) =>
                  onUpdateEstablishment({ ...selectedInst, rentalFee: Number(e.target.value) })
                }
                className="w-16 px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border rounded text-xs font-mono"
                title="Stall Daily Rental Fee"
              />
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

            {/* Lock / Duplicate / Delete */}
            <button
              onClick={() =>
                onUpdateEstablishment({ ...selectedInst, isLocked: !selectedInst.isLocked })
              }
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"
              title={selectedInst.isLocked ? 'Unlock position' : 'Lock position'}
            >
              {selectedInst.isLocked ? <Lock className="w-4 h-4 text-amber-500" /> : <Unlock className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onDuplicateEstablishment(selectedInst.instanceId)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-blue-600 dark:text-blue-400"
              title="Duplicate Stall"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={() => onDeleteEstablishment(selectedInst.instanceId)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-red-600 dark:text-red-400"
              title="Delete Stall"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div />
        )}

        {/* View Zoom & Reset controls */}
        <div className="pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-1.5 flex items-center gap-1 text-xs">
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="font-mono text-[11px] font-bold px-1 text-slate-600 dark:text-slate-400">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />

          <button
            onClick={handleResetView}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            title="Reset Fit to Land"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Road Inspector Panel (shown when a road is selected) */}
      {(() => {
        const selectedRoad = selectedRoadId ? project.roads.find((r) => r.id === selectedRoadId) : null;
        if (!selectedRoad) return null;
        return (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-700 rounded-2xl shadow-2xl p-3 flex flex-wrap items-center gap-3 text-xs animate-in slide-in-from-bottom-3 min-w-max max-w-[90vw]">
            {/* Road color swatch */}
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full shadow-sm border border-slate-200" style={{ backgroundColor: selectedRoad.color }} />
              <span className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide text-[10px]">Road Selected</span>
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

            {/* Name */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[10px]">Name:</span>
              <input
                type="text"
                value={selectedRoad.name}
                onChange={(e) => onUpdateRoad({ ...selectedRoad, name: e.target.value })}
                className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-xs w-40"
              />
            </div>

            {/* Road Type */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[10px]">Type:</span>
              <select
                value={selectedRoad.roadType}
                onChange={(e) => {
                  const rt = e.target.value as RoadType;
                  const color = rt === 'main_avenue' ? '#475569' : rt === 'emergency_corridor' ? '#ef4444' : '#94a3b8';
                  onUpdateRoad({ ...selectedRoad, roadType: rt, color });
                }}
                className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium"
              >
                <option value="main_avenue">Main Promenade</option>
                <option value="pedestrian_path">Pedestrian Walkway</option>
                <option value="service_road">Service Road</option>
                <option value="emergency_corridor">Emergency Corridor</option>
              </select>
            </div>

            {/* Width */}
            <div className="flex items-center gap-1 font-mono">
              <span className="text-slate-400 text-[10px]">Width:</span>
              <select
                value={selectedRoad.width}
                onChange={(e) => onUpdateRoad({ ...selectedRoad, width: Number(e.target.value) })}
                className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
              >
                <option value={3}>3m</option>
                <option value={4}>4m</option>
                <option value={6}>6m</option>
                <option value={8}>8m</option>
                <option value={10}>10m</option>
              </select>
            </div>

            {/* Color picker */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[10px]">Color:</span>
              <input
                type="color"
                value={selectedRoad.color}
                onChange={(e) => onUpdateRoad({ ...selectedRoad, color: e.target.value })}
                className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                title="Road color"
              />
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

            {/* Points count info */}
            <span className="text-[10px] text-slate-500 font-mono">
              {selectedRoad.points.length} points • drag handles to reshape
            </span>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

            {/* Delete road */}
            <button
              onClick={() => {
                onDeleteRoad(selectedRoad.id);
                setSelectedRoadId(null);
              }}
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-red-600 dark:text-red-400 transition flex items-center gap-1"
              title="Delete Road"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>

            {/* Deselect */}
            <button
              onClick={() => setSelectedRoadId(null)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition text-[10px] font-medium"
              title="Deselect"
            >
              ✕ Close
            </button>
          </div>
        );
      })()}

      {/* Road drawing banner notice */}
      {activeTool === 'draw_road' && activeRoadPoints.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-blue-600 text-white text-xs px-4 py-2 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
          <span>Click points on map to build road segments ({activeRoadPoints.length} points added)</span>
          <button
            onClick={handleFinishRoad}
            className="px-2.5 py-1 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition"
          >
            Finish Road Path
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
          {/* Grid pattern */}
          <pattern
            id="gridPattern"
            width={gridStep * METERS_TO_PX}
            height={gridStep * METERS_TO_PX}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridStep * METERS_TO_PX} 0 L 0 0 0 ${gridStep * METERS_TO_PX}`}
              fill="none"
              stroke={
                project.blueprintMode ? 'rgba(56, 189, 248, 0.15)' : 'rgba(148, 163, 184, 0.25)'
              }
              strokeWidth="0.8"
            />
          </pattern>

          {/* Blueprint style diagonal grid */}
          <pattern
            id="blueprintHatch"
            width="20"
            height="20"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="20" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1" />
          </pattern>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Ground Base Outer Boundary */}
          <rect
            x={0}
            y={0}
            width={landPixelW}
            height={landPixelH}
            fill={project.blueprintMode ? '#0f172a' : '#ffffff'}
            stroke={project.blueprintMode ? '#38bdf8' : '#334155'}
            strokeWidth="3"
            rx={project.landDimensions.shape === 'oval' ? landPixelW / 2 : 4}
            className="transition-colors duration-300"
          />

          {/* Blueprint Hatch Fill */}
          {project.blueprintMode && (
            <rect
              x={0}
              y={0}
              width={landPixelW}
              height={landPixelH}
              fill="url(#blueprintHatch)"
              pointerEvents="none"
            />
          )}

          {/* Grid Overlay */}
          {project.landDimensions.gridVisible && (
            <rect
              x={0}
              y={0}
              width={landPixelW}
              height={landPixelH}
              fill="url(#gridPattern)"
              pointerEvents="none"
            />
          )}

          {/* Ruler Dimensions Marks around Land Boundary */}
          {project.dimensionsVisible && (
            <g className="text-[10px] font-mono select-none" pointerEvents="none">
              {/* Top Ruler Width */}
              <line
                x1={0}
                y1={-12}
                x2={landPixelW}
                y2={-12}
                stroke={project.blueprintMode ? '#38bdf8' : '#475569'}
                strokeWidth="1.5"
              />
              <line x1={0} y1={-18} x2={0} y2={-6} stroke={project.blueprintMode ? '#38bdf8' : '#475569'} strokeWidth="1.5" />
              <line x1={landPixelW} y1={-18} x2={landPixelW} y2={-6} stroke={project.blueprintMode ? '#38bdf8' : '#475569'} strokeWidth="1.5" />
              <text
                x={landPixelW / 2}
                y={-16}
                fill={project.blueprintMode ? '#38bdf8' : '#0f172a'}
                textAnchor="middle"
                className="font-bold"
              >
                {landW} {project.landDimensions.unit === 'meters' ? 'm' : 'ft'} (Width)
              </text>

              {/* Left Ruler Depth */}
              <line
                x1={-12}
                y1={0}
                x2={-12}
                y2={landPixelH}
                stroke={project.blueprintMode ? '#38bdf8' : '#475569'}
                strokeWidth="1.5"
              />
              <line x1={-18} y1={0} x2={-6} y2={0} stroke={project.blueprintMode ? '#38bdf8' : '#475569'} strokeWidth="1.5" />
              <line x1={-18} y1={landPixelH} x2={-6} y2={landPixelH} stroke={project.blueprintMode ? '#38bdf8' : '#475569'} strokeWidth="1.5" />
              <text
                x={-16}
                y={landPixelH / 2}
                fill={project.blueprintMode ? '#38bdf8' : '#0f172a'}
                textAnchor="middle"
                transform={`rotate(-90, -16, ${landPixelH / 2})`}
                className="font-bold"
              >
                {landH} {project.landDimensions.unit === 'meters' ? 'm' : 'ft'} (Length)
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

          {/* Roads & Walkways */}
          {project.roads.map((road) => {
            if (road.points.length < 2) return null;
            const pathData = road.points
              .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * METERS_TO_PX} ${p.y * METERS_TO_PX}`)
              .join(' ');
            const isSelectedRoad = selectedRoadId === road.id;

            return (
              <g key={road.id} className="group">
                {/* Invisible thick hit area for easy clicking */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={Math.max(road.width * METERS_TO_PX, 24)}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ cursor: activeTool === 'select' ? 'pointer' : 'default' }}
                  onClick={(e) => {
                    if (activeTool !== 'select') return;
                    e.stopPropagation();
                    setSelectedRoadId(isSelectedRoad ? null : road.id);
                    onSelectEstablishment(null);
                  }}
                />
                {/* Road surface stroke */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={road.color}
                  strokeWidth={road.width * METERS_TO_PX}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={project.blueprintMode ? 0.7 : 0.85}
                  style={{ pointerEvents: 'none' }}
                />
                {/* Center line dash */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeDasharray="8 8"
                  opacity={0.6}
                  style={{ pointerEvents: 'none' }}
                />
                {/* Selection highlight outline */}
                {isSelectedRoad && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={road.width * METERS_TO_PX + 6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.35}
                    style={{ pointerEvents: 'none' }}
                  />
                )}
                {/* Road label */}
                <text
                  x={(road.points[0].x + road.points[road.points.length - 1].x) * 0.5 * METERS_TO_PX}
                  y={
                    (road.points[0].y + road.points[road.points.length - 1].y) * 0.5 * METERS_TO_PX -
                    road.width * METERS_TO_PX * 0.5 - 6
                  }
                  fill={project.blueprintMode ? '#f8fafc' : '#1e293b'}
                  className="text-[10px] font-bold font-mono tracking-wider"
                  textAnchor="middle"
                  style={{ pointerEvents: 'none' }}
                >
                  {road.name} ({road.width}m)
                </text>

                {/* Control Point Handles (visible when selected) */}
                {isSelectedRoad && road.points.map((pt, ptIdx) => (
                  <g key={ptIdx}>
                    <circle
                      cx={pt.x * METERS_TO_PX}
                      cy={pt.y * METERS_TO_PX}
                      r={8}
                      fill="#ffffff"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      style={{ cursor: 'grab' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggingPointInfo({ roadId: road.id, pointIndex: ptIdx });
                      }}
                    />
                    <text
                      x={pt.x * METERS_TO_PX}
                      y={pt.y * METERS_TO_PX + 4}
                      fill="#3b82f6"
                      textAnchor="middle"
                      className="text-[9px] font-bold"
                      style={{ pointerEvents: 'none', fontSize: '9px', fontWeight: 'bold' }}
                    >
                      {ptIdx + 1}
                    </text>
                  </g>
                ))}
              </g>
            );
          })}

          {/* Active Drawing Road Points preview */}
          {activeRoadPoints.length > 0 && (
            <path
              d={activeRoadPoints
                .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * METERS_TO_PX} ${p.y * METERS_TO_PX}`)
                .join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={roadWidth * METERS_TO_PX}
              strokeDasharray="6 6"
              opacity={0.6}
            />
          )}

          {/* Waypoints & Entrances */}
          {project.waypoints.map((wp) => {
            const px = wp.x * METERS_TO_PX;
            const py = wp.y * METERS_TO_PX;

            return (
              <g key={wp.id} className="cursor-pointer group">
                <circle
                  cx={px}
                  cy={py}
                  r="14"
                  fill={wp.color}
                  className="shadow-lg transition-transform hover:scale-110"
                />
                <circle cx={px} cy={py} r="18" fill="none" stroke={wp.color} strokeWidth="2" opacity="0.4" />
                <text
                  x={px}
                  y={py + 4}
                  fill="#ffffff"
                  textAnchor="middle"
                  className="text-[11px] font-bold font-mono"
                >
                  {wp.type === 'main_entrance' ? 'GATE' : wp.type === 'emergency_exit' ? 'EXIT' : 'WP'}
                </text>
                {/* Waypoint Label */}
                <text
                  x={px}
                  y={py + 30}
                  fill={project.blueprintMode ? '#ffffff' : '#0f172a'}
                  textAnchor="middle"
                  className="text-[11px] font-bold"
                >
                  {wp.name}
                </text>
              </g>
            );
          })}

          {/* Placed Retail Establishments */}
          {project.establishments.map((inst) => {
            const isSelected = selectedEstablishmentId === inst.instanceId;
            const isColliding = collidingIds.has(inst.instanceId);

            const px = inst.x * METERS_TO_PX;
            const py = inst.y * METERS_TO_PX;
            const pw = inst.width * METERS_TO_PX;
            const pd = inst.depth * METERS_TO_PX;

            return (
              <g
                key={inst.instanceId}
                transform={`rotate(${inst.rotation}, ${px + pw / 2}, ${py + pd / 2})`}
                onMouseDown={(e) => handleEstablishmentMouseDown(e, inst)}
                className="cursor-move group"
              >
                {/* Main Establishment Rectangle */}
                <rect
                  x={px}
                  y={py}
                  width={pw}
                  height={pd}
                  fill={inst.color}
                  fillOpacity={project.blueprintMode ? 0.8 : 0.9}
                  stroke={
                    isColliding
                      ? '#ef4444'
                      : isSelected
                      ? '#2563eb'
                      : project.blueprintMode
                      ? '#ffffff'
                      : '#1e293b'
                  }
                  strokeWidth={isColliding ? 3 : isSelected ? 3 : 1.5}
                  rx="6"
                  className="transition-all shadow-md"
                />

                {/* Colliding Flashing Aura */}
                {isColliding && (
                  <rect
                    x={px - 3}
                    y={py - 3}
                    width={pw + 6}
                    height={pd + 6}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    className="animate-pulse"
                  />
                )}

                {/* Lock icon if locked */}
                {inst.isLocked && (
                  <circle cx={px + 12} cy={py + 12} r="8" fill="#000000" fillOpacity="0.4" />
                )}

                {/* Stall Number Badge */}
                <rect
                  x={px + 4}
                  y={py + 4}
                  width={34}
                  height={16}
                  fill="#000000"
                  fillOpacity={0.6}
                  rx="3"
                />
                <text
                  x={px + 21}
                  y={py + 15}
                  fill="#ffffff"
                  textAnchor="middle"
                  className="text-[9px] font-mono font-bold"
                >
                  {inst.stallNumber}
                </text>

                {/* Stall Title & Dimensions text inside box if large enough */}
                {pw >= 40 && pd >= 30 && (
                  <g pointerEvents="none">
                    <text
                      x={px + pw / 2}
                      y={py + pd / 2 - 2}
                      fill="#ffffff"
                      textAnchor="middle"
                      className="text-[11px] font-bold drop-shadow-sm"
                    >
                      {inst.name.length > 18 ? inst.name.substring(0, 16) + '...' : inst.name}
                    </text>
                    <text
                      x={px + pw / 2}
                      y={py + pd / 2 + 12}
                      fill="rgba(255,255,255,0.8)"
                      textAnchor="middle"
                      className="text-[9px] font-mono"
                    >
                      {inst.width}m x {inst.depth}m
                    </text>
                  </g>
                )}

                {/* Selected Handles */}
                {isSelected && !inst.isLocked && (
                  <g>
                    {/* Bottom-right Resize Handle */}
                    <circle
                      cx={px + pw}
                      cy={py + pd}
                      r="6"
                      fill="#2563eb"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-nwse-resize hover:scale-125 transition-transform"
                      onMouseDown={(e) => handleResizeHandleMouseDown(e, inst)}
                    />
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* Fixed Title Block in SVG for High-Res SVG/PNG Export */}
        {project.legendVisible && (
          <g transform="translate(20, 20)" className="select-none" pointerEvents="none">
            <rect
              x="0"
              y="0"
              width="260"
              height="85"
              fill={project.blueprintMode ? '#0f172a' : '#ffffff'}
              fillOpacity={0.9}
              stroke={project.blueprintMode ? '#334155' : '#e2e8f0'}
              strokeWidth="1.5"
              rx="12"
            />
            <text
              x="16"
              y="28"
              fill={project.blueprintMode ? '#f8fafc' : '#0f172a'}
              className="text-xs font-bold"
            >
              {project.title}
            </text>
            <text
              x="16"
              y="48"
              fill={project.blueprintMode ? '#94a3b8' : '#64748b'}
              className="text-[10px]"
            >
              Host: {project.hostName} | {project.eventDate}
            </text>
            <text
              x="16"
              y="66"
              fill={project.blueprintMode ? '#38bdf8' : '#2563eb'}
              className="text-[10px] font-mono font-bold"
            >
              Area: {landW}m x {landH}m ({landW * landH} m²) | Stalls: {project.establishments.length}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
