import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import BracketView from '../components/BracketView';

/**
 * Tournament Container
 * Manages tournament state and bracket logic
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

const TournamentContainer = ({ config }) => {
  const { tournament } = useGame();
  const [localTournament, setLocalTournament] = useState(tournament);

  // Actualizar estado local del torneo cuando cambian las props
  useEffect(() => {
    setLocalTournament(tournament);
  }, [tournament]);

  // Manejar actualizaciones del torneo
  // const handleTournamentUpdate = (updatedTournament) => {
  //   setLocalTournament(updatedTournament);
  // };

  // Obtener datos de visualización del torneo
  const getTournamentData = () => {
    if (!localTournament) {
      return {
        rounds: [],
        winner: null,
        runnerUp: null,
        totalMatches: 0,
        completedMatches: 0,
      };
    }

    return {
      rounds: localTournament.rounds || [],
      winner: localTournament.winner || null,
      runnerUp: localTournament.runnerUp || null,
      totalMatches: localTournament.totalMatches || 0,
      completedMatches: localTournament.completedMatches || 0,
    };
  };

  const tournamentData = getTournamentData();

  return (
    <div className="tournament-container">
      <BracketView tournament={tournamentData} config={config} />
    </div>
  );
};

export default TournamentContainer;
