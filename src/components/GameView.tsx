import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUp,
  Clock,
  Heart,
  Pause,
  Play,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { SnapZBannerLink } from './SnapZPromo';
import { soundEngine } from '../game/audio';
import {
  drawMandapSoulmateWithVarmala,
  drawPlayerRide,
  drawRideShadowAtGround,
} from '../game/rideRenderer';
import {
  CHARACTER_OPTIONS,
  RIDE_OPTIONS,
  type CharacterId,
  type ChasmGap,
  type FireworkRocket,
  type FloatingText,
  type HeartCollectible,
  type Particle,
  type PlayStatus,
  type RideId,
  type SessionSummary,
} from '../game/types';
import {
  drawFireworksAndParticles,
  drawHeartCollectible,
  drawParallaxSkyAndPalace,
  drawRoyalMandap,
  drawRoyalPathWithChasms,
} from '../game/worldRenderer';

interface GameViewProps {
  character: CharacterId;
  ride: RideId;
  playerName: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onCompleteJourney: (summary: SessionSummary) => void;
  onBackToLobby: () => void;
}

const SESSION_DURATION_SECONDS = 120; // 02:00 (2 minutes)
const BASE_SPEED = 335;
const MAX_SPEED = 570;
const GRAVITY = 1960;
const JUMP_VY = -745;
const DOUBLE_JUMP_VY = -645;

