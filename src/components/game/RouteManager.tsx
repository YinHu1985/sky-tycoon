import React, { useState, useMemo, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../store/useGameStore';
import { CITIES } from '../../data/cities';
import { PLANE_TYPES } from '../../data/planes';
import { calculateDistance, formatMoney } from '../../lib/utils';
import { calculateFrequency } from '../../lib/economy';
import { Plus, TrendingUp, TrendingDown, MapPin, ToggleLeft, ToggleRight } from 'lucide-react';
import { Route, City, PlaneType } from '../../types';

interface RouteManagerProps {
  onRequestCitySelection?: (options: { type: string; onSelect: (id: string) => void }) => void;
  onOpenRouteDetails?: (routeId: string) => void;
  pendingRouteCreation?: { sourceId: string; targetId: string } | null;
  onConsumePendingRouteCreation?: () => void;
}

export const RouteManager: React.FC<RouteManagerProps> = ({ 
  onRequestCitySelection, 
  onOpenRouteDetails, 
  pendingRouteCreation, 
  onConsumePendingRouteCreation 
}) => {
  const { company, routes, fleet, addRoute, deleteRoute, updateRoute, lastRouteSourceId, setLastRouteSourceId } = useGameStore(useShallow(state => {
    const playerCompany = state.companies.find(c => c.id === state.playerCompanyId);
    return {
      company: playerCompany,
      routes: playerCompany ? playerCompany.routes : [],
      fleet: playerCompany ? playerCompany.fleet : {},
      addRoute: state.addRoute,
      deleteRoute: state.deleteRoute,
      updateRoute: state.updateRoute,
      lastRouteSourceId: state.lastRouteSourceId,
      setLastRouteSourceId: state.setLastRouteSourceId
    };
  }));

  const [isCreating, setIsCreating] = useState(false);

  // Handle pending creation request
  useEffect(() => {
    if (pendingRouteCreation) {
      setIsCreating(true);
      setSourceId(pendingRouteCreation.sourceId);
      setTargetId(pendingRouteCreation.targetId);
      // Consume the request so it doesn't trigger again unless new request comes
      if (onConsumePendingRouteCreation) {
        onConsumePendingRouteCreation();
      }
    }
  }, [pendingRouteCreation, onConsumePendingRouteCreation]);

  // New Route Form State
  const [sourceId, setSourceId] = useState<string>('');
  const [targetId, setTargetId] = useState<string>('');
  const [planeTypeId, setPlaneTypeId] = useState<string>('');
  const [assignedCount, setAssignedCount] = useState<number>(1);
  const [priceModifier, setPriceModifier] = useState<number>(0);
  const [autoManaged, setAutoManaged] = useState<boolean>(false);
  const [targetFrequency, setTargetFrequency] = useState<number>(0); // 0 means max

  const handleOpenCreate = () => {
    setIsCreating(true);
    if (!sourceId && lastRouteSourceId) {
      setSourceId(lastRouteSourceId);
    }
  };
  const handleSetSourceId = (val: string) => {
    setSourceId(val);
    if (val) setLastRouteSourceId(val);
  };

  // Sorting state
  const [sortMode, setSortMode] = useState<'flightNumber' | 'revenue' | 'profit'>('flightNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const availablePlanesForRoute = useMemo(() => {
    return Object.keys(fleet).map(id => PLANE_TYPES.find(p => p.id === id)).filter((p): p is PlaneType => !!p);
  }, [fleet]);

  const sortedRoutes = useMemo(() => {
    const getFlightNum = (fn?: string) => {
      if (!fn) return 0;
      const num = parseInt(String(fn).replace(/^\D+/, ''), 10);
      return isNaN(num) ? 0 : num;
    };
    const getRevenue = (r: Route) => (r.stats && typeof r.stats.revenue === 'number') ? r.stats.revenue : 0;
    const getProfit = (r: Route) => (r.stats && typeof r.stats.profitLastWeek === 'number') ? r.stats.profitLastWeek : 0;

    const arr = [...routes];
    arr.sort((a, b) => {
      switch (sortMode) {
        case 'revenue':
          return sortDirection === 'asc' ? (getRevenue(a) - getRevenue(b)) : (getRevenue(b) - getRevenue(a));
        case 'profit':
          return sortDirection === 'asc' ? (getProfit(a) - getProfit(b)) : (getProfit(b) - getProfit(a));
        case 'flightNumber':
        default:
          return sortDirection === 'asc' 
            ? (getFlightNum(a.flightNumber) - getFlightNum(b.flightNumber))
            : (getFlightNum(b.flightNumber) - getFlightNum(a.flightNumber));
      }
    });
    return arr;
  }, [routes, sortMode, sortDirection]);

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

    const estFuelCost = frequency * 2 * dist * planeType.fuelCost;
    const estMaintCost = assignedCount * planeType.maint;

    return {
      dist,
      rangeOk,
      frequency,
      maxFrequency,
      available,
      estFuelCost,
      estMaintCost,
      canCreate: rangeOk && available >= assignedCount && sourceId !== targetId
    };
  }, [sourceId, targetId, planeTypeId, assignedCount, fleet, routes, targetFrequency]);

  const handleCreate = () => {
    if (!routeDetails?.canCreate) return;

    // Check for duplicate
    const duplicate = routes.find(r =>
      (r.from === sourceId && r.to === targetId) ||
      (r.from === targetId && r.to === sourceId)
    );

    if (duplicate) {
      alert('A route between these cities already exists!');
      return;
    }

    const newRoute: Partial<Route> = {
      from: sourceId,
      to: targetId,
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

  const handleQuickDecrease = (route: Route) => {
    const newCount = Math.max(1, (route.assignedCount || 1) - 1);
    if (newCount !== route.assignedCount) {
      updateRoute(route.id, { assignedCount: newCount });
    }
  };

  const handleQuickIncrease = (route: Route) => {
    const owned = company?.fleet[route.planeTypeId] || 0;
    const assignedElsewhere = company?.routes
      .filter(r => r.id !== route.id && r.planeTypeId === route.planeTypeId)
      .reduce((sum, r) => sum + (r.assignedCount || 0), 0) || 0;
    const available = Math.max(0, owned - assignedElsewhere);

    if (available <= 0) {
      return;
    }
    const newCount = (route.assignedCount || 0) + 1;
    if (newCount <= owned - assignedElsewhere) {
      // Auto-increase frequency proportionally
      const maxFreq = calculateFrequency(route.planeTypeId, route.distance, newCount);
      updateRoute(route.id, { 
        assignedCount: newCount,
        frequency: maxFreq
      });
    }
  };

  if (!company) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-sky-400">Routes ({company.routes.length})</h3>
        <button 
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-2 text-sm font-bold"
        >
          <Plus size={16} /> New Route
        </button>
      </div>

      {!isCreating && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Sort by:</span>
          <button
            onClick={() => setSortMode('flightNumber')}
            className={`px-2 py-1 rounded border ${
              sortMode === 'flightNumber'
                ? 'bg-slate-600 border-slate-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
            }`}
            title="Sort by Airline Number (desc)"
          >
            Airline No.
          </button>
          <button
            onClick={() => setSortMode('revenue')}
            className={`px-2 py-1 rounded border ${
              sortMode === 'revenue'
                ? 'bg-slate-600 border-slate-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
            }`}
            title="Sort by Revenue (desc)"
          >
            Revenue
          </button>
          <button
            onClick={() => setSortMode('profit')}
            className={`px-2 py-1 rounded border ${
              sortMode === 'profit'
                ? 'bg-slate-600 border-slate-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
            }`}
            title="Sort by Profit (desc)"
          >
            Profit
          </button>
          <button
            onClick={() => setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')}
            className="ml-2 px-2 py-1 rounded border bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 flex items-center gap-1"
            title="Toggle sort direction"
          >
            {sortDirection === 'desc' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            {sortDirection === 'desc' ? 'Desc' : 'Asc'}
          </button>
        </div>
      )}

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
                  onChange={e => handleSetSourceId(e.target.value)}
                >
                  <option value="">Select City</option>
                  {CITIES.filter(c => {
                    if (!targetId) return true;
                    const exists = routes.some(r =>
                      (r.from === c.id && r.to === targetId) ||
                      (r.from === targetId && r.to === c.id)
                    );
                    if (exists) return false;
                    if (planeTypeId) {
                      const other = CITIES.find(x => x.id === targetId);
                      const plane = PLANE_TYPES.find(p => p.id === planeTypeId);
                      if (other && plane) {
                        const km = calculateDistance(c, other);
                        if (km > plane.range) return false;
                      }
                    }
                    return true;
                  }).map(c => {
                    const label = (() => {
                      if (targetId) {
                        const other = CITIES.find(x => x.id === targetId);
                        if (other) {
                          const km = calculateDistance(c, other);
                          return `${c.name} (${km} km)`;
                        }
                      }
                      return c.name;
                    })();
                    return <option key={c.id} value={c.id}>{label}</option>;
                  })}
                </select>
                {onRequestCitySelection && (
                  <button
                    onClick={() => onRequestCitySelection({ type: 'route-source', onSelect: handleSetSourceId })}
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
                  {CITIES.filter(c => c.id !== sourceId).filter(c => {
                    if (!sourceId) return true;
                    const exists = routes.some(r =>
                      (r.from === sourceId && r.to === c.id) ||
                      (r.from === c.id && r.to === sourceId)
                    );
                    if (exists) return false;
                    if (planeTypeId) {
                      const other = CITIES.find(x => x.id === sourceId);
                      const plane = PLANE_TYPES.find(p => p.id === planeTypeId);
                      if (other && plane) {
                        const km = calculateDistance(other, c);
                        if (km > plane.range) return false;
                      }
                    }
                    return true;
                  }).map(c => {
                    const label = (() => {
                      if (sourceId) {
                        const other = CITIES.find(x => x.id === sourceId);
                        if (other) {
                          const km = calculateDistance(other, c);
                          return `${c.name} (${km} km)`;
                        }
                      }
                      return c.name;
                    })();
                    return <option key={c.id} value={c.id}>{label}</option>;
                  })}
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

                  <div className="space-y-1 border-t border-slate-700 pt-2 mt-2">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Est. Fuel Cost:</span>
                      <span className="font-mono text-red-300">{formatMoney(routeDetails.estFuelCost)}/wk</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Est. Maintenance:</span>
                      <span className="font-mono text-red-300">{formatMoney(routeDetails.estMaintCost)}/wk</span>
                    </div>
                    <div className="flex justify-between text-xs text-white font-bold pt-1">
                      <span>Total Est. Cost:</span>
                      <span className="font-mono text-red-400">{formatMoney(routeDetails.estFuelCost + routeDetails.estMaintCost)}/wk</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300 pt-1">
                      <span>Est. Frequency:</span>
                      <span className="font-bold">{routeDetails.frequency} round trips/week</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-slate-800 p-2 rounded border border-slate-600 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="text-indigo-400" >🤖</div>
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
                      <div className="w-9 h-5 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setIsCreating(false)}
                      className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-2 rounded font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreate}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded font-bold"
                    >
                      Create Route
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Routes List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {sortedRoutes.length === 0 && !isCreating && (
          <div className="text-center py-8 text-slate-400 bg-slate-800/50 rounded-lg border border-slate-700 border-dashed">
            <p className="mb-2">No routes active.</p>
            <p className="text-sm">Create a route to start earning revenue!</p>
          </div>
        )}
        
        {sortedRoutes.map(route => {
          const source = CITIES.find(c => c.id === route.from);
          const target = CITIES.find(c => c.id === route.to);
          const plane = PLANE_TYPES.find(p => p.id === route.planeTypeId);
          
          if (!source || !target || !plane) return null;

          const stats = route.stats || { profitLastWeek: 0, revenue: 0, occupancy: 0 };
          
          return (
            <div 
              key={route.id} 
              className={`bg-slate-800 rounded border p-3 hover:bg-slate-750 transition-colors cursor-pointer ${
                onOpenRouteDetails ? 'hover:border-blue-500/50' : 'border-slate-700'
              }`}
              onClick={() => onOpenRouteDetails?.(route.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-sky-400 bg-sky-400/10 px-1.5 py-0.5 rounded">
                      {route.flightNumber}
                    </span>
                    <h4 className="font-bold text-white text-sm">
                      {source.name} ↔ {target.name}
                    </h4>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>{plane.name}</span>
                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                    <span>{route.distance} km</span>
                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                    <span>{route.frequency} flt/wk</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-mono text-sm font-bold ${
                    stats.profitLastWeek >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stats.profitLastWeek >= 0 ? '+' : ''}{formatMoney(stats.profitLastWeek)}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase">Last Week</div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-900/50 rounded p-2 text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400">Load Factor</span>
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          stats.occupancy > 0.8 ? 'bg-green-500' : 
                          stats.occupancy > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${stats.occupancy * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-slate-300">{Math.round(stats.occupancy * 100)}%</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1 items-end">
                   <span className="text-slate-400">Assigned</span>
                   <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                     <button 
                       className="w-5 h-5 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-slate-300"
                       onClick={(e) => {
                         e.stopPropagation();
                         handleQuickDecrease(route);
                       }}
                     >
                       -
                     </button>
                     <span className="font-mono text-white w-4 text-center">{route.assignedCount}</span>
                     <button 
                       className="w-5 h-5 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded text-slate-300"
                       onClick={(e) => {
                         e.stopPropagation();
                         handleQuickIncrease(route);
                       }}
                     >
                       +
                     </button>
                   </div>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between" onClick={e => e.stopPropagation()}>
                <label className="relative inline-flex items-center cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={route.autoManaged || false}
                    onChange={(e) => updateRoute(route.id, { autoManaged: e.target.checked })}
                  />
                  <div className="w-7 h-4 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600 group-hover:bg-slate-500"></div>
                  <span className="ml-2 text-[10px] text-slate-400 font-medium select-none">
                    {route.autoManaged ? <span className="text-indigo-300 flex items-center gap-1">🤖 AI Active</span> : 'AI Off'}
                  </span>
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
