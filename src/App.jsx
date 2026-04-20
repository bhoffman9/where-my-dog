import React, { useState, useEffect, useRef } from 'react';
import { MOVIE_PUNS, slugify } from './data/puns.js';
import { POSTER_SLUGS } from './data/poster-manifest.js';

const PUNS_WITH_POSTERS = MOVIE_PUNS.filter((p) => POSTER_SLUGS.has(slugify(p.dog)));

const COLORS = {
  bg: '#0b0d10',
  surface: '#12151c',
  primary: '#f47820',
  text: '#e8eaf0',
  muted: '#5a6370',
  accent: '#f5c542',
  green: '#3ddc84',
  red: '#ff5252',
};

const ANIMALS = [
  'Deer', 'Raccoon', 'Possum', 'Coyote', 'Fox', 'Black Bear',
  'Grizzly Bear', 'Polar Bear', 'Panda', 'Koala', 'Sloth', 'Anteater',
  'Pangolin', 'Aardvark', 'Otter', 'Beaver', 'Badger', 'Wolverine',
  'Skunk', 'Squirrel', 'Chipmunk', 'Marmot', 'Groundhog', 'Prairie Dog',
  'Mole', 'Vole', 'Hedgehog', 'Porcupine', 'Hare', 'Rabbit',
  'Wolf', 'Arctic Fox', 'Fennec Fox', 'Bobcat', 'Lynx', 'Cougar',
  'Jaguar', 'Ocelot', 'Cheetah', 'Leopard', 'Tiger', 'Lion',
  'Hyena', 'Wildebeest', 'Elk', 'Moose', 'Caribou', 'Bison',
  'Yak', 'Buffalo', 'Goose', 'Heron', 'Owl', 'Hawk',
  'Eagle', 'Falcon', 'Crane', 'Stork', 'Swan', 'Pelican',
  'Roadrunner', 'Iguana', 'Gila Monster', 'Komodo Dragon', 'Tortoise', 'Bullfrog',
  'Salamander', 'Toad', 'Manatee', 'Walrus', 'Seal', 'Sea Lion',
  'Dolphin', 'Orca', 'Narwhal', 'Capybara', 'Llama', 'Alpaca',
  'Vicuña', 'Tapir', 'Okapi', 'Giraffe', 'Hippopotamus', 'Rhinoceros',
  'Quokka', 'Wombat', 'Tasmanian Devil', 'Echidna', 'Platypus', 'Kangaroo',
  'Wallaby', 'Cat', 'Mongoose', 'Goat', 'Mountain Goat', 'Sheep',
  'Ram', 'Donkey', 'Mule', 'Pig',
];

const NOT_HERE_MESSAGES = [
  'Not Here.',
  'Absent.',
  'Whereabouts Unknown.',
  'Gone Like the Wind.',
  'The Ghost of a Dog.',
  'Vacated.',
  'Nowhere to be Found.',
  'No Dog Detected.',
  'A Dogless Frame.',
  'Empty.',
  'Searched. Found Nothing.',
  'The Dog Is Elsewhere.',
  'Undetectable.',
  'Unaccounted For.',
  'Presumed Napping.',
  'Off the Grid.',
  'Absconded.',
  'Missing from This Frame.',
  'A Dog-Shaped Hole.',
  'Conspicuously Absent.',
  'No Canine Signal.',
  'Patrol Report: Empty.',
  'The Dog Has Left the Chat.',
  'Zero Tails Detected.',
  'Hiding, Allegedly.',
  'A Silence Where a Dog Should Be.',
  'Currently Off-Duty.',
  'Unphotographed.',
  'Out of Sight.',
  'Elusive.',
  'No Paws, No Proof.',
  'Signal Lost.',
  'Investigation Ongoing.',
  'Not Pictured.',
  'Last Seen Elsewhere.',
  'A Room Without a Dog.',
  'Mathematically Dogless.',
  'The Dog Eludes Us.',
  'A Perfect Absence.',
  'Canine Status: 404.',
  'Dog: Offline.',
  'The Dog Is Not Available at This Time.',
  'A Frame in Want of a Dog.',
  'No Such Dog.',
];

const NOT_HERE_SUBTITLES = [
  'Try another angle.',
  'Have you checked under the bed?',
  'The couch, perhaps?',
  'Field analysis: inconclusive.',
  'Suggest checking the kitchen.',
  'No tail. No paw. No dog.',
  'Vibe check: dogless.',
  'A profound emptiness.',
  'Recommend: open the back door.',
  'Yard sweep advised.',
  'Check the laundry pile.',
  'Perhaps under the table.',
  'The dog knows.',
  'Sniff test: negative.',
  'We regret to inform you.',
  'Try calling their name.',
  'Rattle a treat bag.',
  'The shadows yield nothing.',
  'Check behind the curtain.',
  'A meditation on absence.',
  'Commence perimeter scan.',
  'Shake a leash. Stand back.',
  'Suspiciously quiet.',
  'Look where you last left them.',
  'Field conditions: empty.',
  'Await their return.',
  'The air holds no bark.',
  'Is the window open?',
  'Behind the refrigerator?',
  'We cannot help you.',
  'Try the car.',
  'Somewhere, but not here.',
];

