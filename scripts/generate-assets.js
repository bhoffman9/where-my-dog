#!/usr/bin/env node
// Generate PWA icons + OG preview image from inline SVG using sharp.
// Run with: npm run assets
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC = path.join(__dirname, '..', 'public');

const BG = '#0b0d10';
const ORANGE = '#f47820';

function pawSvg({ size = 512, inset = 0 }) {
  const s = 512;
  // inset shrinks the paw inside the viewBox for maskable safe area.
  const scale = 1 - inset;
  const offset = (1 - scale) * 256;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" fill="${BG}"/>
  <g transform="translate(${offset},${offset}) scale(${scale})" fill="${ORANGE}">
    <path d="M 256 370 C 180 370 150 325 150 285 C 150 245 180 220 220 218 C 235 217 245 220 256 220 C 267 220 277 217 292 218 C 332 220 362 245 362 285 C 362 325 332 370 256 370 Z"/>
    <ellipse cx="135" cy="200" rx="42" ry="58"/>
    <ellipse cx="205" cy="140" rx="44" ry="62"/>
    <ellipse cx="307" cy="140" rx="44" ry="62"/>
    <ellipse cx="377" cy="200" rx="42" ry="58"/>
  </g>
</svg>`;
}

function ogSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#0b0d10"/>
      <stop offset="1" stop-color="#0b0d10"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#grad)"/>
  <g transform="translate(830,60) scale(0.95)" fill="${ORANGE}" opacity="0.18">
    <path d="M 256 370 C 180 370 150 325 150 285 C 150 245 180 220 220 218 C 235 217 245 220 256 220 C 267 220 277 217 292 218 C 332 220 362 245 362 285 C 362 325 332 370 256 370 Z"/>
    <ellipse cx="135" cy="200" rx="42" ry="58"/>
    <ellipse cx="205" cy="140" rx="44" ry="62"/>
    <ellipse cx="307" cy="140" rx="44" ry="62"/>
    <ellipse cx="377" cy="200" rx="42" ry="58"/>
  </g>
  <text x="72" y="260" fill="${ORANGE}" font-family="Georgia, serif" font-style="italic" font-weight="900" font-size="128">Where My Dog.</text>
  <text x="74" y="330" fill="#e8eaf0" font-family="Georgia, serif" font-style="italic" font-size="38">A canine locator that takes itself very seriously</text>
  <text x="74" y="378" fill="#e8eaf0" font-family="Georgia, serif" font-style="italic" font-size="38">and is wrong most of the time.</text>
  <text x="74" y="470" fill="#5a6370" font-family="Consolas, monospace" font-size="22" letter-spacing="6">WHERE-MY-DOG.VERCEL.APP</text>
  <line x1="74" y1="498" x2="300" y2="498" stroke="${ORANGE}" stroke-width="3"/>
</svg>`;
}

async function writePng(svg, size, outName) {
  const out = path.join(PUBLIC, outName);
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out);
  console.log(`wrote ${outName} (${size}x${size})`);
}

async function writeOgPng() {
  const out = path.join(PUBLIC, 'og-image.png');
  await sharp(Buffer.from(ogSvg())).png().toFile(out);
  console.log('wrote og-image.png (1200x630)');
}

async function main() {
  await fs.mkdir(PUBLIC, { recursive: true });
  await writePng(pawSvg({ inset: 0 }), 192, 'icon-192.png');
  await writePng(pawSvg({ inset: 0 }), 512, 'icon-512.png');
  await writePng(pawSvg({ inset: 0 }), 180, 'apple-touch-icon.png');
  await writePng(pawSvg({ inset: 0.2 }), 512, 'icon-maskable-512.png');
  await writeOgPng();
}

main().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
