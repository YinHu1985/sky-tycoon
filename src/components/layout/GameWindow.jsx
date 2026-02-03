import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export const GameWindow = ({ title, onClose, children, x, y, zIndex, onFocus }) => {
  const [pos, setPos] = useState({ x, y });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    onFocus?.();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPos({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      className="fixed bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden flex flex-col"
      style={{ left: pos.x, top: pos.y, zIndex, minWidth: '400px', maxWidth: '800px', maxHeight: '80vh' }}
      onMouseDown={onFocus}
    >
      <div 
        className="bg-slate-900 px-3 py-2 flex justify-between items-center cursor-move select-none border-b border-slate-700"
        onMouseDown={handleMouseDown}
      >
        <span className="font-bold text-slate-100 flex items-center gap-2">{title}</span>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={16} /></button>
      </div>
      <div className="p-4 overflow-y-auto text-slate-200 bg-slate-800/95 backdrop-blur-sm custom-scrollbar">
        {children}
      </div>
    </div>
  );
};
