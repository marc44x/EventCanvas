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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg dark:text-blue-400">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Host's Land & Event Setup</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define the overall land boundaries, scale unit, and event metadata.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Event Metadata Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Event & Host Identity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Summer Craft & Food Expo"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Host / Organizer Name
                </label>
                <input
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="e.g. City Cultural Board"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Venue Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Riverside Park Green"
                    className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Event Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* Land Area Dimensions */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5" /> Overall Land Dimensions
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Land Width ({unit === 'meters' ? 'm' : 'ft'})
                </label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Land Length / Depth ({unit === 'meters' ? 'm' : 'ft'})
                </label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>
            </div>

            {/* Total Area Summary Banner */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
              <span className="font-medium">Calculated Total Land Area:</span>
              <span className="font-bold font-mono text-sm">
                {area.toLocaleString()} {unit === 'meters' ? 'm²' : 'ft²'}
              </span>
            </div>

            {/* Unit & Shape */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Measurement Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as LandUnit)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                >
                  <option value="meters">Meters (m)</option>
                  <option value="feet">Feet (ft)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Land Shape Profile
                </label>
                <select
                  value={shape}
                  onChange={(e) => setShape(e.target.value as LandShape)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                >
                  <option value="rectangular">Rectangular Grounds</option>
                  <option value="l_shaped">L-Shaped Grounds</option>
                  <option value="oval">Oval / Arena Grounds</option>
                </select>
              </div>
            </div>

            {/* Grid Snapping & Visibility */}
            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Grid Snap Distance
                </label>
                <select
                  value={gridSnap}
                  onChange={(e) => setGridSnap(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                >
                  <option value={0.5}>0.5 {unit === 'meters' ? 'm' : 'ft'} (Fine)</option>
                  <option value={1}>1.0 {unit === 'meters' ? 'm' : 'ft'} (Standard)</option>
                  <option value={2}>2.0 {unit === 'meters' ? 'm' : 'ft'} (Coarse)</option>
                  <option value={5}>5.0 {unit === 'meters' ? 'm' : 'ft'} (Large Zones)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="gridVisibleToggle"
                  checked={gridVisible}
                  onChange={(e) => setGridVisible(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="gridVisibleToggle" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                  Display Grid Lines on Map
                </label>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition flex items-center gap-2"
            >
              <Layers className="w-4 h-4" /> Save Land Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
