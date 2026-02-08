
import { CITIES } from './src/data/cities.js';
import { PLANE_TYPES } from './src/data/planes.js';
import { calculateDistance, calculateFrequency } from './src/lib/economy.js'; // Wait, calculateDistance is in utils
import { calculateDistance as calcDistUtils } from './src/lib/utils.js';

console.log('Checking CITIES...');
CITIES.forEach(c => {
    if (typeof c.lat !== 'number' || typeof c.lon !== 'number') {
        console.error('Invalid city:', c);
    }
});

console.log('Checking PLANE_TYPES...');
PLANE_TYPES.forEach(p => {
    if (!p.speed || !p.fuelCost || !p.maint) {
        console.error('Invalid plane:', p);
    }
});

console.log('Checking calculateDistance...');
try {
    const d = calcDistUtils(CITIES[0], CITIES[1]);
    console.log('Dist 0-1:', d);
    if (isNaN(d)) console.error('Dist is NaN');
} catch (e) {
    console.error('Dist failed:', e);
}

console.log('Done.');
