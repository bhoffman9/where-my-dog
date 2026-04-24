# Where My Dog — Joke Canine Locator

Camera app that uses **real** in-browser dog detection (MediaPipe EfficientDet-Lite) to gate a deliberately unreliable joke verdict. No dog → classy stylized "Not Here." from a pool of 40+ Playfair-italic lines, escalating every few scans to Dog Punishments. Dog detected → 95% "Dog Is Here" with theatrical confidence %, 5% random animal from an exotic-only list. Entrance shows one of 142 A-tier movie puns ("The Dogfather", "Pup Fiction", "Pooch Cassidy and the Sundance Kid", etc.) with a gpt-image-1 painterly poster.

- **Live URL:** https://where-my-dog.vercel.app/
- **Repo:** https://github.com/bhoffman9/where-my-dog.git
- **Branch:** `master`
- **Owner:** Ben Hoffman

## Local Path

`c:\Users\hoffm\Desktop\Personal\where-my-dog\`

## Tech Stack

- **Frontend:** React 18 + Vite (dev server on port 3000)
- **Detection:** `@mediapipe/tasks-vision` with EfficientDet-Lite 0 object detector. wasm loaded from jsdelivr CDN, `.tflite` model from Google's mediapipe-models bucket. ~136 KB JS bundle vs 1.9 MB for the old TensorFlow.js + COCO-SSD stack it replaced.
- **AI Posters:** OpenAI `gpt-image-1` (high quality portrait 1024×1536, pre-generated via script) with Pollinations.ai Flux fallback for puns that don't have a local poster (live-gen, free, no API key).
- **Styling:** Inline CSS-in-JS, dark theme. Fonts via Google: Playfair Display (italic serif for classy moments), IBM Plex Mono (HUD/labels), Barlow Condensed (display caps + verdict badge). Palette matches FreightIQ.
- **Storage:** localStorage for Field Log (last 10 scans, photo dataURL + verdict) and no-dog streak counter.
- **PWA:** `vite-plugin-pwa` (Workbox) with auto-update registration. Installable on iOS/Android, works offline for the shell + posters that have been viewed. Precache stays ~320 KB; posters cache lazily via `CacheFirst`.
- **Hosting:** Vercel, auto-deploys from GitHub `master`.
- **App Store path (future):** Capacitor wrap (React already uses safe-area insets, `playsInline`).

## Commands

```bash
npm install                # Install dependencies
npm run dev                # Dev server → http://localhost:3000
npm run build              # Production build → dist/ (auto-regenerates poster manifest via prebuild)
npm run preview            # Preview production build
npm run posters            # Generate all 142 gpt-image-1 posters (requires OPENAI_API_KEY env)
npm run manifest           # Rebuild src/data/poster-manifest.js from public/posters/
npm run assets             # Regenerate PWA icons + OG image (satori + Playfair Display)
```

## Project Structure

```
where-my-dog/
├── src/
│   ├── main.jsx           # React entry + ErrorBoundary wrapper
│   ├── App.jsx            # Single-file SPA: views, detection, verdict logic, share card
│   └── data/
│       ├── puns.js               # 142 A-tier MOVIE_PUNS + slugify helper
│       └── poster-manifest.js    # AUTO-GENERATED list of slugs with posters on disk
├── scripts/
│   ├── generate-posters.js       # gpt-image-1 poster generation (reads OPENAI_API_KEY)
│   ├── write-manifest.js         # Scans public/posters, writes poster-manifest.js
│   └── generate-assets.js        # satori → resvg renders OG image + paw icons
├── public/
│   ├── posters/                  # Pre-generated posters, <slug>.png (107/142 live)
│   ├── manifest.webmanifest      # PWA manifest (hand-authored, not the plugin's)
│   ├── icon-192.png / icon-512.png / icon-maskable-512.png / apple-touch-icon.png
│   └── og-image.png              # 1200×630 social preview
├── index.html                    # Meta + OG + Twitter tags + manifest link
├── package.json                  # Node scripts + deps
└── vite.config.js                # React plugin + VitePWA (Workbox SW)
```

## Views

| View | Trigger | Purpose |
|------|---------|---------|
| `welcome` | Initial load | Cinematic splash — "Welcome to the Future of Dog" + live-jittering "8.142 BILLION USERS WORLDWIDE" counter + `[ BEGIN ]`. Pulsing orange halo, staggered fade-ins. Header is hidden on this view. |
| `entrance` | `[ BEGIN ]` from welcome | Random pun (poster-filtered) + AI poster + orange dog-house "FIND MY DOG" button (pulsing halo + bobbing icon). Tap poster to zoom, ▸ for next poster. Header is hidden on this view. |
| `camera` | Click ENTER or SCAN tab | Live camera viewfinder + capture button. If camera permission denied / unsupported, shows a Playfair "Camera access denied" panel with an upload fallback. Capture button is disabled until detector is ready. |
| `analyzing` | After capture | 1.5–2.3s scan-line animation while MediaPipe runs detection. `prefers-reduced-motion` pins the scan line. |
| `result` | After analysis | Verdict badge (DOG ✓ green / NO DOG ✗ red) pinned to the top of the photo, typewriter label revealing below, confidence counter fades in after label completes. |
| `log` | Click LOG tab | Field Log — last 10 scans with thumbnails + clear button. |

## Verdict Logic

The app uses **real** dog detection but **fake** result presentation. MediaPipe's EfficientDet-Lite 0 runs on an HTMLImageElement in-browser.

```
detection runs on captured photo (MediaPipe ObjectDetector.detect(img))
  ↓
