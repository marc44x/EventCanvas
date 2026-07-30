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
  Utensils,
  ShoppingBag,
  Info,
  Music,
  Bath,
  Cross,
  Store,
  X,
} from 'lucide-react';

interface EstablishmentCatalogProps {
  variables: EstablishmentVariable[];
  customVariables: EstablishmentVariable[];
  landDimensions: LandDimensions;
  onAddEstablishment: (newEstablishment: Omit<PlacedEstablishment, 'instanceId'>) => void;
  onCreateCustomVariable: (variable: EstablishmentVariable) => void;
  onUpdateVariableDefaultSpace: (variableId: string, defaultWidth: number, defaultDepth: number) => void;
}

const CATEGORIES: { key: EstablishmentCategory | 'all'; label: string }[] = [
  { key: 'all',              label: 'All' },
  { key: 'food_beverage',    label: 'Food' },
  { key: 'retail_shopping',  label: 'Retail' },
  { key: 'services',         label: 'Services' },
  { key: 'entertainment',    label: 'Entertainment' },
  { key: 'amenities',        label: 'Amenities' },
  { key: 'security_medical', label: 'Medical' },
];

// Ink color for category
const CAT_COLOR: Record<string, string> = {
  food_beverage:    '#b07030',
  retail_shopping:  '#4a6fa5',
  services:         '#5c5248',
  entertainment:    '#7a4a9a',
  amenities:        '#3a7a50',
  security_medical: '#b94040',
  custom:           '#6b7280',
};

/* ── Shared input style ── */
const inp: React.CSSProperties = {
  width: '100%',
  fontSize: 11,
  padding: '4px 8px',
  border: '1px solid #c8c0b0',
  borderRadius: 3,
  backgroundColor: '#f0ede6',
  color: '#2c2825',
  fontFamily: 'monospace',
  outline: 'none',
};

