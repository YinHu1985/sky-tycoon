import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { PLANE_TYPES } from '../../data/planes';
import { useGameStore } from '../../store/useGameStore';
import { formatMoney } from '../../lib/utils';
import { Plane, Clock, Package } from 'lucide-react';

export const FleetManager = () => {
  const { company, date, tasks, debugUnlockAll, updateCompany, addTask, addNotification, buyPlane } = useGameStore(useShallow(state => {
      const playerCompany = state.companies.find(c => c.id === state.playerCompanyId);
      return {
          company: playerCompany,
          date: state.date,
          tasks: state.tasks,
          debugUnlockAll: state.debugUnlockAll,
          updateCompany: state.updateCompany,
          addTask: state.addTask,
          addNotification: state.addNotification,
          buyPlane: state.buyPlane
      };
  }));

  if (!company) return null;

  const { fleet, money } = company;
  const currentYear = date.getFullYear();

  const handleBuyPlane = (plane) => {
    if (money < plane.price) {
      addNotification('Insufficient Funds!', 'error');
      return;
    }

    // Call generic action instead of manual update
    buyPlane(plane.id, plane.price, { delayed: true });

    // Create delivery task (14 days)
    const deliveryDate = new Date(date);
    deliveryDate.setDate(deliveryDate.getDate() + 14);

    const task = {
      type: 'DELIVER_PLANE',
      name: `Delivery: ${plane.name}`,
      completeDate: deliveryDate.toISOString(),
      payload: { typeId: plane.id, count: 1 }
    };

    addTask(task);
    addNotification(`Ordered ${plane.name}. Delivery in 14 days.`, 'success');
  };

  const availablePlanes = PLANE_TYPES.filter(
    p => debugUnlockAll || (p.intro <= currentYear && p.end >= currentYear)
  );

  const pendingDeliveries = tasks.filter(t => t.type === 'DELIVER_PLANE');

  return (
    <div className="flex flex-col gap-6">
      {/* Pending Deliveries */}
      {pendingDeliveries.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 text-amber-400 flex items-center gap-2">
            <Clock size={20} />
            Pending Deliveries ({pendingDeliveries.length})
          </h3>
          <div className="space-y-2">
            {pendingDeliveries.map(task => {
              const deliveryDate = new Date(task.completeDate);
              const daysRemaining = Math.ceil((deliveryDate - date) / (1000 * 60 * 60 * 24));
              return (
                <div key={task.id} className="bg-amber-900/20 border border-amber-800 p-3 rounded flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Package className="text-amber-400" size={20} />
                    <div>
                      <div className="font-bold text-white">{task.name}</div>
                      <div className="text-xs text-slate-400">
                        Arrives: {deliveryDate.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-amber-400 font-bold">
                    {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Current Fleet */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-sky-400">Your Fleet</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(fleet).map(([typeId, count]) => {
            const type = PLANE_TYPES.find(t => t.id === typeId);
            if (!type || count === 0) return null;

            // Calculate idle aircraft
            const assigned = company.routes
              .filter(r => r.planeTypeId === typeId)
              .reduce((sum, r) => sum + r.assignedCount, 0);
            const idle = Math.max(0, count - assigned);

            return (
              <div key={typeId} className="bg-slate-700 rounded border border-slate-600 overflow-hidden">
                {type.image && (
                  <img
                    src={type.image}
                    alt={type.name}
                    loading="lazy"
                    className="w-full h-24 object-contain bg-slate-800"
                  />
                )}
                <div className="p-3">
                  <div className="font-bold text-lg">{type.name}</div>
                  <div className="text-xs text-slate-400 mb-1">Fuel: {formatMoney(type.fuelCost)}/km</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-mono text-green-400">{count}</span>
                    <span className="text-xs text-slate-400">owned</span>
                  </div>
                  {idle > 0 && (
                    <div className="text-xs text-amber-400 mt-1">
                      {idle} idle • {formatMoney(idle * type.idle)}/wk cost
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {Object.keys(fleet).length === 0 && (
            <div className="text-slate-400 italic col-span-3">No planes owned yet. Buy aircraft from the market below!</div>
          )}
        </div>
      </div>

      {/* Market */}
      <div>
        <h3 className="text-xl font-bold mb-4 text-sky-400 flex items-center gap-2">
          Aircraft Market ({currentYear})
          {debugUnlockAll && <span className="text-xs px-2 py-0.5 bg-purple-700 rounded">SANDBOX</span>}
        </h3>
        <div className="space-y-4">
          {availablePlanes.map(plane => (
            <div key={plane.id} className="bg-slate-700 rounded border border-slate-600 overflow-hidden hover:bg-slate-600 transition-colors">
              <div className="flex">
                {plane.image && (
                  <div className="bg-slate-800 w-48 flex items-center justify-center flex-shrink-0">
                    <img
                      src={plane.image}
                      alt={plane.name}
                      loading="lazy"
                      className="w-full h-auto object-contain p-2"
                    />
                  </div>
                )}
                <div className="flex-1 p-4 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-white">{plane.name}</span>
                      <span className="text-xs px-2 py-0.5 bg-slate-800 rounded text-slate-300">{plane.vendor}</span>
                    </div>
                    <div className="text-sm text-slate-300 mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                      <span>Range: {plane.range}km</span>
                      <span>Speed: {plane.speed}km/h</span>
                      <span>Seats: {plane.capacity}</span>
                      <span>Maint: {formatMoney(plane.maint)}/wk</span>
                      <span className="col-span-2 text-sky-300">Fuel: {formatMoney(plane.fuelCost)}/km</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-2 italic">{plane.desc}</div>
                  </div>

                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="text-xl font-mono text-green-400 font-bold">{formatMoney(plane.price)}</div>
                    <button
                      onClick={() => handleBuyPlane(plane)}
                      disabled={money < plane.price}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 rounded font-bold text-white transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
                    >
                      <Plane size={16} />
                      Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
