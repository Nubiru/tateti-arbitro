import React from 'react';
import './BracketView.css';

/**
 * BracketView Component
 * Displays tournament bracket with rounds and matches
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

const BracketView = ({ tournament, config }) => {
  if (!tournament || !config) {
    return (
      <div className="bracketView">
        <div className="bracketHeader">
          <h2 className="bracketTitle">Bracket del Torneo</h2>
          <div className="tournamentInfo">
            <span className="infoItem">
              <strong>Jugadores:</strong> 0
            </span>
            <span className="infoItem">
              <strong>Partidas:</strong> 0
            </span>
            <span className="infoItem">
              <strong>Completadas:</strong> 0
            </span>
          </div>
        </div>
        <div className="bracketContent">
          <p>No hay datos del torneo disponibles</p>
        </div>
      </div>
    );
  }

  const { rounds, winner, runnerUp } = tournament;
  const { players = [] } = config;

  const getPlayerColor = playerId => {
    const colors = [
      'rgb(239, 68, 68)', // Rojo
      'rgb(245, 158, 11)', // Naranja
      'rgb(34, 197, 94)', // Verde
      'rgb(59, 130, 246)', // Azul
      'rgb(147, 51, 234)', // Púrpura
      'rgb(236, 72, 153)', // Rosa
    ];
    return colors[playerId % colors.length];
  };

  const getPlayerName = playerId => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : `Player${playerId}`;
  };

  const getPlayerPort = playerId => {
    const player = players.find(p => p.id === playerId);
    return player ? player.port : 3000 + playerId;
  };

  return (
    <div className="bracketView">
      <div className="bracketHeader">
        <h2 className="bracketTitle">Bracket del Torneo</h2>
        <div className="tournamentInfo">
          <span className="infoItem">
            <strong>Jugadores:</strong> {players.length}
          </span>
          <span className="infoItem">
            <strong>Partidas:</strong> {tournament.totalMatches || 0}
          </span>
          <span className="infoItem">
            <strong>Completadas:</strong> {tournament.completedMatches || 0}
          </span>
        </div>
      </div>

      <div className="bracketContent">
        {rounds &&
          rounds.map((round, roundIndex) => (
            <div key={roundIndex} className="tournamentRound">
              <div className="roundHeader">
                <h3 className="roundTitle">Ronda {roundIndex + 1}</h3>
                <span className="roundStatus">
                  {round.completed ? '✅ Completada' : '⏳ En progreso'}
                </span>
              </div>
              <div className="roundMatches">
                {round.matches &&
                  round.matches.map((match, matchIndex) => (
                    <div key={matchIndex} className="matchCard">
                      <div className="matchHeader">
                        <span className="matchId">Ronda {roundIndex + 1}</span>
                        <span className="matchStatus">
                          {match.winner ? '✅' : '⏳'}
                        </span>
                      </div>
                      <div className="playersContainer">
                        <div
                          className={`player ${
                            match.winner === match.player1 ? 'winner' : ''
                          }`}
                          style={{
                            '--player-color':
                              match.winner === match.player1
                                ? getPlayerColor(match.player1)
                                : 'rgb(243, 244, 246)',
                            '--player-text-color':
                              match.winner === match.player1
                                ? 'white'
                                : 'rgb(55, 65, 81)',
                          }}
                        >
                          <span className="playerName">
                            {getPlayerName(match.player1)}
                          </span>
                          {match.winner === match.player1 && (
                            <span className="winnerBadge">👑</span>
                          )}
                        </div>
                        <div className="vs">VS</div>
                        <div
                          className={`player ${
                            match.winner === match.player2 ? 'winner' : ''
                          }`}
                          style={{
                            '--player-color':
                              match.winner === match.player2
                                ? getPlayerColor(match.player2)
                                : 'rgb(243, 244, 246)',
                            '--player-text-color':
                              match.winner === match.player2
                                ? 'white'
                                : 'rgb(55, 65, 81)',
                          }}
                        >
                          <span className="playerName">
                            {getPlayerName(match.player2)}
                          </span>
                          {match.winner === match.player2 && (
                            <span className="winnerBadge">👑</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
      </div>

      {winner && (
        <div className="tournamentWinner">
          <div className="winnerCrown">👑</div>
          <h3 className="winnerName">{getPlayerName(winner)}</h3>
          <p className="winnerMessage">¡Campeón del Torneo!</p>
          {runnerUp && (
            <div className="runnerUp">
              <p className="runnerUpMessage">
                Subcampeón: {getPlayerName(runnerUp)}
              </p>
              <p className="runnerUpPort">Puerto: {getPlayerPort(runnerUp)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BracketView;
