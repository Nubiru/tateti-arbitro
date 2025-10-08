import React from 'react';
import Card from './Card';
import AnimatedInput from './AnimatedInput';
import AnimatedCheckbox from './AnimatedCheckbox';
import styles from './PlayerProfile.module.css';

/**
 * PlayerProfile Component
 * Individual player input card with name, port, and human checkbox
 * @lastModified 2025-10-06
 * @version 1.0.0
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

  const handleHumanChange = e => {
    onUpdate(index, 'isHuman', e.target.checked);
  };

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
          {isConnected && (
            <div className={styles.connectionStatus}>
              <div className={styles.statusDot}></div>
              <span className={styles.statusText}>Conectado</span>
            </div>
          )}
          <label className={styles.humanLabel}>
            <AnimatedCheckbox
              checked={player.isHuman || false}
              onChange={handleHumanChange}
            />
            <span>Humano</span>
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

        <AnimatedInput
          type="number"
          placeholder="Puerto"
          value={player.port}
          onChange={handlePortChange}
          className={styles.playerPortInput}
          min="3000"
          max="9999"
        />
      </div>
    </Card>
  );
};

export default PlayerProfile;
