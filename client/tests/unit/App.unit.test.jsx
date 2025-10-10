/**
 * Pruebas Unitarias para el Componente App
 * @lastModified 2025-10-05
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../src/App';

// Simular módulos CSS
jest.mock('../../src/screens/PresentationScreen.module.css', () => ({}));
jest.mock('../../src/components/layout/Header.css', () => ({}));
jest.mock('../../src/components/ui/ThemeSwitcher.css', () => ({}));

// Simular localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Componente App', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  test('debería renderizar pantalla de presentación por defecto', () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(<App />);

    // Verificar el texto del título - aparece tanto en el header como en la pantalla de presentación
    const titleElements = screen.getAllByText('Ta-Te-Ti Arbitro');
    expect(titleElements).toHaveLength(2); // Uno en el header, uno en la pantalla de presentación
    expect(titleElements[0]).toBeInTheDocument();
    expect(titleElements[1]).toBeInTheDocument();

    // Verificar el botón por rol
    expect(
      screen.getByRole('button', { name: 'Comenzar' })
    ).toBeInTheDocument();
  });

  test('debería inicializar con tema dark-neon por defecto', () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(<App />);

    // Verificar que se establece el tema por defecto
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'tateti-theme',
      'dark-neon'
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe(
      'dark-neon'
    );
  });

  test('debería cargar tema desde localStorage', () => {
    localStorageMock.getItem.mockReturnValue('light-clasico');
    render(<App />);

    expect(document.documentElement.getAttribute('data-theme')).toBe(
      'light-clasico'
    );
  });

  test('debería manejar cambio de tema desde ThemeSwitcher', () => {
    localStorageMock.getItem.mockReturnValue('dark-neon');
    render(<App />);

    // Encontrar el checkbox de cambio de tema por aria-label
    const themeToggle = screen.getByLabelText(
      'Current: Dark - Click to switch'
    );
    fireEvent.click(themeToggle);

    // Debería cambiar a light-neon
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'tateti-theme',
      'light-neon'
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe(
      'light-neon'
    );
  });

  test('debería manejar cambio de tema visual desde ConfigScreen', () => {
    localStorageMock.getItem.mockReturnValue('dark-neon');
    render(<App />);

    // Navegar a ConfigScreen
    const startButton = screen.getByRole('button', { name: 'Comenzar' });
    fireEvent.click(startButton);

    // Simular cambio de tema visual (esto se implementará en ConfigScreen)
    // Por ahora solo verificamos que la pantalla cambió
    expect(screen.getByText('Configuración del Juego')).toBeInTheDocument();
  });
});
