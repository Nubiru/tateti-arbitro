import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import BracketView from '../components/bracket/BracketView';

/**
 * Bracket Screen Component
 * Tournament bracket visualization
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

const BracketScreen = ({ config, onBack, onActivity }) => {
  const { tournament } = useGame();

  useEffect(() => {
    onActivity();
  }, [onActivity]);

  return (
    <div className="bracket-screen">
      <div className="bracket-container">
        {/* Header */}
        <div className="bracket-header">
          <button className="btn btn-secondary back-button" onClick={onBack}>
            ← Volver al Juego
          </button>
          <h1 className="bracket-title">Bracket del Torneo</h1>
        </div>

        {/* Bracket Visualization */}
        <div className="bracket-content">
          <BracketView tournament={tournament} config={config} />
        </div>
      </div>

      <style>{`
        .bracket-screen {
          min-height: 100vh;
          background: var(--bg-primary);
          padding: var(--spacing-lg);
        }

        .bracket-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .bracket-header {
          display: flex;
          align-items: center;
          margin-bottom: var(--spacing-xl);
        }

        .back-button {
          margin-right: var(--spacing-md);
        }

        .bracket-title {
          font-size: var(--text-3xl);
          color: var(--text-primary);
          font-weight: 700;
        }

        .bracket-content {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
        }

        .bracket-placeholder {
          text-align: center;
          padding: var(--spacing-2xl);
          background: var(--bg-secondary);
          border-radius: var(--radius-xl);
          border: 2px dashed var(--border-medium);
        }

        .placeholder-icon {
          font-size: var(--text-5xl);
          margin-bottom: var(--spacing-lg);
        }

        .bracket-placeholder h2 {
          font-size: var(--text-2xl);
          color: var(--text-primary);
          margin-bottom: var(--spacing-md);
        }

        .bracket-placeholder p {
          font-size: var(--text-lg);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-lg);
        }

        .bracket-features {
          text-align: left;
          max-width: 300px;
          margin: 0 auto;
        }

        .feature {
          padding: var(--spacing-sm) 0;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

export default BracketScreen;
