import type {
  FireworkRocket,
  FloatingText,
  ChasmGap,
  HeartCollectible,
  Particle,
} from './types';

interface Star {
  xFrac: number;
  yFrac: number;
  radius: number;
  twinkleOffset: number;
}

const STARS: Star[] = Array.from({ length: 36 }, (_, i) => ({
  xFrac: ((i * 73 + 19) % 100) / 100,
  yFrac: ((i * 41 + 7) % 48) / 100,
  radius: (i % 3) * 0.6 + 0.7,
  twinkleOffset: i * 1.1,
}));

export function drawParallaxSkyAndPalace(
  ctx: CanvasRenderingContext2D,
  width: number,
  groundY: number,
  distance: number,
  animTime: number
): void {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
  skyGrad.addColorStop(0, '#13040a');
  skyGrad.addColorStop(0.45, '#260914');
  skyGrad.addColorStop(0.85, '#411020');
  skyGrad.addColorStop(1, '#5d182b');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, groundY);

  const horizonGlow = ctx.createRadialGradient(
    width * 0.65,
    groundY * 0.72,
    10,
    width * 0.65,
    groundY * 0.72,
    width * 0.65
  );
  horizonGlow.addColorStop(0, 'rgba(244, 198, 104, 0.22)');
  horizonGlow.addColorStop(0.55, 'rgba(185, 36, 68, 0.14)');
  horizonGlow.addColorStop(1, 'rgba(24, 5, 11, 0)');
  ctx.fillStyle = horizonGlow;
  ctx.fillRect(0, 0, width, groundY);

  STARS.forEach((star) => {
    const twinkle = 0.4 + 0.6 * Math.sin(animTime * 2.4 + star.twinkleOffset);
    ctx.fillStyle = `rgba(255, 232, 168, ${0.28 + twinkle * 0.65})`;
    ctx.beginPath();
    ctx.arc(star.xFrac * width, star.yFrac * groundY, star.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  // Crescent Moon
  const moonX = width * 0.82;
  const moonY = groundY * 0.18;
  ctx.save();
  const moonGlow = ctx.createRadialGradient(moonX, moonY, 6, moonX, moonY, 44);
  moonGlow.addColorStop(0, 'rgba(255, 236, 178, 0.35)');
  moonGlow.addColorStop(1, 'rgba(255, 236, 178, 0)');
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 44, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffe9b0';
  ctx.beginPath();
  ctx.arc(moonX, moonY, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1d060f';
  ctx.beginPath();
  ctx.arc(moonX + 6, moonY - 4, 13.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Distant Palace Silhouette
  const farSegmentW = 240;
  const farOffset = (distance * 0.12) % farSegmentW;
  ctx.save();
  for (let sx = -farOffset - farSegmentW; sx < width + farSegmentW; sx += farSegmentW) {
    const baseY = groundY;
    ctx.fillStyle = '#2d0a16';
    ctx.fillRect(sx, baseY - 108, farSegmentW + 1, 108);

    ctx.beginPath();
    ctx.moveTo(sx + 76, baseY - 108);
    ctx.bezierCurveTo(sx + 72, baseY - 144, sx + 120, baseY - 156, sx + 120, baseY - 172);
    ctx.bezierCurveTo(sx + 120, baseY - 156, sx + 168, baseY - 144, sx + 164, baseY - 108);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#b9832c';
    ctx.fillRect(sx + 119, baseY - 186, 2, 16);

    ctx.fillStyle = '#2d0a16';
    for (const cx of [sx + 32, sx + 208]) {
      ctx.fillRect(cx - 12, baseY - 132, 24, 24);
      ctx.beginPath();
      ctx.moveTo(cx - 16, baseY - 132);
      ctx.quadraticCurveTo(cx, baseY - 154, cx + 16, baseY - 132);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(255, 206, 112, 0.36)';
    for (const wx of [sx + 30, sx + 96, sx + 116, sx + 136, sx + 206]) {
      ctx.beginPath();
      ctx.arc(wx + 4, baseY - 82, 4, Math.PI, 0);
      ctx.lineTo(wx + 8, baseY - 70);
      ctx.lineTo(wx, baseY - 70);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();

  // Midground Palace Arches & Lanterns
  const archW = 168;
  const archOffset = (distance * 0.38) % archW;
  const archTop = Math.max(24, groundY - 152);
  ctx.save();

  for (let ax = -archOffset - archW; ax < width + archW; ax += archW) {
    const pillarGrad = ctx.createLinearGradient(ax, 0, ax + 22, 0);
    pillarGrad.addColorStop(0, '#360b19');
    pillarGrad.addColorStop(0.5, '#541428');
    pillarGrad.addColorStop(1, '#260711');
    ctx.fillStyle = pillarGrad;
    ctx.fillRect(ax, archTop, 22, groundY - archTop);

    ctx.fillStyle = '#c89234';
    ctx.fillRect(ax - 2, archTop + 26, 26, 4);
    ctx.fillRect(ax - 2, groundY - 26, 26, 5);

    ctx.fillStyle = '#290814';
    ctx.beginPath();
    ctx.moveTo(ax + 20, archTop);
    ctx.lineTo(ax + archW + 2, archTop);
    ctx.lineTo(ax + archW + 2, archTop + 56);
    ctx.quadraticCurveTo(ax + archW * 0.72, archTop + 16, ax + archW * 0.5 + 10, archTop + 14);
    ctx.quadraticCurveTo(ax + archW * 0.28, archTop + 16, ax + 20, archTop + 56);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(244, 198, 104, 0.55)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(ax + 20, archTop + 56);
    ctx.quadraticCurveTo(ax + archW * 0.5 + 10, archTop + 4, ax + archW, archTop + 56);
    ctx.stroke();

    ctx.strokeStyle = '#e87a1e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(ax + 22, archTop + 46);
    ctx.quadraticCurveTo(ax + archW * 0.5 + 10, archTop + 68, ax + archW, archTop + 46);
    ctx.stroke();

    for (let m = 0; m <= 5; m++) {
      const t = m / 5;
      const mx = ax + 22 + t * (archW - 22);
      const my = archTop + 46 + Math.sin(t * Math.PI) * 14;
      ctx.fillStyle = m % 2 === 0 ? '#ff9d2e' : '#ffd24c';
      ctx.beginPath();
      ctx.arc(mx, my, 3.6, 0, Math.PI * 2);
      ctx.fill();
    }

    const lx = ax + archW * 0.5 + 11;
    const lanternSway = Math.sin(animTime * 2.1 + ax * 0.02) * 2.5;
    const ly = archTop + 56;
    ctx.strokeStyle = '#c89234';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(lx, archTop + 18);
    ctx.lineTo(lx + lanternSway, ly);
    ctx.stroke();

    const flicker = 0.8 + 0.2 * Math.sin(animTime * 8 + ax);
    const lGlow = ctx.createRadialGradient(lx + lanternSway, ly + 8, 2, lx + lanternSway, ly + 8, 26);
    lGlow.addColorStop(0, `rgba(255, 224, 128, ${0.55 * flicker})`);
    lGlow.addColorStop(1, 'rgba(255, 180, 64, 0)');
    ctx.fillStyle = lGlow;
    ctx.beginPath();
    ctx.arc(lx + lanternSway, ly + 8, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffe596';
    ctx.beginPath();
    ctx.ellipse(lx + lanternSway, ly + 8, 4.5, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b97b1e';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    const dx = ax + 11;
    const dy = groundY - 30;
    const dGlow = ctx.createRadialGradient(dx, dy - 4, 1, dx, dy - 4, 18);
    dGlow.addColorStop(0, `rgba(255, 210, 100, ${0.65 * flicker})`);
    dGlow.addColorStop(1, 'rgba(255, 160, 40, 0)');
    ctx.fillStyle = dGlow;
    ctx.beginPath();
    ctx.arc(dx, dy - 4, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd966';
    ctx.beginPath();
    ctx.ellipse(dx, dy - 4, 2.5, 4.5 * flicker, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a85224';
    ctx.beginPath();
    ctx.arc(dx, dy, 5, 0, Math.PI);
    ctx.fill();
  }
  ctx.restore();
}

function drawSolidBridgeSegment(
  ctx: CanvasRenderingContext2D,
  segX: number,
  segW: number,
  height: number,
  groundY: number,
  distance: number
) {
  if (segW <= 0) return;
  const carpetH = height - groundY;

  ctx.save();
  ctx.beginPath();
  ctx.rect(segX, groundY - 4, segW, carpetH + 6);
  ctx.clip();

  const floorGrad = ctx.createLinearGradient(0, groundY, 0, height);
  floorGrad.addColorStop(0, '#720f28');
  floorGrad.addColorStop(0.28, '#4c091a');
  floorGrad.addColorStop(1, '#1d030a');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(segX, groundY, segW, carpetH);

  const railGrad = ctx.createLinearGradient(0, groundY - 3, 0, groundY + 7);
  railGrad.addColorStop(0, '#ffe49e');
  railGrad.addColorStop(0.5, '#d4962c');
  railGrad.addColorStop(1, '#85530d');
  ctx.fillStyle = railGrad;
  ctx.fillRect(segX, groundY - 2, segW, 6);

  const tileW = 56;
  const offset = distance % tileW;
  const startTile = Math.floor((segX + offset) / tileW) * tileW - offset - tileW;
  ctx.strokeStyle = 'rgba(244, 198, 104, 0.36)';
  ctx.lineWidth = 1.6;
  for (let cx = startTile; cx < segX + segW + tileW; cx += tileW) {
    const cy = groundY + Math.min(26, carpetH * 0.45);
    ctx.beginPath();
    ctx.moveTo(cx, cy - 9);
    ctx.lineTo(cx + 14, cy);
    ctx.lineTo(cx, cy + 9);
    ctx.lineTo(cx - 14, cy);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 224, 138, 0.25)';
    ctx.beginPath();
    ctx.arc(cx, cy, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  if (carpetH > 38) {
    ctx.fillStyle = 'rgba(244, 198, 104, 0.42)';
    ctx.fillRect(segX, groundY + Math.min(44, carpetH - 12), segW, 2);
  }
  ctx.restore();
}

function drawChasm(
  ctx: CanvasRenderingContext2D,
  gap: ChasmGap,
  height: number,
  groundY: number,
  animTime: number
) {
  const { x, width } = gap;
  const depth = height - groundY;

  ctx.save();

  // Deep Twilight Valley Void inside the Chasm
  const chasmGrad = ctx.createLinearGradient(0, groundY - 2, 0, height);
  chasmGrad.addColorStop(0, '#14040a');
  chasmGrad.addColorStop(0.45, '#090205');
  chasmGrad.addColorStop(1, '#1d0a12');
  ctx.fillStyle = chasmGrad;
  ctx.fillRect(x, groundY - 2, width, depth + 4);

  // Subtle swirling golden-rose valley mist at the bottom of the Chasm
  const mistGlow = ctx.createRadialGradient(
    x + width * 0.5,
    height + 8,
    6,
    x + width * 0.5,
    height + 8,
    width * 0.72
  );
  mistGlow.addColorStop(0, 'rgba(244, 198, 104, 0.28)');
  mistGlow.addColorStop(0.55, 'rgba(185, 36, 68, 0.16)');
  mistGlow.addColorStop(1, 'rgba(12, 2, 6, 0)');
  ctx.fillStyle = mistGlow;
  ctx.fillRect(x, groundY, width, depth);

  // Rugged Cliff Edge Walls on Left & Right of the Chasm
  ctx.fillStyle = '#3d101f';
  ctx.beginPath();
  ctx.moveTo(x - 4, groundY - 2);
  ctx.lineTo(x + 10, groundY + 12);
  ctx.lineTo(x + 5, groundY + 34);
  ctx.lineTo(x + 14, height);
  ctx.lineTo(x - 6, height);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + width + 4, groundY - 2);
  ctx.lineTo(x + width - 10, groundY + 12);
  ctx.lineTo(x + width - 5, groundY + 34);
  ctx.lineTo(x + width - 14, height);
  ctx.lineTo(x + width + 6, height);
  ctx.closePath();
  ctx.fill();

  // Ornate Stone & Gold Bridge Edge Pillars (clear jump timing markers!)
  const flicker = 0.8 + 0.2 * Math.sin(animTime * 9 + gap.id);
  for (const px of [x - 5, x + width + 5]) {
    ctx.fillStyle = '#5c152b';
    ctx.fillRect(px - 4, groundY - 14, 8, 14);
    ctx.fillStyle = '#f4c668';
    ctx.fillRect(px - 5, groundY - 15, 10, 3);

    // Warning diya flame atop pillar
    const fGlow = ctx.createRadialGradient(px, groundY - 19, 1, px, groundY - 19, 14);
    fGlow.addColorStop(0, `rgba(255, 224, 128, ${0.75 * flicker})`);
    fGlow.addColorStop(1, 'rgba(255, 160, 40, 0)');
    ctx.fillStyle = fGlow;
    ctx.beginPath();
    ctx.arc(px, groundY - 19, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffe596';
    ctx.beginPath();
    ctx.ellipse(px, groundY - 18, 2.5, 4.2 * flicker, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function drawRoyalPathWithChasms(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundY: number,
  distance: number,
  chasms: ChasmGap[],
  animTime: number
): void {
  const sorted = [...chasms].sort((a, b) => a.x - b.x);

  // Draw solid bridge segments between Chasm gaps
  let cursor = 0;
  for (const g of sorted) {
    if (g.x > cursor) {
      drawSolidBridgeSegment(ctx, cursor, g.x - cursor, height, groundY, distance);
    }
    cursor = Math.max(cursor, g.x + g.width);
  }
  if (cursor < width) {
    drawSolidBridgeSegment(ctx, cursor, width - cursor, height, groundY, distance);
  }

  // Draw Chasms & edge warning pillars
  for (const g of sorted) {
    drawChasm(ctx, g, height, groundY, animTime);
  }
}

export function drawHeartCollectible(
  ctx: CanvasRenderingContext2D,
  item: HeartCollectible,
  animTime: number
): void {
  if (item.collected) return;
  const bob = Math.sin(animTime * 4.5 + item.phase) * 5;
  const cx = item.x;
  const cy = item.y + bob;
  const r = item.radius;
  const pulse = 1 + Math.sin(animTime * 6 + item.phase) * 0.06;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(pulse, pulse);

  // Radiant golden-rose aura
  const halo = ctx.createRadialGradient(0, 0, 2, 0, 0, r * 2.1);
  halo.addColorStop(0, 'rgba(255, 196, 128, 0.55)');
  halo.addColorStop(0.5, 'rgba(225, 29, 72, 0.25)');
  halo.addColorStop(1, 'rgba(225, 29, 72, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, r * 2.1, 0, Math.PI * 2);
  ctx.fill();

  // Painterly Ruby-Crimson Heart Shape
  const heartGrad = ctx.createRadialGradient(-r * 0.25, -r * 0.3, 2, 0, 0, r * 1.2);
  heartGrad.addColorStop(0, '#ff8aa8');
  heartGrad.addColorStop(0.35, '#e11d48');
  heartGrad.addColorStop(1, '#7a0926');
  ctx.fillStyle = heartGrad;

  ctx.beginPath();
  ctx.moveTo(0, r * 0.78);
  ctx.bezierCurveTo(-r * 1.35, r * 0.02, -r * 0.85, -r * 1.08, 0, -r * 0.34);
  ctx.bezierCurveTo(r * 0.85, -r * 1.08, r * 1.35, r * 0.02, 0, r * 0.78);
  ctx.closePath();
  ctx.fill();

  // Antique gold heart border
  ctx.strokeStyle = '#ffe08a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Specular highlight glint
  ctx.fillStyle = 'rgba(255, 245, 220, 0.82)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.36, -r * 0.34, r * 0.18, r * 0.11, -0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawRoyalMandap(
  ctx: CanvasRenderingContext2D,
  mandapCenterX: number,
  groundY: number,
  animTime: number
): void {
  ctx.save();
  ctx.translate(mandapCenterX, groundY);

  // Warm sacred Mandap glow
  const glow = ctx.createRadialGradient(0, -85, 16, 0, -85, 165);
  glow.addColorStop(0, 'rgba(255, 218, 128, 0.42)');
  glow.addColorStop(0.6, 'rgba(190, 24, 60, 0.18)');
  glow.addColorStop(1, 'rgba(24, 5, 11, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, -85, 165, 0, Math.PI * 2);
  ctx.fill();

  // Raised Royal Mandap Platform & Steps
  const stepGrad = ctx.createLinearGradient(-96, -18, 96, 2);
  stepGrad.addColorStop(0, '#6a0e25');
  stepGrad.addColorStop(0.5, '#9d1739');
  stepGrad.addColorStop(1, '#580a1d');
  ctx.fillStyle = stepGrad;
  ctx.fillRect(-102, -10, 204, 12);
  ctx.fillRect(-84, -20, 168, 12);

  ctx.strokeStyle = '#ffe08a';
  ctx.lineWidth = 2;
  ctx.strokeRect(-102, -10, 204, 12);
  ctx.strokeRect(-84, -20, 168, 12);

  // Back Crimson Silk Backdrop Curtain
  const curtainGrad = ctx.createLinearGradient(0, -145, 0, -20);
  curtainGrad.addColorStop(0, '#5a091d');
  curtainGrad.addColorStop(1, '#9c1434');
  ctx.fillStyle = curtainGrad;
  ctx.fillRect(-72, -145, 144, 125);

  // Decorative Gold Mandala Halo behind the couple
  ctx.strokeStyle = 'rgba(255, 224, 138, 0.35)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, -78, 38, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -78, 48, 0, Math.PI * 2);
  ctx.stroke();

  // Four Carved Golden Mandap Pillars wrapped with Marigolds
  for (const px of [-74, -46, 46, 74]) {
    const pGrad = ctx.createLinearGradient(px - 4, 0, px + 4, 0);
    pGrad.addColorStop(0, '#9c6614');
    pGrad.addColorStop(0.5, '#ffe49e');
    pGrad.addColorStop(1, '#b57b1b');
    ctx.fillStyle = pGrad;
    ctx.fillRect(px - 4, -148, 8, 128);

    // Spiral marigold garland around outer pillars
    if (Math.abs(px) > 60) {
      for (let py = -140; py < -28; py += 16) {
        ctx.fillStyle = py % 32 === 0 ? '#ff941a' : '#e11d48';
        ctx.beginPath();
        ctx.arc(px, py, 4.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Sculpted Royal Golden Mandap Dome & Canopy
  const domeGrad = ctx.createLinearGradient(-88, -196, 88, -144);
  domeGrad.addColorStop(0, '#fff2c2');
  domeGrad.addColorStop(0.5, '#e2a335');
  domeGrad.addColorStop(1, '#8c5a10');
  ctx.fillStyle = domeGrad;
  ctx.beginPath();
  ctx.moveTo(-88, -146);
  ctx.quadraticCurveTo(0, -204, 88, -146);
  ctx.closePath();
  ctx.fill();

  // Golden Kalash Spire at Peak
  ctx.fillStyle = '#ffe8a8';
  ctx.beginPath();
  ctx.moveTo(-5, -176);
  ctx.lineTo(0, -198);
  ctx.lineTo(5, -176);
  ctx.closePath();
  ctx.fill();

  // Swag Floral Toran across Mandap Arch
  ctx.strokeStyle = '#ff9d2e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-74, -142);
  ctx.quadraticCurveTo(0, -118, 74, -142);
  ctx.stroke();

  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const fx = -70 + t * 140;
    const fy = -142 + Math.sin(t * Math.PI) * 14;
    ctx.fillStyle = i % 2 === 0 ? '#ffd23f' : '#e11d48';
    ctx.beginPath();
    ctx.arc(fx, fy, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Flickering Sacred Diyas on Mandap Steps
  const flicker = 0.85 + 0.15 * Math.sin(animTime * 10);
  for (const dx of [-88, 88]) {
    ctx.fillStyle = '#ffe08a';
    ctx.beginPath();
    ctx.ellipse(dx, -17, 3, 5 * flicker, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(dx, -12, 6, 0, Math.PI);
    ctx.fill();
  }

  ctx.restore();
}

export function drawFireworksAndParticles(
  ctx: CanvasRenderingContext2D,
  rockets: FireworkRocket[],
  particles: Particle[],
  popups: FloatingText[]
): void {
  // Ascending Firework Rockets
  for (const r of rockets) {
    if (r.exploded) continue;
    ctx.save();
    const grad = ctx.createLinearGradient(r.x, r.y, r.x, r.y + 18);
    grad.addColorStop(0, '#fff7cf');
    grad.addColorStop(0.5, r.color);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(r.x, r.y);
    ctx.lineTo(r.x, r.y + 18);
    ctx.stroke();
    ctx.restore();
  }

  // Particles (petals, golden sparks, and firework bursts)
  for (const p of particles) {
    const progress = p.life / p.maxLife;
    const alpha = Math.max(0, (1 - progress) * p.alpha);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;

    if (p.kind === 'petal') {
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.58, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.kind === 'firework') {
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.72, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  for (const ft of popups) {
    const progress = ft.life / ft.maxLife;
    const alpha = Math.max(0, 1 - progress);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '700 15px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#18050b';
    ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }
}
