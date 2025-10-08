import React, { useState, useEffect, useRef } from 'react';
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

const defaultPlayerService = new PlayerService();

const ConfigScreen = ({
  onBack,
  onStart,
  onActivity,
  visualTheme = 'neon',
  onVisualThemeChange,
  initialConfig = {},
  playerService = defaultPlayerService,
}) => {
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

  const initialPlayerCount = (() => {
    if (initialConfig.players && initialConfig.players.length > 0) {
      return initialConfig.players.length;
    }
    if (initialConfig.gameMode === 'tournament' && initialConfig.playerCount) {
      return initialConfig.playerCount;
    }
    return 2;
  })();

  const [players, setPlayers] = useState(
    initialConfig.players && initialConfig.players.length > 0
      ? initialConfig.players
      : playerService.generatePlayers(initialPlayerCount, [])
  );

  const [availableBots, setAvailableBots] = useState([]);
  const [botDiscoveryStatus, setBotDiscoveryStatus] = useState('loading');

  // Local state for visual theme to handle radio button interactions
  const [localVisualTheme, setLocalVisualTheme] = useState(visualTheme);

  // Ref to track last processed target count to prevent unnecessary re-runs
  const lastProcessedTargetCount = useRef(null);

  // Bot discovery on mount - skip in test environment
  useEffect(() => {
    // Skip bot discovery in test environment to keep unit tests synchronous
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const discoverBots = async () => {
      try {
        setBotDiscoveryStatus('loading');
        const response = await fetch('/api/bots/available');
        if (response.ok) {
          const data = await response.json();
          setAvailableBots(data.bots);
          setBotDiscoveryStatus('success');
        } else {
          // Bot discovery failed - handled by error state
          setBotDiscoveryStatus('error');
        }
      } catch (error) {
        // Error discovering bots - could be logged in development
        setBotDiscoveryStatus('error');
      }
    };

    discoverBots();
  }, []);

  // Populate players immediately after bot discovery completes
  useEffect(() => {
    if (botDiscoveryStatus === 'success' && availableBots.length > 0) {
      const healthyBots = availableBots.filter(bot => bot.status === 'healthy');
      healthyBots.sort((a, b) => a.port - b.port);

      const targetCount =
        config.gameMode === 'single' ? 2 : config.playerCount || 2;
      const newPlayers = [];

      for (let i = 0; i < targetCount; i++) {
        if (i < healthyBots.length) {
          newPlayers.push({
            name: healthyBots[i].name,
            port: healthyBots[i].port,
            isHuman: false,
            status: healthyBots[i].status,
            type: healthyBots[i].type,
            capabilities: healthyBots[i].capabilities,
          });
        } else {
          const fallback = playerService.generatePlayers(i + 1, [])[i];
          newPlayers.push(fallback);
        }
      }

      setPlayers(newPlayers);
      lastProcessedTargetCount.current = targetCount;
    }
  }, [
    botDiscoveryStatus,
    availableBots,
    config.gameMode,
    config.playerCount,
    playerService,
  ]);

  // Notify activity on mount
  useEffect(() => {
    if (onActivity) {
      onActivity();
    }
  }, [onActivity]);

  // Sync local visual theme with prop
  useEffect(() => {
    setLocalVisualTheme(visualTheme);
  }, [visualTheme]);

  // Update players if initialConfig.players changes
  useEffect(() => {
    if (initialConfig.players && initialConfig.players.length > 0) {
      setPlayers(initialConfig.players);
    }
  }, [initialConfig.players]);

  // Auto-generate players based on game mode and playerCount
  useEffect(() => {
    // Don't auto-generate if initialConfig.players is provided
    if (initialConfig.players && initialConfig.players.length > 0) {
      return;
    }

    // Wait for bot discovery to complete
    if (botDiscoveryStatus === 'loading') {
      return;
    }

    let targetPlayerCount;

    if (config.gameMode === 'single') {
      // Individual mode: always 2 players
      targetPlayerCount = 2;
    } else {
      // Tournament mode: use selected playerCount
      targetPlayerCount = config.playerCount || 2;
    }

    // Skip if we've already processed this target count
    if (lastProcessedTargetCount.current === targetPlayerCount) {
      return;
    }

    // Reset the ref when game mode changes to force regeneration
    if (lastProcessedTargetCount.current !== targetPlayerCount) {
      lastProcessedTargetCount.current = null;
    }

    const currentPlayerCount = players.length;

    // Only update if target count is different
    if (targetPlayerCount !== currentPlayerCount) {
      // Always regenerate players when count changes
      const newPlayers = [];
      const healthyBots = availableBots.filter(bot => bot.status === 'healthy');

      // Sort bots by port for consistent ordering
      healthyBots.sort((a, b) => a.port - b.port);

      for (let i = 0; i < targetPlayerCount; i++) {
        if (i < healthyBots.length) {
          // Use discovered bot
          newPlayers.push({
            name: healthyBots[i].name,
            port: healthyBots[i].port,
            isHuman: false,
            status: healthyBots[i].status,
            type: healthyBots[i].type,
            capabilities: healthyBots[i].capabilities,
          });
        } else {
          // Fallback to generic bot
          const playerNumber = i + 1;
          // Use service to build consistent fallback structure
          const fallback = playerService.generatePlayers(playerNumber, [])[
            playerNumber - 1
          ];
          newPlayers.push(fallback);
        }
      }

      setPlayers(newPlayers);

      // Update the ref to track this target count
      lastProcessedTargetCount.current = targetPlayerCount;

      if (onActivity) onActivity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    config.gameMode,
    config.playerCount,
    availableBots,
    botDiscoveryStatus,
    onActivity,
    // Removed players.length and config.players to prevent infinite loops
  ]);

  // Smart bot detection and auto-fill - REMOVED INFINITE LOOP
  // This useEffect was causing infinite loops and corrupting player data
  // Player data is now managed by the auto-generation useEffect above

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    if (onActivity) onActivity();
  };

  const updatePlayer = (index, field, value) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
    if (onActivity) onActivity();
  };

  const isTournamentValid = () => {
    if (config.gameMode === 'tournament') {
      const validSizes = [2, 4, 8, 16];
      return validSizes.includes(players.length);
    }
    return true;
  };

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
            disabled={!isTournamentValid()}
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
        {!isTournamentValid() && (
          <div className={styles.errorMessage}>
            El torneo requiere {tournamentSizes.join(', ')} jugadores
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigScreen;
