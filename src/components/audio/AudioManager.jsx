import { useEffect, useRef, useState } from 'react';

/**
 * AudioManager - Handles background music playback for Sky Tycoon
 * Uses Web Audio API to synthesize the Retro Aviation March
 */
export default function AudioManager() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3); // Default 30% volume
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const nextNoteTimeRef = useRef(0);
  const currentNoteRef = useRef(0);
  const schedulerIdRef = useRef(null);

  // Retro Aviation March melody (note, duration in seconds)
  const melody = [
    // Measure 1: Introduction (C-E-G-C pattern)
    { note: 60, duration: 0.4 }, // C4
    { note: 64, duration: 0.4 }, // E4
    { note: 67, duration: 0.4 }, // G4
    { note: 72, duration: 0.4 }, // C5

    // Measure 2: March rhythm
    { note: 67, duration: 0.4 }, // G4
    { note: 69, duration: 0.4 }, // A4
    { note: 67, duration: 0.4 }, // G4
    { note: 65, duration: 0.4 }, // F4

    // Measure 3: Upward climb
    { note: 64, duration: 0.8 }, // E4 (longer)
    { note: 67, duration: 0.4 }, // G4
    { note: 71, duration: 0.4 }, // B4

    // Measure 4: Triumphant resolution
    { note: 72, duration: 0.8 }, // C5 (hold)
    { note: 67, duration: 0.4 }, // G4
    { note: 64, duration: 0.4 }, // E4

    // Measure 5: Variation with rhythm
    { note: 60, duration: 0.2 }, // C4 (shorter)
    { note: 62, duration: 0.2 }, // D4
    { note: 64, duration: 0.4 }, // E4
    { note: 65, duration: 0.4 }, // F4
    { note: 67, duration: 0.4 }, // G4

    // Measure 6: Descending pattern
    { note: 71, duration: 0.4 }, // B4
    { note: 69, duration: 0.4 }, // A4
    { note: 67, duration: 0.4 }, // G4
    { note: 65, duration: 0.4 }, // F4

    // Measure 7: Build up
    { note: 64, duration: 0.4 }, // E4
    { note: 65, duration: 0.4 }, // F4
    { note: 67, duration: 0.4 }, // G4
    { note: 69, duration: 0.4 }, // A4

    // Measure 8: Grand finale
    { note: 72, duration: 1.2 }, // C5 (long hold)
    { note: 60, duration: 0.4 }, // C4 (bass note)
  ];

  // Convert MIDI note number to frequency
  const midiToFreq = (midi) => {
    return 220 * Math.pow(2, (midi - 69) / 12);
  };

  // Play a single note
  const playNote = (note, duration, time) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const gainNode = gainNodeRef.current;

    // Create oscillator for the note
    const osc = ctx.createOscillator();
    const noteGain = ctx.createGain();

    osc.connect(noteGain);
    noteGain.connect(gainNode);

    // Set frequency
    osc.frequency.value = midiToFreq(note);
    osc.type = 'triangle'; // Warm, retro sound

    // Envelope for smooth attack/release
    const now = time || ctx.currentTime;
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(0.3, now + 0.02); // Attack
    noteGain.gain.linearRampToValueAtTime(0.2, now + duration * 0.7); // Sustain
    noteGain.gain.linearRampToValueAtTime(0, now + duration); // Release

    osc.start(now);
    osc.stop(now + duration);
  };

  // Scheduler for accurate timing
  const scheduleNotes = () => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const scheduleAheadTime = 0.1; // Schedule 100ms ahead

    while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadTime) {
      const noteData = melody[currentNoteRef.current];
      playNote(noteData.note, noteData.duration, nextNoteTimeRef.current);

      // Advance to next note
      nextNoteTimeRef.current += noteData.duration;
      currentNoteRef.current++;

      // Loop back to start
      if (currentNoteRef.current >= melody.length) {
        currentNoteRef.current = 0;
      }
    }
  };

  // Start playing
  const startMusic = () => {
    if (!audioContextRef.current) {
      // Initialize Web Audio
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current.gain.value = volume;
    }

    // Resume context if suspended (browser autoplay policy)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    nextNoteTimeRef.current = audioContextRef.current.currentTime;
    currentNoteRef.current = 0;

    // Start scheduler
    schedulerIdRef.current = setInterval(scheduleNotes, 25); // Check every 25ms

    setIsPlaying(true);
  };

  // Stop playing
  const stopMusic = () => {
    if (schedulerIdRef.current) {
      clearInterval(schedulerIdRef.current);
      schedulerIdRef.current = null;
    }
    setIsPlaying(false);
  };

  // Toggle play/pause
  const toggleMusic = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  };

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMusic();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 text-white rounded-lg shadow-lg p-3 flex items-center gap-3 z-50">
      <button
        onClick={toggleMusic}
        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition"
        title={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? '⏸' : '▶'} Music
      </button>

      <div className="flex items-center gap-2">
        <span className="text-xs">🔊</span>
        <input
          type="range"
          min="0"
          max="100"
          value={volume * 100}
          onChange={(e) => setVolume(e.target.value / 100)}
          className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          title="Volume"
        />
      </div>

      <span className="text-xs text-gray-400">Retro Aviation March</span>
    </div>
  );
}
