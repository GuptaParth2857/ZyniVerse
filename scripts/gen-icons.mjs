import sharp from "sharp";

const SRC = "public/logo.png";
const ICON_DIR = "public/icons/";

const logo = sharp(SRC);

// "any" app icon — plain square logo (OS masks it anyway)
await logo.clone().resize(512, 512, { fit: "cover" }).png().toFile(ICON_DIR + "icon-512.png");
await logo.clone().resize(192, 192, { fit: "cover" }).png().toFile(ICON_DIR + "icon-192.png");

// Maskable — brand content kept inside the 80% safe zone, full-bleed black
// background so the opaque logo blends seamlessly. Also serves as a subtly
// padded "universal" icon.
const SAFE = 410;
const off = Math.round((512 - SAFE) / 2);
const logoSafe = await logo.clone().resize(SAFE, SAFE, { fit: "cover" }).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#000000" } })
  .composite([{ input: logoSafe, top: off, left: off }])
  .png()
  .toFile(ICON_DIR + "icon-512-maskable.png");

// Apple touch icon (no transparency)
await logo.clone().resize(180, 180, { fit: "cover" }).png().toFile(ICON_DIR + "apple-touch-icon.png");

console.log("ok");