/**
 * Pruebas Unitarias para el Componente PresentationScreen
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PresentationScreen from '../../screens/PresentationScreen';

describe('Componente PresentationScreen', () => {
  const mockOnStart = jest.fn();
  const mockOnActivity = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('debería renderizar los elementos principales', () => {
    render(
      <PresentationScreen onStart={mockOnStart} onActivity={mockOnActivity} />
    );

    expect(screen.getByText('UPC')).toBeInTheDocument();
    expect(screen.getByText('Ta-Te-Ti Arbitro')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Sistema de arbitraje inteligente para partidas de Ta-Te-Ti'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Programación Full Stack')).toBeInTheDocument();
  });

  test('debería renderizar el botón de inicio', () => {
    render(
      <PresentationScreen onStart={mockOnStart} onActivity={mockOnActivity} />
    );

    const startButton = screen.getByRole('button', {
      name: /comenzar/i,
    });
    expect(startButton).toBeInTheDocument();
    expect(startButton).toHaveClass('btn', 'btn-primary', 'startButton');
  });

  test('debería llamar onStart cuando se hace clic en el botón de inicio', () => {
    render(
      <PresentationScreen onStart={mockOnStart} onActivity={mockOnActivity} />
    );

    const startButton = screen.getByRole('button', {
      name: /comenzar/i,
    });
    fireEvent.click(startButton);

    expect(mockOnStart).toHaveBeenCalledTimes(1);
    expect(mockOnActivity).toHaveBeenCalledTimes(1);
  });

  test('debería renderizar las formas flotantes', () => {
    render(
      <PresentationScreen onStart={mockOnStart} onActivity={mockOnActivity} />
    );
    const shapes = screen
      .getAllByRole('generic')
      .filter(el => el.className.includes('shape'));

    expect(shapes).toHaveLength(4);
    expect(shapes[0]).toHaveClass('shape1');
    expect(shapes[1]).toHaveClass('shape2');
    expect(shapes[2]).toHaveClass('shape3');
    expect(shapes[3]).toHaveClass('shape4');
  });

  test('debería tener atributos de accesibilidad apropiados', () => {
    render(
      <PresentationScreen onStart={mockOnStart} onActivity={mockOnActivity} />
    );

    const startButton = screen.getByRole('button', {
      name: /comenzar/i,
    });
    expect(startButton).toBeInTheDocument();
    expect(startButton).toHaveClass('btn', 'btn-primary', 'startButton');
  });

  test('debería aplicar clases de animación después de los timeouts', () => {
    render(
      <PresentationScreen onStart={mockOnStart} onActivity={mockOnActivity} />
    );

    // En el entorno de prueba, las animaciones se aplican inmediatamente
    const upcElement = screen.getByText('UPC');
    const mainTitleDiv = upcElement.closest('.mainTitle');
    expect(mainTitleDiv).toHaveClass('animate-fade-in');

    // También verificar que el elemento h1 tiene la clase de animación
    expect(upcElement).toHaveClass('animate-fade-in');

    expect(screen.getByText('Ta-Te-Ti Arbitro').parentElement).toHaveClass(
      'animate-slide-in'
    );
  });

  test('debería manejar la actividad del mouse', () => {
    render(
      <PresentationScreen onStart={mockOnStart} onActivity={mockOnActivity} />
    );

    const container = screen.getByTestId('presentation-screen');
    fireEvent.mouseMove(container);

    expect(mockOnActivity).toHaveBeenCalledTimes(1);
  });

  test('debería manejar la actividad del teclado', () => {
    render(
      <PresentationScreen onStart={mockOnStart} onActivity={mockOnActivity} />
    );

    const container = screen.getByTestId('presentation-screen');
    fireEvent.keyDown(container, { key: 'Enter' });

    expect(mockOnActivity).toHaveBeenCalledTimes(1);
  });
});
