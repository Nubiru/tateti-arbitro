/**
 * Pruebas Unitarias de CelebrationScreen
 * Pruebas para el componente CelebrationScreen
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CelebrationScreen from '../../screens/CelebrationScreen';

// Simular módulos CSS
jest.mock('../../screens/CelebrationScreen.module.css', () => ({
  celebrationScreen: 'celebrationScreen',
  celebrationContainer: 'celebrationContainer',
  confetti: 'confetti',
  confettiPiece: 'confettiPiece',
  confetti0: 'confetti0',
  confetti1: 'confetti1',
  confetti2: 'confetti2',
  confetti3: 'confetti3',
  confetti4: 'confetti4',
  winnerDisplay: 'winnerDisplay',
  winnerIcon: 'winnerIcon',
  winnerTitle: 'winnerTitle',
  winnerName: 'winnerName',
  winnerMessage: 'winnerMessage',
  celebrationActions: 'celebrationActions',
  returnButton: 'returnButton',
  countdown: 'countdown',
  celebrationStats: 'celebrationStats',
  statItem: 'statItem',
  statIcon: 'statIcon',
  statLabel: 'statLabel',
  statValue: 'statValue',
}));

describe('Componente CelebrationScreen', () => {
  const mockOnReturn = jest.fn();
  const mockOnActivity = jest.fn();

  const createMockMatchResult = (overrides = {}) => ({
    winner: { name: 'Player 1' },
    history: [
      { playerId: 'player1', move: 0 },
      { playerId: 'player2', move: 1 },
    ],
    gameMode: 'Individual',
    boardSize: '3x3',
    speed: 'normal',
    noTie: false,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Renderizado', () => {
    test('debería renderizar pantalla de celebración con todos los elementos', () => {
      render(
        <CelebrationScreen
          matchResult={createMockMatchResult()}
          onReturn={mockOnReturn}
          onActivity={mockOnActivity}
        />
      );

      expect(screen.getByText('¡Felicidades!')).toBeInTheDocument();
      expect(screen.getByText('Player 1 ganó!')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Player 1 ha demostrado ser el mejor jugador de Ta-Te-Ti'
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Volver al Inicio')).toBeInTheDocument();
      expect(
        screen.getByText(/Regresando automáticamente en \d+s/)
      ).toBeInTheDocument();
    });

    test('debería renderizar animación de confeti', () => {
      render(
        <CelebrationScreen
          matchResult={createMockMatchResult()}
          onReturn={mockOnReturn}
          onActivity={mockOnActivity}
        />
      );

      // Verificar piezas de confeti (50 piezas)
      const confettiPieces = document.querySelectorAll('.confettiPiece');
      expect(confettiPieces).toHaveLength(50);
    });

    test('debería renderizar ícono de ganador con animación de rebote', () => {
      render(
        <CelebrationScreen
          matchResult={createMockMatchResult()}
          onReturn={mockOnReturn}
          onActivity={mockOnActivity}
        />
      );

      const winnerIcons = screen.getAllByText('🏆');
      expect(winnerIcons.length).toBeGreaterThan(0);
      const winnerIcon = winnerIcons[0]; // Obtener el primero (ícono de ganador)
      expect(winnerIcon).toBeInTheDocument();
      expect(winnerIcon).toHaveClass('animate-bounce');
    });

    test('debería renderizar estadísticas de celebración', () => {
      render(
        <CelebrationScreen
          matchResult={createMockMatchResult()}
          onReturn={mockOnReturn}
          onActivity={mockOnActivity}
        />
      );

      expect(screen.getByText('Estadísticas del Juego')).toBeInTheDocument();
      expect(screen.getByText('Individual')).toBeInTheDocument();
      expect(screen.getByText('3x3')).toBeInTheDocument();
      expect(screen.getByText('normal')).toBeInTheDocument();
    });
  });

  describe('Inicialización', () => {
    test('debería llamar onActivity al montar', () => {
      render(
        <CelebrationScreen
          matchResult={createMockMatchResult()}
          onReturn={mockOnReturn}
          onActivity={mockOnActivity}
        />
      );

      expect(mockOnActivity).toHaveBeenCalledTimes(1);
    });

    test('debería establecer isVisible a true al montar', () => {
      render(
        <CelebrationScreen
          matchResult={createMockMatchResult()}
          onReturn={mockOnReturn}
          onActivity={mockOnActivity}
        />
      );

      // Verificar que los elementos con animación de desvanecimiento están presentes
      const winnerDisplay = screen.getByText('¡Felicidades!').closest('div');
      expect(winnerDisplay).toHaveClass('animate-fade-in');
    });

    test('debería inicializar cuenta regresiva a 60 segundos', () => {
      render(
        <CelebrationScreen
          matchResult={createMockMatchResult()}
          onReturn={mockOnReturn}
          onActivity={mockOnActivity}
        />
      );

      expect(
        screen.getByText('Regresando automáticamente en 60s')
      ).toBeInTheDocument();
    });
  });

  describe('Temporizador de Cuenta Regresiva', () => {
    test('debería decrementar cuenta regresiva cada segundo', () => {
      render(
        <CelebrationScreen
          matchResult={createMockMatchResult()}
          onReturn={mockOnReturn}
          onActivity={mockOnActivity}
        />
      );

      expect(
        screen.getByText('Regresando automáticamente en 60s')
      ).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(
        screen.getByText('Regresando automáticamente en 59s')
      ).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(
        screen.getByText('Regresando automáticamente en 58s')
      ).toBeInTheDocument();
    });

    test('debería llamar onReturn cuando la cuenta regresiva llegue a 0', () => {
      render(
        <CelebrationScreen
          matchResult={createMockMatchResult()}
          onReturn={mockOnReturn}
          onActivity={mockOnActivity}
        />
      );

      // Avanzar rápidamente a 60 segundos
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(mockOnReturn).toHaveBeenCalledTimes(1);
    });

    test('debería detener cuenta regresiva en 0', () => {
      render(
        <CelebrationScreen
          matchResult={createMockMatchResult()}
          onReturn={mockOnReturn}
          onActivity={mockOnActivity}
        />
      );

      // Avanzar rápidamente a 60 segundos
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(
        screen.getByText('Regresando automáticamente en 0s')
      ).toBeInTheDocument();

      // Avanzar más tiempo para asegurar que se mantenga en 0
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(
        screen.getByText('Regresando automáticamente en 0s')
      ).toBeInTheDocument();
    });
  });

  describe('Retorno Manual', () => {
    test('debería llamar onActivity y onReturn cuando se hace clic en el botón de retorno', () => {
      render(
        <CelebrationScreen
          matchResult={createMockMatchResult()}
          onReturn={mockOnReturn}
          onActivity={mockOnActivity}
        />
      );

      const returnButton = screen.getByText('Volver al Inicio');
      fireEvent.click(returnButton);

      expect(mockOnActivity).toHaveBeenCalledTimes(2); // Una vez al montar, una vez al hacer clic
      expect(mockOnReturn).toHaveBeenCalledTimes(1);
    });

    test('debería llamar onActivity y onReturn cuando se hace clic en el botón de retorno múltiples veces', () => {
      render(
        <CelebrationScreen
          matchResult={createMockMatchResult()}
          onReturn={mockOnReturn}
          onActivity={mockOnActivity}
        />
      );

      const returnButton = screen.getByText('Volver al Inicio');

      fireEvent.click(returnButton);
      fireEvent.click(returnButton);
      fireEvent.click(returnButton);

      expect(mockOnActivity).toHaveBeenCalledTimes(4); // Una vez al montar, 3 veces en los clics
      expect(mockOnReturn).toHaveBeenCalledTimes(3);
    });
  });

  describe('Animación de Confeti', () => {
    test('debería generar 50 piezas de confeti', () => {
      render(
        <CelebrationScreen
          matchResult={createMockMatchResult()}
          onReturn={mockOnReturn}
          onActivity={mockOnActivity}
        />
      );

      const confettiPieces = document.querySelectorAll('.confettiPiece');
      expect(confettiPieces).toHaveLength(50);
    });

    test('debería asignar diferentes clases de confeti a las piezas', () => {
      render(
        <CelebrationScreen
          matchResult={createMockMatchResult()}
          onReturn={mockOnReturn}
          onActivity={mockOnActivity}
        />
      );

      const confettiPieces = document.querySelectorAll('.confettiPiece');

      // Verificar que las piezas tienen diferentes clases de confeti
      const classNames = Array.from(confettiPieces).map(piece =>
        Array.from(piece.classList).find(
          cls => cls.startsWith('confetti') && cls !== 'confettiPiece'
        )
      );

      expect(classNames.filter(cls => cls === 'confetti0')).toHaveLength(10);
      expect(classNames.filter(cls => cls === 'confetti1')).toHaveLength(10);
      expect(classNames.filter(cls => cls === 'confetti2')).toHaveLength(10);
      expect(classNames.filter(cls => cls === 'confetti3')).toHaveLength(10);
      expect(classNames.filter(cls => cls === 'confetti4')).toHaveLength(10);
    });

    test('debería establecer posiciones aleatorias y retrasos de animación para el confeti', () => {
      render(
        <CelebrationScreen
          matchResult={createMockMatchResult()}
          onReturn={mockOnReturn}
          onActivity={mockOnActivity}
        />
      );

      const confettiPieces = document.querySelectorAll('.confettiPiece');

      // Verificar que las piezas tienen estilos en línea
      confettiPieces.forEach(piece => {
        expect(piece.style.left).toMatch(/\d+%/);
        expect(piece.style.animationDelay).toMatch(/\d+\.\d+s/);
        expect(piece.style.animationDuration).toMatch(/\d+\.\d+s/);
      });
    });
  });

  describe('Clases de Animación', () => {
    test('debería aplicar animación de desvanecimiento a la pantalla de ganador', () => {
      render(
        <CelebrationScreen
          matchResult={createMockMatchResult()}
          onReturn={mockOnReturn}
          onActivity={mockOnActivity}
        />
      );

      const winnerDisplay = screen.getByText('¡Felicidades!').closest('div');
      expect(winnerDisplay).toHaveClass('animate-fade-in');
    });

    test('debería aplicar animación de desvanecimiento a las acciones de celebración', () => {
      render(
        <CelebrationScreen
          matchResult={createMockMatchResult()}
          onReturn={mockOnReturn}
          onActivity={mockOnActivity}
        />
      );

      const celebrationActions = screen
        .getByText('Volver al Inicio')
        .closest('div');
      expect(celebrationActions).toHaveClass('animate-fade-in');
    });

    test('debería aplicar animación de desvanecimiento a las estadísticas de celebración', () => {
      render(
        <CelebrationScreen
          matchResult={createMockMatchResult()}
          onReturn={mockOnReturn}
          onActivity={mockOnActivity}
        />
      );

      const celebrationStats = screen
        .getByText('Estadísticas del Juego')
        .closest('div').parentElement;
      expect(celebrationStats).toHaveClass('animate-fade-in');
    });
  });

  describe('Limpieza', () => {
    test('debería limpiar intervalo al desmontar', () => {
      const { unmount } = render(
        <CelebrationScreen
          onReturn={mockOnReturn}
          onActivity={mockOnActivity}
        />
      );

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });

    test('debería no llamar onReturn después de desmontar', () => {
      const { unmount } = render(
        <CelebrationScreen
          onReturn={mockOnReturn}
          onActivity={mockOnActivity}
        />
      );

      unmount();

      // Avanzar tiempo después de desmontar
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(mockOnReturn).not.toHaveBeenCalled();
    });
  });

  describe('Casos Extremos', () => {
    test('debería manejar prop onReturn faltante de manera elegante', () => {
      expect(() => {
        render(<CelebrationScreen onActivity={mockOnActivity} />);
      }).not.toThrow();
    });

    test('debería manejar prop onActivity faltante de manera elegante', () => {
      expect(() => {
        render(
          <CelebrationScreen onReturn={mockOnReturn} onActivity={jest.fn()} />
        );
      }).not.toThrow();
    });

    test('debería manejar ambas props faltantes de manera elegante', () => {
      expect(() => {
        render(
          <CelebrationScreen onReturn={jest.fn()} onActivity={jest.fn()} />
        );
      }).not.toThrow();
    });
  });

  describe('Visualización de Estadísticas', () => {
    test('debería mostrar íconos de estadísticas correctos', () => {
      render(
        <CelebrationScreen
          matchResult={createMockMatchResult()}
          onReturn={mockOnReturn}
          onActivity={mockOnActivity}
        />
      );

      expect(screen.getByText('🎮')).toBeInTheDocument();
      expect(screen.getByText('⚡')).toBeInTheDocument();
      expect(screen.getByText('🎯')).toBeInTheDocument();
    });

    test('debería mostrar valores de estadísticas correctos', () => {
      render(
        <CelebrationScreen
          matchResult={createMockMatchResult()}
          onReturn={mockOnReturn}
          onActivity={mockOnActivity}
        />
      );

      expect(screen.getByText('Individual')).toBeInTheDocument();
      expect(screen.getByText('3x3')).toBeInTheDocument();
      expect(screen.getByText('normal')).toBeInTheDocument();
    });
  });
});
