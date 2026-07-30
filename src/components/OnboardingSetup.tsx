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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Gradient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />

      {/* Card */}
      <div className="relative w-full max-w-lg mx-4 bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        <div className="p-8">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-2xl">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white tracking-tight leading-none">
                Event Retail Coordinator
              </h1>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Land Visualizer & Retail System Editor
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    step === s
                      ? 'bg-blue-600 text-white'
                      : step > s
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <span>{s}</span>
                  <span>{s === 1 ? 'Event Info' : 'Land Dimensions'}</span>
                </div>
                {s < 2 && <div className="flex-1 h-px bg-slate-700" />}
              </React.Fragment>
            ))}
          </div>

          {/* ── STEP 1: Event Info ── */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Tell us about your event</h2>
                <p className="text-sm text-slate-400">We'll set up a clean workspace tailored for you.</p>
              </div>

              {/* Event Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Event Name *
                </label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={data.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="e.g. Central Plaza Street Market"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-800 border rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition ${
                      errors.title ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                    }`}
                  />
                </div>
                {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
              </div>

              {/* Host Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Host / Organizer Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={data.hostName}
                    onChange={(e) => set('hostName', e.target.value)}
                    placeholder="e.g. Marc Santos"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-800 border rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition ${
                      errors.hostName ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                    }`}
                  />
                </div>
                {errors.hostName && <p className="text-xs text-red-400 mt-1">{errors.hostName}</p>}
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Venue / Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={data.locationName}
                    onChange={(e) => set('locationName', e.target.value)}
                    placeholder="e.g. Bonifacio Global City, Taguig"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-800 border rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition ${
                      errors.locationName ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                    }`}
                  />
                </div>
                {errors.locationName && (
                  <p className="text-xs text-red-400 mt-1">{errors.locationName}</p>
                )}
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Event Date (optional)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    value={data.eventDate}
                    onChange={(e) => set('eventDate', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                  />
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
              >
                Next: Set Land Dimensions <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 2: Land Dimensions ── */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Define your land area</h2>
                <p className="text-sm text-slate-400">
                  Enter the total area dimensions for <span className="text-white font-semibold">{data.title}</span>.
                </p>
              </div>

              {/* Unit selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Measurement Unit
                </label>
                <div className="flex gap-2">
                  {(['meters', 'feet'] as const).map((u) => (
                    <button
                      key={u}
                      onClick={() => set('unit', u)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition ${
                        data.unit === u
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {u === 'meters' ? 'Meters (m)' : 'Feet (ft)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Width & Height */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Width *
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      min={10}
                      max={5000}
                      value={data.width}
                      onChange={(e) => set('width', Number(e.target.value))}
                      className={`w-full pl-10 pr-3 py-2.5 bg-slate-800 border rounded-xl text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition ${
                        errors.width ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {errors.width && <p className="text-xs text-red-400 mt-1">{errors.width}</p>}
                  <p className="text-[10px] text-slate-600 mt-1">Horizontal span ({data.unit})</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Height / Length *
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 rotate-90" />
                    <input
                      type="number"
                      min={10}
                      max={5000}
                      value={data.height}
                      onChange={(e) => set('height', Number(e.target.value))}
                      className={`w-full pl-10 pr-3 py-2.5 bg-slate-800 border rounded-xl text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition ${
                        errors.height ? 'border-red-500' : 'border-slate-700 focus:border-blue-500'
                      }`}
                    />
                  </div>
                  {errors.height && <p className="text-xs text-red-400 mt-1">{errors.height}</p>}
                  <p className="text-[10px] text-slate-600 mt-1">Vertical span ({data.unit})</p>
                </div>
              </div>

              {/* Area preview */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Total Area</p>
                  <p className="text-2xl font-extrabold text-white font-mono mt-0.5">
                    {(data.width * data.height).toLocaleString()}{' '}
                    <span className="text-sm text-slate-400">{data.unit === 'meters' ? 'm²' : 'ft²'}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">Dimensions</p>
                  <p className="text-lg font-bold text-slate-300 font-mono mt-0.5">
                    {data.width} × {data.height} {data.unit === 'meters' ? 'm' : 'ft'}
                  </p>
                </div>
              </div>

              {/* Shape */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Land Shape
                </label>
                <div className="relative">
                  <select
                    value={data.shape}
                    onChange={(e) => set('shape', e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 bg-slate-800 border border-slate-700 focus:border-blue-500 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                  >
                    <option value="rectangular">Rectangular</option>
                    <option value="l_shaped">L-Shaped</option>
                    <option value="oval">Oval / Rounded</option>
                    <option value="zoned">Zoned (Multi-area)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Grid Snap */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Grid Snap ({data.unit === 'meters' ? 'm' : 'ft'})
                </label>
                <div className="flex gap-2">
                  {[0.5, 1, 2, 5].map((g) => (
                    <button
                      key={g}
                      onClick={() => set('gridSnap', g)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition font-mono ${
                        data.gridSnap === g
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition border border-slate-700"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/25"
                >
                  <Layers className="w-4 h-4" />
                  Launch Canvas
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="px-8 pb-6 text-center">
          <p className="text-[11px] text-slate-600">
            You can change these settings anytime via <strong className="text-slate-500">Land Dimensions</strong> in the toolbar.
          </p>
        </div>
      </div>
    </div>
  );
};
