import React, { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../store/useGameStore';
import { formatMoney } from '../../lib/utils';
import { Star, Wrench, Plane, Megaphone } from 'lucide-react';

export const CompanyManagement: React.FC = () => {
  const { company, updateEfforts } = useGameStore(useShallow(state => {
    const playerCompany = state.companies.find(c => c.id === state.playerCompanyId);
    return {
      company: playerCompany,
      updateEfforts: state.updateEfforts
    };
  }));

  // Initialize with default values if company properties are undefined
  const [maintenanceEffort, setMaintenanceEffort] = useState(company?.maintenanceEffort || 50);
  const [serviceEffort, setServiceEffort] = useState(company?.serviceEffort || 50);
  const [prBudget, setPrBudget] = useState(company?.prBudget || 0);

  if (!company) return null;

  const handleSave = () => {
    if (updateEfforts) {
      updateEfforts(maintenanceEffort, serviceEffort, prBudget);
      useGameStore.getState().addNotification('Company settings updated', 'success');
    }
  };

  // Calculate preview values
  const maintCostMult = 0.5 + (maintenanceEffort / 100) * 1.3;
  const serviceCostMult = 0.7 + (serviceEffort / 100) * 0.8;
  const maintContrib = (maintenanceEffort - 50) * 0.04;
  const serviceContrib = (serviceEffort - 50) * 0.04;
  const prContrib = Math.min(10, prBudget / 100000);
  const fameChange = -0.5 + maintContrib + serviceContrib + prContrib;

  return (
    <div className="w-[500px] space-y-6">
      {/* Fame Display */}
      <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-4 rounded-lg border border-purple-600">
        <div className="flex items-center gap-2 mb-3">
          <Star className="text-yellow-400" size={24} />
          <h3 className="text-xl font-bold text-white">Company Fame</h3>
        </div>
        <div className="flex items-baseline gap-3">
          <div className="text-5xl font-bold text-yellow-400">{(company.fame || 0).toFixed(1)}</div>
          <div className="text-slate-400 text-sm">/100</div>
        </div>
        <div className="mt-2 h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-300"
            style={{ width: `${company.fame || 0}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Fame affects passenger demand and load factors on all routes.
        </p>
      </div>

      {/* Maintenance Effort */}
      <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
        <div className="flex items-center gap-2 mb-3">
          <Wrench className="text-blue-400" size={20} />
          <h4 className="font-bold text-white">Maintenance Effort</h4>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">Level: {maintenanceEffort}%</span>
          <span className="text-slate-300">Cost Multiplier: {maintCostMult.toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={maintenanceEffort}
          onChange={e => setMaintenanceEffort(parseInt(e.target.value))}
          className="w-full accent-blue-500"
        />
        <p className="text-xs text-slate-400 mt-2">
          Higher maintenance increases costs but improves fame and reduces accident risk.
        </p>
      </div>

      {/* Service Effort */}
      <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
        <div className="flex items-center gap-2 mb-3">
          <Plane className="text-green-400" size={20} />
          <h4 className="font-bold text-white">Service Quality</h4>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">Level: {serviceEffort}%</span>
          <span className="text-slate-300">Cost Multiplier: {serviceCostMult.toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={serviceEffort}
          onChange={e => setServiceEffort(parseInt(e.target.value))}
          className="w-full accent-green-500"
        />
        <p className="text-xs text-slate-400 mt-2">
          Higher service quality increases flight costs but improves fame and passenger satisfaction.
        </p>
      </div>

      {/* PR Budget */}
      <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
        <div className="flex items-center gap-2 mb-3">
          <Megaphone className="text-pink-400" size={20} />
          <h4 className="font-bold text-white">PR & Advertisement</h4>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">Weekly Budget</span>
          <span className="text-pink-400 font-mono font-bold">{formatMoney(prBudget)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="5000000"
          step="100000"
          value={prBudget}
          onChange={e => setPrBudget(parseInt(e.target.value))}
          className="w-full accent-pink-500"
        />
        <p className="text-xs text-slate-400 mt-2">
          PR spending directly increases fame. Every $100k/week = +1 fame (max +10).
        </p>
      </div>

      {/* Preview */}
      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <h4 className="font-bold text-white mb-2 text-sm">Impact Preview</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Fame Change (per week):</span>
            <span className={fameChange >= 0 ? 'text-green-400' : 'text-red-400'}>
              {fameChange >= 0 ? '+' : ''}{fameChange.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Weekly PR Cost:</span>
            <span className="text-red-400">{formatMoney(prBudget)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Maintenance Cost Mult:</span>
            <span className="text-blue-400">{maintCostMult.toFixed(2)}x</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Service Cost Mult:</span>
            <span className="text-green-400">{serviceCostMult.toFixed(2)}x</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors"
      >
        Apply Changes
      </button>
    </div>
  );
};