function formatTimer(secondsRemaining: number): string {
  const clamped = Math.max(0, Math.ceil(secondsRemaining));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function GameView({
  character,
  ride,
  playerName,
  isMuted,
  onToggleMute,
  onCompleteJourney,
  onBackToLobby,
}: GameViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [status, setStatus] = useState<PlayStatus>('PLAYING');
  const [score, setScore] = useState(0);
  const [heartsEarned, setHeartsEarned] = useState(0);
  const [totalHearts, setTotalHearts] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(SESSION_DURATION_SECONDS);
  const [showControlsHint, setShowControlsHint] = useState(true);
  const [showContinueButton, setShowContinueButton] = useState(false);

  const simRef = useRef({
    status: 'PLAYING' as PlayStatus,
    logicalW: 800,
    logicalH: 380,
    groundY: 322,
    animTime: 0,
    distance: 0,
    speed: BASE_SPEED,
    timeRemaining: SESSION_DURATION_SECONDS,

    score: 0,
    heartsEarned: 0,
    totalHearts: 0,
    countedHeartIds: new Set<number>(),
    chasmsCleared: 0,

    // Player physics
    playerX: 120,
    playerY: 322,
    vy: 0,
    isGrounded: true,
    jumpsUsed: 0,
    isFallingInChasm: false,
    fallTimer: 0,
    chasmOverlayTimestamp: 0,

    // Mandap climax state
    mandapX: 1100,
    climaxElapsed: 0,
    fireworkTimer: 0,
    climaxDoneCalled: false,

    // Entities
    nextId: 1,
    chasmTimer: 1.55,
    heartTimer: 0.45,
    ambientPetalTimer: 0,
    chasms: [] as ChasmGap[],
    hearts: [] as HeartCollectible[],
    particles: [] as Particle[],
    rockets: [] as FireworkRocket[],
    popups: [] as FloatingText[],
  });

  const charMeta = CHARACTER_OPTIONS.find((c) => c.id === character) ?? CHARACTER_OPTIONS[0];
  const rideMeta = RIDE_OPTIONS.find((r) => r.id === ride) ?? RIDE_OPTIONS[0];
  const oppositeCharacter: CharacterId = character === 'groom' ? 'bride' : 'groom';

  const spawnBurst = useCallback(
    (
      x: number,
      y: number,
      count: number,
      kind: 'spark' | 'petal' | 'mixed' | 'firework',
      customColors?: string[]
    ) => {
      const sim = simRef.current;
      const sparkColors = customColors ?? ['#ffe08a', '#fff5c4', '#f4c668', '#ffae42'];
      const petalColors = ['#e11d48', '#fb7185', '#ff9d2e', '#ffd24c'];
      for (let i = 0; i < count; i++) {
        const isPetal = kind === 'petal' || (kind === 'mixed' && i % 2 === 0);
        const palette = isPetal ? petalColors : sparkColors;
        const angle = -Math.PI + Math.random() * Math.PI * 2;
        const spd = kind === 'firework' ? 85 + Math.random() * 195 : 45 + Math.random() * 165;
        sim.particles.push({
          x,
          y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd - (kind === 'firework' ? 15 : 45),
          size: isPetal ? 4.8 + Math.random() * 3.5 : 3 + Math.random() * 3.2,
          alpha: 0.96,
          life: 0,
          maxLife: kind === 'firework' ? 0.75 + Math.random() * 0.6 : 0.45 + Math.random() * 0.45,
          color: palette[Math.floor(Math.random() * palette.length)],
          kind: kind === 'firework' ? 'firework' : isPetal ? 'petal' : 'spark',
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 9,
        });
      }
    },
    []
  );

  const resetJourney = useCallback(() => {
    const sim = simRef.current;
    sim.status = 'PLAYING';
    sim.animTime = 0;
    sim.distance = 0;
    sim.speed = BASE_SPEED;
    sim.timeRemaining = SESSION_DURATION_SECONDS;
    sim.score = 0;
    sim.heartsEarned = 0;
    sim.totalHearts = 0;
    sim.countedHeartIds.clear();
    sim.chasmsCleared = 0;
    sim.playerX = Math.max(88, Math.round(sim.logicalW * 0.165));
    sim.playerY = sim.groundY;
    sim.vy = 0;
    sim.isGrounded = true;
    sim.jumpsUsed = 0;
    sim.isFallingInChasm = false;
    sim.fallTimer = 0;
    sim.chasmTimer = 1.55;
    sim.heartTimer = 0.45;
    sim.chasms = [];
    sim.hearts = [];
    sim.particles = [];
    sim.rockets = [];
    sim.popups = [];

    setScore(0);
    setHeartsEarned(0);
    setTotalHearts(0);
    setTimeRemaining(SESSION_DURATION_SECONDS);
    setShowContinueButton(false);
    setStatus('PLAYING');
    soundEngine.playClick();
  }, []);

  const finishToStatusCard = useCallback(() => {
    const sim = simRef.current;
    if (sim.climaxDoneCalled) return;
    sim.climaxDoneCalled = true;
    onCompleteJourney({
      playerName: playerName.trim(),
      score: sim.score,
      heartsCollected: sim.heartsEarned,
      totalHearts: Math.max(sim.totalHearts, sim.heartsEarned),
      chasmsCleared: sim.chasmsCleared,
      character,
      ride,
    });
  }, [character, onCompleteJourney, playerName, ride]);

  const triggerJump = useCallback(() => {
    const sim = simRef.current;
    if (sim.status !== 'PLAYING' || sim.isFallingInChasm) return;

    if (sim.isGrounded) {
      sim.vy = JUMP_VY;
      sim.isGrounded = false;
      sim.jumpsUsed = 1;
      spawnBurst(sim.playerX, sim.groundY - 4, 10, 'mixed');
      soundEngine.playJump();
      setShowControlsHint(false);
    } else if (sim.jumpsUsed < 2) {
      sim.vy = DOUBLE_JUMP_VY;
      sim.jumpsUsed = 2;
      spawnBurst(sim.playerX, sim.playerY - 22, 14, 'mixed');
      soundEngine.playDoubleJump();
      setShowControlsHint(false);
    }
  }, [spawnBurst]);

  const releaseJump = useCallback(() => {
    const sim = simRef.current;
    if (sim.status === 'PLAYING' && !sim.isGrounded && !sim.isFallingInChasm && sim.vy < -280) {
      sim.vy *= 0.65;
    }
  }, []);

  const togglePause = useCallback(() => {
    const sim = simRef.current;
    if (sim.status === 'PLAYING') {
      sim.status = 'PAUSED';
      setStatus('PAUSED');
      soundEngine.playClick();
    } else if (sim.status === 'PAUSED') {
      sim.status = 'PLAYING';
      setStatus('PLAYING');
      soundEngine.playClick();
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowControlsHint(false), 4500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (e.repeat) return;
        const sim = simRef.current;
        if (sim.status === 'CHASM_FALL') {
          if (performance.now() - sim.chasmOverlayTimestamp > 450) {
            resetJourney();
          }
          return;
        }
        if (sim.status === 'PAUSED') {
          togglePause();
          return;
        }
        triggerJump();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        if (simRef.current.status === 'PLAYING' || simRef.current.status === 'PAUSED') {
          togglePause();
        }
      } else if (e.code === 'Enter' && simRef.current.status === 'CHASM_FALL') {
        resetJourney();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        releaseJump();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [releaseJump, resetJourney, togglePause, triggerJump]);

  // Main 60fps requestAnimationFrame Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);

      const aspect = rect.width / rect.height;
      const minLogicalW = 580;
      const baseLogicalH = 380;

      let logicalW: number;
      let logicalH: number;
      if (aspect >= minLogicalW / baseLogicalH) {
        logicalH = baseLogicalH;
        logicalW = Math.min(960, Math.round(baseLogicalH * aspect));
      } else {
        logicalW = minLogicalW;
        logicalH = Math.min(540, Math.round(minLogicalW / aspect));
      }

      const sim = simRef.current;
      const prevGround = sim.groundY;
      sim.logicalW = logicalW;
      sim.logicalH = logicalH;
      sim.groundY = logicalH - 58;
      if (sim.status !== 'MANDAP_CLIMAX') {
        sim.playerX = Math.max(88, Math.round(logicalW * 0.165));
      }

      if (sim.isGrounded && !sim.isFallingInChasm) {
        sim.playerY = sim.groundY;
      } else {
        sim.playerY += sim.groundY - prevGround;
      }
    };

    updateCanvasSize();
    const ro = new ResizeObserver(updateCanvasSize);
    ro.observe(container);

    let rafId = 0;
    let lastTs = performance.now();
    let uiSyncAccum = 0;

    // Spawn a Chasm gap + rich 3-4 Heart parabolic arc right over it!
    const spawnChasmAndArcHearts = (sim: typeof simRef.current) => {
      const elapsedRatio = 1 - sim.timeRemaining / SESSION_DURATION_SECONDS;
      const gapWidth = 96 + Math.min(52, elapsedRatio * 40) + Math.random() * 18;
      const gapX = sim.logicalW + 50;

      sim.chasms.push({
        id: sim.nextId++,
        x: gapX,
        width: gapWidth,
        cleared: false,
      });

      const arcCount = Math.random() > 0.35 ? 4 : 3;
      for (let i = 0; i < arcCount; i++) {
        const frac = (i + 0.5) / arcCount; // distributed evenly across chasm
        const archLift = Math.sin(frac * Math.PI) * 44;
        sim.hearts.push({
          id: sim.nextId++,
          x: gapX + gapWidth * frac,
          y: sim.groundY - (78 + archLift),
          radius: 15,
          points: 1000,
          phase: i * 0.55 + Math.random() * 0.4,
          collected: false,
        });
      }
    };

    // Spawn dense gentle lines/waves of 3-5 Hearts along flat stretches!
    const spawnFlatStretchHeartLine = (sim: typeof simRef.current) => {
      const count = 3 + Math.floor(Math.random() * 3); // 3, 4, or 5 hearts
      const startX = sim.logicalW + 55;
      const spacing = 42;
      const pattern = Math.random();

      // Avoid placing low ground hearts directly inside an upcoming Chasm
      const overlapsChasm = (hx: number) =>
        sim.chasms.some((g) => hx >= g.x - 24 && hx <= g.x + g.width + 24);

      for (let i = 0; i < count; i++) {
        const hx = startX + i * spacing;
        if (overlapsChasm(hx)) continue;

        let hy: number;
        if (pattern < 0.48) {
          // Gentle flat line right along reachable riding height
          hy = sim.groundY - 46;
        } else if (pattern < 0.8) {
          // Gentle rising/falling wave
          hy = sim.groundY - (48 + Math.sin((i / Math.max(1, count - 1)) * Math.PI) * 52);
        } else {
          // Elevated rewarding line for single jump
          hy = sim.groundY - 94;
        }

        sim.hearts.push({
          id: sim.nextId++,
          x: hx,
          y: hy,
          radius: 15,
          points: 1000,
          phase: i * 0.45,
          collected: false,
        });
      }
    };

    const launchFirework = (sim: typeof simRef.current) => {
      const colors = ['#ffe08a', '#e11d48', '#fb7185', '#ff9d2e', '#34d399', '#fff3c4'];
      sim.rockets.push({
        x: 65 + Math.random() * (sim.logicalW - 130),
        y: sim.groundY - 20,
        targetY: 45 + Math.random() * (sim.groundY * 0.42),
        vy: -(240 + Math.random() * 110),
        color: colors[Math.floor(Math.random() * colors.length)],
        exploded: false,
      });
    };

    const step = (now: number) => {
      const rawDt = (now - lastTs) / 1000;
      lastTs = now;
      const dt = Math.min(0.05, Math.max(0.001, rawDt));
      const sim = simRef.current;

      if (sim.status === 'PLAYING') {
        sim.animTime += dt;
        sim.timeRemaining = Math.max(0, sim.timeRemaining - dt);

        const elapsedFrac = 1 - sim.timeRemaining / SESSION_DURATION_SECONDS;
        sim.speed = Math.min(MAX_SPEED, BASE_SPEED + elapsedFrac * 185);
        sim.distance += sim.speed * dt;

        // Check if player is currently over any Chasm
        let activeChasmUnderPlayer: ChasmGap | null = null;
        for (const g of sim.chasms) {
          if (sim.playerX > g.x + 16 && sim.playerX < g.x + g.width - 16) {
            activeChasmUnderPlayer = g;
            break;
          }
        }

        if (sim.isFallingInChasm) {
          sim.fallTimer -= dt;
          sim.vy += GRAVITY * 0.9 * dt;
          sim.playerY += sim.vy * dt;

          if (sim.fallTimer <= 0) {
            sim.isFallingInChasm = false;
            sim.status = 'CHASM_FALL';
            sim.chasmOverlayTimestamp = performance.now();
            setScore(sim.score);
            setHeartsEarned(sim.heartsEarned);
            setTotalHearts(sim.totalHearts);
            setTimeRemaining(sim.timeRemaining);
            setStatus('CHASM_FALL');
          }
        } else if (!sim.isGrounded) {
          sim.vy += GRAVITY * dt;
          sim.playerY += sim.vy * dt;
          if (sim.playerY >= sim.groundY) {
            if (activeChasmUnderPlayer) {
              sim.isFallingInChasm = true;
              sim.fallTimer = 0.4;
              sim.vy = 180;
              spawnBurst(sim.playerX, sim.groundY, 16, 'spark', ['#e5c994', '#b91c3e']);
              soundEngine.playChasmFall();
            } else {
              sim.playerY = sim.groundY;
              sim.vy = 0;
              sim.isGrounded = true;
              sim.jumpsUsed = 0;
              spawnBurst(sim.playerX, sim.groundY - 2, 5, 'spark');
            }
          }
        } else if (activeChasmUnderPlayer) {
          sim.isFallingInChasm = true;
          sim.isGrounded = false;
          sim.fallTimer = 0.4;
          sim.vy = 160;
          spawnBurst(sim.playerX, sim.groundY, 16, 'spark', ['#e5c994', '#b91c3e']);
          soundEngine.playChasmFall();
        }

        // Ambient rose petals & sparkles
        sim.ambientPetalTimer -= dt;
        if (sim.ambientPetalTimer <= 0) {
          sim.ambientPetalTimer = 0.16;
          const isPetal = Math.random() > 0.35;
          sim.particles.push({
            x: sim.logicalW + 10,
            y: 20 + Math.random() * (sim.groundY - 40),
            vx: -(70 + Math.random() * 90),
            vy: 14 + Math.random() * 24,
            size: isPetal ? 4 + Math.random() * 3 : 2 + Math.random() * 2,
            alpha: isPetal ? 0.72 : 0.65,
            life: 0,
            maxLife: 4.5,
            color: isPetal ? (Math.random() > 0.5 ? '#e11d48' : '#fb7185') : '#ffe08a',
            kind: isPetal ? 'petal' : 'spark',
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 3,
          });
        }

        // Stop spawning Chasms in final 4.2s so runway into Mandap is smooth
        if (sim.timeRemaining > 4.2 && !sim.isFallingInChasm) {
          sim.chasmTimer -= dt;
          if (sim.chasmTimer <= 0) {
            spawnChasmAndArcHearts(sim);
            const speedRatio = sim.speed / BASE_SPEED;
            const minGapTime = Math.max(1.25, 1.85 - (speedRatio - 1) * 0.35);
            sim.chasmTimer = minGapTime + Math.random() * 0.9;
          }

          sim.heartTimer -= dt;
          if (sim.heartTimer <= 0) {
            spawnFlatStretchHeartLine(sim);
            sim.heartTimer = 0.8 + Math.random() * 0.55;
          }
        }

        // Move Chasms & count cleared Chasms
        for (let i = sim.chasms.length - 1; i >= 0; i--) {
          const g = sim.chasms[i];
          g.x -= sim.speed * dt;
          if (!g.cleared && g.x + g.width < sim.playerX - 24 && !sim.isFallingInChasm) {
            g.cleared = true;
            sim.chasmsCleared += 1;
          }
          if (g.x + g.width < -60) {
            sim.chasms.splice(i, 1);
          }
        }

        // Move Hearts, update Total Hearts as they enter screen, & collect (+1,000 each)
        for (let i = sim.hearts.length - 1; i >= 0; i--) {
          const h = sim.hearts[i];
          h.x -= sim.speed * dt;

          if (!sim.countedHeartIds.has(h.id) && h.x <= sim.logicalW + 6) {
            sim.countedHeartIds.add(h.id);
            sim.totalHearts += 1;
          }

          if (!h.collected && !sim.isFallingInChasm) {
            const pCenterX = sim.playerX;
            const pCenterY = sim.playerY - 38;
            const dx = h.x - pCenterX;
            const dy = h.y - pCenterY;
            const hitDist = h.radius + 38;
            if (dx * dx + dy * dy <= hitDist * hitDist) {
              if (!sim.countedHeartIds.has(h.id)) {
                sim.countedHeartIds.add(h.id);
                sim.totalHearts += 1;
              }
              h.collected = true;
              sim.score += h.points; // +1,000
              sim.heartsEarned += 1;
              spawnBurst(h.x, h.y, 16, 'mixed');
              sim.popups.push({
                x: h.x,
                y: h.y - 12,
                vy: -48,
                text: '+1,000 ♥',
                color: '#ffe08a',
                life: 0,
                maxLife: 0.9,
              });
              soundEngine.playHeartCollect();
            }
          }

          if (h.collected || h.x + h.radius < -40) {
            sim.hearts.splice(i, 1);
          }
        }

        // Trigger Mandap Climax when 02:00 timer hits 00:00
        if (sim.timeRemaining <= 0 && !sim.isFallingInChasm) {
          sim.status = 'MANDAP_CLIMAX';
          sim.chasms = [];
          sim.mandapX = sim.logicalW + 130;
          sim.climaxElapsed = 0;
          sim.fireworkTimer = 0.2;
          setTimeRemaining(0);
          setScore(sim.score);
          setHeartsEarned(sim.heartsEarned);
          setTotalHearts(sim.totalHearts);
          setStatus('MANDAP_CLIMAX');
          soundEngine.playMandapFanfare();
        }

        uiSyncAccum += dt;
        if (uiSyncAccum >= 0.06) {
          uiSyncAccum = 0;
          setScore(sim.score);
          setHeartsEarned(sim.heartsEarned);
          setTotalHearts(sim.totalHearts);
          setTimeRemaining(sim.timeRemaining);
        }
      } else if (sim.status === 'MANDAP_CLIMAX') {
        sim.animTime += dt;
        sim.climaxElapsed += dt;

        if (!sim.isGrounded) {
          sim.vy += GRAVITY * dt;
          sim.playerY += sim.vy * dt;
          if (sim.playerY >= sim.groundY) {
            sim.playerY = sim.groundY;
            sim.vy = 0;
            sim.isGrounded = true;
          }
        }

        const targetMandapX = sim.logicalW * 0.72;
        if (sim.mandapX > targetMandapX) {
          const stepX = Math.min(sim.mandapX - targetMandapX, 240 * dt);
          sim.mandapX -= stepX;
          sim.distance += stepX;
        }

        const targetPlayerX = targetMandapX - 118;
        if (sim.playerX < targetPlayerX) {
          sim.playerX = Math.min(targetPlayerX, sim.playerX + 120 * dt);
          sim.distance += 120 * dt;
        }

        sim.fireworkTimer -= dt;
        if (sim.fireworkTimer <= 0) {
          launchFirework(sim);
          sim.fireworkTimer = 0.4 + Math.random() * 0.35;
        }

        sim.ambientPetalTimer -= dt;
        if (sim.ambientPetalTimer <= 0) {
          sim.ambientPetalTimer = 0.042;
          const colors = ['#e11d48', '#fb7185', '#ff8c1a', '#ffd23f', '#fda4af'];
          sim.particles.push({
            x: Math.random() * sim.logicalW,
            y: -10,
            vx: -24 + Math.random() * 48,
            vy: 48 + Math.random() * 55,
            size: 4.5 + Math.random() * 4,
            alpha: 0.9,
            life: 0,
            maxLife: 5.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            kind: 'petal',
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 4,
          });
        }

        if (sim.climaxElapsed >= 1.6) {
          setShowContinueButton(true);
        }
        if (sim.climaxElapsed >= 7.0) {
          finishToStatusCard();
        }
      }

      // Update Firework Rockets
      for (let i = sim.rockets.length - 1; i >= 0; i--) {
        const r = sim.rockets[i];
        r.y += r.vy * dt;
        if (r.y <= r.targetY && !r.exploded) {
          r.exploded = true;
          spawnBurst(r.x, r.y, 34, 'firework', [r.color, '#ffe08a', '#ffffff']);
          soundEngine.playFireworkPop();
          sim.rockets.splice(i, 1);
        }
      }

      // Update particles & popups when active
      if (sim.status === 'PLAYING' || sim.status === 'MANDAP_CLIMAX') {
        for (let i = sim.particles.length - 1; i >= 0; i--) {
          const p = sim.particles[i];
          p.life += dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.rotation += p.vRot * dt;
          if (p.kind === 'firework') {
            p.vx *= 0.985;
            p.vy += 120 * dt;
          } else if (p.kind === 'spark' && p.maxLife < 1.2) {
            p.vy += 260 * dt;
          }
          if (p.life >= p.maxLife || p.x < -30 || p.y > sim.logicalH + 20) {
            sim.particles.splice(i, 1);
          }
        }

        for (let i = sim.popups.length - 1; i >= 0; i--) {
          const ft = sim.popups[i];
          ft.life += dt;
          ft.y += ft.vy * dt;
          if (ft.life >= ft.maxLife) {
            sim.popups.splice(i, 1);
          }
        }
      }

      // Render Frame
      ctx.save();
      const scaleX = canvas.width / sim.logicalW;
      const scaleY = canvas.height / sim.logicalH;
      ctx.scale(scaleX, scaleY);

      drawParallaxSkyAndPalace(ctx, sim.logicalW, sim.groundY, sim.distance, sim.animTime);

      drawRoyalPathWithChasms(
        ctx,
        sim.logicalW,
        sim.logicalH,
        sim.groundY,
        sim.distance,
        sim.chasms,
        sim.animTime
      );

      if (sim.status === 'MANDAP_CLIMAX') {
        drawRoyalMandap(ctx, sim.mandapX, sim.groundY, sim.animTime);
        drawMandapSoulmateWithVarmala(
          ctx,
          oppositeCharacter,
          sim.mandapX + 18,
          sim.groundY - 20,
          sim.animTime,
          true
        );
      }

      const isOverChasm = sim.chasms.some(
        (g) => sim.playerX > g.x + 8 && sim.playerX < g.x + g.width - 8
      );
      drawRideShadowAtGround(ctx, sim.playerX, sim.groundY, sim.playerY, ride, isOverChasm);

      for (const h of sim.hearts) {
        drawHeartCollectible(ctx, h, sim.animTime);
      }

      drawPlayerRide({
        ctx,
        ride,
        character,
        x: sim.playerX,
        y: sim.playerY,
        vy: sim.vy,
        isGrounded: sim.isGrounded,
        animTime: sim.animTime,
        distance: sim.distance,
        speedRatio: sim.status === 'MANDAP_CLIMAX' ? 0.4 : sim.speed / BASE_SPEED,
        scale: 1,
      });

      drawFireworksAndParticles(ctx, sim.rockets, sim.particles, sim.popups);

      ctx.restore();
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, [character, finishToStatusCard, oppositeCharacter, ride, spawnBurst]);

  return (
    <div className="relative p-2.5 sm:p-4 flex flex-col gap-2">
      {/* Compact SnapZ Banner Image cleanly padded inside the Golden Frame & Corner Ornaments */}
      <div className="pt-2.5 sm:pt-3.5 px-8 sm:px-14">
        <SnapZBannerLink variant="header" />
      </div>

      {/* Top HUD Bar: Switch Ride, 02:00 Timer, Earned / Total Hearts, Score, Pause, Mute */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-[#260812]/90 border border-[#f4c668]/35">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToLobby}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg bg-[#3b0c1c] hover:bg-[#521228] border border-[#f4c668]/40 text-xs font-semibold text-[#ffe8ad] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe08a]"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Switch Ride</span>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#f2d6a0] pl-1 whitespace-nowrap">
            <span className="font-semibold text-[#ffe08a]">
              {playerName.trim() ? `${playerName.trim()} (${charMeta.title})` : charMeta.title}
            </span>
            <span aria-hidden="true">·</span>
            <span>{rideMeta.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* 02:00 Countdown Timer */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#16040a] border border-[#f4c668]/35 text-xs sm:text-sm tabular-nums">
            <Clock className="w-3.5 h-3.5 text-[#f4c668]" aria-hidden="true" />
            <span className="font-mono font-bold text-[#ffe8ad]">{formatTimer(timeRemaining)}</span>
          </div>

          {/* Earned / Total Hearts Counter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#16040a] border border-[#f4c668]/35 text-xs sm:text-sm tabular-nums">
            <Heart className="w-3.5 h-3.5 text-[#e11d48] fill-[#e11d48]" aria-hidden="true" />
            <span className="text-[#d9b882] hidden sm:inline">Hearts</span>
            <span className="font-mono font-bold text-[#fff3c4]">
              {heartsEarned} / {totalHearts}
            </span>
          </div>

          {/* Score */}
          <div className="text-xs sm:text-sm tabular-nums">
            <span className="text-[#d9b882] mr-1 hidden sm:inline">Score</span>
            <span className="font-mono font-bold text-[#ffe08a]">
              {score.toLocaleString('en-US')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={togglePause}
              disabled={status === 'MANDAP_CLIMAX' || status === 'CHASM_FALL'}
              aria-label={status === 'PAUSED' ? 'Resume game' : 'Pause game'}
              className="w-9 h-9 rounded-lg border border-[#f4c668]/35 bg-[#380b1b] hover:bg-[#4e1126] disabled:opacity-40 text-[#ffe08a] flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe08a]"
            >
              {status === 'PAUSED' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
              className="w-9 h-9 rounded-lg border border-[#f4c668]/35 bg-[#380b1b] hover:bg-[#4e1126] text-[#ffe08a] flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe08a]"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Live 60fps Game Canvas Container */}
      <div
        ref={containerRef}
        onPointerDown={(e) => {
          if (status === 'PLAYING') {
            e.preventDefault();
            triggerJump();
          }
        }}
        onPointerUp={() => releaseJump()}
        className="relative w-full h-[270px] sm:h-[330px] md:h-[360px] rounded-xl overflow-hidden border border-[#f4c668]/45 bg-[#13040a] select-none touch-none cursor-pointer shadow-[inset_0_0_30px_rgba(0,0,0,0.65)]"
      >
        <canvas ref={canvasRef} className="block w-full h-full" />

        {/* Controls Hint */}
        {showControlsHint && status === 'PLAYING' && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1 rounded-full bg-[#18050b]/85 border border-[#f4c668]/45 text-[11px] sm:text-xs text-[#ffe8ad] whitespace-nowrap">
            Jump over Chasms · Collect Hearts (+1,000) · Tap or Space
          </div>
        )}

        {/* Mandap Climax Celebration Banner & Continue Action */}
        {status === 'MANDAP_CLIMAX' && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute inset-x-0 top-3 z-30 flex flex-col items-center gap-2 px-3 pointer-events-none"
          >
            <div className="px-4 py-1.5 rounded-full bg-[#2b0914]/90 border border-[#ffe08a]/80 shadow-xl flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ffe08a]" aria-hidden="true" />
              <span
                className="text-xs sm:text-sm font-bold text-[#fff3c4]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Mandap Arrival! {oppositeCharacter === 'bride' ? 'Bride' : 'Groom'} Awaits With Varmala
              </span>
            </div>

            {showContinueButton && (
              <button
                type="button"
                onClick={finishToStatusCard}
                className="pointer-events-auto min-h-[42px] px-5 py-2 rounded-full bg-gradient-to-b from-[#a81c3f] to-[#6a0c23] hover:from-[#bf224a] hover:to-[#7e102b] border-2 border-[#ffe08a] text-xs sm:text-sm font-bold text-[#fff7dc] shadow-lg cursor-pointer transition-transform hover:scale-[1.02]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                View Royal Status Card
              </button>
            )}
          </div>
        )}
      </div>

      {/* Game Screen Footer: Prominent Jump Button Only */}
      <footer className="w-full pt-0.5 flex items-center justify-center">
        <button
          type="button"
          disabled={status !== 'PLAYING'}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (status === 'PLAYING') {
              triggerJump();
            }
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            releaseJump();
          }}
          onPointerCancel={() => releaseJump()}
          onClick={(e) => {
            e.stopPropagation();
            if (e.detail === 0 && status === 'PLAYING') {
              triggerJump();
            }
          }}
          aria-label="Jump"
          className="w-full max-w-[340px] min-h-[48px] sm:min-h-[52px] px-6 py-2 rounded-full bg-gradient-to-b from-[#a81c3f] via-[#83112d] to-[#5d091e] hover:from-[#bf224a] hover:via-[#961535] hover:to-[#6d0c24] active:scale-[0.97] disabled:opacity-45 disabled:pointer-events-none border-2 border-[#ffe08a] shadow-[0_6px_22px_rgba(244,198,104,0.3),inset_0_1px_1px_rgba(255,240,190,0.45)] flex items-center justify-center gap-2.5 text-[#fff7dc] font-extrabold text-base sm:text-lg tracking-[0.14em] uppercase select-none touch-manipulation cursor-pointer transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe08a]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <ArrowUp className="w-5 h-5 text-[#ffe08a] stroke-[2.75]" aria-hidden="true" />
          <span>JUMP</span>
        </button>
      </footer>

      {/* Chasm Restart Modal Overlay (centered across full game container so it never clips) */}
      {status === 'CHASM_FALL' && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute inset-0 z-40 rounded-xl bg-[#120308]/85 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          <div className="w-full max-w-md max-h-full overflow-y-auto rounded-2xl bg-gradient-to-b from-[#2b0914] to-[#17040b] border-2 border-[#f4c668] p-4 sm:p-6 text-center shadow-[0_18px_50px_rgba(0,0,0,0.92)]">
            <div className="mx-auto mb-2.5 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#4a0d20] border border-[#ffe08a]/70 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-[#e11d48] fill-[#e11d48]" aria-hidden="true" />
            </div>

            <p
              lang="hi"
              className="text-sm sm:text-base font-semibold text-[#fff3c4] leading-relaxed mb-3.5"
              style={{ fontFamily: '"Noto Sans Devanagari", var(--font-sans)' }}
            >
              कोई बात नहीं, प्यार की राह में थोड़ा ठहरना भी खास होता है — एक बार फिर पूरी धड़कन के साथ कोशिश करें!
            </p>

            <div className="flex items-center justify-center gap-4 text-xs text-[#e5c994] mb-4 py-2 px-3 rounded-xl bg-[#16040a]/90 border border-[#f4c668]/25 tabular-nums">
              <span>
                Hearts:{' '}
                <strong className="font-mono text-[#ffe8ad]">
                  {heartsEarned} / {totalHearts}
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Score:{' '}
                <strong className="font-mono text-[#ffe08a]">
                  {score.toLocaleString('en-US')}
                </strong>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={resetJourney}
                className="flex-1 min-h-[44px] sm:min-h-[46px] px-5 py-2 rounded-full bg-gradient-to-b from-[#a81c3f] to-[#6a0c23] hover:from-[#bf224a] hover:to-[#7e102b] border-2 border-[#ffe08a] text-sm sm:text-base font-bold text-[#fff7dc] cursor-pointer shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe08a]"
                style={{ fontFamily: '"Noto Sans Devanagari", var(--font-sans)' }}
              >
                फिर से आज़माएं ✨
              </button>
              <button
                type="button"
                onClick={onBackToLobby}
                className="min-h-[42px] sm:min-h-[46px] px-4 py-2 rounded-full bg-[#330917] hover:bg-[#491023] border border-[#f4c668]/50 text-xs sm:text-sm font-semibold text-[#ffe8ad] cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe08a]"
              >
                Switch Ride
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Overlay (centered across full game container) */}
      {status === 'PAUSED' && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute inset-0 z-40 rounded-xl bg-[#120308]/80 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="w-full max-w-xs rounded-xl bg-[#220710] border-2 border-[#f4c668]/80 p-5 text-center shadow-2xl">
            <h3
              className="text-xl font-bold text-[#ffe08a] mb-1"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Journey Paused
            </h3>
            <p className="text-xs text-[#e8cf9b] mb-4">
              {charMeta.title} · {rideMeta.name} · {formatTimer(timeRemaining)} left
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={togglePause}
                className="w-full min-h-[44px] px-4 py-2 rounded-lg bg-gradient-to-b from-[#a81c3f] to-[#6e0d25] border border-[#ffe08a] text-sm font-bold text-[#fff6dc] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>Resume Journey</span>
              </button>
              <button
                type="button"
                onClick={onBackToLobby}
                className="w-full min-h-[42px] px-4 py-2 rounded-lg bg-[#340a18] hover:bg-[#491022] border border-[#f4c668]/40 text-xs font-semibold text-[#ffe8ad] cursor-pointer"
              >
                Change Character / Ride
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
