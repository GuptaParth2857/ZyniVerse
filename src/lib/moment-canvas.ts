const CANVAS_W = 600;
const CANVAS_H = 800;

const PROXY = "/api/proxy-image?url=";

function proxyUrl(src: string): string {
  return `${PROXY}${encodeURIComponent(src)}`;
}

function loadImg(src: string, useProxy = true): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = useProxy ? proxyUrl(src) : src;
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export interface MomentData {
  quote: string;
  character: string;
  animeTitle: string;
  animeCover?: string | null;
  episode?: string | null;
  timestamp?: string | null;
  style?: string;
}

export async function generateMomentPng(data: MomentData): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W * 2;
  canvas.height = CANVAS_H * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(2, 2);

  const [coverImg, logoImg] = await Promise.all([
    data.animeCover ? loadImg(data.animeCover) : null,
    loadImg("/logo.png", false),
  ]);

  // BG
  if (coverImg) {
    ctx.drawImage(coverImg, 0, 0, CANVAS_W, CANVAS_H);
    const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
    g.addColorStop(0, "rgba(0,0,0,0.1)");
    g.addColorStop(0.35, "rgba(0,0,0,0.25)");
    g.addColorStop(0.7, "rgba(0,0,0,0.6)");
    g.addColorStop(1, "rgba(0,0,0,0.9)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  } else {
    const g = ctx.createLinearGradient(135, 0, CANVAS_W, CANVAS_H);
    g.addColorStop(0, "#0a0a1a");
    g.addColorStop(0.5, "#1a0a2e");
    g.addColorStop(1, "#0a0a1a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  // Subtle vignette
  const vig = ctx.createRadialGradient(CANVAS_W / 2, CANVAS_H / 2, CANVAS_H * 0.2, CANVAS_W / 2, CANVAS_H / 2, CANVAS_H * 0.8);
  vig.addColorStop(0, "transparent");
  vig.addColorStop(1, "rgba(0,0,0,0.3)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // Logo
  const logoSize = 40;
  const logoX = CANVAS_W - logoSize - 22;
  const logoY = 18;
  if (logoImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 1, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
    ctx.restore();
  } else {
    ctx.font = "bold 14px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.textAlign = "right";
    ctx.fillText("ZV", logoX + logoSize, logoY + 16);
  }

  // Quote mark
  ctx.textAlign = "center";
  ctx.font = "italic 72px Georgia, serif";
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillText("\u201C", CANVAS_W / 2, 300);

  // Quote
  ctx.font = "italic 24px Georgia, 'Times New Roman', serif";
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  let qLines = wrapText(ctx, data.quote || "Your quote here", CANVAS_W - 100);
  if (qLines.length > 4) {
    ctx.font = "italic 20px Georgia, 'Times New Roman', serif";
    qLines = wrapText(ctx, data.quote || "Your quote here", CANVAS_W - 100);
  }
  if (qLines.length > 6) {
    ctx.font = "italic 17px Georgia, 'Times New Roman', serif";
    qLines = wrapText(ctx, data.quote || "Your quote here", CANVAS_W - 100);
  }
  const lh = 34;
  const qH = qLines.length * lh;
  const qStart = (CANVAS_H - qH) / 2 - 20;
  for (let i = 0; i < qLines.length; i++) {
    ctx.fillText(qLines[i], CANVAS_W / 2, qStart + i * lh);
  }

  // Accent line
  const lineY = qStart + qH + 22;
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillRect(CANVAS_W / 2 - 30, lineY, 60, 1);

  // Character
  ctx.font = "bold 15px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText(`\u2014 ${data.character}`, CANVAS_W / 2, lineY + 28);

  // Meta pills
  const meta: string[] = [];
  if (data.animeTitle) meta.push(data.animeTitle);
  if (data.episode) meta.push(`Ep ${data.episode}`);
  if (data.timestamp) meta.push(data.timestamp);

  if (meta.length > 0) {
    ctx.font = "10px system-ui, sans-serif";
    const totalW = meta.reduce((s, t) => s + ctx.measureText(t).width, 0) + (meta.length - 1) * 8;
    let px = CANVAS_W / 2 - totalW / 2;
    const py = lineY + 52;

    for (const item of meta) {
      const tw = ctx.measureText(item).width;
      const pw = tw + 16;
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      roundRect(ctx, px, py, pw, 22, 11);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 0.5;
      roundRect(ctx, px, py, pw, 22, 11);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.textAlign = "center";
      ctx.fillText(item, px + pw / 2, py + 15);
      px += pw + 8;
    }
    ctx.textAlign = "center";
  }

  // Watermark
  const wmY = CANVAS_H - 32;
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  roundRect(ctx, CANVAS_W / 2 - 90, wmY - 7, 180, 20, 10);
  ctx.fill();
  ctx.font = "8px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillText("ZyniVerse \u2014 Anime for Everyone", CANVAS_W / 2, wmY + 5);

  ctx.textAlign = "start";

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png", 1);
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
