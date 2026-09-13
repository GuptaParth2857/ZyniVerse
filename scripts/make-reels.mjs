import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");
const ffmpegPath = require("ffmpeg-static");

const OUT = "C:/Users/PARTHG~1/AppData/Local/Temp/opencode/reels-seed";
mkdirSync(OUT, { recursive: true });
copyFileSync("C:/Windows/Fonts/impact.ttf", join(OUT, "impact.ttf"));
copyFileSync("C:/Windows/Fonts/arialbd.ttf", join(OUT, "arialbd.ttf"));

function runFfmpeg(args) {
  execFileSync(ffmpegPath, args, { cwd: OUT, stdio: ["ignore", "inherit", "inherit"] });
}

const REELS = [
  {
    key: "r1_naruto_ramen",
    top: "SASUKE BHAI RUKO!",
    bottom: "pehle ramen mera, arc bad me tera",
    art: `
<svg width="720" height="1280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff7a18"/><stop offset="0.55" stop-color="#ffb347"/><stop offset="1" stop-color="#ffe0a3"/>
    </linearGradient>
    <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#fffde7"/><stop offset="0.55" stop-color="#ffeb3b"/><stop offset="1" stop-color="#ff9800" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="720" height="1280" fill="url(#sky)"/>
  <circle cx="360" cy="300" r="230" fill="url(#sun)"/>
  <circle cx="360" cy="300" r="118" fill="none" stroke="#ff3d00" stroke-width="12" opacity="0.5"/>
  <circle cx="360" cy="300" r="152" fill="none" stroke="#ff3d00" stroke-width="9" opacity="0.35"/>
  <circle cx="360" cy="300" r="188" fill="none" stroke="#ffe082" stroke-width="6" opacity="0.5"/>
  <g fill="#fff" opacity="0.3">
    <polygon points="360,300 320,-40 400,-40"/><polygon points="360,300 40,80 120,120"/>
    <polygon points="360,300 680,80 600,120"/><polygon points="360,300 0,360 0,440"/>
    <polygon points="360,300 720,360 720,440"/>
  </g>
  <path d="M0 940 Q360 890 720 940 L720 1280 L0 1280 Z" fill="#4e3220"/>
  <path d="M0 906 Q360 856 720 906 L720 1280 L0 1280 Z" fill="#24150d"/>
  <path d="M300 1160 Q360 1090 420 1160 L420 1280 L300 1280 Z" fill="#3a2416"/>
  <g fill="#1a1009">
    <circle cx="360" cy="712" r="62"/>
    <path d="M360 768 Q300 800 300 930 L420 930 Q420 800 360 768 Z"/>
    <path d="M300 780 Q210 800 176 852" stroke="#1a1009" stroke-width="22" fill="none" stroke-linecap="round"/>
    <path d="M300 810 Q210 830 188 890" stroke="#1a1009" stroke-width="18" fill="none" stroke-linecap="round"/>
    <path d="M300 840 Q214 862 200 930" stroke="#1a1009" stroke-width="16" fill="none" stroke-linecap="round"/>
  </g>
  <g stroke="#ffeb3b" stroke-width="10" fill="none" opacity="0.95">
    <path d="M292 700 Q360 668 428 700"/>
    <path d="M292 718 Q360 740 428 718"/>
    <path d="M296 736 Q360 758 424 736"/>
    <rect x="322" y="664" width="76" height="16" rx="8" fill="#ffeb3b" stroke="none"/>
  </g>
  <g>
    <ellipse cx="360" cy="1000" rx="168" ry="46" fill="#f7f1e5"/>
    <path d="M192 1010 Q360 970 528 1010 L512 1040 Q360 1000 208 1040 Z" fill="#e8e0f0" opacity="0.35"/>
    <g stroke="#ffffff" fill="none" stroke-width="12" opacity="0.85" stroke-linecap="round">
      <path d="M240 932 Q260 884 300 860"/><path d="M300 928 Q318 870 356 838"/>
      <path d="M352 930 Q372 862 410 826"/>
    </g>
    <line x1="300" y1="1010" x2="452" y2="886" stroke="#8d6e63" stroke-width="10" stroke-linecap="round"/>
    <line x1="330" y1="1016" x2="478" y2="896" stroke="#8d6e63" stroke-width="10" stroke-linecap="round"/>
    <path d="M196 1000 Q240 954 300 950 Q268 980 258 1034 Z" fill="#fdd835"/>
  </g>
</svg>`,
  },
  {
    key: "r2_bleach_bankai",
    top: "BANKAI KHUL GAYA!",
    bottom: "zankuto se pyar ho gaya",
    art: `
<svg width="720" height="1280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="night" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0b1035"/><stop offset="0.55" stop-color="#2a1b5e"/><stop offset="1" stop-color="#7b2fe0"/>
    </linearGradient>
    <radialGradient id="mon" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#eef4ff"/><stop offset="0.8" stop-color="#c5d3ff"/><stop offset="1" stop-color="#aebfff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#9ff6ff" stop-opacity="0.55"/><stop offset="1" stop-color="#9ff6ff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="720" height="1280" fill="url(#night)"/>
  <circle cx="520" cy="420" r="240" fill="url(#mon)"/>
  <g fill="#dbe6ff" opacity="0.85">
    <circle cx="490" cy="360" r="30"/><circle cx="580" cy="470" r="42"/><circle cx="520" cy="520" r="20"/>
    <circle cx="430" cy="440" r="16"/><circle cx="610" cy="340" r="14"/>
  </g>
  <g fill="#fff" opacity="0.16">
    <circle cx="120" cy="200" r="2"/><circle cx="220" cy="140" r="3"/><circle cx="80" cy="420" r="2"/>
    <circle cx="300" cy="260" r="2"/><circle cx="180" cy="620" r="3"/><circle cx="640" cy="180" r="2"/>
    <circle cx="660" cy="640" r="2"/><circle cx="40" cy="760" r="2"/>
  </g>
  <path d="M0 980 Q360 940 720 980 L720 1280 L0 1280 Z" fill="#0d0930"/>
  <g fill="#0d0930">
    <circle cx="360" cy="830" r="84"/>
    <path d="M360 900 Q300 960 288 1160 L432 1160 Q420 960 360 900 Z"/>
  </g>
  <path d="M360 880 Q240 900 208 1010 M360 880 Q480 900 512 1010" stroke="#0d0930" stroke-width="26" fill="none" stroke-linecap="round"/>
  <path d="M360 790 Q120 840 40 940 M360 790 Q600 840 680 940" stroke="#0d0930" stroke-width="18" fill="none" stroke-linecap="round"/>
  <circle cx="360" cy="830" r="110" fill="url(#glow)"/>
  <line x1="360" y1="300" x2="360" y2="1100" stroke="#b3fbff" stroke-width="34" stroke-linecap="round" opacity="0.9"/>
  <line x1="360" y1="300" x2="360" y2="1100" stroke="#ffffff" stroke-width="16" stroke-linecap="round"/>
  <line x1="330" y1="460" x2="390" y2="460" stroke="#0d0930" stroke-width="34"/>
  <line x1="330" y1="910" x2="390" y2="910" stroke="#2a1b5e" stroke-width="26"/>
  <polygon points="330,380 390,380 360,452" fill="#2a1b5e"/>
</svg>`,
  },
  {
    key: "r3_exam_meme",
    top: "PAPER: 99% AAYA",
    bottom: "1% ATTENDANCE NE 100 BANA DIYA",
    art: `
<svg width="720" height="1280" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="board" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2e7d32"/><stop offset="1" stop-color="#1b5e20"/>
    </linearGradient>
  </defs>
  <rect width="720" height="1280" fill="#5d4037"/>
  <rect x="28" y="28" width="664" height="1184" rx="14" fill="#4e342e"/>
  <rect x="52" y="52" width="616" height="1136" rx="8" fill="url(#board)"/>
  <g stroke="#fff" stroke-width="8" fill="none" opacity="0.9">
    <path d="M120 260 L360 760 L540 320"/>
    <circle cx="560" cy="240" r="70"/>
    <path d="M640 140 L560 260"/>
    <path d="M200 560 L280 500 M280 500 L360 560 M360 560 L440 500"/>
    <path d="M120 820 Q180 800 240 820 L240 920 L120 920 Z"/>
    <rect x="300" y="820" width="60" height="100"/>
    <circle cx="330" cy="795" r="26"/>
  </g>
  <g stroke="#fff" stroke-width="10" fill="none" opacity="0.55">
    <path d="M520 920 Q560 960 520 1000 Q560 1040 520 1080"/>
    <path d="M580 900 Q620 940 580 980 Q620 1020 580 1060"/>
  </g>
  <path d="M0 1120 L720 1120 L720 1280 L0 1280 Z" fill="#3e2723"/>
  <path d="M200 1130 Q360 1080 520 1130 L720 1200 L720 1280 L0 1280 L0 1220 Z" fill="#2c1a12"/>
  <ellipse cx="292" cy="1220" rx="150" ry="40" fill="#4a342a" opacity="0.6"/>
  <polygon points="520,1150 620,1160 560,1290 460,1290" fill="#5d4037" opacity="0.7"/>
</svg>`,
  },
];

