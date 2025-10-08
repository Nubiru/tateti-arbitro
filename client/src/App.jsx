import React, { useState, useEffect } from 'react';
import GameContainer from './containers/GameContainer';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/layout/Header';
import { GameProvider, useGame } from './context/GameContext';

/**
 * Componente Principal de la Aplicación
 * @lastModified 2025-10-05
 * @version 1.0.0
 */

// Component that can access GameContext
const AppContent = ({
  themeState,
  handleDarkToggle,
  handleVisualThemeChange,
}) => {
  const { connectionStatus } = useGame();

  return (
    <>
      <Header
        isDark={themeState.isDark}
        onToggleDark={handleDarkToggle}
        connectionStatus={connectionStatus}
      />
      <div className="app-content">
        <GameContainer
          visualTheme={themeState.visualTheme}
          onVisualThemeChange={handleVisualThemeChange}
        />
      </div>
    </>
  );
};

function App() {
  // Inicializar estado del tema con isDark y visualTheme
  const [themeState, setThemeState] = useState(() => {
    const savedTheme = localStorage.getItem('tateti-theme');
    if (savedTheme) {
      // Analizar formato de tema existente (ej., 'dark-neon' -> { isDark: true, visualTheme: 'neon' })
      const [base, visual] = savedTheme.split('-');
      return {
        isDark: base === 'dark',
        visualTheme: visual || 'neon',
      };
    }
    return { isDark: true, visualTheme: 'neon' };
  });

  // Generar ID completo del tema desde el estado
  const fullTheme = `${themeState.isDark ? 'dark' : 'light'}-${
    themeState.visualTheme
  }`;

  // Aplicar tema al elemento html
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', fullTheme);
    localStorage.setItem('tateti-theme', fullTheme);
  }, [fullTheme]);

  const handleDarkToggle = () => {
    setThemeState(prev => ({
      ...prev,
      isDark: !prev.isDark,
    }));
  };

  const handleVisualThemeChange = newVisualTheme => {
    setThemeState(prev => ({
      ...prev,
      visualTheme: newVisualTheme,
    }));
  };

  return (
    <ErrorBoundary>
      <GameProvider>
        <AppContent
          themeState={themeState}
          handleDarkToggle={handleDarkToggle}
          handleVisualThemeChange={handleVisualThemeChange}
        />
      </GameProvider>
    </ErrorBoundary>
  );
}

export default App;
