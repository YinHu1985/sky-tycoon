import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../store/useGameStore';
import { formatMoney } from '../../lib/utils';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const StatRow = ({ label, value, type = 'neutral' }) => (
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

export const FinancialReport = () => {
  const { stats, money } = useGameStore(useShallow(state => ({
    stats: state.company.stats,
    money: state.company.money
  })));

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
          <StatRow label="Ticket Revenue" value={stats.totalRevenue} type="income" />
          <StatRow label="Property Income" value={stats.totalPropertyIncome || 0} type="income" />
          <StatRow label="Flight Operations" value={-stats.totalFlightCost} type="expense" />
          <StatRow label="Maintenance" value={-stats.totalMaintCost} type="expense" />
          <StatRow label="Idle Costs" value={-stats.totalIdleCost} type="expense" />
          <StatRow label="Property Maintenance" value={-(stats.totalPropertyCost || 0)} type="expense" />
          <StatRow label="PR & Advertising" value={-(stats.totalPrCost || 0)} type="expense" />

          <div className="mt-4 pt-4 border-t-2 border-slate-600 flex justify-between items-center">
            <span className="font-bold text-lg text-white">Net Income</span>
            <span className={`font-mono text-xl font-bold ${stats.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.netIncome > 0 ? '+' : ''}{formatMoney(stats.netIncome)}
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
