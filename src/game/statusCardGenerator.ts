import QRCode from 'qrcode';
import {
  CHARACTER_OPTIONS,
  PLAY_URL,
  PLAY_URL_DISPLAY,
  RIDE_OPTIONS,
  formatLoveOfHeartMessage,
  type SessionSummary,
} from './types';

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawMiniHeart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  fill: string,
  stroke?: string
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(0, r * 0.78);
  ctx.bezierCurveTo(-r * 1.35, r * 0.02, -r * 0.85, -r * 1.08, 0, -r * 0.34);
  ctx.bezierCurveTo(r * 0.85, -r * 1.08, r * 1.35, r * 0.02, 0, r * 0.78);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = Math.max(1.5, r * 0.14);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCardFiligree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  flipX: number,
  flipY: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flipX, flipY);
  ctx.strokeStyle = '#f4c668';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(6, 78);
  ctx.bezierCurveTo(6, 36, 12, 18, 30, 10);
  ctx.bezierCurveTo(44, 4, 62, 6, 78, 6);
  ctx.stroke();

  ctx.fillStyle = '#ffe49e';
  ctx.beginPath();
  ctx.arc(14, 14, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPortraitMedallion(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  cx: number,
  cy: number,
  radius: number,
  label: string,
  highlight: boolean
) {
  ctx.save();
  if (highlight) {
    const glow = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 1.35);
    glow.addColorStop(0, 'rgba(255, 224, 138, 0.45)');
    glow.addColorStop(1, 'rgba(255, 224, 138, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.save();
  ctx.clip();

  if (img) {
    const aspect = img.width / img.height;
    const drawSize = radius * 2;
    if (aspect >= 1) {
      const w = drawSize * aspect;
      ctx.drawImage(img, cx - w / 2, cy - radius, w, drawSize);
    } else {
      const h = drawSize / aspect;
      ctx.drawImage(img, cx - radius, cy - radius * 0.9, drawSize, h);
    }
  } else {
    ctx.fillStyle = '#380b1a';
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  }
  ctx.restore();

  // Gold Ring Frame
  ctx.strokeStyle = highlight ? '#ffe49e' : '#d49a34';
  ctx.lineWidth = highlight ? 7 : 5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Label pill below portrait
  ctx.fillStyle = '#5a0e24';
  ctx.strokeStyle = '#f4c668';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(cx - 82, cy + radius - 18, 164, 42, 21);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffe8ad';
  ctx.font = '700 22px "Cinzel", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cx, cy + radius + 3);
  ctx.restore();
}

function wrapCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  startY: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  lines.forEach((line, idx) => {
    ctx.fillText(line, cx, startY + idx * lineHeight);
  });
}

async function generateQrImage(): Promise<HTMLImageElement | null> {
  try {
    const qrDataUrl = await QRCode.toDataURL(PLAY_URL, {
      width: 140,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#280b14',
        light: '#fffaf0',
      },
    });
    return await loadImage(qrDataUrl);
  } catch {
    return null;
  }
}

