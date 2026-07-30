import React, { useState } from 'react';
import { Layers, ArrowRight, Ruler, Calendar, User, MapPin, ChevronDown } from 'lucide-react';

interface OnboardingData {
  title: string;
  hostName: string;
  locationName: string;
  eventDate: string;
  width: number;
  height: number;
  unit: 'meters' | 'feet';
  shape: 'rectangular' | 'l_shaped' | 'oval' | 'zoned';
  gridSnap: number;
}

interface OnboardingSetupProps {
  onComplete: (data: OnboardingData) => void;
}

export const OnboardingSetup: React.FC<OnboardingSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [data, setData] = useState<OnboardingData>({
    title: '',
    hostName: '',
    locationName: '',
    eventDate: '',
    width: 100,
    height: 80,
    unit: 'meters',
    shape: 'rectangular',
    gridSnap: 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof OnboardingData, value: string | number) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!data.title.trim()) e.title = 'Event name is required';
    if (!data.hostName.trim()) e.hostName = 'Host name is required';
    if (!data.locationName.trim()) e.locationName = 'Location is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!data.width || data.width < 10) e.width = 'Minimum width is 10';
    if (!data.height || data.height < 10) e.height = 'Minimum height is 10';
    if (data.width > 5000) e.width = 'Maximum width is 5000';
    if (data.height > 5000) e.height = 'Maximum height is 5000';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const handleSubmit = () => {
    if (validateStep2()) onComplete(data);
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px 10px 36px',
    backgroundColor: '#f0ede6',
    border: '1px solid #c8c0b0',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#2c2825',
    outline: 'none',
  };

  const inputErrorStyle = {
    ...inputStyle,
    borderColor: '#b94040',
    backgroundColor: '#fdf0f0',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '10px',
    fontWeight: 700,
    color: '#9c9388',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '6px',
  };

  const iconStyle = {
    position: 'absolute' as const,
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '14px',
    height: '14px',
    color: '#9c9388',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans" style={{ backgroundColor: '#f5f2eb' }}>
      
      {/* Background sketch lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="bg-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#8a7d6a" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg-grid)" />
      </svg>

      {/* Card */}
      <div 
        className="relative w-full max-w-lg mx-4 flex flex-col"
        style={{
          backgroundColor: '#faf8f4',
          border: '1.5px solid #c8c0b0',
          borderRadius: '4px',
          boxShadow: '2px 6px 24px rgba(44,40,37,0.12)',
        }}
      >
        <div className="p-8">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 mb-8">
            <div style={{ padding: '8px', border: '1.5px solid #4a6fa5', borderRadius: '4px', backgroundColor: '#d9e5f5' }}>
              <Layers style={{ width: '20px', height: '20px', color: '#4a6fa5' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#2c2825', lineHeight: 1 }}>
                EventCanvas
              </h1>
              <p style={{ fontSize: '11px', color: '#5c5248', fontFamily: 'monospace', marginTop: '4px' }}>
                Event Layout & Retail Planner
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => {
              const active = step === s;
              const past = step > s;
              return (
                <React.Fragment key={s}>
                  <div
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold transition-all"
                    style={{
                      borderRadius: '16px',
                      backgroundColor: active ? '#4a6fa5' : past ? '#d9e5f5' : '#f0ede6',
                      color: active ? '#fff' : past ? '#4a6fa5' : '#9c9388',
                      border: past ? '1px solid #4a6fa5' : '1px solid transparent'
                    }}
                  >
                    <span>{s}</span>
                    <span>{s === 1 ? 'Event Info' : 'Land Dimensions'}</span>
                  </div>
                  {s < 2 && <div className="flex-1 h-px" style={{ backgroundColor: '#ddd8ce' }} />}
                </React.Fragment>
              );
            })}
          </div>

          {/* ── STEP 1: Event Info ── */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#2c2825', marginBottom: '2px' }}>Tell us about your event</h2>
                <p style={{ fontSize: '12px', color: '#5c5248' }}>We'll set up a clean workspace tailored for you.</p>
              </div>

              {/* Event Name */}
              <div>
                <label style={labelStyle}>Event Name *</label>
                <div className="relative">
                  <Layers style={iconStyle} />
                  <input
                    type="text"
                    value={data.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="e.g. Central Plaza Street Market"
                    style={errors.title ? inputErrorStyle : inputStyle}
                  />
                </div>
                {errors.title && <p style={{ fontSize: '11px', color: '#b94040', marginTop: '4px' }}>{errors.title}</p>}
              </div>

              {/* Host Name */}
              <div>
                <label style={labelStyle}>Host / Organizer Name *</label>
                <div className="relative">
                  <User style={iconStyle} />
                  <input
                    type="text"
                    value={data.hostName}
                    onChange={(e) => set('hostName', e.target.value)}
                    placeholder="e.g. Marc Santos"
                    style={errors.hostName ? inputErrorStyle : inputStyle}
                  />
                </div>
                {errors.hostName && <p style={{ fontSize: '11px', color: '#b94040', marginTop: '4px' }}>{errors.hostName}</p>}
              </div>

              {/* Location */}
              <div>
                <label style={labelStyle}>Venue / Location *</label>
                <div className="relative">
                  <MapPin style={iconStyle} />
                  <input
                    type="text"
                    value={data.locationName}
                    onChange={(e) => set('locationName', e.target.value)}
                    placeholder="e.g. Bonifacio Global City, Taguig"
                    style={errors.locationName ? inputErrorStyle : inputStyle}
                  />
                </div>
                {errors.locationName && (
                  <p style={{ fontSize: '11px', color: '#b94040', marginTop: '4px' }}>{errors.locationName}</p>
                )}
              </div>

              {/* Event Date */}
              <div>
                <label style={labelStyle}>Event Date (optional)</label>
                <div className="relative">
                  <Calendar style={iconStyle} />
                  <input
                    type="date"
                    value={data.eventDate}
                    onChange={(e) => set('eventDate', e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full mt-4 flex items-center justify-center gap-2 transition-all cursor-pointer"
                style={{
                  padding: '12px',
                  backgroundColor: '#4a6fa5',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '13px',
                  border: '1px solid #2c4a7a',
                  borderRadius: '4px',
                }}
              >
                Next: Set Land Dimensions <ArrowRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
          )}

          {/* ── STEP 2: Land Dimensions ── */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#2c2825', marginBottom: '2px' }}>Define your land area</h2>
                <p style={{ fontSize: '12px', color: '#5c5248' }}>
                  Enter the total area dimensions for <strong style={{ color: '#2c2825' }}>{data.title}</strong>.
                </p>
              </div>

              {/* Unit selector */}
              <div>
                <label style={labelStyle}>Measurement Unit</label>
                <div className="flex gap-2">
                  {(['meters', 'feet'] as const).map((u) => {
                    const active = data.unit === u;
                    return (
                      <button
                        key={u}
                        onClick={() => set('unit', u)}
                        className="flex-1 transition cursor-pointer"
                        style={{
                          padding: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                          borderRadius: '4px',
                          backgroundColor: active ? '#d9e5f5' : '#f0ede6',
                          border: active ? '1px solid #4a6fa5' : '1px solid #c8c0b0',
                          color: active ? '#2c4a7a' : '#5c5248',
                        }}
                      >
                        {u === 'meters' ? 'Meters (m)' : 'Feet (ft)'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Width & Height */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Width *</label>
                  <div className="relative">
                    <Ruler style={iconStyle} />
                    <input
                      type="number"
                      min={10}
                      max={5000}
                      value={data.width}
                      onChange={(e) => set('width', Number(e.target.value))}
                      style={{ ...(errors.width ? inputErrorStyle : inputStyle), fontFamily: 'monospace' }}
                    />
                  </div>
                  {errors.width && <p style={{ fontSize: '11px', color: '#b94040', marginTop: '4px' }}>{errors.width}</p>}
                  <p style={{ fontSize: '10px', color: '#9c9388', marginTop: '4px' }}>Horizontal span ({data.unit})</p>
                </div>

                <div>
                  <label style={labelStyle}>Height / Length *</label>
                  <div className="relative">
                    <Ruler style={{ ...iconStyle, transform: 'translateY(-50%) rotate(90deg)' }} />
                    <input
                      type="number"
                      min={10}
                      max={5000}
                      value={data.height}
                      onChange={(e) => set('height', Number(e.target.value))}
                      style={{ ...(errors.height ? inputErrorStyle : inputStyle), fontFamily: 'monospace' }}
                    />
                  </div>
                  {errors.height && <p style={{ fontSize: '11px', color: '#b94040', marginTop: '4px' }}>{errors.height}</p>}
                  <p style={{ fontSize: '10px', color: '#9c9388', marginTop: '4px' }}>Vertical span ({data.unit})</p>
                </div>
              </div>

              {/* Area preview */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContents: 'space-between', padding: '16px', backgroundColor: '#eef5f0', border: '1px solid #3a7a50', borderRadius: '4px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '10px', color: '#3a7a50', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Area</p>
                  <p style={{ fontSize: '20px', fontWeight: 800, color: '#143821', fontFamily: 'monospace' }}>
                    {(data.width * data.height).toLocaleString()}{' '}
                    <span style={{ fontSize: '12px', color: '#3a7a50' }}>{data.unit === 'meters' ? 'm²' : 'ft²'}</span>
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '10px', color: '#3a7a50', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dimensions</p>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#143821', fontFamily: 'monospace' }}>
                    {data.width} × {data.height} {data.unit === 'meters' ? 'm' : 'ft'}
                  </p>
                </div>
              </div>

              {/* Shape */}
              <div>
                <label style={labelStyle}>Land Shape</label>
                <div className="relative">
                  <select
                    value={data.shape}
                    onChange={(e) => set('shape', e.target.value as any)}
                    className="appearance-none"
                    style={{ ...inputStyle, paddingLeft: '14px' }}
                  >
                    <option value="rectangular">Rectangular</option>
                    <option value="l_shaped">L-Shaped</option>
                    <option value="oval">Oval / Rounded</option>
                    <option value="zoned">Zoned (Multi-area)</option>
                  </select>
                  <ChevronDown style={{ ...iconStyle, left: 'auto', right: '12px' }} />
                </div>
              </div>

              {/* Grid Snap */}
              <div>
                <label style={labelStyle}>Grid Snap ({data.unit === 'meters' ? 'm' : 'ft'})</label>
                <div className="flex gap-2">
                  {[0.5, 1, 2, 5].map((g) => {
                    const active = data.gridSnap === g;
                    return (
                      <button
                        key={g}
                        onClick={() => set('gridSnap', g)}
                        className="flex-1 transition cursor-pointer"
                        style={{
                          padding: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          borderRadius: '4px',
                          backgroundColor: active ? '#4a6fa5' : '#f0ede6',
                          border: active ? '1px solid #2c4a7a' : '1px solid #c8c0b0',
                          color: active ? '#fff' : '#5c5248',
                        }}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="cursor-pointer transition"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'transparent',
                    border: '1px solid #c8c0b0',
                    borderRadius: '4px',
                    color: '#5c5248',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 flex items-center justify-center gap-2 transition cursor-pointer"
                  style={{
                    backgroundColor: '#3a7a50',
                    color: '#fff',
                    border: '1px solid #2d6040',
                    borderRadius: '4px',
                    fontWeight: 700,
                    fontSize: '13px',
                  }}
                >
                  <Layers style={{ width: '16px', height: '16px' }} />
                  Launch Canvas
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div style={{ padding: '0 32px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '10px', color: '#9c9388' }}>
            You can change these settings anytime via <strong style={{ color: '#5c5248' }}>Land Dimensions</strong> in the toolbar.
          </p>
        </div>
      </div>
    </div>
  );
};
