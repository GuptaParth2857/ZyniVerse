/**
 * ZyniVerse mobile — launcher icon + splash generator.
 *
 * The previous `assets/icon.png` and `assets/splash.png` were solid-colour
 * placeholders (icon was 100% #C084FC, splash 100% #0A0A0F), so the published
 * APK showed a blank purple square as its launcher icon and a black screen
 * with an invisible logo as its splash.
 *
 * This script derives real assets from the web logo (`../logo.png`, a stacked
 * mark + wordmark in white on black):
 *
 *   assets/icon.png                     1024x1024, black plate (legacy icon)
 *   assets/adaptive-icon-foreground.png 1024x1024, transparent, safe-zone sized
 *   assets/splash.png                   1024x1024, transparent splash lockup
 *
 * Run with:  node scripts/generate-assets.js
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.resolve(ROOT, '..', 'logo.png');
const ASSETS = path.join(ROOT, 'assets');

const SIZE = 1024;
const PLATE = { r: 0x00, g: 0x00, b: 0x00 }; // icon plate, matches logo background
const THRESHOLD = 40; // luma below this is background, not artwork

/** Fraction of the canvas width the lockup should occupy. */
const FRACTIONS = {
  icon: 0.78, // legacy square icon — the plate is the icon, so go generous
  foreground: 0.52, // adaptive icons are masked to a circle: stay inside the 61% safe zone
  // Expo re-fits the splash bitmap ("contain" into its 384dp square), which
  // scales it down by ~0.69. 0.72 here lands the logo at ~50% of the bitmap.
  splash: 0.72,
};

function readPng(file) {
  return PNG.sync.read(fs.readFileSync(file));
}

function createPng(size) {
  const png = new PNG({ width: size, height: size });
  png.data.fill(0);
  return png;
}

function lumaAt(img, x, y) {
  const i = (y * img.width + x) * 4;
  return (
    0.2126 * img.data[i] + 0.7152 * img.data[i + 1] + 0.0722 * img.data[i + 2]
  );
}

/** Tight bounding box of the visible artwork, so scaling uses the real lockup. */
function artworkBounds(img) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      if (lumaAt(img, x, y) <= THRESHOLD) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) throw new Error('No artwork found in source logo');
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/**
 * Crop to the artwork and resample it into a `size`x`size` premultiplied-alpha
 * image. Premultiplying before the bilinear pass keeps the antialiased edge of
 * the white-on-transparent variants free of dark fringes.
 */
function normaliseArtwork(img) {
  const box = artworkBounds(img);
  const scale = SIZE / Math.max(box.width, box.height);
  const w = Math.max(1, Math.round(box.width * scale));
  const h = Math.max(1, Math.round(box.height * scale));

  const out = new PNG({ width: SIZE, height: SIZE });
  const offX = Math.round((SIZE - w) / 2);
  const offY = Math.round((SIZE - h) / 2);

  for (let y = 0; y < h; y++) {
    const sy = box.y + (y * box.height) / h;
    const y0 = Math.floor(sy);
    const fy = sy - y0;
    const y1 = Math.min(img.height - 1, y0 + 1);
    for (let x = 0; x < w; x++) {
      const sx = box.x + (x * box.width) / w;
      const x0 = Math.floor(sx);
      const fx = sx - x0;
      const x1 = Math.min(img.width - 1, x0 + 1);

      // Bilinear over premultiplied samples.
      let pr = 0;
      let pg = 0;
      let pb = 0;
      let pa = 0;
      for (const [px, py, weight] of [
        [x0, y0, (1 - fx) * (1 - fy)],
        [x1, y0, fx * (1 - fy)],
        [x0, y1, (1 - fx) * fy],
        [x1, y1, fx * fy],
      ]) {
        const i = (py * img.width + px) * 4;
        const alpha = lumaAt(img, px, py) / 255; // white art on black plate
        pr += img.data[i] * alpha * weight;
        pg += img.data[i + 1] * alpha * weight;
        pb += img.data[i + 2] * alpha * weight;
        pa += alpha * weight;
      }

      const oi = ((offY + y) * SIZE + (offX + x)) * 4;
      if (pa > 0.0001) {
        out.data[oi] = Math.min(255, Math.round(pr / pa));
        out.data[oi + 1] = Math.min(255, Math.round(pg / pa));
        out.data[oi + 2] = Math.min(255, Math.round(pb / pa));
      }
      out.data[oi + 3] = Math.min(255, Math.round(pa * 255));
    }
  }
  return { art: out, width: w, height: h };
}