export async function generateStatusCardImage(summary: SessionSummary): Promise<{
  dataUrl: string;
  blob: Blob | null;
}> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { dataUrl: '', blob: null };
  }

  // Wait for custom fonts if ready
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  const groomOpt = CHARACTER_OPTIONS.find((c) => c.id === 'groom')!;
  const brideOpt = CHARACTER_OPTIONS.find((c) => c.id === 'bride')!;
  const rideOpt = RIDE_OPTIONS.find((r) => r.id === summary.ride) ?? RIDE_OPTIONS[0];

  const [groomImg, brideImg, qrImg] = await Promise.all([
    loadImage(groomOpt.portraitSrc),
    loadImage(brideOpt.portraitSrc),
    generateQrImage(),
  ]);

  // 1. Deep Royal Maroon Background with Warm Golden Glow
  const bgGrad = ctx.createRadialGradient(W / 2, H * 0.36, 40, W / 2, H * 0.45, W * 0.78);
  bgGrad.addColorStop(0, '#5a1127');
  bgGrad.addColorStop(0.55, '#250711');
  bgGrad.addColorStop(1, '#120308');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Subtle geometric lattice
  ctx.save();
  ctx.strokeStyle = 'rgba(244, 198, 104, 0.045)';
  ctx.lineWidth = 1.5;
  for (let i = -H; i < W + H; i += 44) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + H, H);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i, H);
    ctx.lineTo(i + H, 0);
    ctx.stroke();
  }
  ctx.restore();

  // Scattered festive sparkles & mini hearts
  for (let i = 0; i < 28; i++) {
    const sx = ((i * 197 + 80) % (W - 140)) + 70;
    const sy = ((i * 263 + 110) % (H - 220)) + 110;
    if (i % 4 === 0) {
      drawMiniHeart(ctx, sx, sy, 9, 'rgba(225, 29, 72, 0.35)', 'rgba(255, 224, 138, 0.4)');
    } else {
      ctx.fillStyle = 'rgba(255, 224, 138, 0.45)';
      ctx.beginPath();
      ctx.arc(sx, sy, (i % 3) + 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 2. Ornate Double Gold Border Frame + Corner Filigrees
  ctx.strokeStyle = '#c8922f';
  ctx.lineWidth = 6;
  ctx.strokeRect(34, 34, W - 68, H - 68);
  ctx.strokeStyle = 'rgba(255, 224, 138, 0.55)';
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 50, W - 100, H - 100);

  drawCardFiligree(ctx, 56, 56, 1, 1);
  drawCardFiligree(ctx, W - 56, 56, -1, 1);
  drawCardFiligree(ctx, 56, H - 56, 1, -1);
  drawCardFiligree(ctx, W - 56, H - 56, -1, -1);

  // 3. Top Royal Crest & Title
  ctx.fillStyle = '#5e0d24';
  ctx.strokeStyle = '#f4c668';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(W / 2 - 220, 84, 440, 50, 25);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffe8ad';
  ctx.font = '700 22px "Cinzel", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ROYAL MANDAP BLESSING', W / 2, 109);

  const titleGrad = ctx.createLinearGradient(0, 158, 0, 232);
  titleGrad.addColorStop(0, '#fff5cc');
  titleGrad.addColorStop(0.5, '#f4c668');
  titleGrad.addColorStop(1, '#c88c24');
  ctx.fillStyle = titleGrad;
  ctx.font = '800 72px "Cinzel", Georgia, serif';
  ctx.fillText('SOULMATE', W / 2, 200);

  const trimmedName = summary.playerName.trim();
  const journeySubtitle = trimmedName
    ? `${trimmedName}'s Journey Completed on ${rideOpt.name}`
    : `Journey Completed on ${rideOpt.name}`;

  ctx.fillStyle = '#f2d6a0';
  ctx.font = 'italic 25px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(journeySubtitle, W / 2, 256);

  // 4. Couple Portraits Connected by Glowing Heart
  const portraitY = 430;
  drawPortraitMedallion(
    ctx,
    groomImg,
    W / 2 - 195,
    portraitY,
    122,
    'GROOM',
    summary.character === 'groom'
  );
  drawPortraitMedallion(
    ctx,
    brideImg,
    W / 2 + 195,
    portraitY,
    122,
    'BRIDE',
    summary.character === 'bride'
  );

  // Center Heart & Varmala Connection
  drawMiniHeart(ctx, W / 2, portraitY, 34, '#e11d48', '#ffe49e');

  // 5. Score of Hearts Medallion Panel
  ctx.save();
  const panelGrad = ctx.createLinearGradient(0, 620, 0, 816);
  panelGrad.addColorStop(0, 'rgba(90, 14, 36, 0.92)');
  panelGrad.addColorStop(1, 'rgba(38, 6, 16, 0.96)');
  ctx.fillStyle = panelGrad;
  ctx.strokeStyle = '#f4c668';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(110, 622, W - 220, 194, 24);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f5dfb0';
  ctx.font = '700 26px "Cinzel", Georgia, serif';
  ctx.fillText('SCORE OF HEARTS', W / 2, 668);

  const scoreStr = summary.score.toLocaleString('en-US');
  ctx.font = '700 78px "JetBrains Mono", monospace';
  const scoreTextW = ctx.measureText(scoreStr).width;
  const heartR = 27;
  const heartBoxW = heartR * 2.2;
  const iconGap = 18;
  const totalScoreW = heartBoxW + iconGap + scoreTextW;
  const scoreGroupX = W / 2 - totalScoreW / 2;

  drawMiniHeart(ctx, scoreGroupX + heartBoxW / 2, 738, heartR, '#e11d48', '#ffe49e');

  ctx.fillStyle = '#ffe49e';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(scoreStr, scoreGroupX + heartBoxW + iconGap, 742);
  ctx.textAlign = 'center';

  ctx.fillStyle = '#f4c668';
  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `${summary.heartsCollected} / ${summary.totalHearts} Hearts Earned  ·  ${summary.chasmsCleared} Chasms Crossed`,
    W / 2,
    792
  );
  ctx.restore();

  // 6. Dynamic Pronoun-Aware Romantic Status Message
  const statusMessage = formatLoveOfHeartMessage(
    summary.playerName,
    summary.character,
    summary.score
  );

  ctx.save();
  ctx.fillStyle = '#fff3d1';
  ctx.font = '700 34px "Cinzel", Georgia, serif';
  wrapCenteredText(
    ctx,
    `“${statusMessage}”`,
    W / 2,
    884,
    W - 170,
    50
  );
  ctx.restore();

  // Decorative Gold Divider
  ctx.strokeStyle = 'rgba(244, 198, 104, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(170, 1034);
  ctx.lineTo(W - 170, 1034);
  ctx.stroke();
  drawMiniHeart(ctx, W / 2, 1034, 13, '#e11d48', '#ffe49e');

  // 7. Scannable QR Code + Play URL Footer Card
  ctx.save();
  const qrCardX = 110;
  const qrCardY = 1070;
  const qrCardW = W - 220;
  const qrCardH = 166;

  const qrPanelGrad = ctx.createLinearGradient(qrCardX, qrCardY, qrCardX + qrCardW, qrCardY);
  qrPanelGrad.addColorStop(0, 'rgba(65, 11, 28, 0.92)');
  qrPanelGrad.addColorStop(1, 'rgba(34, 6, 15, 0.95)');
  ctx.fillStyle = qrPanelGrad;
  ctx.strokeStyle = 'rgba(244, 198, 104, 0.72)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(qrCardX, qrCardY, qrCardW, qrCardH, 20);
  ctx.fill();
  ctx.stroke();

  // QR Box Frame
  const qrBoxSize = 136;
  const qrBoxX = qrCardX + 22;
  const qrBoxY = qrCardY + (qrCardH - qrBoxSize) / 2;
  ctx.fillStyle = '#fffaf0';
  ctx.strokeStyle = '#ffe08a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 12);
  ctx.fill();
  ctx.stroke();

  if (qrImg) {
    ctx.drawImage(qrImg, qrBoxX + 5, qrBoxY + 5, qrBoxSize - 10, qrBoxSize - 10);
  }

  // Right-side Callout Text
  const textX = qrBoxX + qrBoxSize + 30;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = '#ffe08a';
  ctx.font = '800 26px "Cinzel", Georgia, serif';
  ctx.fillText('SOULMATE — ROYAL BARAAT', textX, qrCardY + 42);

  ctx.fillStyle = '#f5dfb0';
  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Scan or Visit to Play:', textX, qrCardY + 86);

  ctx.fillStyle = '#ffe8ad';
  ctx.font = '700 27px "JetBrains Mono", monospace';
  ctx.fillText(PLAY_URL_DISPLAY, textX, qrCardY + 126);
  ctx.restore();

  // Subtle Bottom Branding
  ctx.fillStyle = '#d9b882';
  ctx.font = '600 19px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SnapZ — 50+ Free Online Tools  ·  www.snapz.co.in', W / 2, 1268);

  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png')
  );

  return { dataUrl, blob };
}
