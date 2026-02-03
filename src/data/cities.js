export const CITIES = [
  // North America - USA
  { id: 'nyc', name: 'New York', lat: 40.71, lon: -74.00, biz: 95, tour: 80, country: 'USA' },
  { id: 'lax', name: 'Los Angeles', lat: 34.05, lon: -118.24, biz: 75, tour: 85, country: 'USA' },
  { id: 'chi', name: 'Chicago', lat: 41.88, lon: -87.62, biz: 85, tour: 65, country: 'USA' },
  { id: 'mia', name: 'Miami', lat: 25.76, lon: -80.19, biz: 70, tour: 90, country: 'USA' },
  { id: 'sfo', name: 'San Francisco', lat: 37.77, lon: -122.41, biz: 90, tour: 80, country: 'USA' },
  { id: 'sea', name: 'Seattle', lat: 47.60, lon: -122.33, biz: 80, tour: 70, country: 'USA' },
  { id: 'bos', name: 'Boston', lat: 42.36, lon: -71.05, biz: 85, tour: 75, country: 'USA' },
  { id: 'atl', name: 'Atlanta', lat: 33.74, lon: -84.38, biz: 80, tour: 60, country: 'USA' },
  { id: 'las', name: 'Las Vegas', lat: 36.17, lon: -115.13, biz: 60, tour: 95, country: 'USA' },
  { id: 'den', name: 'Denver', lat: 39.73, lon: -104.99, biz: 75, tour: 70, country: 'USA' },
  { id: 'iah', name: 'Houston', lat: 29.76, lon: -95.36, biz: 80, tour: 55, country: 'USA' },
  { id: 'phx', name: 'Phoenix', lat: 33.44, lon: -112.07, biz: 70, tour: 65, country: 'USA' },

  // North America - Canada & Mexico
  { id: 'yyz', name: 'Toronto', lat: 43.65, lon: -79.38, biz: 80, tour: 70, country: 'Canada' },
  { id: 'yvr', name: 'Vancouver', lat: 49.28, lon: -123.12, biz: 75, tour: 80, country: 'Canada' },
  { id: 'yul', name: 'Montreal', lat: 45.50, lon: -73.56, biz: 75, tour: 75, country: 'Canada' },
  { id: 'mex', name: 'Mexico City', lat: 19.43, lon: -99.13, biz: 70, tour: 80, country: 'Mexico' },
  { id: 'can', name: 'Cancun', lat: 21.16, lon: -86.85, biz: 40, tour: 95, country: 'Mexico' },

  // Europe - Western
  { id: 'lon', name: 'London', lat: 51.50, lon: -0.12, biz: 90, tour: 85, country: 'UK' },
  { id: 'par', name: 'Paris', lat: 48.85, lon: 2.35, biz: 80, tour: 95, country: 'France' },
  { id: 'fra', name: 'Frankfurt', lat: 50.11, lon: 8.68, biz: 85, tour: 60, country: 'Germany' },
  { id: 'ams', name: 'Amsterdam', lat: 52.37, lon: 4.89, biz: 80, tour: 85, country: 'Netherlands' },
  { id: 'mad', name: 'Madrid', lat: 40.41, lon: -3.70, biz: 75, tour: 85, country: 'Spain' },
  { id: 'bcn', name: 'Barcelona', lat: 41.38, lon: 2.17, biz: 70, tour: 90, country: 'Spain' },
  { id: 'rom', name: 'Rome', lat: 41.90, lon: 12.49, biz: 70, tour: 95, country: 'Italy' },
  { id: 'mil', name: 'Milan', lat: 45.46, lon: 9.18, biz: 80, tour: 75, country: 'Italy' },
  { id: 'muc', name: 'Munich', lat: 48.13, lon: 11.57, biz: 80, tour: 75, country: 'Germany' },
  { id: 'zur', name: 'Zurich', lat: 47.37, lon: 8.54, biz: 85, tour: 70, country: 'Switzerland' },
  { id: 'vie', name: 'Vienna', lat: 48.20, lon: 16.36, biz: 75, tour: 80, country: 'Austria' },
  { id: 'bru', name: 'Brussels', lat: 50.84, lon: 4.35, biz: 80, tour: 70, country: 'Belgium' },
  { id: 'cph', name: 'Copenhagen', lat: 55.67, lon: 12.56, biz: 75, tour: 75, country: 'Denmark' },
  { id: 'dub', name: 'Dublin', lat: 53.35, lon: -6.26, biz: 70, tour: 80, country: 'Ireland' },

  // Europe - Eastern & Northern
  { id: 'mos', name: 'Moscow', lat: 55.75, lon: 37.61, biz: 70, tour: 60, country: 'USSR' },
  { id: 'ist', name: 'Istanbul', lat: 41.00, lon: 28.97, biz: 75, tour: 85, country: 'Turkey' },
  { id: 'ath', name: 'Athens', lat: 37.98, lon: 23.72, biz: 60, tour: 90, country: 'Greece' },
  { id: 'prg', name: 'Prague', lat: 50.07, lon: 14.43, biz: 70, tour: 85, country: 'Czechoslovakia' },
  { id: 'war', name: 'Warsaw', lat: 52.22, lon: 21.01, biz: 65, tour: 70, country: 'Poland' },
  { id: 'sto', name: 'Stockholm', lat: 59.32, lon: 18.06, biz: 75, tour: 75, country: 'Sweden' },
  { id: 'hel', name: 'Helsinki', lat: 60.17, lon: 24.93, biz: 70, tour: 65, country: 'Finland' },

  // Asia - East
  { id: 'tok', name: 'Tokyo', lat: 35.67, lon: 139.65, biz: 88, tour: 70, country: 'Japan' },
  { id: 'pek', name: 'Beijing', lat: 39.90, lon: 116.40, biz: 80, tour: 80, country: 'China' },
  { id: 'sha', name: 'Shanghai', lat: 31.22, lon: 121.45, biz: 85, tour: 70, country: 'China' },
  { id: 'hkg', name: 'Hong Kong', lat: 22.31, lon: 114.16, biz: 92, tour: 75, country: 'Hong Kong' },
  { id: 'tpe', name: 'Taipei', lat: 25.03, lon: 121.56, biz: 80, tour: 65, country: 'Taiwan' },
  { id: 'sel', name: 'Seoul', lat: 37.56, lon: 126.97, biz: 85, tour: 70, country: 'South Korea' },
  { id: 'osa', name: 'Osaka', lat: 34.69, lon: 135.50, biz: 80, tour: 65, country: 'Japan' },

  // Asia - Southeast
  { id: 'sin', name: 'Singapore', lat: 1.35, lon: 103.81, biz: 85, tour: 70, country: 'Singapore' },
  { id: 'bkk', name: 'Bangkok', lat: 13.75, lon: 100.50, biz: 70, tour: 85, country: 'Thailand' },
  { id: 'mnl', name: 'Manila', lat: 14.59, lon: 120.98, biz: 65, tour: 70, country: 'Philippines' },
  { id: 'jkt', name: 'Jakarta', lat: -6.20, lon: 106.81, biz: 70, tour: 65, country: 'Indonesia' },
  { id: 'kul', name: 'Kuala Lumpur', lat: 3.13, lon: 101.68, biz: 75, tour: 75, country: 'Malaysia' },
  { id: 'sgn', name: 'Saigon', lat: 10.82, lon: 106.62, biz: 60, tour: 75, country: 'Vietnam' },

  // Asia - South
  { id: 'bom', name: 'Mumbai', lat: 19.07, lon: 72.87, biz: 65, tour: 60, country: 'India' },
  { id: 'del', name: 'Delhi', lat: 28.61, lon: 77.20, biz: 70, tour: 70, country: 'India' },
  { id: 'blr', name: 'Bangalore', lat: 12.97, lon: 77.59, biz: 75, tour: 55, country: 'India' },
  { id: 'khi', name: 'Karachi', lat: 24.86, lon: 67.01, biz: 55, tour: 50, country: 'Pakistan' },

  // Middle East
  { id: 'dxb', name: 'Dubai', lat: 25.20, lon: 55.27, biz: 80, tour: 85, country: 'UAE' },
  { id: 'doh', name: 'Doha', lat: 25.28, lon: 51.52, biz: 75, tour: 70, country: 'Qatar' },
  { id: 'tlv', name: 'Tel Aviv', lat: 32.08, lon: 34.78, biz: 75, tour: 75, country: 'Israel' },
  { id: 'bey', name: 'Beirut', lat: 33.88, lon: 35.49, biz: 60, tour: 70, country: 'Lebanon' },
  { id: 'teh', name: 'Tehran', lat: 35.68, lon: 51.41, biz: 65, tour: 55, country: 'Iran' },

  // Africa
  { id: 'cai', name: 'Cairo', lat: 30.04, lon: 31.23, biz: 55, tour: 85, country: 'Egypt' },
  { id: 'jnb', name: 'Johannesburg', lat: -26.20, lon: 28.04, biz: 60, tour: 50, country: 'South Africa' },
  { id: 'cpt', name: 'Cape Town', lat: -33.92, lon: 18.42, biz: 55, tour: 85, country: 'South Africa' },
  { id: 'lag', name: 'Lagos', lat: 6.45, lon: 3.39, biz: 60, tour: 45, country: 'Nigeria' },
  { id: 'nbo', name: 'Nairobi', lat: -1.28, lon: 36.81, biz: 55, tour: 70, country: 'Kenya' },
  { id: 'cas', name: 'Casablanca', lat: 33.57, lon: -7.58, biz: 60, tour: 75, country: 'Morocco' },
  { id: 'add', name: 'Addis Ababa', lat: 9.02, lon: 38.74, biz: 50, tour: 60, country: 'Ethiopia' },

  // South America
  { id: 'bue', name: 'Buenos Aires', lat: -34.60, lon: -58.38, biz: 60, tour: 75, country: 'Argentina' },
  { id: 'rio', name: 'Rio de Janeiro', lat: -22.90, lon: -43.17, biz: 50, tour: 90, country: 'Brazil' },
  { id: 'sao', name: 'Sao Paulo', lat: -23.55, lon: -46.63, biz: 75, tour: 65, country: 'Brazil' },
  { id: 'lim', name: 'Lima', lat: -12.04, lon: -77.04, biz: 55, tour: 75, country: 'Peru' },
  { id: 'bog', name: 'Bogota', lat: 4.71, lon: -74.07, biz: 60, tour: 65, country: 'Colombia' },
  { id: 'scl', name: 'Santiago', lat: -33.44, lon: -70.66, biz: 65, tour: 70, country: 'Chile' },
  { id: 'ccs', name: 'Caracas', lat: 10.48, lon: -66.90, biz: 55, tour: 60, country: 'Venezuela' },

  // Oceania
  { id: 'syd', name: 'Sydney', lat: -33.86, lon: 151.20, biz: 70, tour: 80, country: 'Australia' },
  { id: 'mel', name: 'Melbourne', lat: -37.81, lon: 144.96, biz: 75, tour: 75, country: 'Australia' },
  { id: 'akl', name: 'Auckland', lat: -36.84, lon: 174.76, biz: 65, tour: 80, country: 'New Zealand' },
  { id: 'per', name: 'Perth', lat: -31.95, lon: 115.85, biz: 65, tour: 70, country: 'Australia' },
  { id: 'bne', name: 'Brisbane', lat: -27.46, lon: 153.02, biz: 70, tour: 75, country: 'Australia' },
];
