export const PLANE_TYPES = [
  // DOUGLAS / MCDONNELL DOUGLAS
  { id: 'dc3', vendor: 'Douglas', name: 'DC-3', image: 'planes/dc3.jpg', speed: 300, range: 2400, capacity: 30, price: 100000, fuelCost: 5, maint: 500, idle: 100, intro: 1936, end: 1955, desc: 'The plane that changed the world.' },
  { id: 'dc6', vendor: 'Douglas', name: 'DC-6', image: 'planes/dc6.jpg', speed: 500, range: 4800, capacity: 60, price: 600000, fuelCost: 12, maint: 1200, idle: 300, intro: 1946, end: 1958, desc: 'Long range piston airliner.' },
  { id: 'dc8', vendor: 'Douglas', name: 'DC-8-30', image: 'planes/dc8.jpg', speed: 880, range: 7500, capacity: 160, price: 5500000, fuelCost: 50, maint: 4000, idle: 1000, intro: 1959, end: 1972, desc: 'Early jet age pioneer.' },
  { id: 'dc9', vendor: 'Douglas', name: 'DC-9-30', image: 'planes/dc9.jpg', speed: 800, range: 2800, capacity: 100, price: 4000000, fuelCost: 35, maint: 3000, idle: 800, intro: 1965, end: 1982, desc: 'Reliable short-haul workhorse.' },
  { id: 'dc10', vendor: 'McDonnell Douglas', name: 'DC-10-30', image: 'planes/dc10.jpg', speed: 900, range: 9600, capacity: 270, price: 22000000, fuelCost: 110, maint: 9000, idle: 2500, intro: 1971, end: 1989, desc: 'Heavy tri-jet for long haul.' },
  { id: 'md80', vendor: 'McDonnell Douglas', name: 'MD-80', image: 'planes/md80.jpg', speed: 810, range: 3500, capacity: 150, price: 25000000, fuelCost: 45, maint: 3500, idle: 900, intro: 1980, end: 1999, desc: 'Efficient twin-jet.' },

  // BOEING
  { id: 'b377', vendor: 'Boeing', name: '377 Stratocruiser', image: 'planes/b377.jpg', speed: 550, range: 6700, capacity: 80, price: 1500000, fuelCost: 20, maint: 2000, idle: 500, intro: 1949, end: 1960, desc: 'Double-decker luxury prop.' },
  { id: 'b707', vendor: 'Boeing', name: '707-320', image: 'planes/b707.jpg', speed: 900, range: 9000, capacity: 180, price: 7000000, fuelCost: 60, maint: 5000, idle: 1200, intro: 1958, end: 1979, desc: 'The jet that shrank the world.' },
  { id: 'b727', vendor: 'Boeing', name: '727-100', image: 'planes/b727.jpg', speed: 900, range: 4000, capacity: 120, price: 4500000, fuelCost: 45, maint: 3500, idle: 900, intro: 1963, end: 1984, desc: 'Tri-jet for shorter runways.' },
  { id: 'b737_200', vendor: 'Boeing', name: '737-200', image: 'planes/b737_200.jpg', speed: 800, range: 3500, capacity: 110, price: 5000000, fuelCost: 38, maint: 3000, idle: 800, intro: 1968, end: 1988, desc: 'The baby Boeing.' },
  { id: 'b747_100', vendor: 'Boeing', name: '747-100', image: 'planes/b747_100.jpg', speed: 920, range: 9800, capacity: 400, price: 24000000, fuelCost: 140, maint: 12000, idle: 4000, intro: 1970, end: 1986, desc: 'The Queen of the Skies.' },
  { id: 'b757', vendor: 'Boeing', name: '757-200', image: 'planes/b757.jpg', speed: 850, range: 7200, capacity: 200, price: 65000000, fuelCost: 65, maint: 5000, idle: 1500, intro: 1983, end: 2004, desc: 'Versatile narrow-body.' },
  { id: 'b767', vendor: 'Boeing', name: '767-300ER', image: 'planes/b767.jpg', speed: 850, range: 11000, capacity: 250, price: 80000000, fuelCost: 80, maint: 7000, idle: 2000, intro: 1986, end: 2040, desc: 'Atlantic crossing twin-jet.' },
  { id: 'b747_400', vendor: 'Boeing', name: '747-400', image: 'planes/b747_400.jpg', speed: 920, range: 13000, capacity: 450, price: 150000000, fuelCost: 130, maint: 11000, idle: 3500, intro: 1989, end: 2009, desc: 'Advanced Jumbo.' },
  { id: 'b777', vendor: 'Boeing', name: '777-200ER', image: 'planes/b777.jpg', speed: 900, range: 14000, capacity: 350, price: 180000000, fuelCost: 100, maint: 9000, idle: 3000, intro: 1995, end: 2040, desc: 'Largest twin-jet.' },
  { id: 'b737_800', vendor: 'Boeing', name: '737-800', image: 'planes/b737_800.jpg', speed: 850, range: 5500, capacity: 180, price: 80000000, fuelCost: 55, maint: 4000, idle: 1200, intro: 1998, end: 2040, desc: 'Modern short-haul standard.' },
  { id: 'b787', vendor: 'Boeing', name: '787-8', image: 'planes/b787.jpg', speed: 900, range: 14500, capacity: 250, price: 200000000, fuelCost: 70, maint: 6000, idle: 2000, intro: 2011, end: 2050, desc: 'Composite construction Dreamliner.' },

  // AIRBUS
  { id: 'a300', vendor: 'Airbus', name: 'A300B4', image: 'planes/a300.jpg', speed: 850, range: 6000, capacity: 250, price: 35000000, fuelCost: 90, maint: 7500, idle: 2000, intro: 1974, end: 2007, desc: 'First twin-engine widebody.' },
  { id: 'a310', vendor: 'Airbus', name: 'A310-300', image: 'planes/a310.jpg', speed: 850, range: 8000, capacity: 220, price: 45000000, fuelCost: 80, maint: 6500, idle: 1800, intro: 1983, end: 1998, desc: 'Long range capabilities.' },
  { id: 'a320', vendor: 'Airbus', name: 'A320-200', image: 'planes/a320.jpg', speed: 840, range: 5700, capacity: 160, price: 70000000, fuelCost: 50, maint: 4000, idle: 1100, intro: 1988, end: 2040, desc: 'Fly-by-wire pioneer.' },
  { id: 'a330', vendor: 'Airbus', name: 'A330-300', image: 'planes/a330.jpg', speed: 870, range: 10500, capacity: 300, price: 120000000, fuelCost: 90, maint: 8000, idle: 2500, intro: 1994, end: 2040, desc: 'Efficient medium-long haul.' },
  { id: 'a340', vendor: 'Airbus', name: 'A340-300', image: 'planes/a340.jpg', speed: 880, range: 13000, capacity: 280, price: 140000000, fuelCost: 110, maint: 9500, idle: 3000, intro: 1993, end: 2011, desc: 'Four engines for long range.' },
  { id: 'a380', vendor: 'Airbus', name: 'A380-800', image: 'planes/a380.jpg', speed: 900, range: 15000, capacity: 600, price: 400000000, fuelCost: 200, maint: 20000, idle: 8000, intro: 2007, end: 2021, desc: 'Superjumbo double-decker.' },
  { id: 'a350', vendor: 'Airbus', name: 'A350-900', image: 'planes/a350.jpg', speed: 900, range: 15000, capacity: 320, price: 300000000, fuelCost: 75, maint: 7000, idle: 2500, intro: 2014, end: 2050, desc: 'Advanced composite widebody.' },

  // LOCKHEED
  { id: 'connie', vendor: 'Lockheed', name: 'L-1049 Constellation', image: 'planes/connie.jpg', speed: 550, range: 6000, capacity: 80, price: 1200000, fuelCost: 15, maint: 1500, idle: 400, intro: 1951, end: 1967, desc: 'Iconic triple-tail design.' },
  { id: 'l1011', vendor: 'Lockheed', name: 'L-1011 Tristar', image: 'planes/l1011.jpg', speed: 890, range: 7400, capacity: 280, price: 30000000, fuelCost: 100, maint: 8500, idle: 2800, intro: 1972, end: 1984, desc: 'Technologically advanced tri-jet.' },

  // TUPOLEV (USSR)
  { id: 'tu104', vendor: 'Tupolev', name: 'Tu-104', image: 'planes/tu104.jpg', speed: 800, range: 3000, capacity: 50, price: 2000000, fuelCost: 40, maint: 3000, idle: 500, intro: 1956, end: 1960, desc: 'Early Soviet jet airliner.' },
  { id: 'tu154', vendor: 'Tupolev', name: 'Tu-154', image: 'planes/tu154.jpg', speed: 850, range: 4000, capacity: 160, price: 10000000, fuelCost: 70, maint: 6000, idle: 1500, intro: 1972, end: 2013, desc: 'Workhorse of the East.' },
  { id: 'tu144', vendor: 'Tupolev', name: 'Tu-144', image: 'planes/tu144.jpg', speed: 2000, range: 6000, capacity: 120, price: 50000000, fuelCost: 350, maint: 25000, idle: 10000, intro: 1975, end: 1978, desc: 'The Soviet Supersonic.' },

  // OTHERS
  { id: 'concorde', vendor: 'BAC/Aerospatiale', name: 'Concorde', image: 'planes/concorde.jpg', speed: 2150, range: 7200, capacity: 100, price: 150000000, fuelCost: 400, maint: 30000, idle: 12000, intro: 1976, end: 2003, desc: 'Supersonic travel.' },
  { id: 'emb110', vendor: 'Embraer', name: 'EMB 110', image: 'planes/emb110.jpg', speed: 450, range: 1800, capacity: 18, price: 1000000, fuelCost: 10, maint: 800, idle: 200, intro: 1973, end: 1990, desc: 'Brazilian turboprop utility.' },
  { id: 'erj145', vendor: 'Embraer', name: 'ERJ 145', image: 'planes/erj145.jpg', speed: 830, range: 2900, capacity: 50, price: 20000000, fuelCost: 30, maint: 2500, idle: 800, intro: 1996, end: 2020, desc: 'Regional jet success.' },
  { id: 'crj200', vendor: 'Bombardier', name: 'CRJ200', image: 'planes/crj200.jpg', speed: 800, range: 3000, capacity: 50, price: 22000000, fuelCost: 32, maint: 2600, idle: 850, intro: 1992, end: 2006, desc: 'Popular regional jet.' },
  { id: 'c919', vendor: 'COMAC', name: 'C919', image: 'planes/c919.jpg', speed: 850, range: 5500, capacity: 160, price: 90000000, fuelCost: 52, maint: 3800, idle: 1100, intro: 2022, end: 2050, desc: 'New narrowbody competitor.' },
];