const NO_DOG_STREAK_KEY = 'wmd_no_dog_streak';
const STREAK_TIERS = [
  { at: 15, label: 'Ask Forgiveness from the Dog Priest.', sub: (n) => `${n} scans. We will pray for you.` },
  { at: 10, label: 'Dog Pound.', sub: (n) => `No successful hits in the last ${n} scans.` },
  { at: 5, label: 'Do You Even Have a Dog?', sub: (n) => `${n} scans. Zero dogs. Just asking.` },
];

const PUNISHMENTS = [
  { label: 'You Have Been Given Fleas.', sub: 'This is how it begins.' },
  { label: 'You Have Been Given Lyme Disease.', sub: 'See a doctor. And a dog.' },
  { label: 'An Unscratchable Itch Has Arrived.', sub: 'Somewhere on your back. Forever.' },
  { label: 'Kennel Cough.', sub: 'A labrador nods knowingly.' },
  { label: 'Mange.', sub: 'The vet is not returning your calls.' },
  { label: 'Tapeworm.', sub: 'A small price to pay.' },
  { label: 'Banned from All Dog Parks.', sub: 'A restraining order, signed in paw prints.' },
  { label: 'The Mailman Holds a Grudge.', sub: 'He remembers. He always remembers.' },
  { label: 'Every Dog Crosses the Street.', sub: 'Word has spread through the neighborhood.' },
  { label: 'You Smell Like a Wet Dog. Permanently.', sub: 'No soap will help.' },
  { label: 'The Cone of Shame Has Materialized.', sub: 'You did this to yourself.' },
  { label: 'The Squirrels Know Your Name.', sub: 'They whisper it. Loudly.' },
  { label: 'Your Tennis Balls No Longer Bounce.', sub: 'They sit. Motionless. Judging.' },
  { label: 'A Golden Retriever Is Disappointed in You.', sub: 'Which is, somehow, worse.' },
  { label: 'The Neighborhood Dogs Have Held a Meeting.', sub: 'You were not invited.' },
  { label: 'You Have Been Reported to the AKC.', sub: 'Your file is thick.' },
  { label: 'The Pet Psychic Refuses to Look.', sub: '"No. Not this one."' },
  { label: 'No Belly Is Rubbable to You Now.', sub: 'They all roll away.' },
  { label: 'A Yorkie Has Passed Judgment.', sub: 'It was not favorable.' },
  { label: 'The Dog Whisperer Will Not Return Your Calls.', sub: 'He says he is busy. He is not.' },
  { label: 'Every Shoe You Own Has Been Pre-Chewed.', sub: 'Retroactively. By a dog you have never met.' },
  { label: 'All Treats Crumble at Your Touch.', sub: 'This is a sign.' },
  { label: 'Reincarnated as a Squeaky Toy.', sub: 'Chewed. Flung. Forgotten under the couch.' },
  { label: 'The Ghost of a Good Boy Sighs.', sub: 'Audibly. In your ear.' },
  { label: 'The Pet Store Has a Photo of You.', sub: 'Behind the counter. Circled in red.' },
  { label: 'A Single Bark Follows You Through Dreams.', sub: 'It is getting closer.' },
  { label: 'You Have Been Unfriended by Every Dog.', sub: 'All of them. At once.' },
  { label: 'Your Couch Now Sheds.', sub: 'Without any dog to blame.' },
  { label: 'A Malamute Frowns from a Great Distance.', sub: 'You feel it.' },
  { label: 'The Dog Park Bench Refuses to Seat You.', sub: 'It has standards.' },
];

const FARM_UPSTATE = {
  label: 'You Are Being Driven to a Farm Upstate.',
  sub: 'Where you can run free. Don\u2019t worry.',
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function hashSeed(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h) % 999999;
}

function localPosterUrl(pun) {
  return `/posters/${slugify(pun.dog)}.png`;
}

