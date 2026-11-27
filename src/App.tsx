import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { GameView } from './components/GameView';
import { LobbyView } from './components/LobbyView';
import { RoyalFrame } from './components/RoyalFrame';
import { StatusCardView } from './components/StatusCardView';
import { soundEngine } from './game/audio';
import type { AppScreen, CharacterId, RideId, SessionSummary } from './game/types';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('LOBBY');
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterId>('groom');
  const [selectedRide, setSelectedRide] = useState<RideId>('horse');
  const [playerName, setPlayerName] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(() => soundEngine.isMuted());
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);

  const handleSelectCharacter = useCallback((id: CharacterId) => {
    setSelectedCharacter(id);
    soundEngine.playClick();
  }, []);

  const handleSelectRide = useCallback((id: RideId) => {
    setSelectedRide(id);
    soundEngine.playClick();
  }, []);

  const handleToggleMute = useCallback(() => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  const handleStartGame = useCallback(() => {
    soundEngine.playMandapFanfare();
    setScreen('GAME');
  }, []);

  const handleBackToLobby = useCallback(() => {
    soundEngine.playClick();
    setScreen('LOBBY');
  }, []);

  const handleCompleteJourney = useCallback((summary: SessionSummary) => {
    setSessionSummary(summary);
    setScreen('STATUS_CARD');
  }, []);

  const handlePlayAgain = useCallback(() => {
    soundEngine.playClick();
    setScreen('LOBBY');
  }, []);

  return (
    <main className="min-h-dvh w-full royal-damask-bg flex items-center justify-center p-2 sm:p-4 overflow-x-hidden">
      <div
        className={`w-full transition-[max-width] duration-200 ${
          screen === 'GAME' ? 'max-w-4xl' : 'max-w-[740px]'
        }`}
      >
        <RoyalFrame>
          <AnimatePresence mode="wait">
            {screen === 'LOBBY' && (
              <motion.div
                key="lobby"
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                <LobbyView
                  selectedCharacter={selectedCharacter}
                  selectedRide={selectedRide}
                  playerName={playerName}
                  isMuted={isMuted}
                  onSelectCharacter={handleSelectCharacter}
                  onSelectRide={handleSelectRide}
                  onChangePlayerName={setPlayerName}
                  onToggleMute={handleToggleMute}
                  onStartGame={handleStartGame}
                />
              </motion.div>
            )}

            {screen === 'GAME' && (
              <motion.div
                key="game"
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                <GameView
                  character={selectedCharacter}
                  ride={selectedRide}
                  playerName={playerName}
                  isMuted={isMuted}
                  onToggleMute={handleToggleMute}
                  onCompleteJourney={handleCompleteJourney}
                  onBackToLobby={handleBackToLobby}
                />
              </motion.div>
            )}

            {screen === 'STATUS_CARD' && sessionSummary && (
              <motion.div
                key="status-card"
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                <StatusCardView summary={sessionSummary} onPlayAgain={handlePlayAgain} />
              </motion.div>
            )}
          </AnimatePresence>
        </RoyalFrame>
      </div>
    </main>
  );
}
