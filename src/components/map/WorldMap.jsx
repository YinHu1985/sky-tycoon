import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { CITIES } from '../../data/cities';
import { MAP_IMAGE_URL } from '../../data/constants';
import { MAP_WIDTH, MAP_HEIGHT, geoToPixel, getGreatCircleSegments } from '../../lib/utils';
import { useGameStore } from '../../store/useGameStore';

export const WorldMap = ({ onCityClick, selectionMode }) => {
  const containerRef = useRef(null);

  // Calculate initial zoom to fit the world
  const getMinZoom = () => {
    if (!containerRef.current) return 0.5;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    return Math.max(viewportWidth / MAP_WIDTH, viewportHeight / MAP_HEIGHT);
  };

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [mapImage, setMapImage] = useState(null);

  const isDraggingMap = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });

  const { company } = useGameStore();

  useEffect(() => {
    const img = new Image();
    img.src = MAP_IMAGE_URL;
    img.onload = () => setMapImage(img);
  }, []);

  // Initialize zoom to fit screen
  useEffect(() => {
    const minZoom = getMinZoom();
    setZoom(Math.max(minZoom, 1));
  }, []);

  const handleMouseDown = (e) => {
    isDraggingMap.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingMap.current) return;

    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;

    setOffset(prev => {
      // Wrap horizontally (infinite scrolling)
      const mapWidthScaled = MAP_WIDTH * zoom;
      let newX = prev.x + dx;

      // Keep wrapping within bounds
      if (newX > mapWidthScaled) newX -= mapWidthScaled;
      if (newX < -mapWidthScaled) newX += mapWidthScaled;

      // Limit vertical scrolling
      const viewportHeight = window.innerHeight;
      const mapHeightScaled = MAP_HEIGHT * zoom;
      const maxY = 0;
      const minY = viewportHeight - mapHeightScaled;
      const newY = Math.max(minY, Math.min(maxY, prev.y + dy));

      return { x: newX, y: newY };
    });

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingMap.current = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const minZoom = getMinZoom();
    const maxZoom = 4;
    const delta = e.deltaY * -0.001;
    const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom + delta));
    setZoom(newZoom);
  };

  const handleZoomIn = () => {
    const maxZoom = 4;
    setZoom(prev => Math.min(maxZoom, prev * 1.2));
  };

  const handleZoomOut = () => {
    const minZoom = getMinZoom();
    setZoom(prev => Math.max(minZoom, prev / 1.2));
  };

  // Calculate route segments (each route may have multiple segments if crossing antimeridian)
  const activeRoutesData = useMemo(() => {
    return company.routes.map(route => {
      const source = CITIES.find(c => c.id === route.sourceId);
      const target = CITIES.find(c => c.id === route.targetId);
      if (!source || !target) return null;

      return {
        segments: getGreatCircleSegments(source, target, 100),
        profit: route.stats?.profitLastWeek || 0
      };
    }).filter(Boolean);
  }, [company.routes]);

  // Render multiple world instances for seamless wrapping
  const renderWorldInstance = (xOffset) => (
    <div
      key={xOffset}
      style={{
        position: 'absolute',
        left: xOffset,
        top: 0,
        width: MAP_WIDTH,
        height: MAP_HEIGHT
      }}
    >
      {/* Base Map */}
      {mapImage ? (
        <img
          src={mapImage.src}
          alt="World Map"
          className="w-full h-full object-cover select-none pointer-events-none opacity-60"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 opacity-60" />
      )}

      {/* Routes */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {activeRoutesData.map((routeData, routeIdx) => {
          const color = routeData.profit >= 0 ? '#10b981' : '#ef4444';
          return routeData.segments.map((segment, segmentIdx) => (
            <polyline
              key={`${routeIdx}-${segmentIdx}`}
              points={segment.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={color}
              strokeWidth={2 / zoom}
              strokeOpacity="0.7"
            />
          ));
        })}
      </svg>

      {/* Cities */}
      {CITIES.map(city => {
        const { x, y } = geoToPixel(city.lat, city.lon);
        const isHub = company.hq === city.id;
        const inSelectionMode = !!selectionMode;

        return (
          <div
            key={city.id}
            className={`absolute rounded-full cursor-pointer hover:scale-150 transition-all ${
              inSelectionMode
                ? 'bg-yellow-400 ring-4 ring-yellow-300 animate-pulse shadow-lg shadow-yellow-400/50'
                : isHub
                  ? 'bg-red-500 ring-2 ring-red-300'
                  : 'bg-cyan-400 hover:bg-cyan-300'
            }`}
            style={{
              left: x - 4,
              top: y - 4,
              width: inSelectionMode ? 10 : (isHub ? 8 : 6),
              height: inSelectionMode ? 10 : (isHub ? 8 : 6)
            }}
            onClick={(e) => {
              e.stopPropagation();
              onCityClick(city);
            }}
            title={inSelectionMode ? `Click to select ${city.name}` : city.name}
          />
        );
      })}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-[#0a0f1c]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: MAP_WIDTH * 3,
          height: MAP_HEIGHT,
          position: 'absolute'
        }}
      >
        {/* Render 3 instances for seamless wrapping */}
        {renderWorldInstance(0)}
        {renderWorldInstance(MAP_WIDTH)}
        {renderWorldInstance(-MAP_WIDTH)}
      </div>

      {/* Selection Mode Banner */}
      {selectionMode && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="bg-yellow-500 text-slate-900 px-8 py-4 rounded-lg shadow-2xl border-4 border-yellow-300 animate-pulse">
            <div className="text-2xl font-bold text-center">
              {selectionMode.type === 'route-source' ? 'Select Origin City' : 'Select Destination City'}
            </div>
            <div className="text-sm text-center mt-1">Click any city on the map</div>
          </div>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="absolute bottom-24 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="bg-slate-900/90 hover:bg-slate-800 text-white p-3 rounded-lg border border-slate-700 transition-colors shadow-lg"
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-slate-900/90 hover:bg-slate-800 text-white p-3 rounded-lg border border-slate-700 transition-colors shadow-lg"
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
      </div>
    </div>
  );
};