function pollinationsPosterUrl(pun) {
  const prompt = `cinematic movie poster, dog as the main character, "${pun.dog}", dramatic lighting, painterly film poster art, parody of ${pun.original}, no text, no title, no letters`;
  const seed = hashSeed(pun.dog);
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=512&height=768&seed=${seed}&nologo=true`;
}

function readStreak() {
  try {
    const n = parseInt(localStorage.getItem(NO_DOG_STREAK_KEY) || '0', 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeStreak(n) {
  try { localStorage.setItem(NO_DOG_STREAK_KEY, String(n)); } catch {}
}

function rollResult(hasDog) {
  if (!hasDog) {
    const streak = readStreak() + 1;
    writeStreak(streak);
    if (streak >= 50) {
      return {
        verdict: 'none',
        label: FARM_UPSTATE.label,
        subtitle: FARM_UPSTATE.sub,
        confidence: null,
      };
    }
    const tier = STREAK_TIERS.find((t) => streak === t.at);
    if (tier) {
      return {
        verdict: 'none',
        label: tier.label,
        subtitle: tier.sub(streak),
        confidence: null,
      };
    }
    if (streak >= 6 && Math.random() < 0.5) {
      const p = pick(PUNISHMENTS);
      return {
        verdict: 'none',
        label: p.label,
        subtitle: p.sub,
        confidence: null,
      };
    }
    return {
      verdict: 'none',
      label: pick(NOT_HERE_MESSAGES),
      subtitle: pick(NOT_HERE_SUBTITLES),
      confidence: null,
    };
  }
  writeStreak(0);
  if (Math.random() < 0.05) {
    return {
      verdict: 'animal',
      label: pick(ANIMALS),
      confidence: 60 + Math.floor(Math.random() * 40),
    };
  }
  return {
    verdict: 'dog',
    label: 'Dog is Here',
    confidence: 73 + Math.floor(Math.random() * 27),
  };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function useTypewriter(text, speed = 30) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!text) { setDisplayed(''); return; }
    setDisplayed('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return displayed;
}


export default function App() {
  const [view, setView] = useState('entrance');
  const [welcomePun, setWelcomePun] = useState(() => pick(PUNS_WITH_POSTERS.length ? PUNS_WITH_POSTERS : MOVIE_PUNS));
  const [result, setResult] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [log, setLog] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wmd_log') || '[]');
    } catch {
      return [];
    }
  });
  const [noDogStreak, setNoDogStreak] = useState(() => readStreak());
  const [animatedConf, setAnimatedConf] = useState(0);
  const [modelStatus, setModelStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [shareBlob, setShareBlob] = useState(null);
  const [shareUrl, setShareUrl] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const modelRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const tf = await import('@tensorflow/tfjs');
        const cocoSsd = await import('@tensorflow-models/coco-ssd');
        await tf.ready();
        const model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
        if (cancelled) return;
        modelRef.current = model;
        setModelStatus('ready');
      } catch (e) {
        console.warn('detector load failed', e);
        if (!cancelled) setModelStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (view !== 'camera') {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) {
        console.warn('camera unavailable', e);
      }
    })();
    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [view]);

  useEffect(() => {
    if (view !== 'result' || !result?.confidence) {
      setAnimatedConf(0);
      return;
    }
    const target = result.confidence;
    let n = 0;
    const id = setInterval(() => {
      n += Math.max(1, Math.ceil(target / 28));
      if (n >= target) {
        n = target;
        clearInterval(id);
      }
      setAnimatedConf(n);
    }, 33);
    return () => clearInterval(id);
  }, [view, result]);

  async function processPhoto(dataUrl) {
    setPhoto(dataUrl);
    setView('analyzing');
    const minWait = new Promise((r) => setTimeout(r, 1500 + Math.random() * 800));

    let hasDog = false;
    if (modelRef.current) {
      try {
        const img = await loadImage(dataUrl);
        const predictions = await modelRef.current.detect(img);
        hasDog = predictions.some((p) => p.class === 'dog' && p.score >= 0.5);
      } catch (e) {
        console.warn('detection failed', e);
        hasDog = Math.random() < 0.5;
      }
    } else {
      hasDog = Math.random() < 0.5;
    }

    await minWait;

    const r = rollResult(hasDog);
    setNoDogStreak(readStreak());
    setResult(r);
    setView('result');
    const entry = {
      id: Date.now(),
      verdict: r.verdict,
      label: r.label,
      confidence: r.confidence,
      photo: dataUrl,
      timestamp: Date.now(),
    };
    setLog((prev) => {
      const next = [entry, ...prev].slice(0, 10);
      try { localStorage.setItem('wmd_log', JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;
    navigator.vibrate?.(40);
    const w = video.videoWidth;
    const h = video.videoHeight;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    processPhoto(dataUrl);
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => processPhoto(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function reset() {
    setResult(null);
    setPhoto(null);
    setView('camera');
  }

  function stageShareCard() {
    if (!photo || !result) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = '#0b0d10';
      ctx.fillRect(0, 0, 1080, 1920);

      const photoTop = 200;
      const photoH = 1080;
      const scale = Math.max(1080 / img.width, photoH / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (1080 - w) / 2;
      const y = photoTop + (photoH - h) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, photoTop, 1080, photoH);
      ctx.clip();
      ctx.drawImage(img, x, y, w, h);
      const grad = ctx.createLinearGradient(0, photoTop, 0, photoTop + photoH);
      grad.addColorStop(0, 'rgba(11,13,16,0.2)');
      grad.addColorStop(1, 'rgba(11,13,16,0.95)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, photoTop, 1080, photoH);
      ctx.restore();

      ctx.fillStyle = '#f47820';
      ctx.font = '800 36px "Barlow Condensed", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('WHERE MY DOG', 540, 110);
      ctx.fillStyle = '#5a6370';
      ctx.font = '500 22px "IBM Plex Mono", monospace';
      ctx.fillText('FIELD REPORT', 540, 150);

      const verdictY = 1380;
      if (result.verdict === 'dog') {
        ctx.fillStyle = '#3ddc84';
        ctx.font = '900 96px "Barlow Condensed", sans-serif';
        ctx.fillText(result.label.toUpperCase(), 540, verdictY);
      } else if (result.verdict === 'animal') {
        ctx.fillStyle = '#f5c542';
        ctx.font = 'italic 700 110px "Playfair Display", serif';
        ctx.fillText(result.label, 540, verdictY);
      } else {
        ctx.fillStyle = '#e8eaf0';
        ctx.font = 'italic 700 96px "Playfair Display", serif';
        ctx.fillText(result.label, 540, verdictY);
      }

      if (result.confidence != null) {
        ctx.fillStyle = '#f47820';
        ctx.font = '700 48px "IBM Plex Mono", monospace';
        ctx.fillText(`${result.confidence}% CONFIDENCE`, 540, verdictY + 90);
      } else if (result.subtitle) {
        ctx.fillStyle = '#5a6370';
        ctx.font = 'italic 400 36px "Playfair Display", serif';
        ctx.fillText(result.subtitle, 540, verdictY + 80);
      }

      ctx.fillStyle = '#5a6370';
      ctx.font = '500 22px "IBM Plex Mono", monospace';
      ctx.fillText(new Date().toLocaleString(), 540, 1820);

      canvas.toBlob((blob) => {
        if (!blob) return;
        if (shareUrl) URL.revokeObjectURL(shareUrl);
        const url = URL.createObjectURL(blob);
        setShareBlob(blob);
        setShareUrl(url);
      }, 'image/png');
    };
    img.src = photo;
  }

  function confirmShare() {
    if (!shareBlob) return;
    const file = new File([shareBlob], `where-my-dog-${Date.now()}.png`, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'Where My Dog' }).catch(() => downloadBlob(shareBlob));
    } else {
      downloadBlob(shareBlob);
    }
    cancelShare();
  }

  function cancelShare() {
    if (shareUrl) URL.revokeObjectURL(shareUrl);
    setShareBlob(null);
    setShareUrl(null);
  }

  function rerollWelcomePun() {
    const pool = PUNS_WITH_POSTERS.length ? PUNS_WITH_POSTERS : MOVIE_PUNS;
    if (pool.length < 2) return;
    let next;
    do {
      next = pick(pool);
    } while (next.dog === welcomePun.dog);
    setWelcomePun(next);
  }

  function downloadBlob(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `where-my-dog-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function clearLog() {
    setLog([]);
    try { localStorage.removeItem('wmd_log'); } catch {}
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: '"IBM Plex Mono", monospace',
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 'env(safe-area-inset-bottom)',
      paddingTop: 'env(safe-area-inset-top)',
    }}>
      {view !== 'entrance' && <Header view={view} setView={setView} modelStatus={modelStatus} streak={noDogStreak} />}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {view === 'entrance' && (
          <EntranceView pun={welcomePun} onEnter={() => setView('camera')} onNextPun={rerollWelcomePun} />
        )}
        {view === 'camera' && (
          <CameraView
            videoRef={videoRef}
            canvasRef={canvasRef}
            onCapture={capturePhoto}
            fileInputRef={fileInputRef}
            onFileUpload={handleFileUpload}
          />
        )}
        {view === 'analyzing' && <Analyzing photo={photo} />}
        {view === 'result' && (
          <ResultView
            result={result}
            photo={photo}
            animatedConf={animatedConf}
            onReset={reset}
            onShare={stageShareCard}
          />
        )}
        {view === 'log' && <FieldLog log={log} onClear={clearLog} />}
      </div>
      {shareUrl && (
        <SharePreview url={shareUrl} onConfirm={confirmShare} onCancel={cancelShare} />
      )}
    </div>
  );
}

