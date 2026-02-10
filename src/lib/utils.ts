import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { City } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MAP_WIDTH = 2000;
export const MAP_HEIGHT = 1000;
export const START_YEAR = 1950;

const distanceCache = new Map<string, number>();

export const calculateDistance = (c1: City, c2: City): number => {
  if (!c1 || !c2) return 0;
  const id1 = c1.id || `${c1.lat}:${c1.lon}`;
  const id2 = c2.id || `${c2.lat}:${c2.lon}`;
  const first = id1 < id2 ? id1 : id2;
  const second = id1 < id2 ? id2 : id1;
  const key = `${first}|${second}`;
  const cached = distanceCache.get(key);
  if (typeof cached === 'number') return cached;
  const R = 6371;
  const dLat = (c2.lat - c1.lat) * Math.PI / 180;
  const dLon = (c2.lon - c1.lon) * Math.PI / 180;
  const hav = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(c1.lat * Math.PI / 180) * Math.cos(c2.lat * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1-hav));
  const dist = Math.round(R * c);
  distanceCache.set(key, dist);
  return dist;
};

export const calculateFlightTime = (distance: number, speed: number): number => {
  if (!speed || speed <= 0) return 0;
  // Speed is likely km/h. Distance is km.
  // Return hours.
  return distance / speed;
};

export const geoToPixel = (lat: number, lon: number): { x: number, y: number } => {
  const x = (lon + 180) * (MAP_WIDTH / 360);
  const y = ((-1 * lat) + 90) * (MAP_HEIGHT / 180);
  return { x, y };
};

export const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

export const formatDate = (dateObj: Date | string | number): string => {
  return new Date(dateObj).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const generateId = (): string => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// --- GEODESIC MATH ---
const toRad = (d: number): number => d * Math.PI / 180;
const toDeg = (r: number): number => r * 180 / Math.PI;

export const getGreatCirclePoints = (c1: City, c2: City, numPoints = 100): { x: number, y: number }[] => {
  const lat1 = toRad(c1.lat);
  const lon1 = toRad(c1.lon);
  const lat2 = toRad(c2.lat);
  const lon2 = toRad(c2.lon);

  const d = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin((lat1 - lat2) / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon1 - lon2) / 2), 2)));

  const points: { x: number, y: number }[] = [];
  if (d === 0) return [{x:0, y:0}];

  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);

    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);

    const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
    const lon = Math.atan2(y, x);

    points.push(geoToPixel(toDeg(lat), toDeg(lon)));
  }
  return points;
};

/**
 * Split great circle route into segments to handle antimeridian crossing
 * Returns array of point arrays (segments) to avoid drawing horizontal lines across the map
 */
export const getGreatCircleSegments = (c1: City, c2: City, numPoints = 100): { x: number, y: number }[][] => {
  const points = getGreatCirclePoints(c1, c2, numPoints);
  const segments: { x: number, y: number }[][] = [];
  let currentSegment: { x: number, y: number }[] = [];

  for (let i = 0; i < points.length; i++) {
    const point = points[i];

    if (currentSegment.length === 0) {
      currentSegment.push(point);
    } else {
      const prevPoint = currentSegment[currentSegment.length - 1];
      const dx = Math.abs(point.x - prevPoint.x);

      // Detect antimeridian crossing (large horizontal jump)
      // If the jump is more than half the map width, we've wrapped around
      if (dx > MAP_WIDTH / 2) {
        // Determine which edge we're crossing
        // If prevPoint.x > point.x (e.g., 1900 > 100), we're wrapping RIGHT
        const wrappingRight = prevPoint.x > point.x;

        // Calculate where the line crosses the edge
        const ratio = wrappingRight ?
          (MAP_WIDTH - prevPoint.x) / ((point.x + MAP_WIDTH) - prevPoint.x) :
          prevPoint.x / (prevPoint.x + MAP_WIDTH - point.x);

        const edgeY = prevPoint.y + (point.y - prevPoint.y) * ratio;

        // End current segment at the appropriate edge
        const edgeX = wrappingRight ? MAP_WIDTH : 0;
        currentSegment.push({ x: edgeX, y: edgeY });
        segments.push([...currentSegment]);

        // Start new segment from the opposite edge
        const oppositeEdgeX = wrappingRight ? 0 : MAP_WIDTH;
        currentSegment = [{ x: oppositeEdgeX, y: edgeY }, point];
      } else {
        currentSegment.push(point);
      }
    }
  }

  // Add the last segment
  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }

  return segments;
};
