import { PlacedEstablishment, LandDimensions, RoadPath, Waypoint } from '../types';

export interface SpatialStats {
  totalLandArea: number; // sq meters
  allocatedRetailArea: number; // sq meters
  roadArea: number; // sq meters
  openSpaceArea: number; // sq meters
  utilizationPercentage: number;
  totalEstablishmentsCount: number;
  totalEstimatedRevenue: number;
  hasCollisionWarning: boolean;
  collisionsList: { inst1: string; inst2: string; name1: string; name2: string }[];
}

// Bounding box collision calculation taking simple AABB (or 90/270 rotated bounding box)
export function checkCollision(e1: PlacedEstablishment, e2: PlacedEstablishment): boolean {
  // Compute width/depth accounting for 90 or 270 degree rotation
  const isRotated1 = e1.rotation === 90 || e1.rotation === 270;
  const w1 = isRotated1 ? e1.depth : e1.width;
  const d1 = isRotated1 ? e1.width : e1.depth;

  const isRotated2 = e2.rotation === 90 || e2.rotation === 270;
  const w2 = isRotated2 ? e2.depth : e2.width;
  const d2 = isRotated2 ? e2.width : e2.depth;

  const left1 = e1.x;
  const right1 = e1.x + w1;
  const top1 = e1.y;
  const bottom1 = e1.y + d1;

  const left2 = e2.x;
  const right2 = e2.x + w2;
  const top2 = e2.y;
  const bottom2 = e2.y + d2;

  // Check overlap with 0.1 meter tolerance
  const xOverlap = left1 < right2 - 0.1 && right1 > left2 + 0.1;
  const yOverlap = top1 < bottom2 - 0.1 && bottom1 > top2 + 0.1;

  return xOverlap && yOverlap;
}

export function computeSpatialStats(
  land: LandDimensions,
  establishments: PlacedEstablishment[],
  roads: RoadPath[]
): SpatialStats {
  const totalLandArea = land.width * land.height;

  let allocatedRetailArea = 0;
  let totalEstimatedRevenue = 0;

  establishments.forEach((est) => {
    allocatedRetailArea += est.width * est.depth;
    totalEstimatedRevenue += est.rentalFee || 0;
  });

  // Calculate road area approximate (length * width)
  let roadArea = 0;
  roads.forEach((road) => {
    let roadLength = 0;
    for (let i = 0; i < road.points.length - 1; i++) {
      const p1 = road.points[i];
      const p2 = road.points[i + 1];
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      roadLength += dist;
    }
    roadArea += roadLength * road.width;
  });

  const openSpaceArea = Math.max(0, totalLandArea - allocatedRetailArea - roadArea);
  const utilizationPercentage = Math.min(100, Math.round((allocatedRetailArea / totalLandArea) * 100));

  // Find collisions
  const collisionsList: { inst1: string; inst2: string; name1: string; name2: string }[] = [];
  for (let i = 0; i < establishments.length; i++) {
    for (let j = i + 1; j < establishments.length; j++) {
      if (checkCollision(establishments[i], establishments[j])) {
        collisionsList.push({
          inst1: establishments[i].instanceId,
          inst2: establishments[j].instanceId,
          name1: establishments[i].name,
          name2: establishments[j].name,
        });
      }
    }
  }

  return {
    totalLandArea,
    allocatedRetailArea,
    roadArea,
    openSpaceArea,
    utilizationPercentage,
    totalEstablishmentsCount: establishments.length,
    totalEstimatedRevenue,
    hasCollisionWarning: collisionsList.length > 0,
    collisionsList,
  };
}

// Snap position to nearest grid step
export function snapToGrid(val: number, step: number): number {
  if (!step || step <= 0) return Math.round(val * 10) / 10;
  return Math.round(val / step) * step;
}

// Alignments helper
export function alignEstablishments(
  establishments: PlacedEstablishment[],
  selectedIds: string[],
  alignment: 'left' | 'center_x' | 'right' | 'top' | 'center_y' | 'bottom'
): PlacedEstablishment[] {
  if (selectedIds.length < 2) return establishments;

  const selected = establishments.filter((e) => selectedIds.includes(e.instanceId));
  if (selected.length === 0) return establishments;

  let targetValue = 0;

  if (alignment === 'left') {
    targetValue = Math.min(...selected.map((e) => e.x));
  } else if (alignment === 'right') {
    targetValue = Math.max(...selected.map((e) => e.x + (e.rotation === 90 || e.rotation === 270 ? e.depth : e.width)));
  } else if (alignment === 'top') {
    targetValue = Math.min(...selected.map((e) => e.y));
  } else if (alignment === 'bottom') {
    targetValue = Math.max(...selected.map((e) => e.y + (e.rotation === 90 || e.rotation === 270 ? e.width : e.depth)));
  }

  return establishments.map((est) => {
    if (!selectedIds.includes(est.instanceId) || est.isLocked) return est;

    let newX = est.x;
    let newY = est.y;

    const w = est.rotation === 90 || est.rotation === 270 ? est.depth : est.width;
    const d = est.rotation === 90 || est.rotation === 270 ? est.width : est.depth;

    if (alignment === 'left') newX = targetValue;
    if (alignment === 'right') newX = targetValue - w;
    if (alignment === 'top') newY = targetValue;
    if (alignment === 'bottom') newY = targetValue - d;

    return { ...est, x: newX, y: newY };
  });
}
