import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../store/useGameStore';
import { formatMoney } from '../../lib/utils';
import { DollarSign } from 'lucide-react';
import { CompanyStats } from '../../types';

interface StatRowProps {
  label: string;
  value: number;
  type?: 'income' | 'expense' | 'neutral';
}

const StatRow: React.FC<StatRowProps> = ({ label, value, type = 'neutral' }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-700 last:border-0">
    <span className="text-slate-300">{label}</span>
    <span className={`font-mono font-bold ${
      type === 'income' ? 'text-green-400' : 
      type === 'expense' ? 'text-red-400' : 'text-white'
    }`}>
      {formatMoney(value)}
    </span>
  </div>
);

export const FinancialReport: React.FC = () => {
  const { stats, money } = useGameStore(useShallow(state => {
    const playerCompany = state.companies.find(c => c.id === state.playerCompanyId);
    return {
      stats: playerCompany?.stats || {} as Partial<CompanyStats>,
      money: playerCompany?.money || 0
    };
  }));

  // Helper to safely get number from potentially partial stats
  const getStat = (val: number | undefined) => val || 0;

  return (
    <div className="flex flex-col gap-6 w-[400px]">
      {/* Overview */}
      <div className="bg-slate-700 p-4 rounded border border-slate-600">
        <h3 className="text-lg font-bold text-sky-400 mb-4 flex items-center gap-2">
          <DollarSign size={20} /> Current Balance
        </h3>
        <div className="text-3xl font-mono text-white font-bold mb-2">
          {formatMoney(money)}
        </div>
        <div className="text-xs text-slate-400">
          Available funds for purchasing aircraft and routes.
        </div>
      </div>

      {/* Weekly Report */}
      <div className="bg-slate-700 p-4 rounded border border-slate-600">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          Weekly Financials
        </h3>
        
        <div className="space-y-1">
          <StatRow label="Ticket Revenue" value={getStat(stats.totalRevenue)} type="income" />
          <StatRow label="Property Income" value={getStat(stats.totalPropertyIncome)} type="income" />
          <StatRow label="Flight Operations" value={-getStat(stats.totalFlightCost)} type="expense" />
          <StatRow label="Maintenance" value={-getStat(stats.totalMaintCost)} type="expense" />
          <StatRow label="Idle Costs" value={-getStat(stats.totalIdleCost)} type="expense" />
          <StatRow label="Property Maintenance" value={-getStat(stats.totalPropertyCost)} type="expense" />
          <StatRow label="PR & Advertising" value={-getStat(stats.totalPrCost)} type="expense" />

          <div className="mt-4 pt-4 border-t-2 border-slate-600 flex justify-between items-center">
            <span className="font-bold text-lg text-white">Net Income</span>
            <span className={`font-mono text-xl font-bold ${getStat(stats.netIncome) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {getStat(stats.netIncome) > 0 ? '+' : ''}{formatMoney(getStat(stats.netIncome))}
            </span>
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-500 text-center italic">
        Financials are processed every Monday.
      </div>
    </div>
  );
};
