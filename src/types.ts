export type LandUnit = 'meters' | 'feet';
export type LandShape = 'rectangular' | 'l_shaped' | 'oval' | 'zoned';

export type EstablishmentCategory =
  | 'food_beverage'
  | 'retail_shopping'
  | 'services'
  | 'entertainment'
  | 'amenities'
  | 'security_medical'
  | 'custom';

export interface EstablishmentVariable {
  id: string;
  name: string;
  category: EstablishmentCategory;
  defaultWidth: number; // in meters/units
  defaultDepth: number; // in meters/units
  color: string;
  iconName: string;
  estimatedRevenuePerDay: number;
  powerRequired: boolean;
  waterRequired: boolean;
  description: string;
}

export interface PlacedEstablishment {
  instanceId: string;
  variableId: string;
  name: string;
  category: EstablishmentCategory;
  x: number; // top-left position in meters
  y: number; // top-left position in meters
  width: number; // width in meters
  depth: number; // depth in meters
  rotation: number; // 0, 45, 90, 180, 270 degrees
  color: string;
  stallNumber: string;
  rentalFee: number;
  notes?: string;
  isLocked?: boolean;
  customLabel?: string;
}

export interface RoadPoint {
  x: number;
  y: number;
}

export type RoadType = 'main_avenue' | 'pedestrian_path' | 'service_road' | 'emergency_corridor';

export interface RoadPath {
  id: string;
  name: string;
  roadType: RoadType;
  width: number; // width of road in meters
  color: string;
  points: RoadPoint[];
}

export type WaypointType =
  | 'main_entrance'
  | 'vip_entrance'
  | 'emergency_exit'
  | 'service_gate'
  | 'info_sign'
  | 'crowd_node'
  | 'stage_view'
  | 'restroom_hub';

export interface Waypoint {
  id: string;
  name: string;
  type: WaypointType;
  x: number;
  y: number;
  color: string;
  icon: string;
  description?: string;
  connections?: string[]; // IDs of connected waypoints to draw flow direction
}

export interface LandDimensions {
  width: number; // in meters
  height: number; // length in meters
  unit: LandUnit;
  shape: LandShape;
  gridSnap: number; // e.g. 1m, 0.5m, 2m
  gridVisible: boolean;
}

export interface EventLayoutProject {
  id: string;
  title: string;
  eventDate: string;
  hostName: string;
  locationName: string;
  landDimensions: LandDimensions;
  establishments: PlacedEstablishment[];
  roads: RoadPath[];
  waypoints: Waypoint[];
  customVariables: EstablishmentVariable[];
  legendVisible: boolean;
  labelsVisible: boolean;
  blueprintMode: boolean;
  dimensionsVisible: boolean;
  zoneOverlays?: ZoneOverlay[];
}

export interface ZoneOverlay {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ActiveTool =
  | 'select'
  | 'place_establishment'
  | 'draw_road'
  | 'place_waypoint'
  | 'add_zone'
  | 'measure';

export interface AIAnalysisResult {
  spatialEfficiencyScore: number;
  crowdSafetyScore: number;
  recommendations: string[];
  commercialPotential: string;
  suggestedAdditions: string[];
}