/** Draw a centred, scaled copy of `art` over a canvas of `size` with `bg`. */
function compose(art, size, fraction, bg) {
  const png = createPng(size);
  const scale = fraction;
  const dstW = Math.round(size * scale);
  const dstH = Math.max(1, Math.round((art.height / art.width) * dstW));
  const offX = Math.round((size - dstW) / 2);
  const offY = Math.round((size - dstH) / 2);

  const br = bg ? bg.r : 0;
  const bgn = bg ? bg.g : 0;
  const bb = bg ? bg.b : 0;
  const baseA = bg ? 1 : 0;

  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      // Nearest sample of the normalised artwork, centred at the pixel centre.
      const sx = Math.min(art.width - 1, Math.floor(((x + 0.5) / dstW) * art.width));
      const sy = Math.min(art.height - 1, Math.floor(((y + 0.5) / dstH) * art.height));
      const si = (sy * art.width + sx) * 4;

      const a = Math.max(0, Math.min(1, art.data[si + 3] / 255));
      const inv = 1 - a;
      const outA = a + baseA * inv;
      const oi = ((offY + y) * size + (offX + x)) * 4;
      if (outA <= 0) continue;

      // Source-over composite onto the opaque plate, or straight copy when the
      // destination is transparent.
      png.data[oi] = Math.round((art.data[si] * a + br * baseA * inv) / outA);
      png.data[oi + 1] = Math.round((art.data[si + 1] * a + bgn * baseA * inv) / outA);
      png.data[oi + 2] = Math.round((art.data[si + 2] * a + bb * baseA * inv) / outA);
      png.data[oi + 3] = Math.round(outA * 255);
    }
  }
  return png;
}

function write(file, png) {
  fs.writeFileSync(file, PNG.sync.write(png));
  const { r, g, b } = dominant(png);
  const size = (fs.statSync(file).size / 1024).toFixed(1);
  console.log(
    `  ${path.relative(ROOT, file).padEnd(34)} ${png.width}x${png.height}  ${size.padStart(6)} KB  dominant #${hex(r, g, b)}`
  );
}

function dominant(png) {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3] < 20) continue;
    r += png.data[i];
    g += png.data[i + 1];
    b += png.data[i + 2];
    n++;
  }
  return n ? { r: r / n, g: g / n, b: b / n } : { r: 0, g: 0, b: 0 };
}

const hex = (r, g, b) =>
  [r, g, b]
    .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();

function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`Source logo not found: ${SOURCE}`);
    process.exit(1);
  }
  console.log(`Source: ${path.relative(process.cwd(), SOURCE)}`);
  const src = readPng(SOURCE);
  const box = artworkBounds(src);
  console.log(
    `Artwork: ${box.width}x${box.height} at (${box.x}, ${box.y}) of ${src.width}x${src.height}`
  );
  const { art } = normaliseArtwork(src);

  console.log('Generated:');
  write(path.join(ASSETS, 'icon.png'), compose(art, SIZE, FRACTIONS.icon, PLATE));
  write(
    path.join(ASSETS, 'adaptive-icon-foreground.png'),
    compose(art, SIZE, FRACTIONS.foreground, null)
  );
  write(path.join(ASSETS, 'splash.png'), compose(art, SIZE, FRACTIONS.splash, null));
}

main();
