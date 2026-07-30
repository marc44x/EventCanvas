import React, { useState } from 'react';
import { LandDimensions, LandShape, LandUnit } from '../types';
import { X, Layers, Ruler, MapPin, Calendar, User } from 'lucide-react';

interface LandDimensionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  landDimensions: LandDimensions;
  title: string;
  hostName: string;
  locationName: string;
  eventDate: string;
  onSave: (updated: {
    landDimensions: LandDimensions;
    title: string;
    hostName: string;
    locationName: string;
    eventDate: string;
  }) => void;
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
  headerBg: '#f0ede6',
  inputBg: '#f0ede6',
  divider: '#e8e3d8',
  cardBorder: '#ddd8ce',
  greenBg: '#eef5f0',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 10px',
  fontSize: 12,
  backgroundColor: COLORS.inputBg,
  border: `1px solid ${COLORS.pencil}`,
  borderRadius: 3,
  color: COLORS.ink,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 500,
  color: COLORS.mutedInk,
  marginBottom: 4,
};

const sectionHeadingStyle: React.CSSProperties = {
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
};

export const LandDimensionsModal: React.FC<LandDimensionsModalProps> = ({
  isOpen,
  onClose,
  landDimensions,
  title,
  hostName,
  locationName,
  eventDate,
  onSave,
}) => {
  const [width, setWidth] = useState(landDimensions.width);
  const [height, setHeight] = useState(landDimensions.height);
  const [unit, setUnit] = useState<LandUnit>(landDimensions.unit);
  const [shape, setShape] = useState<LandShape>(landDimensions.shape);
  const [gridSnap, setGridSnap] = useState(landDimensions.gridSnap);
  const [gridVisible, setGridVisible] = useState(landDimensions.gridVisible);

  const [eventTitle, setEventTitle] = useState(title);
  const [host, setHost] = useState(hostName);
  const [location, setLocation] = useState(locationName);
  const [date, setDate] = useState(eventDate);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      landDimensions: {
        width: Math.max(10, Number(width) || 50),
        height: Math.max(10, Number(height) || 40),
        unit,
        shape,
        gridSnap: Number(gridSnap) || 1,
        gridVisible,
      },
      title: eventTitle || 'Event Land Layout',
      hostName: host || 'Host Organizer',
      locationName: location || 'Event Grounds',
      eventDate: date || new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  const area = Math.round(width * height);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 16,
      }}
      className="animate-in fade-in duration-200"
    >
      <div
        style={{
          backgroundColor: COLORS.paper,
          border: `1.5px solid ${COLORS.pencil}`,
          borderRadius: 4,
          boxShadow: '2px 4px 16px rgba(44,40,37,0.15)',
          width: '100%',
          maxWidth: 576,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: COLORS.headerBg,
            borderBottom: `1px solid ${COLORS.cardBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ color: COLORS.blue, display: 'flex' }}>
              <Ruler style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink, margin: 0 }}>Host's Land &amp; Event Setup</h2>
              <p style={{ fontSize: 11, color: COLORS.greyInk, margin: '2px 0 0' }}>
                Define the overall land boundaries, scale unit, and event metadata.
              </p>
            </div>
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
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto', maxHeight: '80vh' }}>
          {/* Event Metadata Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={sectionHeadingStyle}>
              <User style={{ width: 11, height: 11 }} /> Event &amp; Host Identity
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Event Title</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Summer Craft & Food Expo"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Host / Organizer Name</label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="e.g. City Cultural Board"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Venue Location</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Riverside Park Green"
                    style={{ ...inputStyle, paddingLeft: 28 }}
                  />
                  <MapPin style={{ width: 13, height: 13, color: COLORS.greyInk, position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Event Date</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: 28 }}
                  />
                  <Calendar style={{ width: 13, height: 13, color: COLORS.greyInk, position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: `1px solid ${COLORS.divider}`, margin: 0 }} />

          {/* Land Area Dimensions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <h3 style={sectionHeadingStyle}>
              <Ruler style={{ width: 11, height: 11 }} /> Overall Land Dimensions
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>
                  Land Width ({unit === 'meters' ? 'm' : 'ft'})
                </label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  style={{ ...inputStyle, fontFamily: 'monospace' }}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Land Length / Depth ({unit === 'meters' ? 'm' : 'ft'})
                </label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  style={{ ...inputStyle, fontFamily: 'monospace' }}
                  required
                />
              </div>
            </div>

            {/* Total Area Summary Banner */}
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: COLORS.greenBg,
                border: `1px solid ${COLORS.green}`,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 11,
                color: COLORS.green,
              }}
            >
              <span style={{ fontWeight: 500 }}>Calculated Total Land Area:</span>
              <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>
                {area.toLocaleString()} {unit === 'meters' ? 'm²' : 'ft²'}
              </span>
            </div>

            {/* Unit & Shape */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Measurement Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as LandUnit)}
                  style={inputStyle}
                >
                  <option value="meters">Meters (m)</option>
                  <option value="feet">Feet (ft)</option>
                </select>
              </div>

              <div>
                <label style={labelStyle}>Land Shape Profile</label>
                <select
                  value={shape}
                  onChange={(e) => setShape(e.target.value as LandShape)}
                  style={inputStyle}
                >
                  <option value="rectangular">Rectangular Grounds</option>
                  <option value="l_shaped">L-Shaped Grounds</option>
                  <option value="oval">Oval / Arena Grounds</option>
                </select>
              </div>
            </div>

            {/* Grid Snapping & Visibility */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'center' }}>
              <div>
                <label style={labelStyle}>Grid Snap Distance</label>
                <select
                  value={gridSnap}
                  onChange={(e) => setGridSnap(Number(e.target.value))}
                  style={inputStyle}
                >
                  <option value={0.5}>0.5 {unit === 'meters' ? 'm' : 'ft'} (Fine)</option>
                  <option value={1}>1.0 {unit === 'meters' ? 'm' : 'ft'} (Standard)</option>
                  <option value={2}>2.0 {unit === 'meters' ? 'm' : 'ft'} (Coarse)</option>
                  <option value={5}>5.0 {unit === 'meters' ? 'm' : 'ft'} (Large Zones)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 18 }}>
                <input
                  type="checkbox"
                  id="gridVisibleToggle"
                  checked={gridVisible}
                  onChange={(e) => setGridVisible(e.target.checked)}
                  style={{ width: 14, height: 14 }}
                />
                <label
                  htmlFor="gridVisibleToggle"
                  style={{ fontSize: 11, color: COLORS.mutedInk, fontWeight: 500, cursor: 'pointer' }}
                >
                  Display Grid Lines on Map
                </label>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div
            style={{
              paddingTop: 14,
              borderTop: `1px solid ${COLORS.divider}`,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '7px 14px',
                fontSize: 12,
                fontWeight: 500,
                color: COLORS.greyInk,
                backgroundColor: 'transparent',
                border: `1px solid ${COLORS.pencil}`,
                borderRadius: 3,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '7px 16px',
                fontSize: 12,
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: COLORS.green,
                border: `1px solid #2d6040`,
                borderRadius: 3,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Layers style={{ width: 14, height: 14 }} /> Save Land Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
