import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { CITIES } from '../../data/cities';
import { MAP_IMAGE_URL } from '../../data/constants';
import { MAP_WIDTH, MAP_HEIGHT, geoToPixel, getGreatCircleSegments } from '../../lib/utils';
import { useGameStore } from '../../store/useGameStore';
import { City, Route } from '../../types';

interface WorldMapProps {
  onCityClick: (city: City) => void;
  selectionMode?: { type: string; onSelect: (cityId: string) => void } | null;
  selectedCityIds?: string[];
}

interface RouteSegment {
  segments: { x: number; y: number }[][];
  profit: number;
  isPlayer: boolean;
  companyId: string;
  aiColor: string;
}

export const WorldMap: React.FC<WorldMapProps> = ({ onCityClick, selectionMode, selectedCityIds = [] }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate initial zoom to fit the world
  const getMinZoom = () => {
    if (!containerRef.current) return 0.5;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    return Math.max(viewportWidth / MAP_WIDTH, viewportHeight / MAP_HEIGHT);
  };

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [mapImage, setMapImage] = useState<HTMLImageElement | null>(null);

  const isDraggingMap = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });

  const { companies, playerCompanyId, hiddenCompanyRoutes } = useGameStore(useShallow(state => ({
    companies: state.companies,
    playerCompanyId: state.playerCompanyId,
    hiddenCompanyRoutes: state.hiddenCompanyRoutes || []
  })));

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

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingMap.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const minZoom = getMinZoom();
      const maxZoom = 4;
      const delta = e.deltaY * -0.001;
      setZoom(prev => Math.max(minZoom, Math.min(maxZoom, prev + delta)));
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  const handleZoomIn = () => {
    const maxZoom = 4;
    setZoom(prev => Math.min(maxZoom, prev * 1.2));
  };

  const handleZoomOut = () => {
    const minZoom = getMinZoom();
    setZoom(prev => Math.max(minZoom, prev / 1.2));
  };

  // Calculate route segments for ALL companies
  const allRoutesData = useMemo(() => {
    // Distinct colors for AI companies (Cyan, Purple, Orange, Pink, Lime, Yellow)
    const AI_COLORS = ['#06b6d4', '#d946ef', '#f97316', '#ec4899', '#84cc16', '#eab308'];

    return companies.flatMap((company, idx) => {
      // Skip if company routes are hidden
      if (hiddenCompanyRoutes.includes(company.id)) return [];

      const isPlayer = company.id === playerCompanyId;
      const aiColor = AI_COLORS[idx % AI_COLORS.length];

      return company.routes.map(route => {
        const source = CITIES.find(c => c.id === route.from);
        const target = CITIES.find(c => c.id === route.to);
        if (!source || !target) return null;

        return {
          segments: getGreatCircleSegments(source, target, 100),
          profit: route.stats?.profitLastWeek || 0,
          isPlayer,
          companyId: company.id,
          aiColor
        };
      }).filter((item): item is RouteSegment => item !== null);
    });
  }, [companies, playerCompanyId, hiddenCompanyRoutes]);

  // Render multiple world instances for seamless wrapping
  const renderWorldInstance = (xOffset: number) => (
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
        {allRoutesData.map((routeData, routeIdx) => {
          // Color logic:
          // Player: Green (profit) or Red (loss)
          // AI: Distinct color per company
          let color = routeData.aiColor;
          let opacity = 0.6;
          let width = 1.5;

          if (routeData.isPlayer) {
            color = routeData.profit >= 0 ? '#10b981' : '#ef4444';
            opacity = 0.8;
            width = 2;
          }

          return routeData.segments.map((segment, segmentIdx) => (
            <polyline
              key={`${routeData.companyId}-${routeIdx}-${segmentIdx}`}
              points={segment.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={color}
              strokeWidth={width / zoom}
              strokeOpacity={opacity}
            />
          ));
        })}
      </svg>

      {/* Cities */}
      {CITIES.map(city => {
        const { x, y } = geoToPixel(city.lat, city.lon);
        // Check if this city is a HQ for ANY company
        const hqOwner = companies.find(c => c.hq === city.id);
        const isPlayerHq = hqOwner?.id === playerCompanyId;
        const isAiHq = hqOwner && !isPlayerHq;

        const inSelectionMode = !!selectionMode;
        const isSelected = selectedCityIds.includes(city.id);

        return (
          <div
            key={city.id}
            className={`absolute rounded-full cursor-pointer hover:scale-150 transition-all ${
              inSelectionMode
                ? 'bg-yellow-400 ring-4 ring-yellow-300 animate-pulse shadow-lg shadow-yellow-400/50'
                : isSelected
                  ? 'bg-white ring-4 ring-blue-500 shadow-lg shadow-blue-500/50 z-20 scale-125'
                  : isPlayerHq
                    ? 'bg-red-500 ring-2 ring-red-300 z-10'
                    : isAiHq
                      ? 'bg-purple-500 ring-1 ring-purple-300 z-10' // AI HQ
                      : 'bg-cyan-400 hover:bg-cyan-300'
            }`}
            style={{
              left: x - 4,
              top: y - 4,
              width: inSelectionMode ? 10 : (isSelected ? 10 : ((isPlayerHq || isAiHq) ? 8 : 6)),
              height: inSelectionMode ? 10 : (isSelected ? 10 : ((isPlayerHq || isAiHq) ? 8 : 6))
            }}
            onClick={(e) => {
              e.stopPropagation();
              onCityClick(city);
            }}
            title={
              inSelectionMode 
                ? `Click to select ${city.name}` 
                : hqOwner 
                  ? `${city.name} (${hqOwner.name} HQ)` 
                  : city.name
            }
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
      // onWheel handled by non-passive listener in useEffect
    >
      <div
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: MAP_WIDTH * 3,
          height: MAP_HEIGHT,
          position: 'absolute',
          willChange: 'transform'
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
