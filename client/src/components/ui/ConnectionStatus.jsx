import React from 'react';
import styles from './ConnectionStatus.module.css';

/**
 * Connection Status Component
 * Shows backend connection status to user
 * @lastModified 2025-10-06
 * @version 1.0.0
 */

const ConnectionStatus = ({ status, className = '' }) => {
  const getStatusInfo = status => {
    switch (status) {
      case 'connecting':
        return {
          icon: '🔄',
          message: 'Conectando con el servidor...',
          type: 'info',
        };
      case 'connected':
        return {
          icon: '✅',
          message: 'Servidor conectado',
          type: 'success',
        };
      case 'error':
        return {
          icon: '❌',
          message: 'Error de conexión con el servidor',
          type: 'error',
        };
      case 'disconnected':
        return {
          icon: '⚠️',
          message: 'Servidor desconectado',
          type: 'warning',
        };
      default:
        return {
          icon: '❓',
          message: 'Estado desconocido',
          type: 'info',
        };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <div
      className={`${styles.connectionStatus} ${
        styles[statusInfo.type]
      } ${className}`}
    >
      <span className={styles.statusIcon}>{statusInfo.icon}</span>
      <span className={styles.statusMessage}>{statusInfo.message}</span>
    </div>
  );
};

export default ConnectionStatus;