for (const [idx, reel] of REELS.entries()) {
  const png = join(OUT, `${reel.key}.png`);
  writeFileSync(png, await sharp(Buffer.from(reel.art)).resize(720, 1280).png().toBuffer());

  const tTop = join(OUT, `${reel.key}_t.txt`);
  const tBot = join(OUT, `${reel.key}_b.txt`);
  writeFileSync(tTop, reel.top);
  writeFileSync(tBot, reel.bottom);

  const imp = "impact.ttf";
  const ari = "arialbd.ttf";
  const tfT = `${reel.key}_t.txt`;
  const tfB = `${reel.key}_b.txt`;

  const vf =
    `zoompan=z='min(1+0.0011*on,1.13)':x='iw/2-(iw/zoom)/2':y='ih/2-(ih/zoom)/2':d=168:s=720x1280:fps=24,` +
    `drawtext=fontfile=${imp}:textfile=${tfT}:fontsize=66:fontcolor=white:borderw=10:bordercolor=black@0.95` +
    `:x=(w-text_w)/2:y=150:enable='gte(t,0.4)':alpha='min(1,(t-0.4)*2)',` +
    `drawtext=fontfile=${ari}:textfile=${tfB}:fontsize=48:fontcolor=#ffd54f:borderw=8:bordercolor=black@0.95` +
    `:x=(w-text_w)/2:y=1040:enable='gte(t,1.2)':alpha='min(1,(t-1.2)*2)'`;

  const mp4 = `${reel.key}.mp4`;
  runFfmpeg([
    "-y", "-i", png, "-vf", vf,
    "-c:v", "libx264", "-preset", "medium", "-crf", "23",
    "-pix_fmt", "yuv420p", "-r", "24", "-movflags", "+faststart", "-an", mp4,
  ]);
  const thumb = `${idx + 1}_thumb.jpg`;
  runFfmpeg(["-y", "-ss", "2", "-i", mp4, "-frames:v", "1", "-q:v", "4", thumb]);
  const len = require("node:fs").statSync(join(OUT, mp4)).size;
  console.log(`OK reel${idx + 1}: ${reel.key}.mp4 (${(len / 1048576).toFixed(2)}MB)`);
}

console.log("done -> " + OUT);