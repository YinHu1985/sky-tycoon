#!/usr/bin/env node

/**
 * Downloads images from Wikimedia Commons for planes and cities
 * Usage: node scripts/download-images.mjs [--planes] [--cities] [--all]
 */

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { execSync } from 'child_process';
import { HttpsProxyAgent } from 'https-proxy-agent';
const agent = new HttpsProxyAgent('http://127.0.0.1:7890');

// Plane search terms - maps plane ID to Wikimedia search query
const PLANE_SEARCHES = {
  dc3: 'Douglas DC-3',
  dc6: 'Douglas DC-6',
  dc8: 'DC-8 aircraft',
  dc9: 'DC-9 aircraft',
  dc10: 'McDonnell Douglas DC-10',
  md80: 'McDonnell Douglas MD-80',
  b377: 'Boeing 377 Stratocruiser',
  b707: 'Boeing 707',
  b727: 'Boeing 727',
  b737_200: 'Boeing 737-200',
  b747_100: 'Boeing 747-100',
  b757: 'Boeing 757',
  b767: 'Boeing 767',
  b747_400: 'Boeing 747-400',
  b777: 'Boeing 777',
  b737_800: 'Boeing 737-800',
  b787: 'Boeing 787 Dreamliner',
  a300: 'Airbus A300',
  a310: 'Airbus A310',
  a320: 'Airbus A320',
  a330: 'Airbus A330',
  a340: 'Airbus A340',
  a380: 'Airbus A380',
  a350: 'Airbus A350',
  connie: 'Lockheed Constellation',
  l1011: 'Lockheed L-1011 TriStar',
  tu104: 'Tupolev Tu-104',
  tu154: 'Tupolev Tu-154',
  tu144: 'Tupolev Tu-144',
  concorde: 'Concorde aircraft',
  emb110: 'Embraer EMB 110 Bandeirante',
  erj145: 'Embraer ERJ 145',
  crj200: 'Bombardier CRJ200',
  c919: 'COMAC C919',
};

// City search terms
const CITY_SEARCHES = {
  nyc: 'New York City skyline',
  lax: 'Los Angeles skyline',
  chi: 'Chicago skyline',
  mia: 'Miami skyline',
  sfo: 'San Francisco skyline',
  sea: 'Seattle skyline',
  bos: 'Boston skyline',
  atl: 'Atlanta skyline',
  las: 'Las Vegas strip',
  den: 'Denver skyline',
  iah: 'Houston Texas skyline',
  phx: 'Phoenix Arizona skyline',
  yyz: 'Toronto skyline',
  yvr: 'Vancouver skyline',
  yul: 'Montreal skyline',
  mex: 'Mexico City skyline',
  can: 'Cancun beach',
  lon: 'London skyline',
  par: 'Paris Eiffel Tower',
  fra: 'Frankfurt skyline',
  ams: 'Amsterdam canal',
  mad: 'Madrid skyline',
  bcn: 'Barcelona skyline',
  rom: 'Rome Colosseum',
  mil: 'Milan Duomo',
  muc: 'Munich skyline',
  zur: 'Zurich skyline',
  vie: 'Vienna skyline',
  bru: 'Brussels Grand Place',
  cph: 'Copenhagen Nyhavn',
  dub: 'Dublin city',
  mos: 'Moscow Red Square',
  ist: 'Istanbul Blue Mosque',
  ath: 'Athens Acropolis',
  prg: 'Prague skyline',
  war: 'Warsaw skyline',
  sto: 'Stockholm skyline',
  hel: 'Helsinki skyline',
  tok: 'Tokyo skyline',
  pek: 'Beijing Forbidden City',
  sha: 'Shanghai Pudong skyline',
  hkg: 'Hong Kong skyline',
  tpe: 'Taipei 101',
  sel: 'Seoul skyline',
  osa: 'Osaka skyline',
  sin: 'Singapore Marina Bay',
  bkk: 'Bangkok temples',
  mnl: 'Manila skyline',
  jkt: 'Jakarta skyline',
  kul: 'Kuala Lumpur Petronas Towers',
  sgn: 'Ho Chi Minh City skyline',
  bom: 'Mumbai skyline',
  del: 'Delhi India Gate',
  blr: 'Bangalore skyline',
  khi: 'Karachi skyline',
  dxb: 'Dubai Burj Khalifa',
  doh: 'Doha skyline',
  tlv: 'Tel Aviv skyline',
  bey: 'Beirut skyline',
  teh: 'Tehran skyline',
  cai: 'Cairo pyramids',
  jnb: 'Johannesburg skyline',
  cpt: 'Cape Town Table Mountain',
  lag: 'Lagos Nigeria skyline',
  nbo: 'Nairobi skyline',
  cas: 'Casablanca Morocco',
  add: 'Addis Ababa skyline',
  bue: 'Buenos Aires skyline',
  rio: 'Rio de Janeiro Christ Redeemer',
  sao: 'Sao Paulo skyline',
  lim: 'Lima Peru skyline',
  bog: 'Bogota Colombia skyline',
  scl: 'Santiago Chile skyline',
  ccs: 'Caracas skyline',
  syd: 'Sydney Opera House',
  mel: 'Melbourne skyline',
  akl: 'Auckland skyline',
  per: 'Perth Australia skyline',
  bne: 'Brisbane skyline',
};