hasDog = res.detections.some(d => d.categories.some(c => c.categoryName === 'dog' && c.score >= 0.5))
  ↓
if (!hasDog)              → escalating no-dog tier (see below)
if (hasDog && roll < 5%)  → random animal from ANIMALS list (exotic only)
if (hasDog && roll ≥ 5%)  → "Dog is Here" + animated 73–99% confidence
```

If the detector hasn't loaded when capture fires, the capture button is disabled. If detection fails at runtime, the app falls back to `Math.random() < 0.5` for `hasDog` — graceful degradation, not a hang.

### No-dog streak ladder

Persisted in `localStorage['wmd_no_dog_streak']`. Any dog or animal verdict resets to 0.

| Streak | Behavior |
|---|---|
| 1–5 | Pure classy pool: random from 40+ Playfair lines ("The Ghost of a Dog.", "Mathematically Dogless.") |
| **5** | Tier reveal: "Do You Even Have a Dog?" with live count |
| 6–9 | 50/50 between classy pool and Dog Punishments pool |
| **10** | Tier reveal: "Dog Pound." |
| 11–14 | 50/50 mix |
| **15** | Tier reveal: "Ask Forgiveness from the Dog Priest." |
| 16–49 | 50/50 mix of classy + 30 Dog Punishments (Fleas, Lyme Disease, Unscratchable Itch, Banned from Dog Parks, Mailman Holds a Grudge, Cone of Shame, Squirrels Know Your Name, Reincarnated as a Squeaky Toy, etc.) |
| **50+** | Locked terminal message: "You Are Being Driven to a Farm Upstate." / "Where you can run free. Don't worry." |

## Movie Puns

142 hand-curated A-tier puns in `src/data/puns.js`. **Every entry must make a reasonable person chuckle on first read.** Quality > quantity.

Each pun is `{ dog, original, year }`:
- `dog` — the parodied title shown big in italic Playfair on the entrance
- `original` + `year` — shown subtly underneath as `ORIGINAL — <NAME> · <YEAR>`

**Bar for adding puns:**
1. The dog substitution must be phonetically natural (single-letter or single-word swap, no contortion)
2. The original must be widely known
3. The result must actually be funny — not just substituted

If unsure, leave it out. Examples that pass: Citizen Canine, Raiders of the Lost Bark, Pooch Cassidy and the Sundance Kid, Dingo Unchained, Pupenheimer, Crouching Tiger Hidden Dachshund, The Silence of the Labs, Sherlock Bones, Edward Scissorpaws, Stay by Me. Examples that would fail: "Dog Movie" for The Movie, "Lord of the Bings" — no.

### Poster availability

The entrance picks from `PUNS_WITH_POSTERS` — the subset of puns that have a `.png` in `public/posters/`. Currently 107/142. The remaining 35 (2 content-moderated, 33 billing-capped) are deferred to next generation pass. When posters are added, `npm run manifest` or `npm run build` regenerates `src/data/poster-manifest.js` and they come online.

## AI Posters

Each pun gets a painterly movie-poster image generated by OpenAI's `gpt-image-1` model (high quality), pre-generated and stored in `public/posters/<slug>.png` (slug = lowercased dog title with non-alphanumerics → hyphens). gpt-image-1 is used instead of DALL-E 3 because it follows negative prompts ("no text on the image") much more reliably and hews closer to requested film styles.

**Prompt template:** `"Cinematic movie poster, painterly film art style. A dog as the main character of the film, in the visual style, color palette, and dramatic mood of '<original>' (<year>). Expressive composition, theatrical lighting, rich atmosphere. Absolutely no text, no title, no letters, no words, no captions, no credits, no logos anywhere on the image — poster artwork only."`

**Generation:**

```bash
OPENAI_API_KEY=sk-... npm run posters
```

- Default: `gpt-image-1`, `1024×1536` portrait, `high` quality, concurrency 3
- **Cost (portrait high): ~$0.25/image** × 142 = **~$35.50 max** (skips files already in `public/posters/`). The $0.167 figure OpenAI publishes is for 1024×1024 (square) at high quality — portrait is ~50% more. Also check your account's **hard spending limit** at platform.openai.com/settings/organization/limits before running; it's separate from your balance and will abort the run mid-batch if hit.
- Requires OpenAI org **identity verification** for gpt-image-1 access
- Runtime: ~30–35 min at concurrency 3 for a full 142-poster run
- Tunable via env vars: `MODEL`, `SIZE`, `QUALITY` (`low` / `medium` / `high`), `CONCURRENCY`
- Budget alternative: `QUALITY=medium` (~$6 total, still beats DALL-E 3)
- Idempotent — re-runs only generate missing files
- Writes updated `poster-manifest.js` after generation

**Content moderation edge cases:** Trademarked titles (e.g. "Star Wars: The Force Awakens", "Monsters, Inc.") can trip gpt-image-1's safety filter (HTTP 400 `moderation_blocked`). Current fix: strip brand names from the prompt for specific slugs, or leave them to the Pollinations fallback.

**Loading order in app (entrance):**
1. `<img src="/posters/<slug>.png">` — instant if pre-generated (and pun only picked if so)
2. On 404 / error → live Pollinations.ai Flux URL (slow first load, free, CDN-cached after)
3. On both failing → 🐾 placeholder

`OPENAI_API_KEY` is read from shell env only. Never write it into the repo.

## Random Animal List

~85 exotic entries in `App.jsx` `ANIMALS` const. Spans wild mammals (Capybara, Wolverine, Aardvark), birds (Roadrunner, Pelican), reptiles (Komodo Dragon, Gila Monster), marine (Narwhal, Orca), and marsupials (Quokka, Wombat, Tasmanian Devil). Farm animals (Cat, Sheep, Goat, Ram, Donkey, Mule, Pig) were explicitly pruned in the hostile-review pass — they broke the "unexpected match" joke.

## Result Screen Treatment

- **Badge at top (always):** `DOG ✓` (green, Barlow 900) or `NO DOG ✗` (cool gray `absent`) so the verdict is unambiguous even when the tagline is poetic ("The Ghost of a Dog"). The NO DOG badge is intentionally *not* red — red is reserved for true errors.
- **Dog Is Here** — bold green Barlow Condensed, all caps, typewriter reveal, confidence counter fades in after label completes (eased rAF over 900ms)
- **Random animal** — italic gold Playfair, "UNEXPECTED MATCH · NN%"
- **Not Here** — italic white Playfair, tier message or random subtitle from the 32-line classy pool
- All overlaid on the captured photo with vignette gradient. Buttons: SCAN AGAIN (orange) + SHARE CARD (opens full 1080×1920 preview modal before native share/download).

## Field Log

- localStorage key: `wmd_log`
- Stores last 10 scans only
- Each entry: `{ id, verdict, label, confidence, photo (base64 dataURL), timestamp }`
- Photos as base64 in localStorage — small impact (~100 KB × 10 = ~1 MB max)
- Empty state: italic Playfair "No scans yet. The dog awaits."
- CLEAR button wipes the log

## Share Card

Result screen has a SHARE CARD button → renders 1080×1920 PNG via Canvas (story format) with the photo, verdict, brand mark, and timestamp → **stages a preview modal first** (scaled down with SHARE / CANCEL buttons). Confirm routes to native iOS/Android share sheet (`navigator.share`), falls back to PNG download. Blob URL is tracked via ref and revoked on unmount / cancel.

## Color Scheme (matches FreightIQ palette)

| Token | Hex | Use |
|-------|-----|-----|
| Background | `#0b0d10` | Dark base |
| Surface | `#12151c` | Cards, panels |
| Primary | `#f47820` | Orange accent |
| Accent | `#f5c542` | Yellow / surprise animal |
| Green | `#3ddc84` | DOG ✓ verdict, detector online |
| Red | `#ff5252` | **True errors only** — camera denied, CLEAR log button |
| Absent | `#8a95a5` | NO DOG ✗ verdict, streak-chip at 15+ (classy-sad, not alarming) |
| Text | `#e8eaf0` | Primary text |
| Muted | `#5a6370` | Secondary text |

