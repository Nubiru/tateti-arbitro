import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { PlayerService } from '../services/PlayerService';
import styles from './ConfigScreen.module.css';
import {
  AnimatedButton,
  CustomRadio,
  AnimatedCard,
  AnimatedCheckbox,
  PlayerProfile,
} from '../components/ui';

/**
 * Configuration Screen Component
 * Game setup and options selection
 * @lastModified 2025-10-05
 * @version 2.0.0
 */

const ConfigScreen = ({
  onBack,
  onStart,
  onActivity,
  visualTheme = 'neon',
  onVisualThemeChange,
  initialConfig = {},
}) => {
  console.log('[🔍 COMPONENT] ConfigScreen rendering...');

  // Use GameContext for player management
  const {
    players,
    botDiscoveryStatus,
    discoverBots,
    populatePlayersForMode,
    updatePlayer,
  } = useGame();

  console.log('[🔍 COMPONENT] useGame completed, players:', players);

  const [config, setConfig] = useState({
    gameMode: 'single',
    boardSize: 3,
    speed: 'normal',
    noTie: false,
    playerType: 'bot',
    tournamentSize: 4,
    playerCount: 2,
    ...initialConfig,
  });

  // Connection status for backend communication - removed unused state

  // Update config when initialConfig changes - REMOVED to prevent infinite loops
  // Config is initialized with initialConfig and updated via handleConfigChange

  // Players, availableBots, and botDiscoveryStatus are now managed by GameContext

  // Local state for visual theme to handle radio button interactions
  const [localVisualTheme, setLocalVisualTheme] = useState(visualTheme);

  // Bot discovery on mount
  useEffect(() => {
    discoverBots();
  }, [discoverBots]);

  // Populate players when bot discovery completes or config changes
  useEffect(() => {
    if (botDiscoveryStatus === 'success') {
      populatePlayersForMode(config.gameMode, config);
    }
  }, [botDiscoveryStatus, config, populatePlayersForMode]);

  // Notify activity on mount
  useEffect(() => {
    if (onActivity) {
      onActivity();
    }
  }, [onActivity]);

  // Validation is now handled by useMemo - no need for useEffect

  // Sync local visual theme with prop
  useEffect(() => {
    setLocalVisualTheme(visualTheme);
  }, [visualTheme]);

  // Player management is now handled by GameContext

  const handleConfigChange = (key, value) => {
    setConfig(prev => {
      const newConfig = { ...prev, [key]: value };

      // Auto-adjust playerCount when gameMode changes
      if (key === 'gameMode') {
        if (value === 'single') {
          newConfig.playerCount = 2;
        } else if (value === 'tournament' && prev.playerCount < 4) {
          newConfig.playerCount = 4; // Default to 4 for tournament mode
        }
      }

      return newConfig;
    });
    if (onActivity) onActivity();
  };

  // updatePlayer is now provided by GameContext

  // Memoize validation result to prevent unnecessary recalculations
  const isGameValid = useMemo(() => {
    console.log('[🔍 VALIDATION] isGameValid useMemo called - START');
    console.log('[🔍 VALIDATION] Dependencies:', {
      playersLength: players.length,
      players: players.map(p => ({
        name: p.name,
        port: p.port,
        isHuman: p.isHuman,
      })),
      gameMode: config.gameMode,
    });

    const playerService = new PlayerService();
    const validation = playerService.validatePlayerSelection(
      players,
      config.gameMode
    );

    console.log('[🔍 VALIDATION] Result:', {
      players: players.map(p => ({
        name: p.name,
        port: p.port,
        isHuman: p.isHuman,
      })),
      gameMode: config.gameMode,
      validation: validation,
      isValid: validation.isValid,
    });

    return validation.isValid;
  }, [players, config.gameMode]);

  const handleStart = () => {
    if (onStart) {
      onStart({
        ...config,
        boardSize: `${config.boardSize}x${config.boardSize}`, // Convert to string format
        players: players,
      });
    }
  };

  const tournamentSizes = [2, 4, 8, 16];

  return (
    <div className={styles.configScreen}>
      <div className={styles.configContainer}>
        {/* Header with Title and Buttons */}
        <div className={styles.configHeader}>
          <AnimatedButton
            onClick={onBack}
            className={styles.headerBackButton}
            variant="secondary"
          >
            ← Volver
          </AnimatedButton>

          <h1 className={styles.configTitle}>Configuración del Juego</h1>

          <AnimatedButton
            onClick={handleStart}
            disabled={!isGameValid}
            className={styles.headerStartButton}
            variant="primary"
          >
            {config.gameMode === 'tournament'
              ? 'Iniciar Torneo'
              : 'Iniciar Partida'}
          </AnimatedButton>
        </div>

        {/* First Row: GameMode + GameOptions + Tema Visual (3 columns) */}
        <div className={styles.threeColumnRow}>
          {/* Game Mode Card - Narrow */}
          <AnimatedCard
            title="Modo de Juego"
            className={styles.narrowCard}
            width="300px"
            height="200px"
          >
            <div className={styles.inlineRadioGroup}>
              <CustomRadio
                id="gameMode-single"
                name="gameMode"
                value="single"
                checked={config.gameMode === 'single'}
                onChange={e => handleConfigChange('gameMode', e.target.value)}
                label="Individual"
              />
              <CustomRadio
                id="gameMode-tournament"
                name="gameMode"
                value="tournament"
                checked={config.gameMode === 'tournament'}
                onChange={e => handleConfigChange('gameMode', e.target.value)}
                label="Torneo"
              />
            </div>

            {/* No Tie Option - Only for Individual mode and 3x3 boards */}
            {config.gameMode === 'single' && config.boardSize === 3 && (
              <div className={styles.noTieSection}>
                <label className={styles.inlineCheckboxLabel}>
                  <AnimatedCheckbox
                    checked={config.noTie}
                    onChange={e =>
                      handleConfigChange('noTie', e.target.checked)
                    }
                  />
                  <span>Sin Empates</span>
                </label>
              </div>
            )}
          </AnimatedCard>

          {/* Game Options Card - Wide */}
          <AnimatedCard
            title="Opciones del Juego"
            className={styles.wideCard}
            width="500px"
            height="280px"
          >
            {/* Board Size */}
            <div className={styles.inlineOptionGroup}>
              <span className={styles.optionLabel}>Tablero:</span>
              <div className={styles.inlineRadioGroup}>
                <CustomRadio
                  id="boardSize-3"
                  name="boardSize"
                  value="3"
                  checked={config.boardSize === 3}
                  onChange={e =>
                    handleConfigChange('boardSize', parseInt(e.target.value))
                  }
                  label="3x3"
                />
                <CustomRadio
                  id="boardSize-5"
                  name="boardSize"
                  value="5"
                  checked={config.boardSize === 5}
                  onChange={e =>
                    handleConfigChange('boardSize', parseInt(e.target.value))
                  }
                  label="5x5"
                />
              </div>
            </div>

            {/* Speed - Inline */}
            <div className={styles.inlineOptionGroup}>
              <span className={styles.optionLabel}>Velocidad:</span>
              <div className={styles.inlineRadioGroup}>
                <CustomRadio
                  id="speed-slow"
                  name="speed"
                  value="slow"
                  checked={config.speed === 'slow'}
                  onChange={e => handleConfigChange('speed', e.target.value)}
                  label="Lento"
                />
                <CustomRadio
                  id="speed-normal"
                  name="speed"
                  value="normal"
                  checked={config.speed === 'normal'}
                  onChange={e => handleConfigChange('speed', e.target.value)}
                  label="Normal"
                />
                <CustomRadio
                  id="speed-fast"
                  name="speed"
                  value="fast"
                  checked={config.speed === 'fast'}
                  onChange={e => handleConfigChange('speed', e.target.value)}
                  label="Rápido"
                />
              </div>
            </div>

            {/* Player Count (only show for tournament mode) */}
            {config.gameMode === 'tournament' && (
              <div className={styles.inlineOptionGroup}>
                <span className={styles.optionLabel}>Jugadores:</span>
                <div className={styles.inlineRadioGroup}>
                  {[2, 4, 6, 8, 10, 16].map(count => (
                    <CustomRadio
                      key={count}
                      id={`playerCount-${count}`}
                      name="playerCount"
                      value={count}
                      checked={config.playerCount === count}
                      onChange={e =>
                        handleConfigChange(
                          'playerCount',
                          parseInt(e.target.value)
                        )
                      }
                      label={count.toString()}
                    />
                  ))}
                </div>
              </div>
            )}
          </AnimatedCard>

          {/* Visual Theme Card - Narrow */}
          <AnimatedCard
            title="Tema Visual"
            className={styles.narrowCard}
            width="300px"
            height="200px"
          >
            <div className={styles.inlineRadioGroup}>
              {['clasico', 'naranja', 'neon', 'pastel', 'rgb'].map(theme => (
                <CustomRadio
                  key={theme}
                  id={`visualTheme-${theme}`}
                  name="visualTheme"
                  value={theme}
                  checked={localVisualTheme === theme}
                  onChange={e => {
                    setLocalVisualTheme(e.target.value);
                    if (onVisualThemeChange) {
                      onVisualThemeChange(e.target.value);
                    }
                  }}
                  label={theme.charAt(0).toUpperCase() + theme.slice(1)}
                />
              ))}
            </div>
          </AnimatedCard>
        </div>

        {/* Second Row: Players Only */}
        <div className={styles.singleColumnRow}>
          {/* Players Card */}
          <AnimatedCard title="Jugadores" className={styles.fullWidthCard}>
            <div
              className={styles.playersGrid}
              data-player-count={players.length}
            >
              {players.map((player, index) => (
                <PlayerProfile
                  key={index}
                  player={player}
                  index={index}
                  onUpdate={updatePlayer}
                  isConnected={player.status === 'healthy'}
                />
              ))}
            </div>
          </AnimatedCard>
        </div>

        {/* Error Message */}
        {!isGameValid && (
          <div className={styles.errorMessage}>
            {config.gameMode === 'single'
              ? 'El modo individual requiere exactamente 2 jugadores'
              : `El torneo requiere ${tournamentSizes.join(', ')} jugadores`}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigScreen;
