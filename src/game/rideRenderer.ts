import type { CharacterId, RideId } from './types';

export interface RideRenderParams {
  ctx: CanvasRenderingContext2D;
  ride: RideId;
  character: CharacterId;
  x: number;
  y: number;
  vy: number;
  isGrounded: boolean;
  animTime: number;
  distance: number;
  speedRatio: number;
  scale?: number;
}

function drawGroundShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  heightAboveGround: number,
  baseWidth: number
) {
  const heightFactor = Math.max(0.32, 1 - heightAboveGround / 220);
  const w = baseWidth * heightFactor;
  const h = 9 * heightFactor;
  ctx.save();
  const grad = ctx.createRadialGradient(x, groundY + 2, 2, x, groundY + 2, w);
  grad.addColorStop(0, `rgba(12, 2, 6, ${0.65 * heightFactor})`);
  grad.addColorStop(0.65, `rgba(18, 3, 8, ${0.32 * heightFactor})`);
  grad.addColorStop(1, 'rgba(18, 3, 8, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(x, groundY + 2, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawClothRibbon(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  length: number,
  thickness: number,
  animTime: number,
  speedRatio: number,
  vy: number,
  primaryColor: string,
  trimColor: string
) {
  const segs = 6;
  const step = length / segs;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const wave =
      Math.sin(animTime * (9 + speedRatio * 3) - i * 0.95) * (2.5 + t * 5.5) +
      Math.cos(animTime * 5.2 - i * 0.6) * (1.2 * t);
    const lift = vy * -0.025 * t;
    pts.push({
      x: startX - i * step * (0.85 + speedRatio * 0.12),
      y: startY + t * 4 + wave + lift,
    });
  }

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = thickness;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y + thickness * 0.32);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i].x, pts[i].y + thickness * 0.32);
  }
  ctx.strokeStyle = trimColor;
  ctx.lineWidth = Math.max(1.2, thickness * 0.22);
  ctx.stroke();
  ctx.restore();
}

