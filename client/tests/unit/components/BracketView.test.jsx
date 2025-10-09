/**
 * Unit tests for BracketView component
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import BracketView from '../../../src/components/bracket/BracketView';

describe('BracketView', () => {
  const mockConfig = {
    players: [
      { name: 'Player1', port: 3001 },
      { name: 'Player2', port: 3002 },
      { name: 'Player3', port: 3003 },
      { name: 'Player4', port: 3004 },
    ],
    noTie: false,
  };

  const mockTournament = {
    bracket: [
      {
        roundNumber: 1,
        status: 'completed',
        matches: [
          {
            matchId: 'round-1-match-1',
            player1: { id: 1, name: 'Player1', port: 3001 },
            player2: { id: 2, name: 'Player2', port: 3002 },
            winner: { id: 1, name: 'Player1', port: 3001 },
            result: 'win',
            roundNumber: 1,
          },
          {
            matchId: 'round-1-match-2',
            player1: { id: 3, name: 'Player3', port: 3003 },
            player2: { id: 4, name: 'Player4', port: 3004 },
            winner: { id: 3, name: 'Player3', port: 3003 },
            result: 'win',
            roundNumber: 1,
          },
        ],
      },
      {
        roundNumber: 2,
        status: 'completed',
        matches: [
          {
            matchId: 'round-2-match-1',
            player1: { id: 1, name: 'Player1', port: 3001 },
            player2: { id: 3, name: 'Player3', port: 3003 },
            winner: { id: 1, name: 'Player1', port: 3001 },
            result: 'win',
            roundNumber: 2,
          },
        ],
      },
    ],
    winner: { id: 1, name: 'Player1', port: 3001 },
    runnerUp: { id: 3, name: 'Player3', port: 3003 },
  };

  test('debería render empty state when no tournament data', () => {
    render(<BracketView tournament={null} config={mockConfig} />);

    expect(
      screen.getByText('No hay datos del torneo disponibles')
    ).toBeInTheDocument();
    expect(screen.getByText('🏆')).toBeInTheDocument();
  });

  test('debería render empty state when no bracket data', () => {
    render(<BracketView tournament={{}} config={mockConfig} />);

    expect(
      screen.getByText('No hay datos del torneo disponibles')
    ).toBeInTheDocument();
  });

  test('debería render tournament bracket with rounds', () => {
    render(<BracketView tournament={mockTournament} config={mockConfig} />);

    expect(screen.getByText('Llave del Torneo')).toBeInTheDocument();
    expect(screen.getByText('Ronda 1')).toBeInTheDocument();
    expect(screen.getByText('Final')).toBeInTheDocument();
  });

  test('debería render player names and ports in matches', () => {
    render(<BracketView tournament={mockTournament} config={mockConfig} />);

    // Use getAllByText to handle multiple instances
    expect(screen.getAllByText('Player1')).toHaveLength(3); // 2 in matches + 1 in winner
    expect(screen.getAllByText(':3001')).toHaveLength(2); // 2 in matches
    expect(screen.getAllByText('Player2')).toHaveLength(1);
    expect(screen.getAllByText(':3002')).toHaveLength(1);
  });

  test('debería render vs separators between players', () => {
    render(<BracketView tournament={mockTournament} config={mockConfig} />);

    const vsElements = screen.getAllByText('vs');
    expect(vsElements).toHaveLength(3); // 2 matches in round 1, 1 match in round 2
  });

  test('debería render match results for completed matches', () => {
    render(<BracketView tournament={mockTournament} config={mockConfig} />);

    // Look for "Ganó:" text which appears in match results
    const ganóElements = screen.getAllByText(/Ganó:/);
    expect(ganóElements).toHaveLength(3); // All matches are completed with wins
  });

  test('debería render winner section when tournament is complete', () => {
    render(<BracketView tournament={mockTournament} config={mockConfig} />);

    expect(screen.getByText('¡Campeón!')).toBeInTheDocument();
    expect(screen.getAllByText('Player1')).toHaveLength(3);
    expect(screen.getByText('Puerto: 3001')).toBeInTheDocument();
    expect(screen.getAllByText('👑')).toHaveLength(4); // 3 in matches + 1 in winner crown
  });

  test('debería render runner-up when available', () => {
    render(<BracketView tournament={mockTournament} config={mockConfig} />);

    expect(screen.getByText('Subcampeón')).toBeInTheDocument();
    // Player3 appears in matches and as runner-up, so use getAllByText
    expect(screen.getAllByText('Player3')).toHaveLength(3);
  });

  test('debería display tournament info from config', () => {
    render(<BracketView tournament={mockTournament} config={mockConfig} />);

    // Check for tournament info elements that actually exist
    expect(screen.getByText('Jugadores:')).toBeInTheDocument();
    expect(screen.getByText('Partidas:')).toBeInTheDocument();
    expect(screen.getByText('Completadas:')).toBeInTheDocument();
    expect(screen.getByText('Modo:')).toBeInTheDocument();
    expect(screen.getByText('Con Empate')).toBeInTheDocument();
  });

  test('debería display no-tie mode when configured', () => {
    const noTieConfig = { ...mockConfig, noTie: true };

    render(<BracketView tournament={mockTournament} config={noTieConfig} />);

    expect(screen.getByText('Sin Empate')).toBeInTheDocument();
  });

  test('debería render round status indicators', () => {
    render(<BracketView tournament={mockTournament} config={mockConfig} />);

    // Check for round status text that actually exists
    const completadaElements = screen.getAllByText('✅ Completada');
    expect(completadaElements).toHaveLength(2); // 2 rounds
    expect(screen.getAllByText('✅')).toHaveLength(3); // 3 matches only
  });

  test('debería handle pending matches', () => {
    const pendingTournament = {
      ...mockTournament,
      bracket: [
        {
          roundNumber: 1,
          status: 'pending',
          matches: [
            {
              matchId: 'round-1-match-1',
              player1: { id: 1, name: 'Player1', port: 3001 },
              player2: { id: 2, name: 'Player2', port: 3002 },
              winner: null,
              result: 'pending',
              roundNumber: 1,
            },
          ],
        },
      ],
    };

    render(<BracketView tournament={pendingTournament} config={mockConfig} />);

    expect(screen.getByText('⏸️')).toBeInTheDocument();
  });

  test('debería handle in-progress matches', () => {
    const inProgressTournament = {
      ...mockTournament,
      bracket: [
        {
          roundNumber: 1,
          status: 'in_progress',
          matches: [
            {
              matchId: 'round-1-match-1',
              player1: { id: 1, name: 'Player1', port: 3001 },
              player2: { id: 2, name: 'Player2', port: 3002 },
              winner: null,
              result: 'pending',
              roundNumber: 1,
            },
          ],
        },
      ],
    };

    render(
      <BracketView tournament={inProgressTournament} config={mockConfig} />
    );

    expect(screen.getByText('⏸️')).toBeInTheDocument();
  });

  test('debería apply winner/loser classes correctly', () => {
    render(<BracketView tournament={mockTournament} config={mockConfig} />);

    // Check that winner classes are applied to player divs
    const winnerDivs = screen
      .getAllByText('Player1')
      .filter(el => el.closest('.player')?.classList.contains('winner'));
    expect(winnerDivs.length).toBeGreaterThan(0);

    // Check that loser classes are applied to player divs
    const loserDivs = screen
      .getAllByText('Player2')
      .filter(el => el.closest('.player')?.classList.contains('loser'));
    expect(loserDivs.length).toBeGreaterThan(0);
  });

  test('debería handle error results in matches', () => {
    const errorTournament = {
      ...mockTournament,
      bracket: [
        {
          roundNumber: 1,
          status: 'completed',
          matches: [
            {
              matchId: 'round-1-match-1',
              player1: { id: 1, name: 'Player1', port: 3001 },
              player2: { id: 2, name: 'Player2', port: 3002 },
              winner: { id: 1, name: 'Player1', port: 3001 },
              result: 'error',
              roundNumber: 1,
            },
          ],
        },
      ],
    };

    render(<BracketView tournament={errorTournament} config={mockConfig} />);

    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  test('debería handle draw results in matches', () => {
    const drawTournament = {
      ...mockTournament,
      bracket: [
        {
          roundNumber: 1,
          status: 'completed',
          matches: [
            {
              matchId: 'round-1-match-1',
              player1: { id: 1, name: 'Player1', port: 3001 },
              player2: { id: 2, name: 'Player2', port: 3002 },
              winner: null,
              result: 'draw',
              roundNumber: 1,
            },
          ],
        },
      ],
    };

    render(<BracketView tournament={drawTournament} config={mockConfig} />);

    expect(screen.getByText('Empate')).toBeInTheDocument();
  });
});
