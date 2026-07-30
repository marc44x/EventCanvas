import React, { useState } from 'react';
import {
  EstablishmentVariable,
  EstablishmentCategory,
  PlacedEstablishment,
  LandDimensions,
} from '../types';
import {
  Search,
  Plus,
  Edit2,
  Check,
  Zap,
  Droplets,
  DollarSign,
  Maximize2,
  Utensils,
  ShoppingBag,
  Info,
  Music,
  Bath,
  Cross,
  Store,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface EstablishmentCatalogProps {
  variables: EstablishmentVariable[];
  customVariables: EstablishmentVariable[];
  landDimensions: LandDimensions;
  onAddEstablishment: (newEstablishment: Omit<PlacedEstablishment, 'instanceId'>) => void;
  onCreateCustomVariable: (variable: EstablishmentVariable) => void;
  onUpdateVariableDefaultSpace: (variableId: string, defaultWidth: number, defaultDepth: number) => void;
}

const CATEGORIES: { key: EstablishmentCategory | 'all'; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'All Items', icon: <Store className="w-4 h-4" /> },
  { key: 'food_beverage', label: 'Food & Drink', icon: <Utensils className="w-4 h-4" /> },
  { key: 'retail_shopping', label: 'Retail & Shops', icon: <ShoppingBag className="w-4 h-4" /> },
  { key: 'services', label: 'Services & Desk', icon: <Info className="w-4 h-4" /> },
  { key: 'entertainment', label: 'Stage & Music', icon: <Music className="w-4 h-4" /> },
  { key: 'amenities', label: 'Amenities & WC', icon: <Bath className="w-4 h-4" /> },
  { key: 'security_medical', label: 'Medical & HQ', icon: <Cross className="w-4 h-4" /> },
];

