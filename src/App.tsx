import React, { useState, useRef, useEffect } from 'react';
import {
  EventLayoutProject,
  PlacedEstablishment,
  EstablishmentVariable,
  RoadPath,
  Waypoint,
  ActiveTool,
  RoadType,
  WaypointType,
  ZoneOverlay,
  LandDimensions,
} from './types';
import { DEFAULT_ESTABLISHMENT_VARIABLES } from './data/defaultVariables';
import { HeaderNavbar } from './components/HeaderNavbar';
import { EstablishmentCatalog } from './components/EstablishmentCatalog';
import { RoadWaypointToolbar } from './components/RoadWaypointToolbar';
import { CanvasMap } from './components/CanvasMap';
import { LandDimensionsModal } from './components/LandDimensionsModal';
import { ExportModal } from './components/ExportModal';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { AIAdvisorModal } from './components/AIAdvisorModal';
import { OnboardingSetup } from './components/OnboardingSetup';

export default function App() {
  // Project starts as null until the host completes onboarding
  const [project, setProject] = useState<EventLayoutProject | null>(null);

  // Handler called when host completes the onboarding setup form
  const handleOnboardingComplete = (data: {
    title: string;
    hostName: string;
    locationName: string;
    eventDate: string;
    width: number;
    height: number;
    unit: 'meters' | 'feet';
    shape: 'rectangular' | 'l_shaped' | 'oval' | 'zoned';
    gridSnap: number;
  }) => {
    const emptyProject: EventLayoutProject = {
      id: `project-${Date.now()}`,
      title: data.title,
      hostName: data.hostName,
      locationName: data.locationName,
      eventDate: data.eventDate,
      landDimensions: {
        width: data.width,
        height: data.height,
        unit: data.unit,
        shape: data.shape,
        gridSnap: data.gridSnap,
        gridVisible: true,
      },
      establishments: [],
      roads: [],
      waypoints: [],
      customVariables: [],
      legendVisible: true,
      labelsVisible: true,
      blueprintMode: false,
      dimensionsVisible: true,
      zoneOverlays: [],
    };
    setProject(emptyProject);
  };


  // Catalog variables
  const [establishmentVariables, setEstablishmentVariables] = useState<EstablishmentVariable[]>(
    DEFAULT_ESTABLISHMENT_VARIABLES
  );

  // Active Map Tool
  const [activeTool, setActiveTool] = useState<ActiveTool>('select');
  const [selectedRoadType, setSelectedRoadType] = useState<RoadType>('main_avenue');
  const [roadWidth, setRoadWidth] = useState<number>(6);
  const [selectedWaypointType, setSelectedWaypointType] = useState<WaypointType>('main_entrance');

  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<string | null>(null);

  // Landmark Options
  const [landmarkName, setLandmarkName] = useState<string>('Landmark Area');
  const [landmarkColor, setLandmarkColor] = useState<string>('#4a6fa5');

  // Modals
  const [isLandModalOpen, setIsLandModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);

  // SVG Ref for High-Res SVG/PNG Export
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Keyboard Shortcuts (Delete / Backspace / Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEstablishmentId) {
        handleDeleteEstablishment(selectedEstablishmentId);
      } else if (e.key === 'Escape') {
        setSelectedEstablishmentId(null);
        setActiveTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEstablishmentId]);

  // --- Handlers ---

  // Host's Land Setup Save
  const handleSaveLandConfiguration = (updated: {
    landDimensions: LandDimensions;
    title: string;
    hostName: string;
    locationName: string;
    eventDate: string;
  }) => {
    setProject((prev) => ({
      ...prev,
      landDimensions: updated.landDimensions,
      title: updated.title,
      hostName: updated.hostName,
      locationName: updated.locationName,
      eventDate: updated.eventDate,
    }));
  };

  // Add new establishment instance onto canvas
  const handleAddEstablishment = (
    newEstablishment: Omit<PlacedEstablishment, 'instanceId'>
  ) => {
    const instanceId = `inst-${Date.now()}`;
    const placed: PlacedEstablishment = {
      ...newEstablishment,
      instanceId,
    };

    setProject((prev) => ({
      ...prev,
      establishments: [...prev.establishments, placed],
    }));

    setSelectedEstablishmentId(instanceId);
    setActiveTool('select');
  };

  // Update placed establishment
  const handleUpdateEstablishment = (updated: PlacedEstablishment) => {
    setProject((prev) => ({
      ...prev,
      establishments: prev.establishments.map((item) =>
        item.instanceId === updated.instanceId ? updated : item
      ),
    }));
  };

  // Delete establishment
  const handleDeleteEstablishment = (id: string) => {
    setProject((prev) => ({
      ...prev,
      establishments: prev.establishments.filter((item) => item.instanceId !== id),
    }));
    if (selectedEstablishmentId === id) {
      setSelectedEstablishmentId(null);
    }
  };

  // Duplicate establishment
  const handleDuplicateEstablishment = (id: string) => {
    const original = project.establishments.find((item) => item.instanceId === id);
    if (!original) return;

    const newInst: PlacedEstablishment = {
      ...original,
      instanceId: `inst-${Date.now()}`,
      x: Math.min(project.landDimensions.width - original.width, original.x + 2),
      y: Math.min(project.landDimensions.height - original.depth, original.y + 2),
      stallNumber: `S-${Math.floor(10 + Math.random() * 90)}`,
    };

    setProject((prev) => ({
      ...prev,
      establishments: [...prev.establishments, newInst],
    }));

    setSelectedEstablishmentId(newInst.instanceId);
  };

  // Create Custom Establishment Variable definition
  const handleCreateCustomVariable = (variable: EstablishmentVariable) => {
    setProject((prev) => ({
      ...prev,
      customVariables: [...prev.customVariables, variable],
    }));
  };

  // Update default space requirements for any variable globally
  const handleUpdateVariableDefaultSpace = (
    variableId: string,
    defaultWidth: number,
    defaultDepth: number
  ) => {
    setEstablishmentVariables((prev) =>
      prev.map((v) =>
        v.id === variableId
          ? { ...v, defaultWidth, defaultDepth }
          : v
      )
    );
    setProject((prev) => ({
      ...prev,
      customVariables: prev.customVariables.map((v) =>
        v.id === variableId
          ? { ...v, defaultWidth, defaultDepth }
          : v
      ),
    }));
  };

  // Roads
  const handleAddRoad = (road: RoadPath) => {
    setProject((prev) => ({
      ...prev,
      roads: [...prev.roads, road],
    }));
  };

  const handleUpdateRoad = (updated: RoadPath) => {
    setProject((prev) => ({
      ...prev,
      roads: prev.roads.map((r) => (r.id === updated.id ? updated : r)),
    }));
  };

  const handleDeleteRoad = (id: string) => {
    setProject((prev) => ({
      ...prev,
      roads: prev.roads.filter((r) => r.id !== id),
    }));
  };

  // Waypoints
  const handleAddWaypoint = (waypoint: Waypoint) => {
    setProject((prev) => ({
      ...prev,
      waypoints: [...prev.waypoints, waypoint],
    }));
  };

  const handleDeleteWaypoint = (id: string) => {
    setProject((prev) => ({
      ...prev,
      waypoints: prev.waypoints.filter((w) => w.id !== id),
    }));
  };

  // Zones
  const handleAddZoneOverlay = (zone: ZoneOverlay) => {
    setProject((prev) => ({
      ...prev,
      zoneOverlays: [...(prev.zoneOverlays || []), zone],
    }));
  };

  const handleDeleteZoneOverlay = (id: string) => {
    setProject((prev) => ({
      ...prev,
      zoneOverlays: prev.zoneOverlays?.filter((z) => z.id !== id),
    }));
  };

  // Load preset template
  const handleLoadPreset = (preset: EventLayoutProject) => {
    setProject({ ...preset });
    setSelectedEstablishmentId(null);
  };

  // Clear canvas
  const handleClearCanvas = () => {
    if (confirm('Are you sure you want to clear all establishments and roads?')) {
      setProject((prev) => ({
        ...prev,
        establishments: [],
        roads: [],
        waypoints: [],
        zoneOverlays: [],
      }));
      setSelectedEstablishmentId(null);
    }
  };

  // Show onboarding if project hasn't been configured yet
  if (!project) {
    return <OnboardingSetup onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden font-sans" style={{ backgroundColor: '#f5f2eb' }}>
      {/* Navigation Bar */}
      <HeaderNavbar
        project={project}
        onOpenLandModal={() => setIsLandModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onToggleAnalytics={() => setIsAnalyticsOpen(!isAnalyticsOpen)}
        onOpenAIAdvisor={() => setIsAIAdvisorOpen(true)}
        onLoadPreset={handleLoadPreset}
        onToggleBlueprint={() =>
          setProject((prev) => ({ ...prev, blueprintMode: !prev.blueprintMode }))
        }
        onClearCanvas={handleClearCanvas}
      />

      {/* Tool Sub-header bar */}
      <div
        className="shrink-0 px-4 py-2 flex items-center gap-2 overflow-x-auto"
        style={{ backgroundColor: '#f0ede6', borderBottom: '1px solid #ddd8ce' }}
      >
        <RoadWaypointToolbar
          activeTool={activeTool}
          onSelectTool={setActiveTool}
          selectedRoadType={selectedRoadType}
          onSelectRoadType={setSelectedRoadType}
          roadWidth={roadWidth}
          onChangeRoadWidth={setRoadWidth}
          selectedWaypointType={selectedWaypointType}
          onSelectWaypointType={setSelectedWaypointType}
          clearAllRoads={() => setProject((prev) => ({ ...prev, roads: [] }))}
          clearAllWaypoints={() => setProject((prev) => ({ ...prev, waypoints: [] }))}
          landmarkName={landmarkName}
          onSetLandmarkName={setLandmarkName}
          landmarkColor={landmarkColor}
          onSetLandmarkColor={setLandmarkColor}
        />
      </div>

      {/* Main Studio Workarea */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar Catalog */}
        <EstablishmentCatalog
          variables={establishmentVariables}
          customVariables={project.customVariables}
          landDimensions={project.landDimensions}
          onAddEstablishment={handleAddEstablishment}
          onCreateCustomVariable={handleCreateCustomVariable}
          onUpdateVariableDefaultSpace={handleUpdateVariableDefaultSpace}
        />

        {/* Center Main Canvas */}
        <div className="flex-1 flex flex-col relative overflow-hidden">

          {/* Interactive SVG Canvas */}
          <CanvasMap
            project={project}
            activeTool={activeTool}
            selectedRoadType={selectedRoadType}
            roadWidth={roadWidth}
            selectedWaypointType={selectedWaypointType}
            selectedEstablishmentId={selectedEstablishmentId}
            onSelectEstablishment={setSelectedEstablishmentId}
            onUpdateEstablishment={handleUpdateEstablishment}
            onDeleteEstablishment={handleDeleteEstablishment}
            onDuplicateEstablishment={handleDuplicateEstablishment}
            onAddRoad={handleAddRoad}
            onUpdateRoad={handleUpdateRoad}
            onDeleteRoad={handleDeleteRoad}
            onAddWaypoint={handleAddWaypoint}
            onDeleteWaypoint={handleDeleteWaypoint}
            onAddZoneOverlay={handleAddZoneOverlay}
            onDeleteZoneOverlay={handleDeleteZoneOverlay}
            landmarkName={landmarkName}
            landmarkColor={landmarkColor}
            svgRef={svgRef}
          />
        </div>

        {/* Right Drawer Metrics & Analytics Panel */}
        <AnalyticsPanel
          project={project}
          isOpen={isAnalyticsOpen}
          onClose={() => setIsAnalyticsOpen(false)}
          onOpenAIAdvisor={() => setIsAIAdvisorOpen(true)}
        />
      </div>

      {/* Modals */}
      <LandDimensionsModal
        isOpen={isLandModalOpen}
        onClose={() => setIsLandModalOpen(false)}
        landDimensions={project.landDimensions}
        title={project.title}
        hostName={project.hostName}
        locationName={project.locationName}
        eventDate={project.eventDate}
        onSave={handleSaveLandConfiguration}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
        svgRef={svgRef}
      />

      <AIAdvisorModal
        isOpen={isAIAdvisorOpen}
        onClose={() => setIsAIAdvisorOpen(false)}
        project={project}
      />
    </div>
  );
}
