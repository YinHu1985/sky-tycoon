import React, { useState, useEffect } from 'react';
import { useGameStore } from './store/useGameStore';
import { useGameLoop } from './hooks/useGameLoop';
import { MainMenu } from './components/ui/MainMenu';
import { WorldMap } from './components/map/WorldMap';
import { Dashboard } from './components/ui/Dashboard';
import { GameWindow } from './components/layout/GameWindow';
import { FleetManager } from './components/game/FleetManager';
import { RouteManager } from './components/game/RouteManager';
import { FinancialReport } from './components/game/FinancialReport';
import { CityDetails } from './components/game/CityDetails';
import { RouteDetails } from './components/game/RouteDetails';
import { CompanyManagement } from './components/game/CompanyManagement';
import { EventWindow } from './components/game/EventWindow';
import AudioManager from './components/audio/AudioManager';
import { Settings } from 'lucide-react';

function App() {
  useGameLoop(); // Start game loop

  const gameStarted = useGameStore(state => state.gameStarted);
  const notifications = useGameStore(state => state.notifications);
  const debugUnlockAll = useGameStore(state => state.debugUnlockAll);
  const setDebugUnlockAll = useGameStore(state => state.setDebugUnlockAll);
  const saveGame = useGameStore(state => state.saveGame);
  const triggerEvent = useGameStore(state => state.triggerEvent);
  const showNextEvent = useGameStore(state => state.showNextEvent);
  const addNotification = useGameStore(state => state.addNotification);
  const paused = useGameStore(state => state.paused);
  const setPaused = useGameStore(state => state.setPaused);

  const [openWindows, setOpenWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [mapSelectionMode, setMapSelectionMode] = useState(null); // { type: 'route', onSelect: (cityId) => void }
  const [debugEventId, setDebugEventId] = useState(''); // For debug event triggering

  useEffect(() => {
    // Prevent default space bar scrolling
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        setPaused(!paused);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paused, setPaused]);

  const handleOpenWindow = (id) => {
    if (!openWindows.includes(id)) {
      setOpenWindows([...openWindows, id]);
    }
    setActiveWindowId(id);
  };

  const handleCloseWindow = (id) => {
    setOpenWindows(openWindows.filter(w => w !== id));
    if (activeWindowId === id) setActiveWindowId(null);
    // Clear selections when closing windows
    if (id === 'city-details') setSelectedCity(null);
    if (id === 'route-details') setSelectedRouteId(null);
  };

  const handleOpenRouteDetails = (routeId) => {
    setSelectedRouteId(routeId);
    handleOpenWindow('route-details');
  };

  const handleCityClick = (city) => {
    // If in selection mode, handle selection callback
    if (mapSelectionMode) {
      mapSelectionMode.onSelect(city.id);
      setMapSelectionMode(null); // Exit selection mode after selection
      return;
    }

    // Otherwise, show city details
    setSelectedCity(city);
    handleOpenWindow('city-details');
  };

  if (!gameStarted) {
    return <MainMenu />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-200 select-none font-sans">
      <WorldMap onCityClick={handleCityClick} selectionMode={mapSelectionMode} />

      <Dashboard onOpenWindow={handleOpenWindow} />

      {/* Windows Layer */}
      {openWindows.map(id => {
        let title = '';
        let content = null;

        switch (id) {
          case 'fleet':
            title = 'Fleet Management & Aircraft Market';
            content = <FleetManager />;
            break;
          case 'routes':
            title = 'Route Network';
            content = <RouteManager onRequestCitySelection={setMapSelectionMode} onOpenRouteDetails={handleOpenRouteDetails} />;
            break;
          case 'finance':
            title = 'Financial Report';
            content = <FinancialReport />;
            break;
          case 'city-details':
            title = selectedCity ? selectedCity.name : 'City Details';
            content = selectedCity ? <CityDetails cityId={selectedCity.id} /> : null;
            break;
          case 'route-details':
            title = 'Route Details & Configuration';
            content = selectedRouteId ? <RouteDetails routeId={selectedRouteId} /> : null;
            break;
          case 'company':
            title = 'Company Management';
            content = <CompanyManagement />;
            break;
          case 'settings':
            title = 'Settings';
            content = (
              <div className="space-y-4 w-[450px]">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span>Manual Save</span>
                  <button
                    onClick={() => saveGame()}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1"
                  >
                    💾 Save Game
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sandbox Mode (Unlock All Planes)</span>
                  <button
                    onClick={() => setDebugUnlockAll(!debugUnlockAll)}
                    className={`w-12 h-6 rounded-full transition-colors ${debugUnlockAll ? 'bg-green-600' : 'bg-slate-600'} relative`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${debugUnlockAll ? 'translate-x-6' : ''}`} />
                  </button>
                </div>
                <p className="text-xs text-slate-500">Ignores introduction and retirement years for aircraft.</p>

                {/* Debug Event Trigger */}
                <div className="border-t border-slate-700 pt-4">
                  <p className="text-sm font-semibold mb-2 text-yellow-400">🛠️ Debug Tools</p>
                  <div className="space-y-2">
                    <label className="text-xs text-slate-400">Trigger Event by ID</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={debugEventId}
                        onChange={(e) => setDebugEventId(e.target.value)}
                        placeholder="e.g. welcome_1950"
                        className="flex-1 bg-slate-700 text-white px-3 py-1 rounded text-sm border border-slate-600 focus:border-blue-500 outline-none"
                      />
                      <button
                        onClick={() => {
                          if (debugEventId.trim()) {
                            triggerEvent(debugEventId.trim());
                            // Show the event immediately
                            setTimeout(() => showNextEvent(), 50);
                            addNotification(`Triggered event: ${debugEventId}`, 'info');
                            setDebugEventId('');
                          } else {
                            addNotification('Enter an event ID', 'error');
                          }
                        }}
                        className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-1 rounded text-xs font-bold"
                      >
                        🎲 Trigger
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Available: welcome_1950, oil_crisis_1973, excellent_ceo_hired
                    </p>
                  </div>
                </div>
              </div>
            );
            break;
          default:
            return null;
        }

        const zIndex = activeWindowId === id ? 50 : 40;

        return (
          <GameWindow
            key={id}
            title={title}
            onClose={() => handleCloseWindow(id)}
            x={100 + (openWindows.indexOf(id) * 30)}
            y={100 + (openWindows.indexOf(id) * 30)}
            zIndex={zIndex}
            onFocus={() => setActiveWindowId(id)}
          >
            {content}
          </GameWindow>
        );
      })}

      {/* Background Music */}
      <AudioManager />

      {/* Settings Button */}
      <button
        onClick={() => handleOpenWindow('settings')}
        className="fixed bottom-4 right-4 z-10 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white p-3 rounded-lg border border-slate-700 transition-colors"
        title="Settings"
      >
        <Settings size={20} />
      </button>

      {/* Notifications Toast */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-[100] pointer-events-none">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`bg-slate-800 text-white px-4 py-2 rounded shadow-lg border-l-4 pointer-events-auto animate-in slide-in-from-right-5 fade-in duration-300 ${
              n.type === 'success' ? 'border-green-500' :
              n.type === 'error' ? 'border-red-500' : 'border-blue-500'
            }`}
          >
            {n.msg}
          </div>
        ))}
      </div>

      {/* Event System */}
      <EventWindow />
    </div>
  );
}

export default App;