export const EstablishmentCatalog: React.FC<EstablishmentCatalogProps> = ({
  variables,
  customVariables,
  landDimensions,
  onAddEstablishment,
  onCreateCustomVariable,
  onUpdateVariableDefaultSpace,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EstablishmentCategory | 'all'>('all');
  const [editingVariableId, setEditingVariableId] = useState<string | null>(null);
  const [editWidth, setEditWidth] = useState<number>(3);
  const [editDepth, setEditDepth] = useState<number>(3);

  // New Custom Variable Modal/Accordion State
  const [showNewCustomForm, setShowNewCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<EstablishmentCategory>('retail_shopping');
  const [customWidth, setCustomWidth] = useState(3);
  const [customDepth, setCustomDepth] = useState(3);
  const [customColor, setCustomColor] = useState('#8b5cf6');
  const [customRevenue, setCustomRevenue] = useState(500);
  const [customPower, setCustomPower] = useState(false);
  const [customWater, setCustomWater] = useState(false);

  const allVars = [...variables, ...customVariables];

  const filteredVars = allVars.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStartEditDefault = (v: EstablishmentVariable) => {
    setEditingVariableId(v.id);
    setEditWidth(v.defaultWidth);
    setEditDepth(v.defaultDepth);
  };

  const handleSaveDefaultSpace = (variableId: string) => {
    onUpdateVariableDefaultSpace(variableId, Math.max(1, editWidth), Math.max(1, editDepth));
    setEditingVariableId(null);
  };

  const handlePlaceOnMap = (v: EstablishmentVariable) => {
    // Generate a default center-ish placement
    const placedWidth = editingVariableId === v.id ? editWidth : v.defaultWidth;
    const placedDepth = editingVariableId === v.id ? editDepth : v.defaultDepth;

    onAddEstablishment({
      variableId: v.id,
      name: v.name,
      category: v.category,
      x: Math.round(landDimensions.width / 2 - placedWidth / 2),
      y: Math.round(landDimensions.height / 2 - placedDepth / 2),
      width: placedWidth,
      depth: placedDepth,
      rotation: 0,
      color: v.color,
      stallNumber: `S-${Math.floor(10 + Math.random() * 90)}`,
      rentalFee: v.estimatedRevenuePerDay ? Math.round(v.estimatedRevenuePerDay * 0.3) : 200,
      notes: v.description,
    });
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newVar: EstablishmentVariable = {
      id: `custom-var-${Date.now()}`,
      name: customName,
      category: customCategory,
      defaultWidth: Math.max(1, customWidth),
      defaultDepth: Math.max(1, customDepth),
      color: customColor,
      iconName: 'Store',
      estimatedRevenuePerDay: customRevenue,
      powerRequired: customPower,
      waterRequired: customWater,
      description: `Custom retail variable created by host with default dimensions ${customWidth}m x ${customDepth}m.`,
    };

    onCreateCustomVariable(newVar);
    setShowNewCustomForm(false);
    // Reset
    setCustomName('');
    setCustomWidth(3);
    setCustomDepth(3);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-80 lg:w-96 shrink-0 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Establishment Catalog
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Retail variables & default space requirements
            </p>
          </div>
          <button
            onClick={() => setShowNewCustomForm(!showNewCustomForm)}
            className="px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            New Variable
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search stalls, food trucks, shops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>

        {/* Categories Horizontal Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedCategory === cat.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* New Custom Variable Form (Accordion) */}
      {showNewCustomForm && (
        <form
          onSubmit={handleCreateCustom}
          className="p-4 bg-blue-50/50 dark:bg-blue-950/30 border-b border-blue-200 dark:border-blue-900 space-y-3 text-xs"
        >
          <div className="flex items-center justify-between font-bold text-blue-900 dark:text-blue-200">
            <span>Add Custom Establishment Variable</span>
            <button
              type="button"
              onClick={() => setShowNewCustomForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <div>
            <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">Name</label>
            <input
              type="text"
              placeholder="e.g. Handmade Soap Stall"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">Category</label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value as EstablishmentCategory)}
                className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
              >
                <option value="retail_shopping">Retail Shopping</option>
                <option value="food_beverage">Food & Beverage</option>
                <option value="services">Services</option>
                <option value="entertainment">Entertainment</option>
                <option value="amenities">Amenities</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">Color</label>
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-full h-7 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">
                Default Width ({landDimensions.unit === 'meters' ? 'm' : 'ft'})
              </label>
              <input
                type="number"
                min="1"
                value={customWidth}
                onChange={(e) => setCustomWidth(Number(e.target.value))}
                className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-slate-700 dark:text-slate-300">
                Default Depth ({landDimensions.unit === 'meters' ? 'm' : 'ft'})
              </label>
              <input
                type="number"
                min="1"
                value={customDepth}
                onChange={(e) => setCustomDepth(Number(e.target.value))}
                className="w-full px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={customPower}
                onChange={(e) => setCustomPower(e.target.checked)}
                className="rounded border-slate-300"
              />
              <span>Power Needed</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={customWater}
                onChange={(e) => setCustomWater(e.target.checked)}
                className="rounded border-slate-300"
              />
              <span>Water Needed</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-1.5 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition"
          >
            Create & Save Variable
          </button>
        </form>
      )}

      {/* Catalog Item List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredVars.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No establishment variables found matching filter.
          </div>
        ) : (
          filteredVars.map((v) => {
            const isEditingSpace = editingVariableId === v.id;

            return (
              <div
                key={v.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition group space-y-2"
              >
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: v.color }}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {v.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                        {v.category.replace('_', ' & ')}
                      </p>
                    </div>
                  </div>

                  {/* Add onto land button */}
                  <button
                    onClick={() => handlePlaceOnMap(v)}
                    className="px-2.5 py-1 text-[11px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Place
                  </button>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                  {v.description}
                </p>

                {/* Default Space & Features Row */}
                <div className="pt-1.5 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
                  {/* Space footprint editor */}
                  <div className="flex items-center gap-1 font-mono font-medium">
                    <Maximize2 className="w-3 h-3 text-slate-400" />
                    {isEditingSpace ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          value={editWidth}
                          onChange={(e) => setEditWidth(Number(e.target.value))}
                          className="w-10 px-1 py-0.5 bg-white dark:bg-slate-900 border rounded text-[11px]"
                        />
                        <span>x</span>
                        <input
                          type="number"
                          min="1"
                          value={editDepth}
                          onChange={(e) => setEditDepth(Number(e.target.value))}
                          className="w-10 px-1 py-0.5 bg-white dark:bg-slate-900 border rounded text-[11px]"
                        />
                        <span>{landDimensions.unit === 'meters' ? 'm' : 'ft'}</span>
                        <button
                          onClick={() => handleSaveDefaultSpace(v.id)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Save default space"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="font-bold">
                          {v.defaultWidth} x {v.defaultDepth} {landDimensions.unit === 'meters' ? 'm' : 'ft'}
                        </span>
                        <button
                          onClick={() => handleStartEditDefault(v)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                          title="Edit default space requirement"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Utility requirement badges */}
                  <div className="flex items-center gap-2">
                    {v.powerRequired && (
                      <span className="flex items-center text-[10px] text-amber-600 dark:text-amber-400" title="Requires Power">
                        <Zap className="w-3 h-3" />
                      </span>
                    )}
                    {v.waterRequired && (
                      <span className="flex items-center text-[10px] text-blue-600 dark:text-blue-400" title="Requires Water">
                        <Droplets className="w-3 h-3" />
                      </span>
                    )}
                    {v.estimatedRevenuePerDay > 0 && (
                      <span className="flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold" title="Est. Revenue">
                        ${v.estimatedRevenuePerDay}/d
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