function EntranceView({ pun, onEnter, onNextPun }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [src, setSrc] = useState(() => localPosterUrl(pun));
  const [triedFallback, setTriedFallback] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    setSrc(localPosterUrl(pun));
    setImgLoaded(false);
    setImgError(false);
    setTriedFallback(false);
  }, [pun]);

  function handleError() {
    if (!triedFallback) {
      setTriedFallback(true);
      setSrc(pollinationsPosterUrl(pun));
    } else {
      setImgError(true);
    }
  }
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '70px 24px 32px',
      textAlign: 'center',
      position: 'relative',
      gap: 24,
      overflow: 'auto',
    }}>
      <style>{`
        @keyframes wmd-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes wmd-grain {
          0% { transform: translate(0,0); }
          10% { transform: translate(-5%,-10%); }
          20% { transform: translate(-15%,5%); }
          30% { transform: translate(7%,-25%); }
          40% { transform: translate(-5%,25%); }
          50% { transform: translate(-15%,10%); }
          60% { transform: translate(15%,0%); }
          70% { transform: translate(0%,15%); }
          80% { transform: translate(3%,35%); }
          90% { transform: translate(-10%,10%); }
          100% { transform: translate(0,0); }
        }
      `}</style>
      <div style={{ position: 'absolute', top: 24, left: 0, right: 0, textAlign: 'center' }}>
        <div style={{
          fontFamily: '"Barlow Condensed", sans-serif',
          fontWeight: 800,
          fontSize: 18,
          letterSpacing: 4,
          color: COLORS.primary,
        }}>WHERE MY DOG</div>
        <div style={{ fontSize: 9, color: COLORS.muted, letterSpacing: 2, marginTop: 4 }}>
          CANINE LOCATOR · v0.1
        </div>
      </div>

      <div style={{
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 11,
        letterSpacing: 6,
        color: COLORS.muted,
      }}>WELCOME TO</div>

      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div
          onClick={() => imgLoaded && setZoomed(true)}
          style={{
            width: 'min(240px, 60vw)',
            aspectRatio: '2/3',
            background: COLORS.surface,
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 16px 56px rgba(0,0,0,0.65), 0 0 0 1px rgba(244,120,32,0.15)',
            cursor: imgLoaded ? 'zoom-in' : 'default',
          }}
        >
          {!imgLoaded && !imgError && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(110deg, #12151c 25%, #1a1f2a 50%, #12151c 75%)',
              backgroundSize: '200% 100%',
              animation: 'wmd-shimmer 1.6s linear infinite',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                fontSize: 9,
                color: COLORS.muted,
                letterSpacing: 2,
                fontFamily: '"IBM Plex Mono", monospace',
                padding: '0 12px',
                textAlign: 'center',
              }}>GENERATING POSTER...</div>
            </div>
          )}
          {imgError && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              color: COLORS.muted,
            }}>🐾</div>
          )}
          <img
            src={src}
            alt=""
            onLoad={() => setImgLoaded(true)}
            onError={handleError}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              opacity: imgLoaded ? 1 : 0,
              transition: 'opacity 0.5s',
            }}
          />
          {imgLoaded && (
            <div style={{
              position: 'absolute',
              inset: '-30%',
              pointerEvents: 'none',
              opacity: 0.08,
              mixBlendMode: 'overlay',
              backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>\")",
              animation: 'wmd-grain 1.6s steps(8) infinite',
            }} />
          )}
        </div>
        {onNextPun && (
          <button
            onClick={onNextPun}
            aria-label="Next poster"
            style={{
              position: 'absolute',
              top: '50%',
              right: -52,
              transform: 'translateY(-50%)',
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: COLORS.surface,
              border: `1px solid ${COLORS.primary}44`,
              color: COLORS.primary,
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
          >▸</button>
        )}
      </div>

      <div style={{ maxWidth: 720 }}>
        <div style={{
          fontFamily: '"Playfair Display", serif',
          fontStyle: 'italic',
          fontWeight: 900,
          fontSize: 'clamp(36px, 8vw, 64px)',
          color: COLORS.primary,
          lineHeight: 1.05,
          textShadow: '0 4px 24px rgba(244,120,32,0.25)',
        }}>{pun.dog}</div>
        <div style={{
          marginTop: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}>
          <span style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 9,
            letterSpacing: 2,
            color: COLORS.muted,
          }}>ORIGINAL</span>
          <span style={{ color: COLORS.surface }}>—</span>
          <span style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 11,
            letterSpacing: 1.5,
            color: COLORS.text,
            fontWeight: 500,
          }}>{pun.original.toUpperCase()}</span>
          <span style={{ color: COLORS.surface }}>·</span>
          <span style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 11,
            letterSpacing: 1.5,
            color: COLORS.muted,
          }}>{pun.year}</span>
        </div>
      </div>

      <button
        onClick={onEnter}
        style={{
          background: 'transparent',
          color: COLORS.primary,
          border: `2px solid ${COLORS.primary}`,
          padding: '16px 48px',
          fontFamily: '"IBM Plex Mono", monospace',
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: 8,
          cursor: 'pointer',
          borderRadius: 2,
          transition: 'background 0.15s, color 0.15s',
        }}
        onMouseDown={(e) => { e.currentTarget.style.background = COLORS.primary; e.currentTarget.style.color = '#000'; }}
        onMouseUp={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLORS.primary; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = COLORS.primary; }}
      >[ ENTER ]</button>
      {zoomed && (
        <div
          onClick={() => setZoomed(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'zoom-out',
            padding: 24,
          }}
        >
          <img
            src={src}
            alt=""
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
              borderRadius: 4,
            }}
          />
          <div style={{
            position: 'absolute',
            top: 32,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 10,
            letterSpacing: 3,
            color: COLORS.muted,
          }}>TAP ANYWHERE TO CLOSE</div>
        </div>
      )}
    </div>
  );
}

