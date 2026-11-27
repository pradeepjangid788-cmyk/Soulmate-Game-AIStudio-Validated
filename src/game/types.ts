export type CharacterId = 'groom' | 'bride';
export type RideId = 'horse' | 'elephant' | 'chariot';
export type AppScreen = 'LOBBY' | 'GAME' | 'STATUS_CARD';
export type PlayStatus = 'PLAYING' | 'PAUSED' | 'CHASM_FALL' | 'MANDAP_CLIMAX';

export const PLAY_URL = 'https://soulmate-dream.ai.studio';
export const PLAY_URL_DISPLAY = 'soulmate-dream.ai.studio';

export interface CharacterOption {
  id: CharacterId;
  title: string;
  portraitSrc: string;
  shortLabel: string;
}

export interface RideOption {
  id: RideId;
  name: string;
  imageSrc: string;
  description: string;
}

export const CHARACTER_OPTIONS: CharacterOption[] = [
  {
    id: 'groom',
    title: 'GROOM',
    portraitSrc: '/src/assets/images/groom_portrait_1795454224696.jpg',
    shortLabel: 'Groom',
  },
  {
    id: 'bride',
    title: 'BRIDE',
    portraitSrc: '/src/assets/images/bride_portrait_1795454226458.jpg',
    shortLabel: 'Bride',
  },
];

export const RIDE_OPTIONS: RideOption[] = [
  {
    id: 'horse',
    name: 'Royal Horse',
    imageSrc: '/src/assets/images/ride_royal_horse_solo_1795460164194.jpg',
    description: 'Standalone white Marwari steed',
  },
  {
    id: 'elephant',
    name: 'Elephant Maharaja',
    imageSrc: '/src/assets/images/ride_elephant_maharaja_1795454226861.jpg',
    description: 'Majestic elephant with golden howdah',
  },
  {
    id: 'chariot',
    name: 'Royal Chariot',
    imageSrc: '/src/assets/images/ride_royal_chariot_horse_1795461701567.jpg',
    description: 'Golden rath pulled by a royal horse',
  },
];

export interface ChasmGap {
  id: number;
  x: number;
  width: number;
  cleared: boolean;
}

export interface HeartCollectible {
  id: number;
  x: number;
  y: number;
  radius: number;
  points: number;
  phase: number;
  collected: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
  kind: 'spark' | 'petal' | 'firework';
  rotation: number;
  vRot: number;
}

export interface FireworkRocket {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  color: string;
  exploded: boolean;
}

export interface FloatingText {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface SessionSummary {
  playerName: string;
  score: number;
  heartsCollected: number;
  totalHearts: number;
  chasmsCleared: number;
  character: CharacterId;
  ride: RideId;
}

export function formatLoveOfHeartMessage(
  playerName: string,
  character: CharacterId,
  score: number
): string {
  const trimmed = playerName.trim();
  const scoreStr = score.toLocaleString('en-US');
  if (!trimmed) {
    return `YOU EARN ${scoreStr} TIMES LOVE OF HEART FOR YOUR SOULMATE`;
  }
  const possessive = character === 'groom' ? 'HIS' : 'HER';
  return `${trimmed.toUpperCase()} EARNS ${scoreStr} TIMES LOVE OF HEART FOR ${possessive} SOULMATE`;
}
