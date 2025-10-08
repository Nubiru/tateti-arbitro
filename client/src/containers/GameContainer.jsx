import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import PresentationScreen from '../screens/PresentationScreen';
import ConfigScreen from '../screens/ConfigScreen';
import ProgressScreen from '../screens/ProgressScreen';
import CelebrationScreen from '../screens/CelebrationScreen';
import BracketView from '../components/BracketView';

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
  } = useGame();
  const [currentScreen, setCurrentScreen] = useState('presentation');

  // Manejar transiciones de pantalla basadas en el estado del juego
  useEffect(() => {
    // No cambiar automáticamente si estamos en la pantalla de presentación
    if (currentScreen === 'presentation' && gameState === 'idle') {
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
        setCurrentScreen('celebration');
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
  }, [gameState, currentScreen]);

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
    if (gameConfig.gameMode === 'tournament') {
      // Iniciar torneo
      await startTournament(gameConfig);
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
          <ProgressScreen
            config={config}
            onTournamentBracket={handleTournamentBracket}
            onGameComplete={handleGameComplete}
            onBack={handleBack}
            onActivity={handleActivity}
          />
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
