#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MOVIE_PUNS, slugify } from '../src/data/puns.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('\nERROR: missing OPENAI_API_KEY env var');
  console.error('\nRun like:');
  console.error('  OPENAI_API_KEY=sk-... npm run posters\n');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_DIR = path.join(__dirname, '..', 'public', 'posters');

const MODEL = process.env.MODEL || 'gpt-image-1';
const SIZE = process.env.SIZE || '1024x1536';
const QUALITY = process.env.QUALITY || 'high';
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '3', 10);

const COST_PER = {
  'gpt-image-1': { low: 0.02, medium: 0.042, high: 0.167 },
  'dall-e-3': { standard: 0.08, hd: 0.12 },
};

async function generateOne(pun, i, total) {
  const slug = slugify(pun.dog);
  const outPath = path.join(OUT_DIR, `${slug}.png`);

  try {
    await fs.access(outPath);
    console.log(`[${String(i + 1).padStart(3)}/${total}] SKIP  ${slug}`);
    return 'skip';
  } catch {}

  const prompt = `Cinematic movie poster, painterly film art style. A dog as the main character of the film, in the visual style, color palette, and dramatic mood of "${pun.original}" (${pun.year}). Expressive composition, theatrical lighting, rich atmosphere. Absolutely no text, no title, no letters, no words, no captions, no credits, no logos anywhere on the image — poster artwork only.`;

  const body = {
    model: MODEL,
    prompt,
    n: 1,
    size: SIZE,
    quality: QUALITY,
  };

  const t0 = Date.now();
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 400)}`);
  }

  const data = await res.json();
  const first = data?.data?.[0];
  if (!first) throw new Error('no image in response');

  let buf;
  if (first.b64_json) {
    buf = Buffer.from(first.b64_json, 'base64');
  } else if (first.url) {
    const imgRes = await fetch(first.url);
    if (!imgRes.ok) throw new Error(`download HTTP ${imgRes.status}`);
    buf = Buffer.from(await imgRes.arrayBuffer());
  } else {
    throw new Error('response has neither b64_json nor url');
  }

  await fs.writeFile(outPath, buf);

  const dur = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`[${String(i + 1).padStart(3)}/${total}] OK    ${slug}  (${dur}s)`);
  return 'ok';
}

async function runWithConcurrency(items, fn, concurrency) {
  let nextIdx = 0;
  const counts = { ok: 0, skip: 0, fail: 0 };

  async function worker() {
    while (true) {
      const i = nextIdx++;
      if (i >= items.length) return;
      try {
        const r = await fn(items[i], i, items.length);
        counts[r]++;
      } catch (e) {
        counts.fail++;
        console.error(`[${String(i + 1).padStart(3)}/${items.length}] FAIL  ${slugify(items[i].dog)}: ${e.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return counts;
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const costPer = COST_PER[MODEL]?.[QUALITY] ?? 0.1;
  const maxCost = (MOVIE_PUNS.length * costPer).toFixed(2);

  console.log(`\nGenerating ${MOVIE_PUNS.length} posters`);
  console.log(`Model:       ${MODEL}`);
  console.log(`Size:        ${SIZE}`);
  console.log(`Quality:     ${QUALITY}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Output:      ${OUT_DIR}`);
  console.log(`Max cost:    ~$${maxCost} (less if any are skipped)\n`);

  const t0 = Date.now();
  const counts = await runWithConcurrency(MOVIE_PUNS, generateOne, CONCURRENCY);
  const mins = ((Date.now() - t0) / 60000).toFixed(1);

  console.log(`\nDone in ${mins} min — ${counts.ok} generated, ${counts.skip} skipped, ${counts.fail} failed`);
  if (counts.fail > 0) {
    console.log(`Re-run to retry failed ones (existing posters skip automatically)`);
  }
}

main().catch((e) => {
  console.error('\nFatal:', e.message);
  process.exit(1);
});