**Red vs Absent:** The palette intentionally separates *errors* (red — something is broken, the user should act) from *narrative absence* (absent — the dog isn't here, this is poetic not alarming). When adding new UI, pick red only if the user is expected to do something about it; otherwise use absent.

## Code Conventions

- All components defined as functions inside `App.jsx` (single-file SPA, ~1100 lines)
- Inline styles throughout (no CSS modules, Tailwind, or styled-components)
- No tests configured; no test framework
- React Context not used — all state is local via `useState` / `useRef` / `useEffect`
- localStorage access wrapped in try/catch (private-mode tolerance)
- `ErrorBoundary` wraps `<App />` in `main.jsx` with an orange `[ RELOAD ]` fallback
- No TypeScript (intentional)

## Upload / Deployment Pipeline

1. Commit to `master` → push to GitHub
2. Vercel GitHub integration auto-builds (~60 sec)
3. `prebuild` script regenerates `poster-manifest.js` so new posters come online
4. SW version-bumps automatically (vite-plugin-pwa `autoUpdate`)

## Future Work / Ideas

- **Finish remaining 35 posters** when budget allows (deferred until payday; 33 billing-capped + 2 moderation-blocked)
- **Custom prompt sanitization** for trademarked-title moderation fails (retry Fetch Awakens / Mongrels Inc.)
- **Capacitor wrap** → iOS TestFlight → App Store ($99/yr Apple Dev account)
- **Sound effects** — single bark on enter, etc. (currently silent by user request)
- **Custom dog training** — fine-tune detector on a specific dog (much bigger lift)
- **Streak analytics** — optional: track which tiers fire most often to tune the escalation
