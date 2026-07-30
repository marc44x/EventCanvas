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

const COLORS = {
  paper: '#faf8f4',
  pencil: '#c8c0b0',
  ink: '#2c2825',
  mutedInk: '#5c5248',
  greyInk: '#9c9388',
  blue: '#4a6fa5',
  green: '#3a7a50',
  red: '#b94040',
  amber: '#b07030',
  cardBg: '#f5f2eb',
  cardBorder: '#ddd8ce',
  greenBg: '#eef5f0',
  redBg: '#fdf0f0',
  blueBg: '#d9e5f5',
  blueText: '#2c4a7a',
  track: '#e8e3d8',
};

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
    <div
      style={{
        position: 'fixed',
        inset: '0 0 0 auto',
        zIndex: 40,
        width: '24rem',
        backgroundColor: COLORS.paper,
        borderLeft: `1.5px solid ${COLORS.pencil}`,
        display: 'flex',
        flexDirection: 'column',
        color: COLORS.ink,
        fontFamily: 'inherit',
      }}
      className="animate-in slide-in-from-right duration-200"
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${COLORS.cardBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: COLORS.paper,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart3 style={{ width: 16, height: 16, color: COLORS.blue }} />
          <h2
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontFamily: 'monospace',
              color: COLORS.ink,
              margin: 0,
            }}
          >
            Spatial Metrics &amp; Revenue
          </h2>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '4px 6px',
            color: COLORS.greyInk,
            background: 'transparent',
            border: `1px solid ${COLORS.pencil}`,
            borderRadius: 3,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X style={{ width: 14, height: 14 }} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 20, fontSize: 11 }}>
        {/* Gemini AI Advisor Callout */}
        <div
          style={{
            padding: 12,
            border: `1px solid ${COLORS.blue}`,
            backgroundColor: COLORS.blueBg,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 11, color: COLORS.blueText }}>
              <Sparkles style={{ width: 14, height: 14 }} /> Gemini Spatial Advisor
            </div>
            <p style={{ fontSize: 10, color: COLORS.blueText, opacity: 0.85, marginTop: 2, margin: '2px 0 0' }}>
              Analyze safety compliance, crowd flow &amp; revenue potential.
            </p>
          </div>
          <button
            onClick={onOpenAIAdvisor}
            style={{
              padding: '5px 10px',
              backgroundColor: COLORS.paper,
              color: COLORS.blueText,
              fontWeight: 700,
              border: `1px solid ${COLORS.blue}`,
              borderRadius: 3,
              fontSize: 11,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Analyze
          </button>
        </div>

        {/* Spatial Footprint Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: COLORS.greyInk,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontFamily: 'monospace',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Maximize2 style={{ width: 11, height: 11 }} /> Land Utilization
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div
              style={{
                padding: 10,
                backgroundColor: COLORS.cardBg,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 3,
              }}
            >
              <span style={{ fontSize: 9, color: COLORS.greyInk, textTransform: 'uppercase', fontFamily: 'monospace' }}>Total Land Area</span>
              <p style={{ fontSize: 15, fontWeight: 700, fontFamily: 'monospace', color: COLORS.ink, margin: '4px 0 0' }}>
                {stats.totalLandArea.toLocaleString()} m²
              </p>
            </div>

            <div
              style={{
                padding: 10,
                backgroundColor: COLORS.cardBg,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 3,
              }}
            >
              <span style={{ fontSize: 9, color: COLORS.greyInk, textTransform: 'uppercase', fontFamily: 'monospace' }}>Retail Stalls Footprint</span>
              <p style={{ fontSize: 15, fontWeight: 700, fontFamily: 'monospace', color: COLORS.blue, margin: '4px 0 0' }}>
                {stats.allocatedRetailArea.toLocaleString()} m²
              </p>
            </div>

            <div
              style={{
                padding: 10,
                backgroundColor: COLORS.cardBg,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 3,
              }}
            >
              <span style={{ fontSize: 9, color: COLORS.greyInk, textTransform: 'uppercase', fontFamily: 'monospace' }}>Roads &amp; Walkways</span>
              <p style={{ fontSize: 15, fontWeight: 700, fontFamily: 'monospace', color: COLORS.mutedInk, margin: '4px 0 0' }}>
                {Math.round(stats.roadArea).toLocaleString()} m²
              </p>
            </div>

            <div
              style={{
                padding: 10,
                backgroundColor: COLORS.cardBg,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: 3,
              }}
            >
              <span style={{ fontSize: 9, color: COLORS.greyInk, textTransform: 'uppercase', fontFamily: 'monospace' }}>Open Assembly Space</span>
              <p style={{ fontSize: 15, fontWeight: 700, fontFamily: 'monospace', color: COLORS.green, margin: '4px 0 0' }}>
                {Math.round(stats.openSpaceArea).toLocaleString()} m²
              </p>
            </div>
          </div>

          {/* Utilization Progress bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500, color: COLORS.mutedInk }}>
              <span>Ground Density Efficiency:</span>
              <span style={{ fontWeight: 700, fontFamily: 'monospace', color: COLORS.ink }}>{stats.utilizationPercentage}%</span>
            </div>
            <div
              style={{
                width: '100%',
                backgroundColor: COLORS.track,
                height: 4,
                borderRadius: 2,
                overflow: 'hidden',
                display: 'flex',
              }}
            >
              <div
                style={{
                  backgroundColor: COLORS.blue,
                  height: '100%',
                  width: `${stats.utilizationPercentage}%`,
                  transition: 'width 300ms',
                }}
              />
              <div
                style={{
                  backgroundColor: COLORS.green,
                  height: '100%',
                  opacity: 0.6,
                  width: `${Math.min(100, Math.round((stats.roadArea / stats.totalLandArea) * 100))}%`,
                  transition: 'width 300ms',
                }}
              />
            </div>
          </div>
        </div>

        {/* Safety & Spatial Collision Checker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: COLORS.greyInk,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontFamily: 'monospace',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <AlertTriangle style={{ width: 11, height: 11 }} /> Safety &amp; Collision Status
          </h3>

          {stats.hasCollisionWarning ? (
            <div
              style={{
                padding: 10,
                backgroundColor: COLORS.redBg,
                border: `1px solid ${COLORS.red}`,
                borderRadius: 3,
                color: COLORS.red,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 11 }}>
                <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }} />
                <span>Overlapping Stalls Detected ({stats.collisionsList.length})</span>
              </div>
              <ul style={{ listStyle: 'disc', paddingLeft: 16, fontSize: 10, margin: 0, display: 'flex', flexDirection: 'column', gap: 2, opacity: 0.9 }}>
                {stats.collisionsList.slice(0, 3).map((col, idx) => (
                  <li key={idx}>
                    "{col.name1}" overlaps with "{col.name2}"
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div
              style={{
                padding: 10,
                backgroundColor: COLORS.greenBg,
                border: `1px solid ${COLORS.green}`,
                borderRadius: 3,
                color: COLORS.green,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 500,
              }}
            >
              <CheckCircle2 style={{ width: 14, height: 14, flexShrink: 0 }} />
              <span>Zero spatial collisions detected! Clearance is optimal.</span>
            </div>
          )}
        </div>

        {/* Financial Revenue Potential */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: COLORS.greyInk,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontFamily: 'monospace',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <DollarSign style={{ width: 11, height: 11 }} /> Host Rental Revenue Estimate
          </h3>

          <div
            style={{
              padding: 14,
              backgroundColor: COLORS.greenBg,
              border: `1px solid ${COLORS.green}`,
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 9, color: COLORS.green, fontWeight: 500, textTransform: 'uppercase', fontFamily: 'monospace' }}>
              Total Estimated Daily Rental Income
            </span>
            <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.green, fontFamily: 'monospace' }}>
              ${stats.totalEstimatedRevenue.toLocaleString()} / day
            </div>
            <p style={{ fontSize: 9, color: COLORS.mutedInk, margin: 0 }}>
              Calculated from {stats.totalEstablishmentsCount} active retail &amp; food stall fees.
            </p>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: COLORS.greyInk,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontFamily: 'monospace',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <Store style={{ width: 11, height: 11 }} /> Retail Category Breakdown
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {Object.entries(categoryCounts).map(([cat, info]) => (
              <div
                key={cat}
                style={{
                  padding: '8px 4px',
                  borderBottom: `1px dashed ${COLORS.cardBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, color: COLORS.ink, textTransform: 'capitalize' }}>
                    {cat.replace('_', ' & ')}
                  </span>
                  <div style={{ fontSize: 10, color: COLORS.greyInk }}>
                    {info.count} stalls | {info.area} m² total
                  </div>
                </div>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: COLORS.green }}>
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
