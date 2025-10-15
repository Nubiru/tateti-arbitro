import React from 'react';
import Card from './Card';
import AnimatedInput from './AnimatedInput';
import AnimatedCheckbox from './AnimatedCheckbox';
import styles from './PlayerProfile.module.css';

/**
 * PlayerProfile Component
 * Individual player input card with name, port/url, and human checkbox
 * @lastModified 2025-01-27
 * @version 1.1.0
 */

const PlayerProfile = ({
  player,
  index,
  onUpdate,
  isConnected = false,
  className = '',
  ...props
}) => {
  const handleNameChange = e => {
    onUpdate(index, 'name', e.target.value);
  };

  const handlePortChange = e => {
    onUpdate(index, 'port', parseInt(e.target.value) || 0);
  };

  const handleUrlChange = e => {
    onUpdate(index, 'url', e.target.value);
  };

  const handleHumanChange = e => {
    const isHuman = e.target.checked;
    onUpdate(index, 'isHuman', isHuman);

    // KISS solution: When human is checked, set port to 0 and name to default
    if (isHuman) {
      onUpdate(index, 'port', 0);
      onUpdate(index, 'name', 'Tú nombre?');
    }
  };

  // Determine if this is a Vercel bot (has URL) or Docker bot (has port)
  const isVercelBot = player.url && !player.port;
  const botSource = player.source || (isVercelBot ? 'vercel' : 'docker');

  return (
    <Card
      variant="player"
      padding="small"
      className={`${styles.playerProfile} ${
        isConnected ? styles.connected : ''
      } ${className}`}
      {...props}
    >
      <div className={styles.playerHeader}>
        <span className={styles.playerNumber}>#{index + 1}</span>
        <div className={styles.headerRight}>
          {!player.isHuman && (
            <div className={styles.botSource}>
              <div className={`${styles.sourceIcon} ${styles[botSource]}`}>
                {botSource === 'vercel' ? 'V' : 'D'}
              </div>
            </div>
          )}
          {isConnected && (
            <div className={styles.connectionStatus}>
              <div className={styles.statusDot}></div>
            </div>
          )}
          <label className={styles.humanLabel}>
            <AnimatedCheckbox
              checked={player.isHuman || false}
              onChange={handleHumanChange}
            />
            <span>{player.isHuman ? 'Humano' : player.type || 'Bot'}</span>
          </label>
        </div>
      </div>

      <div className={styles.playerInputs}>
        <AnimatedInput
          type="text"
          placeholder="Nombre"
          value={player.name}
          onChange={handleNameChange}
          className={styles.playerNameInput}
        />

        {isVercelBot ? (
          <AnimatedInput
            type="url"
            placeholder="https://bot.vercel.app"
            value={player.url}
            onChange={handleUrlChange}
            className={styles.playerUrlInput}
          />
        ) : (
          <AnimatedInput
            type="number"
            placeholder="Puerto"
            value={player.port}
            onChange={handlePortChange}
            className={styles.playerPortInput}
            min="3000"
            max="9999"
          />
        )}
      </div>
    </Card>
  );
};

export default PlayerProfile;