async function searchWikimediaCommons(query) {
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=5&format=json`;

  try {
    const response = await fetch(searchUrl, {agent});
 
    const data = await response.json();

    if (data.query?.search?.length > 0) {
      // Get the first image result
      const title = data.query.search[0].title;
      return await getImageUrl(title);
    }
  } catch (error) {
    console.error(`  Search error for "${query}":`, error.message);
  }
  return null;
}

async function getImageUrl(title) {
  const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json`;
// Rate limit - be nice to Wikimedia
    await new Promise(r => setTimeout(r, 3000));
  try {
    const response = await fetch(infoUrl, {agent});
    const data = await response.json();
    const pages = data.query?.pages;

    if (pages) {
      const page = Object.values(pages)[0];
      if (page.imageinfo?.[0]) {
        // Prefer the thumbnail URL (800px wide) for reasonable file size
        return page.imageinfo[0].thumburl || page.imageinfo[0].url;
      }
    }
  } catch (error) {
    console.error(`  Info error for "${title}":`, error.message);
  }
  return null;
}

async function downloadImage(url, outputPath) {
  try {
    // Rate limit - be nice to Wikimedia
    await new Promise(r => setTimeout(r, 3000));
    const response = await fetch(url, {agent});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    return true;
  } catch (error) {
    console.error(`  Download error:`, error.message);
    return false;
  }
}

function resizeImage(inputPath, outputPath, width, height) {
  try {
    execSync(`magick "${inputPath}" -resize ${width}x${height}^ -gravity center -extent ${width}x${height} -quality 85 "${outputPath}"`, {
      stdio: 'pipe'
    });
    return true;
  } catch (error) {
    console.error(`  Resize error:`, error.message);
    return false;
  }
}

async function downloadPlanes() {
  console.log('\n=== Downloading Plane Images ===\n');

  const outputDir = path.join(process.cwd(), 'public', 'planes');
  const tempDir = path.join(process.cwd(), 'temp_planes');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(tempDir, { recursive: true });

  let success = 0;
  let failed = 0;

  for (const [id, query] of Object.entries(PLANE_SEARCHES)) {
    const outputPath = path.join(outputDir, `${id}.jpg`);

    // Skip if already exists
    if (fs.existsSync(outputPath)) {
      console.log(`[SKIP] ${id} - already exists`);
      success++;
      continue;
    }

    console.log(`[SEARCH] ${id}: "${query}"`);

    const imageUrl = await searchWikimediaCommons(query);
    if (!imageUrl) {
      console.log(`  [FAIL] No image found`);
      failed++;
      continue;
    }

    console.log(`  [DOWNLOAD] ${imageUrl.substring(0, 60)}...`);

    const tempPath = path.join(tempDir, `${id}_temp.jpg`);
    const downloaded = await downloadImage(imageUrl, tempPath);

    if (!downloaded) {
      failed++;
      continue;
    }

    console.log(`  [RESIZE] 400x250`);
    const resized = resizeImage(tempPath, outputPath, 400, 250);

    if (resized) {
      console.log(`  [OK] ${id}.jpg`);
      success++;
      fs.unlinkSync(tempPath);
    } else {
      failed++;
    }

    // Rate limit - be nice to Wikimedia
    await new Promise(r => setTimeout(r, 5000));
  }

  // Cleanup temp dir
  try { fs.rmdirSync(tempDir); } catch {}

  console.log(`\nPlanes: ${success} success, ${failed} failed`);
}

async function downloadCities() {
  console.log('\n=== Downloading City Images ===\n');

  const outputDir = path.join(process.cwd(), 'public', 'cities');
  const tempDir = path.join(process.cwd(), 'temp_cities');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(tempDir, { recursive: true });

  let success = 0;
  let failed = 0;

  for (const [id, query] of Object.entries(CITY_SEARCHES)) {
    const outputPath = path.join(outputDir, `${id}.jpg`);

    // Skip if already exists
    if (fs.existsSync(outputPath)) {
      console.log(`[SKIP] ${id} - already exists`);
      success++;
      continue;
    }

    console.log(`[SEARCH] ${id}: "${query}"`);

    const imageUrl = await searchWikimediaCommons(query);
    if (!imageUrl) {
      console.log(`  [FAIL] No image found`);
      failed++;
      continue;
    }

    console.log(`  [DOWNLOAD] ${imageUrl.substring(0, 60)}...`);

    const tempPath = path.join(tempDir, `${id}_temp.jpg`);
    const downloaded = await downloadImage(imageUrl, tempPath);

    if (!downloaded) {
      failed++;
      continue;
    }

    console.log(`  [RESIZE] 400x225`);
    const resized = resizeImage(tempPath, outputPath, 400, 225);

    if (resized) {
      console.log(`  [OK] ${id}.jpg`);
      success++;
      fs.unlinkSync(tempPath);
    } else {
      failed++;
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 5000));
  }

  // Cleanup temp dir
  try { fs.rmdirSync(tempDir); } catch {}

  console.log(`\nCities: ${success} success, ${failed} failed`);
}

// Main
const args = process.argv.slice(2);
const doPlanes = args.includes('--planes') || args.includes('--all') || args.length === 0;
const doCities = args.includes('--cities') || args.includes('--all') || args.length === 0;

console.log('Wikimedia Commons Image Downloader');
console.log('===================================');
console.log('Note: Some images may fail. You can manually replace any missing/bad ones.');
console.log('Images are downloaded under CC licenses - attribution may be required.\n');

(async () => {
  if (doPlanes) await downloadPlanes();
  if (doCities) await downloadCities();

  console.log('\n=== Done! ===');
  console.log('Check public/planes/ and public/cities/ for downloaded images.');
  console.log('Replace any missing or poor quality images manually.');
})();
