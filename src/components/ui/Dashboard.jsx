import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  Play, Pause, FastForward, DollarSign, Calendar,
  Menu, Plane, Map as MapIcon, TrendingUp, Star, Trophy
} from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { formatMoney, formatDate } from '../../lib/utils';

export const Dashboard = ({ onOpenWindow }) => {
  const {
    date, company, paused, speed,
    setPaused, setSpeed
  } = useGameStore(useShallow(state => ({
    date: state.date,
    company: state.companies.find(c => c.id === state.playerCompanyId),
    paused: state.paused,
    speed: state.speed,
    setPaused: state.setPaused,
    setSpeed: state.setSpeed
  })));

  return (
    <>
      {/* Top Bar - Stats and Time Controls */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none flex justify-between items-start z-10">
        {/* Left Stats */}
        <div className="bg-slate-900/90 text-white p-3 rounded-lg shadow-xl pointer-events-auto border border-slate-700 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xl font-bold text-sky-400">
            <Plane className="w-6 h-6" />
            {company.name}
          </div>
          <div className="flex items-center gap-2 text-green-400 font-mono text-lg">
            <DollarSign size={18} />
            {formatMoney(company.money)}
          </div>
          <div className="flex items-center gap-2 text-slate-300 font-mono">
            <Calendar size={18} />
            {formatDate(date)}
          </div>
        </div>

        {/* Center Controls */}
        <div className="bg-slate-900/90 text-white p-2 rounded-full shadow-xl pointer-events-auto border border-slate-700 flex gap-2">
          <button
            className={`p-2 rounded-full hover:bg-slate-700 transition-colors ${paused ? 'bg-red-500/20 text-red-400' : ''}`}
            onClick={() => setPaused(!paused)}
          >
            {paused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
          </button>
          <div className="w-px bg-slate-700 mx-1"></div>
          <button
            className={`p-2 rounded-full hover:bg-slate-700 transition-colors ${speed === 1 && !paused ? 'bg-sky-500/20 text-sky-400' : ''}`}
            onClick={() => setSpeed(1)}
            title="Normal Speed"
          >
            <Play size={16} />
          </button>
          <button
            className={`p-2 rounded-full hover:bg-slate-700 transition-colors ${speed === 2 && !paused ? 'bg-sky-500/20 text-sky-400' : ''}`}
            onClick={() => setSpeed(2)}
            title="2x Speed"
          >
            <FastForward size={16} />
          </button>
          <button
            className={`p-2 rounded-full hover:bg-slate-700 transition-colors relative ${speed === 4 && !paused ? 'bg-sky-500/20 text-sky-400' : ''}`}
            onClick={() => setSpeed(4)}
            title="4x Speed"
          >
            <FastForward size={16} />
            <span className="text-[8px] font-bold absolute top-1 right-1 bg-sky-600 px-1 rounded">4x</span>
          </button>
        </div>
      </div>

      {/* Bottom Bar - Action Buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none flex justify-center items-end z-10">
        <div className="bg-slate-900/90 backdrop-blur-sm text-white px-3 py-2 rounded-full shadow-xl pointer-events-auto border border-slate-700 flex gap-1">
          <button
            className="px-4 py-2 hover:bg-slate-700 rounded-full flex items-center gap-2 transition-colors group"
            onClick={() => onOpenWindow('fleet')}
            title="Fleet Management"
          >
            <Plane size={20} className="group-hover:text-sky-400 transition-colors" />
            <span className="text-sm font-bold">Fleet</span>
          </button>
          <div className="w-px bg-slate-700 my-2"></div>
          <button
            className="px-4 py-2 hover:bg-slate-700 rounded-full flex items-center gap-2 transition-colors group"
            onClick={() => onOpenWindow('routes')}
            title="Route Network"
          >
            <MapIcon size={20} className="group-hover:text-emerald-400 transition-colors" />
            <span className="text-sm font-bold">Routes</span>
          </button>
          <div className="w-px bg-slate-700 my-2"></div>
          <button
            className="px-4 py-2 hover:bg-slate-700 rounded-full flex items-center gap-2 transition-colors group"
            onClick={() => onOpenWindow('finance')}
            title="Financial Report"
          >
            <TrendingUp size={20} className="group-hover:text-amber-400 transition-colors" />
            <span className="text-sm font-bold">Finance</span>
          </button>
          <div className="w-px bg-slate-700 my-2"></div>
          <button
            className="px-4 py-2 hover:bg-slate-700 rounded-full flex items-center gap-2 transition-colors group"
            onClick={() => onOpenWindow('company')}
            title="Company Management"
          >
            <Star size={20} className="group-hover:text-yellow-400 transition-colors" />
            <span className="text-sm font-bold">Company</span>
          </button>
          <div className="w-px bg-slate-700 my-2"></div>
          <button
            className="px-4 py-2 hover:bg-slate-700 rounded-full flex items-center gap-2 transition-colors group"
            onClick={() => onOpenWindow('rivals')}
            title="Global Rankings"
          >
            <Trophy size={20} className="group-hover:text-purple-400 transition-colors" />
            <span className="text-sm font-bold">Rivals</span>
          </button>
        </div>
      </div>
    </>
  );
};
