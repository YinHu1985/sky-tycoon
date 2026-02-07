import React, { useState, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../store/useGameStore';
import { CITIES } from '../../data/cities';
import { PLANE_TYPES } from '../../data/planes';
import { calculateDistance, formatMoney } from '../../lib/utils';
import { calculateFrequency } from '../../lib/economy';
import { Plus, Trash2, TrendingUp, TrendingDown, MapPin, Edit, Bot, ToggleLeft, ToggleRight } from 'lucide-react';

export const RouteManager = ({ onRequestCitySelection, onOpenRouteDetails }) => {
  const { company, routes, fleet, addRoute, deleteRoute, updateRoute } = useGameStore(useShallow(state => {
    const playerCompany = state.companies.find(c => c.id === state.playerCompanyId);
    return {
      company: playerCompany,
      routes: playerCompany ? playerCompany.routes : [],
      fleet: playerCompany ? playerCompany.fleet : {},
      addRoute: state.addRoute,
      deleteRoute: state.deleteRoute,
      updateRoute: state.updateRoute
    };
  }));

  const [isCreating, setIsCreating] = useState(false);

  // New Route Form State
  const [sourceId, setSourceId] = useState('');
  const [targetId, setTargetId] = useState('');
  const [planeTypeId, setPlaneTypeId] = useState('');
  const [assignedCount, setAssignedCount] = useState(1);
  const [priceModifier, setPriceModifier] = useState(0);
  const [autoManaged, setAutoManaged] = useState(false);
  const [targetFrequency, setTargetFrequency] = useState(0); // 0 means max

  const availablePlanesForRoute = useMemo(() => {
    return Object.keys(fleet).map(id => PLANE_TYPES.find(p => p.id === id)).filter(Boolean);
  }, [fleet]);

  const routeDetails = useMemo(() => {
    if (!sourceId || !targetId || !planeTypeId) return null;

    const source = CITIES.find(c => c.id === sourceId);
    const target = CITIES.find(c => c.id === targetId);
    const planeType = PLANE_TYPES.find(p => p.id === planeTypeId);

    if (!source || !target || !planeType) return null;

    const dist = calculateDistance(source, target);
    const rangeOk = dist <= planeType.range;
    const maxFrequency = calculateFrequency(planeTypeId, dist, assignedCount);
    const frequency = (targetFrequency > 0 && targetFrequency <= maxFrequency) 
      ? targetFrequency 
      : maxFrequency;

    // Check available aircraft
    const owned = fleet[planeTypeId] || 0;
    const assigned = routes
      .filter(r => r.planeTypeId === planeTypeId)
      .reduce((sum, r) => sum + r.assignedCount, 0);
    const available = owned - assigned;

    return {
      dist,
      rangeOk,
      frequency,
      maxFrequency,
      available,
      canCreate: rangeOk && available >= assignedCount && sourceId !== targetId
    };
  }, [sourceId, targetId, planeTypeId, assignedCount, fleet, routes, targetFrequency]);

  const handleCreate = () => {
    if (!routeDetails?.canCreate) return;

    // Check for duplicate
    const duplicate = routes.find(r =>
      (r.sourceId === sourceId && r.targetId === targetId) ||
      (r.sourceId === targetId && r.targetId === sourceId)
    );

    if (duplicate) {
      alert('A route between these cities already exists!');
      return;
    }

    const newRoute = {
      sourceId,
      targetId,
      planeTypeId,
      assignedCount,
      frequency: routeDetails.frequency,
      priceModifier,
      autoManaged
    };

    addRoute(newRoute);
    setIsCreating(false);

    // Reset form
    setSourceId('');
    setTargetId('');
    setPlaneTypeId('');
    setAssignedCount(1);
    setPriceModifier(0);
    setAutoManaged(false);
  };

  const handleDelete = (routeId) => {
    deleteRoute(routeId);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-sky-400">Routes ({company.routes.length})</h3>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-2 text-sm font-bold"
        >
          <Plus size={16} /> New Route
        </button>
      </div>

      {isCreating && (
        <div className="bg-slate-700 p-4 rounded border border-slate-500 animate-in fade-in slide-in-from-top-2">
          <h4 className="font-bold text-white mb-3">Plan New Route</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 uppercase font-bold">Origin</label>
              <div className="flex gap-2">
                <select
                  className="flex-1 bg-slate-800 border border-slate-600 rounded p-2 text-white"
                  value={sourceId}
                  onChange={e => setSourceId(e.target.value)}
                >
                  <option value="">Select City</option>
                  {CITIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {onRequestCitySelection && (
                  <button
                    onClick={() => onRequestCitySelection({ type: 'route-source', onSelect: setSourceId })}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 rounded flex items-center gap-1"
                    title="Select from Map"
                  >
                    <MapPin size={16} />
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 uppercase font-bold">Destination</label>
              <div className="flex gap-2">
                <select
                  className="flex-1 bg-slate-800 border border-slate-600 rounded p-2 text-white"
                  value={targetId}
                  onChange={e => setTargetId(e.target.value)}
                >
                  <option value="">Select City</option>
                  {CITIES.filter(c => c.id !== sourceId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {onRequestCitySelection && (
                  <button
                    onClick={() => onRequestCitySelection({ type: 'route-target', onSelect: setTargetId })}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 rounded flex items-center gap-1"
                    title="Select from Map"
                  >
                    <MapPin size={16} />
                  </button>
                )}
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-400 mb-1 uppercase font-bold">Aircraft</label>
              <select
                className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white"
                value={planeTypeId}
                onChange={e => setPlaneTypeId(e.target.value)}
              >
                <option value="">Select Aircraft</option>
                {availablePlanesForRoute.map(p => {
                  const owned = company.fleet[p.id] || 0;
                  const assigned = company.routes
                    .filter(r => r.planeTypeId === p.id)
                    .reduce((sum, r) => sum + r.assignedCount, 0);
                  const available = owned - assigned;
                  return (
                    <option key={p.id} value={p.id} disabled={available <= 0}>
                      {p.name} ({available} avail) - Range: {p.range}km
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {routeDetails && (
            <div className="mt-4 bg-slate-800 p-3 rounded space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Distance:</span>
                <span className={routeDetails.rangeOk ? 'text-white' : 'text-red-400'}>
                  {routeDetails.dist} km {!routeDetails.rangeOk && '⚠ Out of range!'}
                </span>
              </div>

              {routeDetails.rangeOk && (
                <>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Assigned Aircraft</span>
                      <span className="text-white font-bold">{assignedCount} / {routeDetails.available}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max={Math.max(1, routeDetails.available)}
                      value={assignedCount}
                      onChange={e => {
                        setAssignedCount(parseInt(e.target.value));
                        setTargetFrequency(0); // Reset frequency to max when planes change
                      }}
                      className="w-full accent-blue-500"
                      disabled={autoManaged}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Flight Frequency</span>
                      <span className="text-white font-bold">
                         {routeDetails.frequency} / {routeDetails.maxFrequency}/wk
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max={routeDetails.maxFrequency}
                      value={routeDetails.frequency}
                      onChange={e => setTargetFrequency(parseInt(e.target.value))}
                      className="w-full accent-sky-500"
                      disabled={autoManaged}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Price Strategy</span>
                      <span className={priceModifier > 0 ? 'text-green-400' : priceModifier < 0 ? 'text-amber-400' : 'text-white'}>
                        {priceModifier > 0 ? '+' : ''}{priceModifier}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="5"
                      value={priceModifier}
                      onChange={e => setPriceModifier(parseInt(e.target.value))}
                      className="w-full accent-emerald-500"
                      disabled={autoManaged}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-slate-300 border-t border-slate-700 pt-2">
                    <span>Est. Frequency:</span>
                    <span className="font-bold">{routeDetails.frequency} round trips/week</span>
                  </div>

                  <div className="flex items-center justify-between bg-slate-800 p-2 rounded border border-slate-600 mt-2">
                    <div className="flex items-center gap-2">
                      <Bot size={16} className="text-indigo-400" />
                      <div>
                        <div className="text-sm font-bold text-indigo-100">AI Helper</div>
                        <div className="text-[10px] text-slate-400">Auto-optimize</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={autoManaged}
                        onChange={e => setAutoManaged(e.target.checked)}
                      />
                      <div className="w-9 h-5 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="mt-4 flex gap-2 justify-end">
            <button
              onClick={() => setIsCreating(false)}
              className="px-3 py-1 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!routeDetails?.canCreate}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:text-slate-400 text-white rounded font-bold disabled:cursor-not-allowed"
            >
              Launch Route
            </button>
          </div>
        </div>
      )}

      {!isCreating && (
        <div className="space-y-3">
          {routes.map(route => {
            const source = CITIES.find(c => c.id === route.sourceId);
            const target = CITIES.find(c => c.id === route.targetId);
            const plane = PLANE_TYPES.find(p => p.id === route.planeTypeId);

            if (!source || !target || !plane) return null;

            const stats = route.stats || {};
            const profit = stats.profitLastWeek || 0;
            const loadFactor = stats.occupancy || 0;

            return (
              <div key={route.id} className="bg-slate-800 p-4 rounded border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-white flex items-center gap-2 text-lg">
                      <span className="text-xs px-2 py-0.5 bg-slate-900 rounded font-mono">{route.flightNumber}</span>
                      {source.name} <span className="text-slate-500">↔</span> {target.name}
                      
                      <button 
                        onClick={() => updateRoute(route.id, { autoManaged: !route.autoManaged })}
                        title={route.autoManaged ? "AI Helper Active (Click to disable)" : "Enable AI Helper"}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
                          route.autoManaged 
                            ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30' 
                            : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600 hover:text-indigo-300'
                        }`}
                      >
                        <Bot size={12} />
                        {route.autoManaged ? 'Auto' : 'Manual'}
                      </button>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex gap-3">
                      <span>{route.assignedCount}x {plane.name}</span>
                      <span>{route.frequency} trips/wk</span>
                      {route.priceModifier !== 0 && (
                        <span className={route.priceModifier > 0 ? 'text-green-400' : 'text-amber-400'}>
                          {route.priceModifier > 0 ? '+' : ''}{route.priceModifier}% pricing
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {onOpenRouteDetails && (
                      <button
                        onClick={() => onOpenRouteDetails(route.id)}
                        className="text-blue-500 hover:text-blue-400 p-1"
                        title="View/Edit Route"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(route.id)}
                      className="text-red-500 hover:text-red-400 p-1"
                      title="Close Route"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs bg-slate-900/50 p-2 rounded">
                  <div>
                    <div className="text-slate-500">Load Factor</div>
                    <div className={`font-bold ${loadFactor > 0.8 ? 'text-green-400' : loadFactor > 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {(loadFactor * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Revenue</div>
                    <div className="text-emerald-400 font-mono">{formatMoney(stats.revenue || 0)}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Profit</div>
                    <div className={`font-mono font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'} flex items-center gap-1`}>
                      {profit >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {formatMoney(profit)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {routes.length === 0 && (
            <div className="text-slate-500 text-center py-12 border-2 border-dashed border-slate-700 rounded-lg">
              <p className="text-lg mb-2">No active routes yet</p>
              <p className="text-sm">Buy a plane and create a route to start earning money!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
