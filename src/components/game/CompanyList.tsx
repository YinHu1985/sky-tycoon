import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Eye, EyeOff } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { formatMoney } from '../../lib/utils';
import { Company } from '../../types';

export const CompanyList: React.FC = () => {
  const { companies, playerCompanyId, hiddenCompanyRoutes, toggleCompanyRoutes } = useGameStore(useShallow(state => ({
    companies: state.companies,
    playerCompanyId: state.playerCompanyId,
    hiddenCompanyRoutes: state.hiddenCompanyRoutes || [],
    toggleCompanyRoutes: state.toggleCompanyRoutes
  })));

  // Sort companies by Fame (descending) or Money
  const sortedCompanies = [...companies].sort((a, b) => (b.fame || 0) - (a.fame || 0));

  return (
    <div className="w-[900px] max-h-[60vh] overflow-hidden flex flex-col">
      <div className="overflow-y-auto flex-1">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700 text-sm uppercase tracking-wider sticky top-0 bg-slate-900/95 backdrop-blur z-10">
              <th className="p-3 w-16">Rank</th>
              <th className="p-3 w-64">Airline</th>
              <th className="p-3 text-right">Fame</th>
              <th className="p-3 text-right">Cash</th>
              <th className="p-3 text-right">Fleet</th>
              <th className="p-3 text-right">Routes</th>
              <th className="p-3 text-center w-16">Map</th>
              <th className="p-3 text-right">Weekly Profit</th>
            </tr>
          </thead>
          <tbody>
          {sortedCompanies.map((company: Company, index: number) => {
            const isPlayer = company.id === playerCompanyId;
            const fleetSize = Object.values(company.fleet).reduce((a, b) => a + b, 0);
            const weeklyProfit = company.stats?.netIncome || 0;
            const isHidden = hiddenCompanyRoutes.includes(company.id);

            return (
              <tr 
                key={company.id} 
                className={`border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${
                  isPlayer ? 'bg-sky-900/20' : ''
                }`}
              >
                <td className="p-3 font-bold text-slate-500">#{index + 1}</td>
                <td className="p-3">
                  <div className="flex flex-col">
                    <span className={`font-bold ${isPlayer ? 'text-sky-400' : 'text-white'}`}>
                      {company.name} {isPlayer && '(You)'}
                    </span>
                    <span className="text-xs text-slate-500">{company.code} • {company.hq.toUpperCase()}</span>
                  </div>
                </td>
                <td className="p-3 text-right font-mono text-yellow-400">{Math.floor(company.fame || 0)}</td>
                <td className="p-3 text-right font-mono text-green-400">{formatMoney(company.money)}</td>
                <td className="p-3 text-right font-mono text-slate-300">{fleetSize}</td>
                <td className="p-3 text-right font-mono text-slate-300">{company.routes.length}</td>
                <td className="p-3 text-center">
                  <button 
                    onClick={() => toggleCompanyRoutes && toggleCompanyRoutes(company.id)}
                    className={`p-1 rounded hover:bg-slate-700 transition-colors ${
                      isHidden ? 'text-slate-600' : isPlayer ? 'text-sky-400' : 'text-emerald-400'
                    }`}
                    title={isHidden ? "Show Routes on Map" : "Hide Routes on Map"}
                    disabled={!toggleCompanyRoutes}
                  >
                    {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </td>
                <td className={`p-3 text-right font-mono ${weeklyProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {weeklyProfit > 0 ? '+' : ''}{formatMoney(weeklyProfit)}
                </td>
              </tr>
            );
          })}
        </tbody>
        </table>
      </div>
    </div>
  );
};
