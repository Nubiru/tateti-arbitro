import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import PresentationScreen from '../screens/PresentationScreen';
import ConfigScreen from '../screens/ConfigScreen';
import ProgressScreen from '../screens/ProgressScreen';
import CelebrationScreen from '../screens/CelebrationScreen';
import BracketView from '../components/BracketView';
import ErrorBoundary from '../components/ErrorBoundary';

/**
 * Contenedor de Juego
 * Gestiona el estado del juego y las transiciones de pantalla
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

const GameContainer = ({ visualTheme, onVisualThemeChange }) => {
  const {
    gameState,
    config,
    tournament,
    matchResult,
    tournamentResult,
    startMatch,
    startTournament,
    resetGame,
    moveQueue,
    isProcessingMoves,
  } = useGame();
  const [currentScreen, setCurrentScreen] = useState('presentation');

  // Manejar transiciones de pantalla basadas en el estado del juego
  useEffect(() => {
    // DEBUG: Log screen routing decisions
    console.log(
      '[DEBUG][GameContainer][ScreenRouting] Screen routing decision:',
      {
        currentScreen,
        gameState,
        tournament: !!tournament,
        moveQueueLength: moveQueue.length,
        isProcessingMoves,
      }
    );

    // No cambiar automáticamente si estamos en la pantalla de presentación
    if (currentScreen === 'presentation' && gameState === 'idle') {
      return;
    }

    // Guard: Don't route to celebration if moves are still being processed
    if (
      gameState === 'completed' &&
      (moveQueue.length > 0 || isProcessingMoves)
    ) {
      // Stay on progress screen until move queue is empty and processing is done
      return;
    }

    // Tournament-specific routing: Show individual match progress with delays
    if (tournament && gameState === 'playing') {
      // During tournament, show individual match progress with delays
      console.log(
        '[DEBUG][GameContainer][ScreenRouting] Tournament match detected, switching to progress screen'
      );
      setCurrentScreen('progress');
      return;
    }

    switch (gameState) {
      case 'idle':
        setCurrentScreen('config');
        break;
      case 'playing':
        setCurrentScreen('progress');
        break;
      case 'completed':
        // If we're in a tournament and match completed, show bracket
        if (tournament) {
          setCurrentScreen('bracket');
        } else {
          setCurrentScreen('celebration');
        }
        break;
      case 'tournament':
        setCurrentScreen('bracket');
        break;
      case 'tournament_completed':
        setCurrentScreen('celebration');
        break;
      case 'error':
        setCurrentScreen('config');
        break;
      default:
        // No sobrescribir la pantalla de presentación
        if (currentScreen !== 'presentation') {
          setCurrentScreen('config');
        }
    }
  }, [
    gameState,
    currentScreen,
    moveQueue.length,
    isProcessingMoves,
    tournament,
  ]);

  // Manejar navegación hacia atrás
  const handleBack = () => {
    if (currentScreen === 'config') {
      setCurrentScreen('presentation');
    } else {
      // Reset game state when going back to config from any other screen
      resetGame();
      setCurrentScreen('config');
    }
  };

  // Manejar vista de llave de torneo
  const handleTournamentBracket = () => {
    setCurrentScreen('bracket');
  };

  // Manejar finalización del juego
  const handleGameComplete = () => {
    setCurrentScreen('celebration');
  };

  // Manejar actividad (mantener vivo)
  const handleActivity = () => {
    // Funcionalidad de mantener vivo
  };

  // Manejar inicio de juego
  const handleStart = async gameConfig => {
    // DEBUG: Log game start configuration
    console.log(
      '[DEBUG][GameContainer][handleStart] Starting game with config:',
      {
        gameMode: gameConfig.gameMode,
        players: gameConfig.players?.map(p => ({
          name: p.name,
          port: p.port,
          isHuman: p.isHuman,
        })),
        boardSize: gameConfig.boardSize,
        speed: gameConfig.speed,
        noTie: gameConfig.noTie,
      }
    );

    if (gameConfig.gameMode === 'tournament') {
      // Iniciar torneo
      await startTournament(gameConfig.players, {
        boardSize: gameConfig.boardSize,
        speed: gameConfig.speed,
        noTie: gameConfig.noTie,
      });
    } else {
      // Iniciar partida individual
      const [player1, player2] = gameConfig.players;
      await startMatch(player1, player2, {
        boardSize: gameConfig.boardSize,
        speed: gameConfig.speed,
        noTie: gameConfig.noTie,
      });
    }
  };

  // Renderizar pantalla actual
  const renderScreen = () => {
    switch (currentScreen) {
      case 'presentation':
        return (
          <PresentationScreen
            onStart={() => setCurrentScreen('config')}
            onActivity={handleActivity}
          />
        );
      case 'config':
        return (
          <ConfigScreen
            onBack={handleBack}
            onStart={handleStart}
            onActivity={handleActivity}
            visualTheme={visualTheme}
            onVisualThemeChange={onVisualThemeChange}
          />
        );
      case 'progress':
        return (
          <ErrorBoundary>
            <ProgressScreen
              config={config}
              onTournamentBracket={handleTournamentBracket}
              onGameComplete={handleGameComplete}
              onBack={handleBack}
              onActivity={handleActivity}
            />
          </ErrorBoundary>
        );
      case 'bracket':
        return <BracketView tournament={tournament} config={config} />;
      case 'celebration':
        return (
          <CelebrationScreen
            matchResult={matchResult}
            tournamentResult={tournamentResult}
            onReturn={handleBack}
            onActivity={handleActivity}
          />
        );
      default:
        return (
          <ConfigScreen
            onBack={handleBack}
            onStart={handleStart}
            onActivity={handleActivity}
            visualTheme={visualTheme}
            onVisualThemeChange={onVisualThemeChange}
          />
        );
    }
  };

  return <div className="game-container">{renderScreen()}</div>;
};

export default GameContainer;
