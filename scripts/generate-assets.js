#!/usr/bin/env node
// Generate PWA icons + OG preview image.
// Icons: inline SVG → sharp. OG: satori JSX → resvg → PNG with Playfair.
// Run with: npm run assets

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC = path.join(__dirname, '..', 'public');

const BG = '#0b0d10';
const ORANGE = '#f47820';
const TEXT = '#e8eaf0';
const MUTED = '#5a6370';

function pawSvg({ size = 512, inset = 0 }) {
  const s = 512;
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

async function writePng(svg, size, outName) {
  const out = path.join(PUBLIC, outName);
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(out);
  console.log(`wrote ${outName} (${size}x${size})`);
}

async function fetchFont(family, weight, style = 'normal') {
  const italic = style === 'italic' ? 'ital,' : '';
  const variant = style === 'italic' ? `1,${weight}` : weight;
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:${italic}wght@${variant}&display=swap`;
  const cssRes = await fetch(cssUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const css = await cssRes.text();
  const match = css.match(/src:\s*url\(([^)]+\.ttf)\)/);
  if (!match) throw new Error(`no TTF found for ${family} ${weight} ${style}`);
  const ttfRes = await fetch(match[1]);
  return Buffer.from(await ttfRes.arrayBuffer());
}

async function generateOg() {
  const [playfairItalic, playfair, plex] = await Promise.all([
    fetchFont('Playfair Display', '900', 'italic'),
    fetchFont('Playfair Display', '400', 'italic'),
    fetchFont('IBM Plex Mono', '500'),
  ]);

  const node = {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        background: BG,
        display: 'flex',
        padding: '64px 72px',
        position: 'relative',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flex: 1,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'Playfair Display',
                    fontStyle: 'italic',
                    fontWeight: 900,
                    fontSize: 124,
                    color: ORANGE,
                    lineHeight: 1,
                    letterSpacing: -2,
                  },
                  children: 'Where My Dog.',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'Playfair Display',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    fontSize: 38,
                    color: TEXT,
                    marginTop: 26,
                    lineHeight: 1.25,
                    maxWidth: 780,
                  },
                  children:
                    'A canine locator that takes itself very seriously and is wrong most of the time.',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    marginTop: 56,
                    fontFamily: 'IBM Plex Mono',
                    fontWeight: 500,
                    fontSize: 22,
                    color: MUTED,
                    letterSpacing: 6,
                  },
                  children: 'WHERE-MY-DOG.VERCEL.APP',
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 60,
              right: 50,
              width: 420,
              height: 420,
              display: 'flex',
              opacity: 0.2,
            },
            children: [
              {
                type: 'svg',
                props: {
                  width: 420,
                  height: 420,
                  viewBox: '0 0 512 512',
                  xmlns: 'http://www.w3.org/2000/svg',
                  children: [
                    {
                      type: 'g',
                      props: {
                        fill: ORANGE,
                        children: [
                          { type: 'path', props: { d: 'M 256 370 C 180 370 150 325 150 285 C 150 245 180 220 220 218 C 235 217 245 220 256 220 C 267 220 277 217 292 218 C 332 220 362 245 362 285 C 362 325 332 370 256 370 Z' } },
                          { type: 'ellipse', props: { cx: 135, cy: 200, rx: 42, ry: 58 } },
                          { type: 'ellipse', props: { cx: 205, cy: 140, rx: 44, ry: 62 } },
                          { type: 'ellipse', props: { cx: 307, cy: 140, rx: 44, ry: 62 } },
                          { type: 'ellipse', props: { cx: 377, cy: 200, rx: 42, ry: 58 } },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(node, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Playfair Display', data: playfairItalic, weight: 900, style: 'italic' },
      { name: 'Playfair Display', data: playfair, weight: 400, style: 'italic' },
      { name: 'IBM Plex Mono', data: plex, weight: 500, style: 'normal' },
    ],
  });

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  const pngBuf = resvg.render().asPng();
  const out = path.join(PUBLIC, 'og-image.png');
  await fs.writeFile(out, pngBuf);
  console.log('wrote og-image.png (1200x630) with Playfair');
}

async function main() {
  await fs.mkdir(PUBLIC, { recursive: true });
  await writePng(pawSvg({ inset: 0 }), 192, 'icon-192.png');
  await writePng(pawSvg({ inset: 0 }), 512, 'icon-512.png');
  await writePng(pawSvg({ inset: 0 }), 180, 'apple-touch-icon.png');
  await writePng(pawSvg({ inset: 0.2 }), 512, 'icon-maskable-512.png');
  await generateOg();
}

main().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
