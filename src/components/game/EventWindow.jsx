import { useGameStore } from '../../store/useGameStore';
import { getEventById, applyEventEffects } from '../../lib/eventSystem';

/**
 * EventWindow - Displays events with options for player interaction
 * Appears as a modal overlay that pauses the game
 */
export function EventWindow() {
  const activeEvent = useGameStore(state => state.activeEvent);
  const dismissEvent = useGameStore(state => state.dismissEvent);
  const markEventAsFired = useGameStore(state => state.markEventAsFired);
  const removeScheduledEvent = useGameStore(state => state.removeScheduledEvent);

  // If no active event, don't render
  if (!activeEvent) return null;

  // Get event data
  const event = getEventById(activeEvent);
  if (!event) {
    console.error(`Event not found: ${activeEvent}`);
    dismissEvent();
    return null;
  }

  // Handle option selection
  const handleOptionSelect = (option) => {
    // Apply effects
    applyEventEffects(option, useGameStore);

    // Mark one-time events as fired
    if (event.oneTime) {
      markEventAsFired(event.id);
    }

    // Remove from scheduled events
    removeScheduledEvent(event.id);

    // Dismiss the event
    dismissEvent();

    // Check if there are more pending events to show
    setTimeout(() => {
      const { pendingEvents, showNextEvent } = useGameStore.getState();
      if (pendingEvents.length > 0) {
        showNextEvent();
      }
    }, 100);
  };

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center animate-in fade-in duration-200">
        {/* Event Card */}
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl shadow-2xl border-2 border-yellow-500/50 max-w-2xl w-full mx-4 animate-in zoom-in-95 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-600 to-amber-600 px-6 py-4 rounded-t-xl border-b-2 border-yellow-500">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-3xl">📰</span>
              {event.title}
            </h2>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Description */}
            <div className="bg-slate-950/50 rounded-lg p-4 mb-6 border border-slate-700">
              <p className="text-slate-200 whitespace-pre-line leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <p className="text-sm text-slate-400 font-semibold mb-3">Choose your response:</p>
              {event.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600
                           text-white px-5 py-4 rounded-lg font-medium transition-all duration-200
                           border border-blue-500/50 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20
                           text-left group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl group-hover:scale-110 transition-transform">➤</span>
                    <div className="flex-1">
                      <div className="font-bold text-lg mb-1">{option.label}</div>
                      {option.description && (
                        <div className="text-sm text-blue-100/80">{option.description}</div>
                      )}
                      {/* Show effects preview */}
                      {option.effects && option.effects.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {option.effects.map((effect, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-blue-800/50 px-2 py-1 rounded border border-blue-500/30"
                            >
                              {effect.type === 'money' && (
                                <>
                                  {effect.amount > 0 ? '💰 +' : '💸 '}
                                  ${Math.abs(effect.amount).toLocaleString()}
                                </>
                              )}
                              {effect.type === 'addModifier' && (
                                <>🎯 {effect.modifier?.description || 'Add modifier'}</>
                              )}
                              {effect.type === 'removeModifier' && (
                                <>❌ Remove modifier</>
                              )}
                              {effect.type === 'triggerEvent' && (
                                <>🎲 Trigger event</>
                              )}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <div className="px-6 py-3 bg-slate-900/50 rounded-b-xl border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center">
              Game is paused. Select an option to continue.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