export const EstablishmentCatalog: React.FC<EstablishmentCatalogProps> = ({
  variables,
  customVariables,
  landDimensions,
  onAddEstablishment,
  onCreateCustomVariable,
  onUpdateVariableDefaultSpace,
}) => {
  const [searchQuery, setSearchQuery]           = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EstablishmentCategory | 'all'>('all');
  const [editingId, setEditingId]               = useState<string | null>(null);
  const [editWidth, setEditWidth]               = useState(3);
  const [editDepth, setEditDepth]               = useState(3);
  const [showNewForm, setShowNewForm]           = useState(false);

  // Custom form state
  const [customName, setCustomName]         = useState('');
  const [customCategory, setCustomCategory] = useState<EstablishmentCategory>('retail_shopping');
  const [customWidth, setCustomWidth]       = useState(3);
  const [customDepth, setCustomDepth]       = useState(3);
  const [customColor, setCustomColor]       = useState('#8b5cf6');
  const [customRevenue, setCustomRevenue]   = useState(500);
  const [customPower, setCustomPower]       = useState(false);
  const [customWater, setCustomWater]       = useState(false);

  const unit = landDimensions.unit === 'meters' ? 'm' : 'ft';
  const allVars = [...variables, ...customVariables];

  const filtered = allVars.filter((v) => {
    const q = searchQuery.toLowerCase();
    return (
      (v.name.toLowerCase().includes(q) || v.description.toLowerCase().includes(q)) &&
      (selectedCategory === 'all' || v.category === selectedCategory)
    );
  });

  const handlePlaceOnMap = (v: EstablishmentVariable) => {
    const w = editingId === v.id ? editWidth : v.defaultWidth;
    const d = editingId === v.id ? editDepth : v.defaultDepth;
    onAddEstablishment({
      variableId: v.id,
      name: v.name,
      category: v.category,
      x: Math.round(landDimensions.width / 2 - w / 2),
      y: Math.round(landDimensions.height / 2 - d / 2),
      width: w,
      depth: d,
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
    onCreateCustomVariable({
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
      description: `Custom: ${customWidth}${unit} × ${customDepth}${unit}`,
    });
    setShowNewForm(false);
    setCustomName(''); setCustomWidth(3); setCustomDepth(3);
  };

  return (
    <div
      className="flex flex-col h-full shrink-0"
      style={{
        width: 272,
        backgroundColor: '#faf8f4',
        borderRight: '1.5px solid #c8c0b0',
      }}
    >
      {/* ── Header ── */}
      <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid #ddd8ce' }}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#2c2825', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Catalog
            </p>
            <p style={{ fontSize: 10, color: '#9c9388', marginTop: 1 }}>
              {allVars.length} establishment types
            </p>
          </div>
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 10, fontWeight: 600, padding: '4px 8px',
              border: '1px solid #4a6fa5', borderRadius: 3,
              backgroundColor: showNewForm ? '#d9e5f5' : 'transparent',
              color: '#4a6fa5', cursor: 'pointer',
            }}
          >
            {showNewForm ? <X style={{ width: 10, height: 10 }} /> : <Plus style={{ width: 10, height: 10 }} />}
            {showNewForm ? 'Cancel' : 'New'}
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <Search style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 11, height: 11, color: '#9c9388' }} />
          <input
            type="text"
            placeholder="search stalls…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ ...inp, paddingLeft: 26, width: '100%', fontFamily: 'Inter, sans-serif' }}
          />
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                style={{
                  fontSize: 9, fontWeight: active ? 700 : 400,
                  padding: '2px 7px',
                  border: `1px solid ${active ? '#4a6fa5' : '#c8c0b0'}`,
                  borderRadius: 2,
                  backgroundColor: active ? '#d9e5f5' : 'transparent',
                  color: active ? '#2c4a7a' : '#5c5248',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── New Custom Form ── */}
      {showNewForm && (
        <form
          onSubmit={handleCreateCustom}
          style={{
            padding: '10px 14px',
            borderBottom: '1px solid #ddd8ce',
            backgroundColor: '#f5f2eb',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 700, color: '#2c2825', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            New Variable
          </p>

          <input
            type="text"
            placeholder="Stall name…"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            style={inp}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div>
              <label style={{ fontSize: 9, color: '#9c9388', display: 'block', marginBottom: 2 }}>CATEGORY</label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value as EstablishmentCategory)}
                style={inp}
              >
                <option value="retail_shopping">Retail</option>
                <option value="food_beverage">Food & Drink</option>
                <option value="services">Services</option>
                <option value="entertainment">Entertainment</option>
                <option value="amenities">Amenities</option>
                <option value="security_medical">Medical</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 9, color: '#9c9388', display: 'block', marginBottom: 2 }}>COLOR</label>
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                style={{ width: '100%', height: 28, border: '1px solid #c8c0b0', borderRadius: 3, cursor: 'pointer', padding: 2 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div>
              <label style={{ fontSize: 9, color: '#9c9388', display: 'block', marginBottom: 2 }}>WIDTH ({unit})</label>
              <input type="number" min="1" value={customWidth} onChange={(e) => setCustomWidth(Number(e.target.value))} style={inp} />
            </div>
            <div>
              <label style={{ fontSize: 9, color: '#9c9388', display: 'block', marginBottom: 2 }}>DEPTH ({unit})</label>
              <input type="number" min="1" value={customDepth} onChange={(e) => setCustomDepth(Number(e.target.value))} style={inp} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#5c5248', cursor: 'pointer' }}>
              <input type="checkbox" checked={customPower} onChange={(e) => setCustomPower(e.target.checked)} />
              <Zap style={{ width: 10, height: 10, color: '#b07030' }} /> Power
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#5c5248', cursor: 'pointer' }}>
              <input type="checkbox" checked={customWater} onChange={(e) => setCustomWater(e.target.checked)} />
              <Droplets style={{ width: 10, height: 10, color: '#4a6fa5' }} /> Water
            </label>
          </div>

          <button
            type="submit"
            style={{
              width: '100%', padding: '5px', fontSize: 11, fontWeight: 600,
              border: '1px solid #3a7a50', borderRadius: 3,
              backgroundColor: '#3a7a50', color: '#fff', cursor: 'pointer',
            }}
          >
            Add to catalog
          </button>
        </form>
      )}

      {/* ── Catalog list ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '32px 0', fontSize: 11, color: '#9c9388', fontStyle: 'italic' }}>
            No items match filter.
          </p>
        ) : (
          filtered.map((v) => {
            const isEditing = editingId === v.id;
            const col = CAT_COLOR[v.category] || '#6b7280';

            return (
              <div
                key={v.id}
                style={{
                  backgroundColor: '#faf8f4',
                  border: '1px solid #ddd8ce',
                  borderRadius: 3,
                  padding: '8px 10px',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}
              >
                {/* Row 1: color swatch + name + place button */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, flex: 1, minWidth: 0 }}>
                    {/* Color mark */}
                    <div style={{
                      width: 3, alignSelf: 'stretch', borderRadius: 2, flexShrink: 0,
                      backgroundColor: v.color,
                    }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#2c2825', lineHeight: 1.3, marginBottom: 1 }}>
                        {v.name}
                      </p>
                      <p style={{ fontSize: 9, color: col, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {v.category.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Place button */}
                  <button
                    onClick={() => handlePlaceOnMap(v)}
                    style={{
                      flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3,
                      fontSize: 9, fontWeight: 700, padding: '3px 8px',
                      border: '1px solid #c8c0b0', borderRadius: 2,
                      backgroundColor: 'transparent', color: '#2c2825', cursor: 'pointer',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#f0ede6';
                      e.currentTarget.style.borderColor = '#4a6fa5';
                      e.currentTarget.style.color = '#4a6fa5';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = '#c8c0b0';
                      e.currentTarget.style.color = '#2c2825';
                    }}
                  >
                    <Plus style={{ width: 9, height: 9 }} />
                    Place
                  </button>
                </div>

                {/* Row 2: size editor + utility badges */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  paddingTop: 5, borderTop: '1px dashed #ddd8ce',
                }}>
                  {/* Size */}
                  {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input
                        type="number" min="1" value={editWidth}
                        onChange={(e) => setEditWidth(Number(e.target.value))}
                        style={{ ...inp, width: 38, padding: '2px 4px' }}
                      />
                      <span style={{ fontSize: 10, color: '#9c9388' }}>×</span>
                      <input
                        type="number" min="1" value={editDepth}
                        onChange={(e) => setEditDepth(Number(e.target.value))}
                        style={{ ...inp, width: 38, padding: '2px 4px' }}
                      />
                      <span style={{ fontSize: 9, color: '#9c9388' }}>{unit}</span>
                      <button
                        onClick={() => { onUpdateVariableDefaultSpace(v.id, Math.max(1, editWidth), Math.max(1, editDepth)); setEditingId(null); }}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#3a7a50', padding: 2 }}
                      >
                        <Check style={{ width: 11, height: 11 }} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#5c5248', fontWeight: 600 }}>
                        {v.defaultWidth}×{v.defaultDepth}{unit}
                      </span>
                      <button
                        onClick={() => { setEditingId(v.id); setEditWidth(v.defaultWidth); setEditDepth(v.defaultDepth); }}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#b0a898', padding: 1 }}
                        title="Edit default size"
                      >
                        <Edit2 style={{ width: 9, height: 9 }} />
                      </button>
                    </div>
                  )}

                  {/* Utility badges */}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {v.powerRequired && (
                      <span title="Needs power" style={{ color: '#b07030' }}>
                        <Zap style={{ width: 10, height: 10 }} />
                      </span>
                    )}
                    {v.waterRequired && (
                      <span title="Needs water" style={{ color: '#4a6fa5' }}>
                        <Droplets style={{ width: 10, height: 10 }} />
                      </span>
                    )}
                    {v.estimatedRevenuePerDay > 0 && (
                      <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#3a7a50', fontWeight: 600 }}>
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