function Header({ view, setView, modelStatus, streak }) {
  const statusColor =
    modelStatus === 'ready' ? COLORS.green :
    modelStatus === 'error' ? COLORS.red :
    COLORS.accent;
  const statusText =
    modelStatus === 'ready' ? 'DETECTOR ONLINE' :
    modelStatus === 'error' ? 'DETECTOR OFFLINE' :
    'DETECTOR LOADING';
  const isLoading = modelStatus === 'loading';
  return (
    <div style={{
      padding: '20px 16px 12px',
      borderBottom: `1px solid ${COLORS.surface}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <style>{`
        @keyframes wmd-dotpulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 1; }
        }
      `}</style>
      <div>
        <div style={{
          fontFamily: '"Barlow Condensed", sans-serif',
          fontWeight: 800,
          fontSize: 22,
          letterSpacing: 2,
          color: COLORS.primary,
          lineHeight: 1,
        }}>WHERE MY DOG</div>
        <div style={{ fontSize: 10, color: statusColor, letterSpacing: 1.5, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={isLoading ? { animation: 'wmd-dotpulse 1.2s ease-in-out infinite' } : undefined}>●</span>
          <span>{statusText}</span>
          {streak > 0 && (
            <span style={{
              marginLeft: 4,
              padding: '2px 8px',
              border: `1px solid ${COLORS.muted}66`,
              borderRadius: 12,
              color: streak >= 15 ? COLORS.red : streak >= 10 ? COLORS.accent : COLORS.muted,
              fontSize: 9,
              letterSpacing: 1.5,
              fontWeight: 700,
            }}>STREAK · {streak}</span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <TabBtn
          active={view === 'camera' || view === 'analyzing' || view === 'result'}
          onClick={() => setView('camera')}
        >SCAN</TabBtn>
        <TabBtn active={view === 'log'} onClick={() => setView('log')}>LOG</TabBtn>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? COLORS.primary : 'transparent',
        color: active ? '#000' : COLORS.muted,
        border: `1px solid ${active ? COLORS.primary : COLORS.surface}`,
        padding: '8px 14px',
        fontFamily: '"IBM Plex Mono", monospace',
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: 1.5,
        cursor: 'pointer',
        borderRadius: 2,
      }}
    >{children}</button>
  );
}

function CameraView({ videoRef, canvasRef, onCapture, fileInputRef, onFileUpload }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16 }}>
      <div style={{
        flex: 1,
        background: '#000',
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
        aspectRatio: '3/4',
        maxHeight: '70vh',
        margin: '0 auto',
        width: '100%',
        maxWidth: 600,
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <Corners />
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          fontSize: 10,
          color: COLORS.primary,
          letterSpacing: 1.5,
          background: 'rgba(0,0,0,0.55)',
          padding: '4px 8px',
          fontFamily: '"IBM Plex Mono", monospace',
        }}>
          ◉ LIVE · SCANNING
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 24, gap: 10 }}>
        <button
          onClick={onCapture}
          style={{
            width: 84,
            height: 84,
            borderRadius: '50%',
            background: COLORS.primary,
            border: '4px solid #fff',
            boxShadow: `0 0 0 4px ${COLORS.primary}33`,
            cursor: 'pointer',
            padding: 0,
          }}
          aria-label="Capture"
        />
        <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1.5, marginTop: 4 }}>
          TAP TO SCAN FOR DOG
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: 'transparent',
            color: COLORS.muted,
            border: 'none',
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 10,
            letterSpacing: 1.5,
            cursor: 'pointer',
            textDecoration: 'underline',
            marginTop: 4,
          }}
        >OR UPLOAD A PHOTO</button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFileUpload}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}

function Corners() {
  const base = {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: COLORS.primary,
    borderStyle: 'solid',
  };
  return (
    <>
      <div style={{ ...base, top: 12, left: 12, borderWidth: '2px 0 0 2px' }} />
      <div style={{ ...base, top: 12, right: 12, borderWidth: '2px 2px 0 0' }} />
      <div style={{ ...base, bottom: 12, left: 12, borderWidth: '0 0 2px 2px' }} />
      <div style={{ ...base, bottom: 12, right: 12, borderWidth: '0 2px 2px 0' }} />
    </>
  );
}

function Analyzing({ photo }) {
  const phrases = [
    'INITIALIZING SCAN...',
    'ANALYZING PIXELS...',
    'CROSS-REFERENCING DOG DATABASE...',
    'CONSULTING NEURAL NETWORK...',
  ];
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPhase((p) => (p + 1) % phrases.length), 500);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      gap: 24,
    }}>
      <style>{`
        @keyframes wmd-scanmove {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .wmd-scanline {
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #f47820, transparent);
          box-shadow: 0 0 14px #f47820;
          animation: wmd-scanmove 1.6s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .wmd-scanline { animation: none; top: 50%; opacity: 0.7; }
        }
      `}</style>
      {photo && (
        <div style={{ position: 'relative', width: '100%', maxWidth: 400, overflow: 'hidden', borderRadius: 4 }}>
          <img src={photo} style={{ width: '100%', display: 'block', opacity: 0.55 }} alt="" />
          <div className="wmd-scanline" />
        </div>
      )}
      <div style={{
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 12,
        color: COLORS.primary,
        letterSpacing: 2,
      }}>{phrases[phase]}</div>
    </div>
  );
}

function ResultView({ result, photo, animatedConf, onReset, onShare }) {
  const typedLabel = useTypewriter(result?.label, 32);
  if (!result) return null;
  const isDog = result.verdict === 'dog';
  const isAnimal = result.verdict === 'animal';
  const isNone = result.verdict === 'none';
  const labelDone = typedLabel.length >= result.label.length;

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: 16,
      gap: 16,
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 600,
        margin: '0 auto',
        borderRadius: 4,
        overflow: 'hidden',
      }}>
        <img src={photo} style={{ width: '100%', display: 'block' }} alt="" />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: isNone
            ? 'linear-gradient(180deg, rgba(11,13,16,0.4), rgba(11,13,16,0.95))'
            : 'linear-gradient(180deg, rgba(11,13,16,0.1), rgba(11,13,16,0.7))',
        }} />
        <div style={{
          position: 'absolute',
          top: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '6px 14px',
          background: isNone ? 'rgba(11,13,16,0.75)' : 'rgba(11,13,16,0.65)',
          border: `1px solid ${isNone ? `${COLORS.muted}aa` : COLORS.green}`,
          borderRadius: 2,
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 11,
          letterSpacing: 2.5,
          fontWeight: 700,
          color: isNone ? COLORS.muted : COLORS.green,
          zIndex: 2,
          whiteSpace: 'nowrap',
        }}>
          {isNone ? 'NO DOG ✗' : 'DOG ✓'}
        </div>
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 24,
          textAlign: 'center',
        }}>
          {isDog && (
            <>
              <div style={{
                fontFamily: '"Barlow Condensed", sans-serif',
                fontWeight: 900,
                fontSize: 56,
                letterSpacing: 2,
                color: COLORS.green,
                lineHeight: 1,
                textShadow: '0 2px 24px rgba(0,0,0,0.85)',
              }}>{typedLabel.toUpperCase()}{!labelDone && <Caret />}</div>
              <div style={{
                fontSize: 14,
                color: COLORS.text,
                letterSpacing: 2,
                marginTop: 12,
                fontFamily: '"IBM Plex Mono", monospace',
                fontWeight: 700,
                opacity: labelDone ? 1 : 0,
                transition: 'opacity 0.4s',
              }}>{animatedConf}% CONFIDENCE</div>
            </>
          )}
          {isAnimal && (
            <>
              <div style={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700,
                fontStyle: 'italic',
                fontSize: 64,
                color: COLORS.accent,
                lineHeight: 1,
                textShadow: '0 2px 24px rgba(0,0,0,0.85)',
              }}>{typedLabel}{!labelDone && <Caret />}</div>
              <div style={{
                fontSize: 12,
                color: COLORS.muted,
                letterSpacing: 2,
                marginTop: 12,
                fontFamily: '"IBM Plex Mono", monospace',
                opacity: labelDone ? 1 : 0,
                transition: 'opacity 0.4s',
              }}>UNEXPECTED MATCH · {animatedConf}%</div>
            </>
          )}
          {isNone && (
            <>
              <div style={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 700,
                fontStyle: 'italic',
                fontSize: 52,
                color: COLORS.text,
                lineHeight: 1.1,
                textShadow: '0 2px 24px rgba(0,0,0,0.85)',
                minHeight: 58,
              }}>{typedLabel}{!labelDone && <Caret />}</div>
              <div style={{
                fontSize: 12,
                color: COLORS.muted,
                letterSpacing: 1.5,
                marginTop: 16,
                fontFamily: '"IBM Plex Mono", monospace',
                opacity: labelDone ? 1 : 0,
                transition: 'opacity 0.4s',
              }}>{result.subtitle}</div>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 4 }}>
        <ActionBtn primary onClick={onReset}>SCAN AGAIN</ActionBtn>
        <ActionBtn onClick={onShare}>SHARE CARD</ActionBtn>
      </div>
    </div>
  );
}

function Caret() {
  return (
    <span style={{
      display: 'inline-block',
      width: '0.45ch',
      marginLeft: 4,
      animation: 'wmd-caret 0.9s steps(2) infinite',
    }}>
      <style>{`
        @keyframes wmd-caret {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0; }
        }
      `}</style>
      _
    </span>
  );
}

function SharePreview({ url, onConfirm, onCancel }) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 24,
        gap: 20,
      }}
    >
      <div style={{
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: 10,
        letterSpacing: 3,
        color: COLORS.muted,
      }}>PREVIEW · SHARE CARD</div>
      <img
        src={url}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '100%',
          maxHeight: '70vh',
          borderRadius: 4,
          boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
        }}
        alt=""
      />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <ActionBtn primary onClick={onConfirm}>SHARE</ActionBtn>
        <ActionBtn onClick={onCancel}>CANCEL</ActionBtn>
      </div>
    </div>
  );
}

function ActionBtn({ primary, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: primary ? COLORS.primary : 'transparent',
        color: primary ? '#000' : COLORS.text,
        border: `1px solid ${primary ? COLORS.primary : COLORS.muted}`,
        padding: '12px 20px',
        fontFamily: '"IBM Plex Mono", monospace',
        fontWeight: 700,
        fontSize: 12,
        letterSpacing: 2,
        cursor: 'pointer',
        borderRadius: 2,
      }}
    >{children}</button>
  );
}

function FieldLog({ log, onClear }) {
  return (
    <div style={{ flex: 1, padding: 16 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <div>
          <div style={{
            fontFamily: '"Barlow Condensed", sans-serif',
            fontWeight: 800,
            fontSize: 28,
            letterSpacing: 2,
            lineHeight: 1,
          }}>FIELD LOG</div>
          <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1.5, marginTop: 4 }}>
            LAST {log.length} SCAN{log.length === 1 ? '' : 'S'}
          </div>
        </div>
        {log.length > 0 && (
          <button
            onClick={onClear}
            style={{
              background: 'transparent',
              color: COLORS.red,
              border: `1px solid ${COLORS.red}55`,
              padding: '8px 12px',
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 10,
              letterSpacing: 1.5,
              cursor: 'pointer',
              borderRadius: 2,
            }}
          >CLEAR</button>
        )}
      </div>
      {log.length === 0 ? (
        <div style={{
          textAlign: 'center',
          color: COLORS.muted,
          padding: 60,
          fontStyle: 'italic',
          fontFamily: '"Playfair Display", serif',
          fontSize: 20,
        }}>
          No scans yet. The dog awaits.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {log.map((entry) => (
            <LogEntry key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

function LogEntry({ entry }) {
  const labelColor =
    entry.verdict === 'dog' ? COLORS.green :
    entry.verdict === 'animal' ? COLORS.accent :
    COLORS.text;
  const isDog = entry.verdict === 'dog';
  return (
    <div style={{
      display: 'flex',
      gap: 12,
      padding: 8,
      background: COLORS.surface,
      borderRadius: 4,
      alignItems: 'center',
    }}>
      <img
        src={entry.photo}
        style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }}
        alt=""
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: isDog ? '"Barlow Condensed", sans-serif' : '"Playfair Display", serif',
          fontWeight: isDog ? 800 : 700,
          fontStyle: isDog ? 'normal' : 'italic',
          fontSize: 18,
          color: labelColor,
          letterSpacing: isDog ? 1.5 : 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          lineHeight: 1.1,
        }}>
          {isDog ? entry.label.toUpperCase() : entry.label}
        </div>
        <div style={{ fontSize: 10, color: COLORS.muted, letterSpacing: 1, marginTop: 4 }}>
          {entry.confidence != null ? `${entry.confidence}% · ` : ''}
          {new Date(entry.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
