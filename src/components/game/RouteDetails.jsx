import React, { useState, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../store/useGameStore';
import { CITIES } from '../../data/cities';
import { PLANE_TYPES } from '../../data/planes';
import { calculateDistance, formatMoney } from '../../lib/utils';
import { calculateFrequency } from '../../lib/economy';
import { Save, X, TrendingUp, TrendingDown, Plane, MapPin } from 'lucide-react';

export const RouteDetails = ({ routeId }) => {
  const { routes, fleet, updateRoute } = useGameStore(useShallow(state => ({
    routes: state.company.routes,
    fleet: state.company.fleet,
    updateRoute: state.updateRoute
  })));

  const route = routes.find(r => r.id === routeId);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAssignedCount, setEditedAssignedCount] = useState(route?.assignedCount || 1);
  const [editedPriceModifier, setEditedPriceModifier] = useState(route?.priceModifier || 0);

  if (!route) return <div className="text-slate-400">Route not found</div>;

  const source = CITIES.find(c => c.id === route.sourceId);
  const target = CITIES.find(c => c.id === route.targetId);
  const plane = PLANE_TYPES.find(p => p.id === route.planeTypeId);

  if (!source || !target || !plane) return <div className="text-slate-400">Invalid route data</div>;

  const stats = route.stats || {};
  const profit = stats.profitLastWeek || 0;
  const loadFactor = stats.occupancy || 0;
  const dist = calculateDistance(source, target);

  // Calculate available aircraft for editing
  const owned = fleet[route.planeTypeId] || 0;
  const assignedElsewhere = routes
    .filter(r => r.id !== routeId && r.planeTypeId === route.planeTypeId)
    .reduce((sum, r) => sum + r.assignedCount, 0);
  const available = owned - assignedElsewhere;

  const editedFrequency = useMemo(() => {
    return calculateFrequency(route.planeTypeId, dist, editedAssignedCount);
  }, [route.planeTypeId, dist, editedAssignedCount]);

  const handleSave = () => {
    updateRoute(routeId, {
      assignedCount: editedAssignedCount,
      frequency: editedFrequency,
      priceModifier: editedPriceModifier
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedAssignedCount(route.assignedCount);
    setEditedPriceModifier(route.priceModifier);
    setIsEditing(false);
  };

  return (
    <div className="w-[450px] flex flex-col gap-4">
      {/* Route Header */}
      <div className="bg-slate-700 p-4 rounded border border-slate-600">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs px-2 py-1 bg-slate-900 rounded font-mono text-slate-300">
            {route.flightNumber}
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded font-bold"
            >
              Edit Route
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 text-xl font-bold text-white mb-3">
          <span>{source.name}</span>
          <span className="text-slate-500">↔</span>
          <span>{target.name}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-800 p-2 rounded">
            <div className="text-slate-400 text-xs">Distance</div>
            <div className="text-white font-mono">{dist} km</div>
          </div>
          <div className="bg-slate-800 p-2 rounded">
            <div className="text-slate-400 text-xs">Aircraft</div>
            <div className="text-white">{plane.name}</div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing ? (
        <div className="bg-slate-700 p-4 rounded border border-blue-500 space-y-4">
          <h4 className="font-bold text-white flex items-center gap-2">
            <Plane size={16} /> Edit Route Parameters
          </h4>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Assigned Aircraft</span>
              <span className="text-white font-bold">{editedAssignedCount} / {available}</span>
            </div>
            <input
              type="range"
              min="1"
              max={Math.max(1, available)}
              value={editedAssignedCount}
              onChange={e => setEditedAssignedCount(parseInt(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">Price Strategy</span>
              <span className={editedPriceModifier > 0 ? 'text-green-400' : editedPriceModifier < 0 ? 'text-amber-400' : 'text-white'}>
                {editedPriceModifier > 0 ? '+' : ''}{editedPriceModifier}%
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="5"
              value={editedPriceModifier}
              onChange={e => setEditedPriceModifier(parseInt(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="text-xs text-slate-300 bg-slate-800 p-2 rounded">
            <span>Est. Frequency: </span>
            <span className="font-bold">{editedFrequency} round trips/week</span>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-slate-300 hover:text-white flex items-center gap-1"
            >
              <X size={16} /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-bold flex items-center gap-1"
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Current Configuration */}
          <div className="bg-slate-700 p-4 rounded border border-slate-600">
            <h4 className="font-bold text-white mb-3">Current Configuration</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Aircraft:</span>
                <span className="text-white font-bold">{route.assignedCount}x {plane.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Weekly Frequency:</span>
                <span className="text-white font-bold">{route.frequency} round trips</span>
              </div>
              {route.priceModifier !== 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Price Strategy:</span>
                  <span className={route.priceModifier > 0 ? 'text-green-400' : 'text-amber-400'}>
                    {route.priceModifier > 0 ? '+' : ''}{route.priceModifier}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Performance Statistics */}
          <div className="bg-slate-700 p-4 rounded border border-slate-600">
            <h4 className="font-bold text-white mb-3">Performance (Last Week)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800 p-3 rounded">
                <div className="text-slate-400 text-xs uppercase mb-1">Load Factor</div>
                <div className={`text-2xl font-bold ${loadFactor > 0.8 ? 'text-green-400' : loadFactor > 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {(loadFactor * 100).toFixed(0)}%
                </div>
              </div>
              <div className="bg-slate-800 p-3 rounded">
                <div className="text-slate-400 text-xs uppercase mb-1">Passengers</div>
                <div className="text-2xl font-bold text-sky-400">
                  {stats.passengers || 0}
                </div>
              </div>
              <div className="bg-slate-800 p-3 rounded">
                <div className="text-slate-400 text-xs uppercase mb-1">Revenue</div>
                <div className="text-emerald-400 font-mono text-lg">
                  {formatMoney(stats.revenue || 0)}
                </div>
              </div>
              <div className="bg-slate-800 p-3 rounded">
                <div className="text-slate-400 text-xs uppercase mb-1">Profit</div>
                <div className={`font-mono text-lg font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'} flex items-center gap-1`}>
                  {profit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {formatMoney(profit)}
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-slate-700 p-4 rounded border border-slate-600">
            <h4 className="font-bold text-white mb-3">Cost Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Flight Operations:</span>
                <span className="text-red-400 font-mono">{formatMoney(stats.flightCost || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Maintenance:</span>
                <span className="text-red-400 font-mono">{formatMoney(stats.maintCost || 0)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-600">
                <span className="text-white font-bold">Total Cost:</span>
                <span className="text-red-400 font-mono font-bold">
                  {formatMoney((stats.flightCost || 0) + (stats.maintCost || 0))}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
