import React, { useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Plane } from 'lucide-react';
import { CITIES } from '../../data/cities';
import { useGameStore } from '../../store/useGameStore';

export const MainMenu: React.FC = () => {
  const [name, setName] = useState('Skyways International');
  const [code, setCode] = useState('SKW');
  const [hq, setHq] = useState('nyc');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { newGame, loadGame, hasSave, getSaveDate, importSave, addNotification } = useGameStore(useShallow(state => ({
    newGame: state.newGame,
    loadGame: state.loadGame,
    hasSave: state.hasSave,
    getSaveDate: state.getSaveDate,
    importSave: state.importSave,
    addNotification: state.addNotification
  })));

  const savedGame = hasSave();
  const savedDate = getSaveDate();

  const handleNewGame = () => {
    newGame(name, code, hq);
  };

  const handleLoadGame = () => {
    loadGame();
  };
  
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };
  
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const text = await file.text();
      const data = JSON.parse(text);
      const ok = importSave(data);
      if (!ok) {
        addNotification('Import failed', 'error');
      }
    } catch (err) {
      addNotification('Invalid save file', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-2xl px-4">
        {/* Title */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Plane className="w-16 h-16 text-sky-400" />
            <h1 className="text-7xl font-black text-white tracking-tight">
              SKY TYCOON
            </h1>
          </div>
          <p className="text-slate-300 text-lg">Build your airline empire from 1950 onwards</p>
        </div>

        {/* Main Menu Card */}
        <div className="bg-slate-800/90 backdrop-blur-sm p-8 rounded-2xl border border-slate-600 shadow-2xl w-full max-w-md space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Airline Name
              </label>
              <input
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={30}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  ICAO Code
                </label>
                <input
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white uppercase focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  maxLength={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Headquarters
                </label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  value={hq}
                  onChange={e => setHq(e.target.value)}
                >
                  {CITIES.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleNewGame}
              className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105"
            >
              Start New Airline
            </button>
            
            <div className="pt-4 border-t border-slate-700 space-y-3">
              <button
                onClick={handleImportClick}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-bold text-md shadow-lg transition-all"
              >
                Resume by Import JSON
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImportFile}
              />
            </div>

            {savedGame && (
              <div className="pt-4 border-t border-slate-700 space-y-3">
                <button
                  onClick={handleLoadGame}
                  className="w-full bg-emerald-700 hover:bg-emerald-600 text-white py-4 rounded-lg font-bold text-lg shadow-lg transition-all transform hover:scale-105"
                >
                  Resume Game
                </button>
                <div className="text-center text-xs text-slate-400">
                  Last played: {savedDate ? new Date(savedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Unknown'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-slate-500 text-sm text-center">
          <p>Manage routes, purchase aircraft, and dominate the skies</p>
        </div>
      </div>
    </div>
  );
};
