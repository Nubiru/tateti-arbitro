import React from 'react';
import { ThemeSwitcher, ConnectionStatus } from '../ui';
import './Header.css';

/**
 * Header Component
 * Fixed position header with app logo/title, theme switcher, and connection status
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isDark - Whether dark mode is enabled
 * @param {Function} props.onToggleDark - Dark mode toggle handler
 * @param {string} props.connectionStatus - Server connection status
 */
const Header = ({ isDark, onToggleDark, connectionStatus = 'connecting' }) => {
  return (
    <header className="app-header">
      <div className="app-header-content">
        <div className="app-header-logo">
          <h1 className="app-header-title">Ta-Te-Ti Arbitro</h1>
          <span className="app-header-subtitle">
            UPC - Programación Full Stack
          </span>
        </div>
        <div className="app-header-actions">
          <ConnectionStatus
            status={connectionStatus}
            className="header-connection-status"
          />
          <ThemeSwitcher isDark={isDark} onToggleDark={onToggleDark} />
        </div>
      </div>
    </header>
  );
};

export default Header;
