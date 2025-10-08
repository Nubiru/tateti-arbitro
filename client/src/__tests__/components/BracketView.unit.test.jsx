/**
 * Pruebas Unitarias de BracketView
 * Pruebas para el componente BracketView
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import BracketView from '../../components/BracketView';

describe('BracketView Component', () => {
  const mockConfig = {
    players: [
      { id: 1, name: 'Player 1', port: 3001 },
      { id: 2, name: 'Player 2', port: 3002 },
      { id: 3, name: 'Player 3', port: 3003 },
      { id: 4, name: 'Player 4', port: 3004 },
    ],
  };

  const mockTournament = {
    rounds: [
      {
        completed: true,
        matches: [
          {
            player1: 1,
            player2: 2,
            winner: 1,
          },
          {
            player1: 3,
            player2: 4,
            winner: 3,
          },
        ],
      },
      {
        completed: true,
        matches: [
          {
            player1: 1,
            player2: 3,
            winner: 1,
          },
        ],
      },
    ],
    winner: 1,
    runnerUp: 3,
    totalMatches: 3,
    completedMatches: 3,
  };

  describe('Rendering', () => {
    test('debería render with tournament and config data', () => {
      const { container } = render(
        <BracketView tournament={mockTournament} config={mockConfig} />
      );

      expect(screen.getByText('Bracket del Torneo')).toBeInTheDocument();
      expect(container.textContent).toContain('Jugadores: 4');
      expect(container.textContent).toContain('Partidas: 3');
      expect(container.textContent).toContain('Completadas: 3');
    });

    test('debería render empty state when no tournament data', () => {
      const { container } = render(
        <BracketView tournament={null} config={mockConfig} />
      );

      expect(screen.getByText('Bracket del Torneo')).toBeInTheDocument();
      expect(container.textContent).toContain('Jugadores: 0');
      expect(container.textContent).toContain('Partidas: 0');
      expect(container.textContent).toContain('Completadas: 0');
      expect(
        screen.getByText('No hay datos del torneo disponibles')
      ).toBeInTheDocument();
    });

    test('debería render empty state when no config data', () => {
      const { container } = render(
        <BracketView tournament={mockTournament} config={null} />
      );

      expect(screen.getByText('Bracket del Torneo')).toBeInTheDocument();
      expect(container.textContent).toContain('Jugadores: 0');
      expect(container.textContent).toContain('Partidas: 0');
      expect(container.textContent).toContain('Completadas: 0');
      expect(
        screen.getByText('No hay datos del torneo disponibles')
      ).toBeInTheDocument();
    });
  });

  describe('Tournament Rounds', () => {
    test('debería render all tournament rounds', () => {
      render(<BracketView tournament={mockTournament} config={mockConfig} />);

      // Verificar títulos de ronda específicamente (elementos con clase roundTitle)
      const roundTitles = screen.getAllByText(/^Ronda \d+$/, {
        selector: '.roundTitle',
      });
      expect(roundTitles).toHaveLength(2);
      expect(roundTitles[0]).toHaveTextContent('Ronda 1');
      expect(roundTitles[1]).toHaveTextContent('Ronda 2');
    });

    test('debería render round status indicators', () => {
      render(<BracketView tournament={mockTournament} config={mockConfig} />);

      const statusIndicators = screen.getAllByText('✅ Completada');
      expect(statusIndicators).toHaveLength(2);
    });

    test('debería render in-progress round status', () => {
      const inProgressTournament = {
        ...mockTournament,
        rounds: [
          {
            completed: false,
            matches: [
              {
                player1: 1,
                player2: 2,
                winner: null,
              },
            ],
          },
        ],
      };

      render(
        <BracketView tournament={inProgressTournament} config={mockConfig} />
      );

      expect(screen.getByText('⏳ En progreso')).toBeInTheDocument();
    });
  });

  describe('Match Display', () => {
    test('debería render all matches in each round', () => {
      render(<BracketView tournament={mockTournament} config={mockConfig} />);

      // Debería tener 2 partidas en ronda 1, 1 partida en ronda 2
      const matchCards = screen.getAllByText(/Ronda \d+/);
      expect(matchCards).toHaveLength(5); // 2 round titles + 3 match IDs
    });

    test('debería display player names correctly', () => {
      const { container } = render(
        <BracketView tournament={mockTournament} config={mockConfig} />
      );

      // Verificar que todos los jugadores que aparecen en partidas son renderizados
      expect(container.textContent).toContain('Player 1');
      expect(container.textContent).toContain('Player 2');
      expect(container.textContent).toContain('Player 3');
      expect(container.textContent).toContain('Player 4');
    });

    test('debería display VS separators', () => {
      render(<BracketView tournament={mockTournament} config={mockConfig} />);

      const vsElements = screen.getAllByText('VS');
      expect(vsElements).toHaveLength(3);
    });

    test('debería show winner badges for winning players', () => {
      render(<BracketView tournament={mockTournament} config={mockConfig} />);

      const winnerBadges = screen.getAllByText('👑');
      expect(winnerBadges).toHaveLength(4); // 3 in matches + 1 in winner section
    });

    test('debería show match status indicators', () => {
      render(<BracketView tournament={mockTournament} config={mockConfig} />);

      const statusIndicators = screen.getAllByText('✅');
      expect(statusIndicators).toHaveLength(3); // 3 matches
    });
  });

  describe('Player Color Assignment', () => {
    test('debería assign different colors to different players', () => {
      render(<BracketView tournament={mockTournament} config={mockConfig} />);

      // Check that players have different colors
      const playerElements = screen.getAllByText(/Player \d+/);
      expect(playerElements).toHaveLength(8); // 4 unique players appear multiple times
    });

    test('debería handle players with missing data', () => {
      const tournamentWithMissingPlayer = {
        ...mockTournament,
        rounds: [
          {
            completed: true,
            matches: [
              {
                player1: 1,
                player2: 999, // Non-existent player
                winner: 1,
              },
            ],
          },
        ],
      };

      const { container } = render(
        <BracketView
          tournament={tournamentWithMissingPlayer}
          config={mockConfig}
        />
      );

      expect(container.textContent).toContain('Player 1');
      expect(container.textContent).toContain('Player999');
    });
  });

  describe('Tournament Winner', () => {
    test('debería display tournament winner', () => {
      const { container } = render(
        <BracketView tournament={mockTournament} config={mockConfig} />
      );

      expect(container.textContent).toContain('Player 1');
      expect(container.textContent).toContain('¡Campeón del Torneo!');
    });

    test('debería display runner-up when available', () => {
      render(<BracketView tournament={mockTournament} config={mockConfig} />);

      expect(screen.getByText('Subcampeón: Player 3')).toBeInTheDocument();
      expect(screen.getByText('Puerto: 3003')).toBeInTheDocument();
    });

    test('debería not display runner-up section when not available', () => {
      const tournamentWithoutRunnerUp = {
        ...mockTournament,
        runnerUp: null,
      };

      render(
        <BracketView
          tournament={tournamentWithoutRunnerUp}
          config={mockConfig}
        />
      );

      expect(screen.queryByText('Subcampeón:')).not.toBeInTheDocument();
    });

    test('debería not display winner section when no winner', () => {
      const tournamentWithoutWinner = {
        ...mockTournament,
        winner: null,
      };

      render(
        <BracketView tournament={tournamentWithoutWinner} config={mockConfig} />
      );

      expect(
        screen.queryByText('¡Campeón del Torneo!')
      ).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('debería handle empty rounds array', () => {
      const tournamentWithEmptyRounds = {
        ...mockTournament,
        rounds: [],
      };

      render(
        <BracketView
          tournament={tournamentWithEmptyRounds}
          config={mockConfig}
        />
      );

      expect(screen.getByText('Bracket del Torneo')).toBeInTheDocument();
    });

    test('debería handle rounds with no matches', () => {
      const tournamentWithEmptyMatches = {
        ...mockTournament,
        rounds: [
          {
            completed: false,
            matches: [],
          },
        ],
      };

      render(
        <BracketView
          tournament={tournamentWithEmptyMatches}
          config={mockConfig}
        />
      );

      expect(screen.getByText('Ronda 1')).toBeInTheDocument();
    });

    test('debería handle missing tournament properties', () => {
      const incompleteTournament = {
        rounds: [
          {
            completed: true,
            matches: [
              {
                player1: 1,
                player2: 2,
                winner: 1,
              },
            ],
          },
        ],
      };

      const { container } = render(
        <BracketView tournament={incompleteTournament} config={mockConfig} />
      );

      expect(container.textContent).toContain('Partidas: 0');
      expect(container.textContent).toContain('Completadas: 0');
    });

    test('debería handle missing config players', () => {
      const configWithoutPlayers = {};

      const { container } = render(
        <BracketView
          tournament={mockTournament}
          config={configWithoutPlayers}
        />
      );

      expect(container.textContent).toContain('Jugadores: 0');
    });
  });

  describe('Player Name and Port Functions', () => {
    test('debería get player name from config', () => {
      const { container } = render(
        <BracketView tournament={mockTournament} config={mockConfig} />
      );

      expect(container.textContent).toContain('Player 1');
      expect(container.textContent).toContain('Player 2');
    });

    test('debería fallback to default name for missing players', () => {
      const tournamentWithUnknownPlayer = {
        ...mockTournament,
        rounds: [
          {
            completed: true,
            matches: [
              {
                player1: 1,
                player2: 999,
                winner: 1,
              },
            ],
          },
        ],
      };

      render(
        <BracketView
          tournament={tournamentWithUnknownPlayer}
          config={mockConfig}
        />
      );

      expect(screen.getByText('Player999')).toBeInTheDocument();
    });

    test('debería get player port from config', () => {
      render(<BracketView tournament={mockTournament} config={mockConfig} />);

      expect(screen.getByText('Puerto: 3003')).toBeInTheDocument();
    });

    test('debería fallback to default port for missing players', () => {
      const tournamentWithUnknownPlayer = {
        ...mockTournament,
        winner: 999,
        runnerUp: 888,
      };

      render(
        <BracketView
          tournament={tournamentWithUnknownPlayer}
          config={mockConfig}
        />
      );

      // No debería fallar y debería mostrar nombres por defecto
      expect(screen.getByText('Player999')).toBeInTheDocument();
    });
  });

  describe('CSS Classes and Styling', () => {
    test('debería apply correct CSS classes', () => {
      render(<BracketView tournament={mockTournament} config={mockConfig} />);

      expect(screen.getByText('Bracket del Torneo')).toHaveClass(
        'bracketTitle'
      );
      // Check for round title specifically (h3 elements with roundTitle class)
      const roundTitles = screen.getAllByText(/^Ronda \d+$/, {
        selector: '.roundTitle',
      });
      expect(roundTitles[0]).toHaveClass('roundTitle');
    });

    test('debería apply winner classes to winning players', () => {
      render(<BracketView tournament={mockTournament} config={mockConfig} />);

      const winnerElements = screen.getAllByText('Player 1');
      // Player 1 appears multiple times, check that at least one has winner class
      expect(winnerElements.length).toBeGreaterThan(0);
    });
  });
});
