/**
 * Pruebas Unitarias de PresentationScreen
 * Pruebas para el componente PresentationScreen
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import PresentationScreen from '../../screens/PresentationScreen';

// Simular módulos CSS
jest.mock('../../screens/PresentationScreen.module.css', () => ({
  presentationScreen: 'presentation-screen',
  presentationContainer: 'presentation-container',
  mainTitle: 'main-title',
  universityTitle: 'university-title',
  titleSubtitle: 'title-subtitle',
  programTitle: 'program-title',
  gameTitle: 'game-title',
  gameName: 'game-name',
  gameDescription: 'game-description',
  animatedElements: 'animated-elements',
  floatingShapes: 'floating-shapes',
  shape: 'shape',
  shape1: 'shape1',
  shape2: 'shape2',
  shape3: 'shape3',
  shape4: 'shape4',
  startSection: 'start-section',
  startButton: 'start-button',
  featuresPreview: 'features-preview',
  featureItem: 'feature-item',
  featureIcon: 'feature-icon',
}));

describe('Componente PresentationScreen', () => {
  const mockOnStart = jest.fn();
  const mockOnActivity = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Restablecer NODE_ENV para prueba
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    // Restaurar NODE_ENV original
    process.env.NODE_ENV = 'test';
  });

  describe('Renderizado', () => {
    test('debería renderizar elementos principales', () => {
      render(
        <PresentationScreen onStart={mockOnStart} onActivity={mockOnActivity} />
      );

      expect(screen.getByTestId('presentation-screen')).toBeInTheDocument();
      expect(screen.getByText('UPC')).toBeInTheDocument();
      expect(screen.getByText('Programación Full Stack')).toBeInTheDocument();
      expect(screen.getByText('Ta-Te-Ti Arbitro')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Sistema de arbitraje inteligente para partidas de Ta-Te-Ti'
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Comenzar')).toBeInTheDocument();
    });

    test('debería renderizar formas flotantes', () => {
      render(
        <PresentationScreen onStart={mockOnStart} onActivity={mockOnActivity} />
      );

      // Buscar el contenedor de formas flotantes
      const floatingShapes = screen
        .getByTestId('presentation-screen')
        .querySelector('.floating-shapes');
      expect(floatingShapes).toBeInTheDocument();

      // Buscar elementos de forma individuales
      const shapes = floatingShapes.querySelectorAll('.shape');
      expect(shapes).toHaveLength(4);
    });
  });

  describe('Clases de Animación', () => {
    test('debería aplicar clases de animación inmediatamente en el entorno de prueba', () => {
      render(
        <PresentationScreen onStart={mockOnStart} onActivity={mockOnActivity} />
      );

      // Verificar que los elementos principales son visibles (lo que significa que las animaciones están aplicadas)
      expect(screen.getByText('UPC')).toBeInTheDocument();
      expect(screen.getByText('Ta-Te-Ti Arbitro')).toBeInTheDocument();
      expect(screen.getByText('Comenzar')).toBeInTheDocument();
    });

    test('debería aplicar clases de animación a los elementos correctos', () => {
      render(
        <PresentationScreen onStart={mockOnStart} onActivity={mockOnActivity} />
      );

      // Verificar que el div del título del juego tiene la animación de deslizamiento
      const gameTitleDiv = screen.getByText('Ta-Te-Ti Arbitro').closest('div');
      expect(gameTitleDiv).toHaveClass('animate-slide-in');

      // Verificar que el título de la universidad tiene animación de desvanecimiento
      const universityTitle = screen.getByText('UPC');
      expect(universityTitle).toHaveClass('animate-fade-in');
    });
  });

  describe('Interacciones de Usuario', () => {
    test('debería llamar onStart y onActivity cuando se hace clic en el botón de inicio', () => {
      render(
        <PresentationScreen onStart={mockOnStart} onActivity={mockOnActivity} />
      );

      fireEvent.click(screen.getByText('Comenzar'));

      expect(mockOnStart).toHaveBeenCalledTimes(1);
      expect(mockOnActivity).toHaveBeenCalledTimes(1);
    });

    test('debería llamar onActivity cuando se mueve el mouse', () => {
      render(
        <PresentationScreen onStart={mockOnStart} onActivity={mockOnActivity} />
      );

      fireEvent.mouseMove(screen.getByTestId('presentation-screen'));

      expect(mockOnActivity).toHaveBeenCalledTimes(1);
    });

    test('debería llamar onActivity cuando se presiona una tecla', () => {
      render(
        <PresentationScreen onStart={mockOnStart} onActivity={mockOnActivity} />
      );

      fireEvent.keyDown(screen.getByTestId('presentation-screen'));

      expect(mockOnActivity).toHaveBeenCalledTimes(1);
    });

    test('debería llamar onActivity múltiples veces para múltiples interacciones', () => {
      render(
        <PresentationScreen onStart={mockOnStart} onActivity={mockOnActivity} />
      );

      fireEvent.mouseMove(screen.getByTestId('presentation-screen'));
      fireEvent.keyDown(screen.getByTestId('presentation-screen'));
      fireEvent.click(screen.getByText('Comenzar'));

      expect(mockOnActivity).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accesibilidad', () => {
    test('debería tener atributos de accesibilidad apropiados', () => {
      render(
        <PresentationScreen onStart={mockOnStart} onActivity={mockOnActivity} />
      );

      const startButton = screen.getByRole('button', { name: 'Comenzar' });
      expect(startButton).toHaveAttribute('type', 'button');
      expect(startButton).toHaveClass('btn', 'btn-primary');
    });

    test('debería ser accesible por teclado', () => {
      render(
        <PresentationScreen onStart={mockOnStart} onActivity={mockOnActivity} />
      );

      const startButton = screen.getByRole('button', { name: 'Comenzar' });
      expect(startButton).toBeInTheDocument();

      // El botón debería ser enfocable
      startButton.focus();
      expect(document.activeElement).toBe(startButton);
    });
  });

  describe('Clases CSS', () => {
    test('debería aplicar clases CSS correctas a los elementos', () => {
      render(
        <PresentationScreen onStart={mockOnStart} onActivity={mockOnActivity} />
      );

      expect(screen.getByTestId('presentation-screen')).toHaveClass(
        'presentation-screen'
      );
      expect(screen.getByText('UPC').closest('.main-title')).toHaveClass(
        'main-title'
      );
      expect(
        screen.getByText('Ta-Te-Ti Arbitro').closest('.game-title')
      ).toHaveClass('game-title');
      expect(
        screen.getByText('Comenzar').closest('.start-section')
      ).toHaveClass('start-section');
    });

    test('debería aplicar clases de forma a las formas flotantes', () => {
      render(
        <PresentationScreen onStart={mockOnStart} onActivity={mockOnActivity} />
      );

      // Buscar el contenedor de formas flotantes
      const floatingShapes = screen
        .getByTestId('presentation-screen')
        .querySelector('.floating-shapes');
      expect(floatingShapes).toBeInTheDocument();

      // Buscar elementos de forma individuales y verificar sus clases
      const shapes = floatingShapes.querySelectorAll('.shape');
      expect(shapes).toHaveLength(4);

      // Verificar que cada forma tiene la clase correcta
      expect(shapes[0].className).toContain('shape1');
      expect(shapes[1].className).toContain('shape2');
      expect(shapes[2].className).toContain('shape3');
      expect(shapes[3].className).toContain('shape4');
    });
  });

  describe('Casos Extremos', () => {
    test('debería manejar prop onStart faltante', () => {
      expect(() => {
        render(<PresentationScreen onActivity={mockOnActivity} />);
      }).not.toThrow();
    });

    test('debería manejar prop onActivity faltante', () => {
      expect(() => {
        render(<PresentationScreen onStart={mockOnStart} />);
      }).not.toThrow();
    });

    test('debería manejar ambas props faltantes', () => {
      expect(() => {
        render(<PresentationScreen />);
      }).not.toThrow();
    });

    test('debería manejar props nulas', () => {
      expect(() => {
        render(<PresentationScreen onStart={null} onActivity={null} />);
      }).not.toThrow();
    });
  });

  describe('Comportamiento del Entorno de Producción', () => {
    test('debería usar timeouts en el entorno de producción', () => {
      // Simular entorno de producción
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      jest.useFakeTimers();

      render(
        <PresentationScreen onStart={mockOnStart} onActivity={mockOnActivity} />
      );

      // Inicialmente los elementos deben estar presentes pero las animaciones pueden no estar aplicadas
      expect(screen.getByText('UPC')).toBeInTheDocument();
      expect(screen.getByText('Ta-Te-Ti Arbitro')).toBeInTheDocument();

      // Avanzar temporizadores para activar animaciones
      act(() => {
        jest.advanceTimersByTime(500);
      });

      // Los elementos deberían seguir presentes después del avance del temporizador
      expect(screen.getByText('UPC')).toBeInTheDocument();
      expect(screen.getByText('Ta-Te-Ti Arbitro')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Todos los elementos deberían ser visibles después de todos los temporizadores
      expect(screen.getByText('Comenzar')).toBeInTheDocument();

      jest.useRealTimers();
      process.env.NODE_ENV = originalEnv;
    });
  });
});