export function drawRider(
  ctx: CanvasRenderingContext2D,
  character: CharacterId,
  seatX: number,
  seatY: number,
  animTime: number,
  speedRatio: number,
  vy: number,
  scale: number = 1,
  seatedMode: 'saddle' | 'carriage' = 'saddle'
) {
  ctx.save();
  ctx.translate(seatX, seatY);
  ctx.scale(scale, scale);

  const lean = 0.05 + Math.min(0.09, speedRatio * 0.028) + Math.max(-0.14, Math.min(0.14, vy * 0.00018));
  ctx.rotate(lean);

  if (character === 'groom') {
    drawClothRibbon(ctx, -4, -22, 34, 6.5, animTime, speedRatio, vy, '#9d1734', '#f4c668');

    if (seatedMode === 'saddle') {
      ctx.fillStyle = '#f5ead6';
      ctx.beginPath();
      ctx.moveTo(-2, -4);
      ctx.quadraticCurveTo(6, 4, 3, 16);
      ctx.lineTo(-3, 16);
      ctx.quadraticCurveTo(-4, 5, -7, -3);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#d99e32';
      ctx.beginPath();
      ctx.ellipse(3, 17, 5, 2.6, -0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    const sherwaniGrad = ctx.createLinearGradient(-10, -26, 10, 0);
    sherwaniGrad.addColorStop(0, '#fff7e8');
    sherwaniGrad.addColorStop(0.55, '#edd9b8');
    sherwaniGrad.addColorStop(1, '#c9ab80');
    ctx.fillStyle = sherwaniGrad;
    ctx.beginPath();
    ctx.moveTo(-9, -24);
    ctx.quadraticCurveTo(0, -28, 9, -24);
    ctx.lineTo(10, -2);
    ctx.quadraticCurveTo(0, 2, -11, -1);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#d99e32';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(2, -25);
    ctx.lineTo(2, -2);
    ctx.stroke();

    ctx.fillStyle = '#8f132e';
    ctx.beginPath();
    ctx.moveTo(-8, -25);
    ctx.lineTo(-2, -25);
    ctx.lineTo(7, -2);
    ctx.lineTo(1, -2);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#fff5dc';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, -22, 6.5, 0.25, Math.PI - 0.25);
    ctx.stroke();

    ctx.fillStyle = '#edd9b8';
    ctx.beginPath();
    ctx.moveTo(4, -22);
    ctx.quadraticCurveTo(14, -15, 16, -11);
    ctx.lineTo(13, -8);
    ctx.quadraticCurveTo(9, -12, 2, -17);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d49a6a';
    ctx.beginPath();
    ctx.arc(16, -10, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#d29463';
    ctx.fillRect(-3, -31, 6, 7);

    const faceGrad = ctx.createRadialGradient(2, -36, 1, 0, -35, 9);
    faceGrad.addColorStop(0, '#eab384');
    faceGrad.addColorStop(1, '#ba7a4a');
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.ellipse(1, -36, 6.8, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#24120c';
    ctx.beginPath();
    ctx.arc(1.5, -34.5, 6.5, 0.15, Math.PI - 0.15);
    ctx.quadraticCurveTo(1.5, -31, 7.6, -34);
    ctx.fill();

    ctx.fillStyle = '#1b0c08';
    ctx.beginPath();
    ctx.ellipse(4.2, -37.2, 1.3, 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    const turbanGrad = ctx.createLinearGradient(-8, -48, 9, -37);
    turbanGrad.addColorStop(0, '#b51d3f');
    turbanGrad.addColorStop(0.5, '#e0a943');
    turbanGrad.addColorStop(1, '#7c0f26');
    ctx.fillStyle = turbanGrad;
    ctx.beginPath();
    ctx.ellipse(0, -42.5, 9.5, 7, -0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffe08a';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(0, -42, 7.2, -2.5, -0.3);
    ctx.stroke();

    ctx.fillStyle = '#961633';
    ctx.beginPath();
    ctx.moveTo(-7, -40);
    ctx.quadraticCurveTo(-13, -32, -11, -24);
    ctx.lineTo(-6, -26);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffe49e';
    ctx.beginPath();
    ctx.moveTo(3, -46);
    ctx.quadraticCurveTo(8, -56, 1, -55);
    ctx.quadraticCurveTo(0, -50, 3, -46);
    ctx.fill();
    ctx.fillStyle = '#d1264b';
    ctx.beginPath();
    ctx.arc(3, -46, 2.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    drawClothRibbon(ctx, -3, -36, 32, 7, animTime + 0.5, speedRatio, vy, '#1a0c0a', '#2e1812');
    drawClothRibbon(ctx, -2, -41, 40, 9.5, animTime, speedRatio, vy, '#b91c3e', '#f4c668');

    const lehengaGrad = ctx.createLinearGradient(-12, -22, 10, 6);
    lehengaGrad.addColorStop(0, '#c81e45');
    lehengaGrad.addColorStop(0.6, '#8f112d');
    lehengaGrad.addColorStop(1, '#5e091d');
    ctx.fillStyle = lehengaGrad;
    ctx.beginPath();
    ctx.moveTo(-8, -23);
    ctx.quadraticCurveTo(0, -26, 8, -23);
    ctx.lineTo(11, 2);
    if (seatedMode === 'saddle') {
      ctx.quadraticCurveTo(4, 15, -6, 13);
    } else {
      ctx.quadraticCurveTo(0, 5, -11, 2);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#f4c668';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-9, 0);
    ctx.quadraticCurveTo(0, 3, 10, 1);
    ctx.stroke();

    ctx.strokeStyle = '#ffe08a';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0.5, -22, 5.5, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0.5, -20, 7.5, 0.3, Math.PI - 0.3);
    ctx.stroke();

    ctx.fillStyle = '#ebb68b';
    ctx.beginPath();
    ctx.moveTo(4, -21);
    ctx.quadraticCurveTo(13, -15, 15, -11);
    ctx.lineTo(12, -8);
    ctx.quadraticCurveTo(8, -12, 2, -16);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffe08a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, -13);
    ctx.lineTo(12, -10);
    ctx.stroke();

    ctx.fillStyle = '#e0a476';
    ctx.fillRect(-2.5, -31, 5, 7);

    ctx.fillStyle = '#180b08';
    ctx.beginPath();
    ctx.ellipse(-1.5, -34, 7.8, 10.5, -0.1, 0, Math.PI * 2);
    ctx.fill();

    const faceGrad = ctx.createRadialGradient(2, -36, 1, 0.5, -35.5, 8.5);
    faceGrad.addColorStop(0, '#f5c79e');
    faceGrad.addColorStop(1, '#c9885a');
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.ellipse(1.2, -36, 6.3, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1d0b08';
    ctx.beginPath();
    ctx.ellipse(4.1, -36.8, 1.3, 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#c81e45';
    ctx.beginPath();
    ctx.arc(5.5, -38.8, 0.95, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffe08a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(6.6, -34.6, 2.1, -0.5, Math.PI * 1.15);
    ctx.stroke();

    ctx.fillStyle = '#f4c668';
    ctx.beginPath();
    ctx.moveTo(-2.2, -35);
    ctx.lineTo(-4.2, -31.5);
    ctx.lineTo(-0.2, -31.5);
    ctx.closePath();
    ctx.fill();

    const palluGrad = ctx.createLinearGradient(-8, -46, 6, -24);
    palluGrad.addColorStop(0, '#c81e45');
    palluGrad.addColorStop(1, '#7a0d25');
    ctx.fillStyle = palluGrad;
    ctx.beginPath();
    ctx.moveTo(4.2, -43.2);
    ctx.quadraticCurveTo(0, -46.8, -6.5, -42);
    ctx.quadraticCurveTo(-11, -34, -9, -22);
    ctx.lineTo(-4, -22);
    ctx.quadraticCurveTo(-4.5, -35, 1, -41.5);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ffe08a';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(4.2, -43.2);
    ctx.quadraticCurveTo(-1.5, -44.5, -5.8, -37);
    ctx.stroke();

    ctx.fillStyle = '#ffe08a';
    ctx.beginPath();
    ctx.arc(4.8, -40.8, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function drawMandapSoulmateWithVarmala(
  ctx: CanvasRenderingContext2D,
  soulmate: CharacterId,
  x: number,
  feetY: number,
  animTime: number,
  celebrating: boolean
) {
  ctx.save();
  ctx.translate(x, feetY);
  ctx.scale(-1, 1);

  const gentleBob = celebrating ? Math.sin(animTime * 4) * 2.2 : Math.sin(animTime * 2.4) * 1.2;
  ctx.translate(0, gentleBob);

  if (soulmate === 'groom') {
    const dhotiGrad = ctx.createLinearGradient(-10, -24, 10, 0);
    dhotiGrad.addColorStop(0, '#fff7e6');
    dhotiGrad.addColorStop(1, '#d9c098');
    ctx.fillStyle = dhotiGrad;
    ctx.beginPath();
    ctx.moveTo(-10, -24);
    ctx.lineTo(10, -24);
    ctx.lineTo(11, 0);
    ctx.lineTo(-11, 0);
    ctx.closePath();
    ctx.fill();
  } else {
    const skirtGrad = ctx.createLinearGradient(-14, -24, 14, 0);
    skirtGrad.addColorStop(0, '#c81e45');
    skirtGrad.addColorStop(0.6, '#8f112d');
    skirtGrad.addColorStop(1, '#58081a');
    ctx.fillStyle = skirtGrad;
    ctx.beginPath();
    ctx.moveTo(-9, -24);
    ctx.lineTo(9, -24);
    ctx.lineTo(17, 0);
    ctx.lineTo(-17, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffe08a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-16, -2);
    ctx.lineTo(16, -2);
    ctx.stroke();
  }

  drawRider(ctx, soulmate, 0, -24, animTime, 0.1, 0, 1.05, 'carriage');

  const armLift = celebrating ? Math.sin(animTime * 4.5) * 3 : 0;
  ctx.save();
  ctx.translate(18, -36 - armLift);

  const flowerCount = 12;
  for (let i = 0; i < flowerCount; i++) {
    const angle = (i / flowerCount) * Math.PI * 2;
    const fx = Math.cos(angle) * 8;
    const fy = Math.sin(angle) * 11 + 8;
    ctx.fillStyle = i % 3 === 0 ? '#ffe08a' : i % 2 === 0 ? '#e11d48' : '#ff8c1a';
    ctx.beginPath();
    ctx.arc(fx, fy, 3.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.restore();
}

function drawWhiteRoyalHorseSprite(
  ctx: CanvasRenderingContext2D,
  vy: number,
  isGrounded: boolean,
  animTime: number,
  speedRatio: number,
  withRider: CharacterId | null
) {
  const stride = animTime * (10 + speedRatio * 3.5);

  drawClothRibbon(ctx, -36, -6, 36, 7.5, animTime + 0.3, speedRatio, vy, '#f3eadb', '#e2c99b');

  const drawHorseLeg = (
    hipX: number,
    hipY: number,
    phase: number,
    isBackShade: boolean,
    isHind: boolean
  ) => {
    let upperAngle: number;
    let lowerAngle: number;
    if (!isGrounded) {
      upperAngle = isHind ? 0.55 : -0.75;
      lowerAngle = isHind ? 0.85 : 1.05;
    } else {
      const s = Math.sin(stride + phase);
      const c = Math.cos(stride + phase);
      upperAngle = s * 0.52 + (isHind ? 0.1 : -0.08);
      lowerAngle = Math.max(0.05, c * 0.65 + 0.35);
    }

    const len1 = 19;
    const len2 = 18;
    const kneeX = hipX + Math.sin(upperAngle) * len1;
    const kneeY = hipY + Math.cos(upperAngle) * len1;
    const hoofX = kneeX + Math.sin(upperAngle - lowerAngle) * len2;
    const hoofY = kneeY + Math.cos(upperAngle - lowerAngle) * len2;

    ctx.save();
    ctx.strokeStyle = isBackShade ? '#c9bfb2' : '#f7f1e6';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineWidth = isHind ? 8.5 : 7.5;
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(kneeX, kneeY);
    ctx.stroke();

    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(kneeX, kneeY);
    ctx.lineTo(hoofX, hoofY);
    ctx.stroke();

    ctx.fillStyle = '#f4c668';
    ctx.beginPath();
    ctx.arc(hoofX, hoofY - 2, 2.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4a3628';
    ctx.beginPath();
    ctx.ellipse(hoofX + 1.5, hoofY + 1.5, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  drawHorseLeg(-26, 6, Math.PI * 0.9, true, true);
  drawHorseLeg(22, 6, Math.PI * 0.15, true, false);

  const bodyGrad = ctx.createLinearGradient(0, -18, 0, 16);
  bodyGrad.addColorStop(0, '#fffdf9');
  bodyGrad.addColorStop(0.6, '#efe7da');
  bodyGrad.addColorStop(1, '#c7bcb0');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(-34, -4);
  ctx.bezierCurveTo(-36, -16, -18, -16, -4, -14);
  ctx.bezierCurveTo(12, -13, 28, -18, 34, -6);
  ctx.bezierCurveTo(37, 5, 25, 13, 12, 12);
  ctx.bezierCurveTo(-4, 11, -18, 13, -30, 9);
  ctx.bezierCurveTo(-37, 6, -35, 0, -34, -4);
  ctx.closePath();
  ctx.fill();

  const neckGrad = ctx.createLinearGradient(18, -36, 38, -4);
  neckGrad.addColorStop(0, '#fffdf9');
  neckGrad.addColorStop(0.7, '#ece3d5');
  neckGrad.addColorStop(1, '#cec2b4');
  ctx.fillStyle = neckGrad;
  ctx.beginPath();
  ctx.moveTo(16, -11);
  ctx.bezierCurveTo(23, -24, 30, -38, 41, -43);
  ctx.lineTo(48, -37);
  ctx.bezierCurveTo(41, -24, 38, -10, 32, 3);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#f2deb6';
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const t = i / 3;
    const mx = 39 - t * 18;
    const my = -41 + t * 23;
    const wave = Math.sin(animTime * 11 - i) * 2.5;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.quadraticCurveTo(mx - 8, my + 2 + wave, mx - 13, my + 7 + wave);
    ctx.stroke();
  }

  // Naturally proportioned, slender, tapered equine head & muzzle/snout
  ctx.save();
  ctx.translate(42, -41);
  ctx.rotate(0.18 + Math.sin(stride) * 0.04);

  const headGrad = ctx.createLinearGradient(0, -6, 24, 14);
  headGrad.addColorStop(0, '#fffdf9');
  headGrad.addColorStop(0.7, '#ece2d3');
  headGrad.addColorStop(1, '#cfc2b4');
  ctx.fillStyle = headGrad;

  ctx.beginPath();
  ctx.moveTo(-5, -4);
  ctx.quadraticCurveTo(4, -7, 10, -2);
  ctx.lineTo(25, 8);
  ctx.quadraticCurveTo(28.5, 11.5, 25.5, 15.5);
  ctx.quadraticCurveTo(21, 17, 16, 13.5);
  ctx.lineTo(6, 10);
  ctx.quadraticCurveTo(-3, 10, -6, 2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#9c8a84';
  ctx.beginPath();
  ctx.ellipse(24.5, 12.2, 3.2, 2.8, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#332220';
  ctx.beginPath();
  ctx.ellipse(23.8, 10.6, 1.3, 0.9, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f5ede0';
  ctx.beginPath();
  ctx.moveTo(-2, -5);
  ctx.quadraticCurveTo(-1, -15, 4, -14);
  ctx.quadraticCurveTo(4, -8, 2, -4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#1b0d09';
  ctx.beginPath();
  ctx.ellipse(8.5, 1.2, 1.7, 1.3, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(9.1, 0.7, 0.45, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#f4c668';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(2, -4);
  ctx.lineTo(5, 9);
  ctx.moveTo(16, 6);
  ctx.lineTo(20, 14);
  ctx.moveTo(5, 9);
  ctx.lineTo(19, 11);
  ctx.stroke();

  if (withRider) {
    ctx.strokeStyle = '#d49b38';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(18, 11);
    ctx.quadraticCurveTo(0, 18, -22, 10);
    ctx.stroke();
  }

  ctx.fillStyle = '#b91c3e';
  ctx.beginPath();
  ctx.moveTo(3, -5);
  ctx.quadraticCurveTo(1, -24, 12, -22);
  ctx.quadraticCurveTo(7, -14, 5, -5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffe08a';
  ctx.beginPath();
  ctx.arc(4, -5.5, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const saddleGrad = ctx.createLinearGradient(-20, -15, 10, 6);
  saddleGrad.addColorStop(0, '#a81739');
  saddleGrad.addColorStop(1, '#680b21');
  ctx.fillStyle = saddleGrad;
  ctx.beginPath();
  ctx.moveTo(-21, -14);
  ctx.lineTo(8, -13);
  ctx.lineTo(10, 5);
  ctx.quadraticCurveTo(-6, 8, -22, 4);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#f4c668';
  ctx.lineWidth = 1.8;
  ctx.strokeRect(-19, -12, 26, 15);

  ctx.strokeStyle = '#a81739';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(10, -8);
  ctx.quadraticCurveTo(24, -4, 32, -2);
  ctx.stroke();
  ctx.strokeStyle = '#f4c668';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  if (withRider) {
    drawRider(ctx, withRider, -3, -12, animTime, speedRatio, vy, 0.94, 'saddle');
  }

  drawHorseLeg(-24, 6, 0, false, true);
  drawHorseLeg(24, 6, Math.PI * 1.15, false, false);
}

function drawRoyalHorse(params: RideRenderParams) {
  const { ctx, character, x, y, vy, isGrounded, animTime, speedRatio, scale = 1 } = params;
  const stride = animTime * (10 + speedRatio * 3.5);
  const gallopBob = isGrounded ? Math.sin(stride * 2) * 3.2 : Math.max(-4, Math.min(4, vy * 0.01));
  const bodyPitch = isGrounded ? Math.cos(stride) * 0.04 : Math.max(-0.22, Math.min(0.2, vy * 0.00038));

  ctx.save();
  ctx.translate(x, y - 42 * scale + gallopBob);
  ctx.scale(scale, scale);
  ctx.rotate(bodyPitch);

  drawWhiteRoyalHorseSprite(ctx, vy, isGrounded, animTime, speedRatio, character);

  ctx.restore();
}

function drawElephantMaharaja(params: RideRenderParams) {
  const { ctx, character, x, y, vy, isGrounded, animTime, speedRatio, scale = 1 } = params;

  const stride = animTime * (6.5 + speedRatio * 2.2);
  const heavyBob = isGrounded ? Math.abs(Math.sin(stride)) * -2.6 : 0;
  const pitch = isGrounded ? Math.sin(stride) * 0.025 : Math.max(-0.14, Math.min(0.14, vy * 0.00028));

  ctx.save();
  ctx.translate(x, y - 50 * scale + heavyBob);
  ctx.scale(scale, scale);
  ctx.rotate(pitch);

  const drawEleLeg = (lx: number, ly: number, phase: number, isBack: boolean) => {
    const swing = isGrounded ? Math.sin(stride + phase) * 9 : 4;
    const lift = isGrounded ? Math.max(0, -Math.cos(stride + phase)) * 5 : 4;

    ctx.save();
    ctx.fillStyle = isBack ? '#4e484b' : '#736b70';
    ctx.beginPath();
    ctx.moveTo(lx - 7, ly);
    ctx.lineTo(lx + 7, ly);
    ctx.lineTo(lx + 6 + swing, ly + 31 - lift);
    ctx.lineTo(lx - 7 + swing, ly + 31 - lift);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#d4cbb8';
    for (let t = -1; t <= 1; t++) {
      ctx.beginPath();
      ctx.arc(lx + swing + t * 3.5 + 1.5, ly + 30.5 - lift, 1.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  drawEleLeg(-22, 18, Math.PI, true);
  drawEleLeg(16, 18, 0, true);

  ctx.strokeStyle = '#5c5559';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-36, -2);
  ctx.quadraticCurveTo(-44, 8, -42, 20);
  ctx.stroke();

  const eleGrad = ctx.createLinearGradient(-35, -24, 30, 26);
  eleGrad.addColorStop(0, '#8d8488');
  eleGrad.addColorStop(0.5, '#6d656a');
  eleGrad.addColorStop(1, '#4c4549');
  ctx.fillStyle = eleGrad;
  ctx.beginPath();
  ctx.ellipse(-4, 2, 35, 25, 0, 0, Math.PI * 2);
  ctx.fill();

  drawEleLeg(-18, 18, 0, false);
  drawEleLeg(21, 18, Math.PI, false);

  const jhoolGrad = ctx.createLinearGradient(-26, -22, 14, 18);
  jhoolGrad.addColorStop(0, '#b91c3e');
  jhoolGrad.addColorStop(1, '#6f0b22');
  ctx.fillStyle = jhoolGrad;
  ctx.beginPath();
  ctx.moveTo(-28, -14);
  ctx.quadraticCurveTo(-6, -24, 16, -15);
  ctx.lineTo(18, 15);
  ctx.quadraticCurveTo(-4, 18, -28, 14);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#f4c668';
  ctx.lineWidth = 2;
  ctx.strokeRect(-25, -13, 40, 25);

  ctx.fillStyle = '#ffe08a';
  for (let tx = -24; tx <= 14; tx += 6) {
    ctx.beginPath();
    ctx.arc(tx, 16.5, 1.7, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#7b7277';
  ctx.beginPath();
  ctx.ellipse(27, -6, 17, 18, 0.1, 0, Math.PI * 2);
  ctx.fill();

  const trunkSwing = Math.sin(animTime * 4.5) * 4.5;
  ctx.strokeStyle = '#736a6f';
  ctx.lineCap = 'round';
  ctx.lineWidth = 10.5;
  ctx.beginPath();
  ctx.moveTo(37, -1);
  ctx.bezierCurveTo(46, 10, 44 + trunkSwing, 23, 36 + trunkSwing, 26);
  ctx.stroke();

  ctx.fillStyle = '#f4c668';
  ctx.beginPath();
  ctx.arc(36 + trunkSwing, 26, 3.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff8e6';
  ctx.beginPath();
  ctx.moveTo(34, 4);
  ctx.quadraticCurveTo(50, 9, 55, 1);
  ctx.quadraticCurveTo(47, 13, 32, 9);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d99e32';
  ctx.fillRect(42, 4.5, 3, 4.5);

  const earFlap = Math.sin(animTime * 3.8) * 1.5;
  ctx.fillStyle = '#8b8186';
  ctx.beginPath();
  ctx.ellipse(17 + earFlap, -5, 9, 13, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b48a86';
  ctx.beginPath();
  ctx.ellipse(16 + earFlap, -3, 5, 8, -0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1b0d09';
  ctx.beginPath();
  ctx.arc(33, -9, 1.8, 0, Math.PI * 2);
  ctx.fill();

  const crownGrad = ctx.createLinearGradient(20, -24, 40, -6);
  crownGrad.addColorStop(0, '#ffe08a');
  crownGrad.addColorStop(1, '#c98824');
  ctx.fillStyle = crownGrad;
  ctx.beginPath();
  ctx.moveTo(22, -20);
  ctx.quadraticCurveTo(35, -24, 42, -9);
  ctx.lineTo(35, -6);
  ctx.quadraticCurveTo(28, -14, 21, -15);
  ctx.closePath();
  ctx.fill();

  ctx.save();
  ctx.translate(-5, -21);

  ctx.fillStyle = '#d49b34';
  ctx.fillRect(-19, -5, 38, 6);
  ctx.strokeStyle = '#ffe49e';
  ctx.lineWidth = 1.4;
  ctx.strokeRect(-19, -5, 38, 6);

  drawRider(ctx, character, 0, -4, animTime, speedRatio, vy, 0.78, 'carriage');

  ctx.strokeStyle = '#f4c668';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(-16, -5);
  ctx.lineTo(-16, -34);
  ctx.moveTo(16, -5);
  ctx.lineTo(16, -34);
  ctx.stroke();

  const domeGrad = ctx.createLinearGradient(-18, -50, 18, -32);
  domeGrad.addColorStop(0, '#ffe49e');
  domeGrad.addColorStop(0.5, '#df9e2e');
  domeGrad.addColorStop(1, '#9c6614');
  ctx.fillStyle = domeGrad;
  ctx.beginPath();
  ctx.moveTo(-20, -34);
  ctx.quadraticCurveTo(0, -54, 20, -34);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffe8a8';
  ctx.beginPath();
  ctx.moveTo(-2.5, -45);
  ctx.lineTo(0, -54);
  ctx.lineTo(2.5, -45);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
  ctx.restore();
}

function drawSpokedWheel(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  rotation: number,
  spokes: number = 10
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  ctx.strokeStyle = '#d49a34';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#ffe296';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, radius - 1.5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#c88c28';
  ctx.lineWidth = 2;
  for (let i = 0; i < spokes; i++) {
    const a = (i * Math.PI * 2) / spokes;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * (radius - 2), Math.sin(a) * (radius - 2));
    ctx.stroke();
  }

  ctx.fillStyle = '#ffe08a';
  ctx.beginPath();
  ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7a0f26';
  ctx.beginPath();
  ctx.arc(0, 0, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawRoyalChariot(params: RideRenderParams) {
  const { ctx, character, x, y, vy, isGrounded, animTime, distance, speedRatio, scale = 1 } = params;

  const wheelRadiusBack = 18;
  const wheelRadiusFront = 13.5;
  const stride = animTime * (10 + speedRatio * 3.5);
  const chassisBounce = isGrounded ? Math.sin(animTime * 14) * 1.4 : 0;
  const horseBob = isGrounded ? Math.sin(stride * 2) * 2.5 : 0;
  const pitch = isGrounded ? 0 : Math.max(-0.18, Math.min(0.18, vy * 0.00032));

  ctx.save();
  // Shift chariot slightly back so the pulling horse sits naturally in front
  ctx.translate(x - 10 * scale, y - 18 * scale + chassisBounce);
  ctx.scale(scale * 0.88, scale * 0.88);
  ctx.rotate(pitch);

  // Pull Horse harnessed in front of the Royal Chariot!
  ctx.save();
  ctx.translate(64, -18 + horseBob);
  ctx.scale(0.86, 0.86);
  drawWhiteRoyalHorseSprite(ctx, vy, isGrounded, animTime, speedRatio, null);
  ctx.restore();

  // Golden Harness Shafts & Reins connecting Horse to Chariot
  ctx.strokeStyle = '#e2a335';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(26, -8);
  ctx.quadraticCurveTo(44, -8, 62, -16 + horseBob * 0.6);
  ctx.stroke();

  ctx.strokeStyle = '#ffe08a';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(12, -24);
  ctx.quadraticCurveTo(50, -32, 92, -38 + horseBob * 0.6);
  ctx.stroke();

  // Carved Golden Chariot Body
  const goldGrad = ctx.createLinearGradient(-44, -22, 46, 8);
  goldGrad.addColorStop(0, '#b57b1b');
  goldGrad.addColorStop(0.5, '#ffe08a');
  goldGrad.addColorStop(1, '#c98824');

  ctx.fillStyle = goldGrad;
  ctx.beginPath();
  ctx.moveTo(-42, -6);
  ctx.quadraticCurveTo(-10, 12, 34, 4);
  ctx.quadraticCurveTo(46, -4, 48, -16);
  ctx.quadraticCurveTo(39, -15, 34, -8);
  ctx.lineTo(-34, -10);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#8f112d';
  ctx.beginPath();
  ctx.moveTo(-26, -10);
  ctx.quadraticCurveTo(0, 2, 22, -10);
  ctx.lineTo(20, -18);
  ctx.lineTo(-24, -18);
  ctx.closePath();
  ctx.fill();

  drawRider(ctx, character, -1, -14, animTime, speedRatio, vy, 0.88, 'carriage');

  ctx.strokeStyle = '#f4c668';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-24, -12);
  ctx.lineTo(-24, -50);
  ctx.moveTo(22, -12);
  ctx.lineTo(22, -50);
  ctx.stroke();

  const sway = Math.sin(animTime * 5.5) * 2;
  ctx.fillStyle = '#9f1333';
  ctx.beginPath();
  ctx.moveTo(-23, -49);
  ctx.quadraticCurveTo(-15 + sway, -32, -23, -15);
  ctx.lineTo(-24, -49);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(21, -49);
  ctx.quadraticCurveTo(13 + sway, -32, 21, -15);
  ctx.lineTo(22, -49);
  ctx.fill();

  const domeGrad = ctx.createLinearGradient(-28, -72, 28, -48);
  domeGrad.addColorStop(0, '#fff0ba');
  domeGrad.addColorStop(0.5, '#e2a335');
  domeGrad.addColorStop(1, '#9c6614');
  ctx.fillStyle = domeGrad;
  ctx.beginPath();
  ctx.moveTo(-30, -49);
  ctx.quadraticCurveTo(0, -78, 30, -49);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffe8a8';
  ctx.beginPath();
  ctx.moveTo(-3, -64);
  ctx.lineTo(0, -76);
  ctx.lineTo(3, -64);
  ctx.closePath();
  ctx.fill();

  drawSpokedWheel(ctx, -22, 0, wheelRadiusBack, distance / wheelRadiusBack, 10);
  drawSpokedWheel(ctx, 25, 4.5, wheelRadiusFront, distance / wheelRadiusFront, 8);

  ctx.restore();
}

export function drawPlayerRide(params: RideRenderParams): void {
  const { ride } = params;
  switch (ride) {
    case 'horse':
      drawRoyalHorse(params);
      break;
    case 'elephant':
      drawElephantMaharaja(params);
      break;
    case 'chariot':
      drawRoyalChariot(params);
      break;
  }
}

export function drawRideShadowAtGround(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  playerGroundY: number,
  ride: RideId,
  overChasm: boolean = false
): void {
  if (overChasm) return;
  const heightAboveGround = Math.max(0, groundY - playerGroundY);
  const shadowWidth = ride === 'chariot' ? 68 : ride === 'elephant' ? 54 : 44;
  drawGroundShadow(ctx, x + (ride === 'chariot' ? 10 : 0), groundY, heightAboveGround, shadowWidth);
}
