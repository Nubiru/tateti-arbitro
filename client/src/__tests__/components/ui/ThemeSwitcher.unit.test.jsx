/**
 * Pruebas Unitarias para el Componente ThemeSwitcher
 * @lastModified 2025-10-05
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeSwitcher from '../../../components/ui/ThemeSwitcher';

// Simular módulos CSS
jest.mock('../../../components/ui/ThemeSwitcher.css', () => ({}));

describe('Componente ThemeSwitcher', () => {
  const defaultProps = {
    isDark: true,
    onToggleDark: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería renderizar checkbox toggle para modo oscuro', () => {
    render(<ThemeSwitcher {...defaultProps} />);

    // Verificar que se renderiza el checkbox
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked(); // Dark mode = unchecked
    expect(checkbox).toHaveAttribute(
      'aria-label',
      'Current: Dark - Click to switch'
    );
  });

  test('debería renderizar checkbox toggle para modo claro', () => {
    const lightProps = { ...defaultProps, isDark: false };
    render(<ThemeSwitcher {...lightProps} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked(); // Light mode = checked
    expect(checkbox).toHaveAttribute(
      'aria-label',
      'Current: Light - Click to switch'
    );
  });

  test('debería llamar onToggleDark cuando se hace clic', () => {
    render(<ThemeSwitcher {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(defaultProps.onToggleDark).toHaveBeenCalledTimes(1);
  });

  test('debería renderizar elementos de animación (luna, nubes, estrellas)', () => {
    render(<ThemeSwitcher {...defaultProps} />);

    // Verificar que se renderizan los elementos de animación
    const moon = document.querySelector('.theme-switch__moon');
    const clouds = document.querySelector('.theme-switch__clouds');
    const stars = document.querySelector('.theme-switch__stars-container');

    expect(moon).toBeInTheDocument();
    expect(clouds).toBeInTheDocument();
    expect(stars).toBeInTheDocument();
  });

  test('debería renderizar manchas de cráter en la luna', () => {
    render(<ThemeSwitcher {...defaultProps} />);

    // Verificar que se renderizan los spots de la luna
    const spots = document.querySelectorAll('.theme-switch__spot');
    expect(spots).toHaveLength(3);
  });

  test('debería funcionar sin prop onToggleDark', () => {
    const propsWithoutCallback = { isDark: true };
    render(<ThemeSwitcher {...propsWithoutCallback} />);

    const checkbox = screen.getByRole('checkbox');
    expect(() => fireEvent.click(checkbox)).not.toThrow();
  });

  test('debería usar valores por defecto cuando no se pasan props', () => {
    render(<ThemeSwitcher />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked(); // Default is dark mode
    expect(checkbox).toHaveAttribute(
      'aria-label',
      'Current: Dark - Click to switch'
    );
  });

  test('debería tener label asociado correctamente', () => {
    render(<ThemeSwitcher {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    const label = checkbox.closest('label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveAttribute('for', 'theme-switch-checkbox');
    expect(checkbox).toHaveAttribute('id', 'theme-switch-checkbox');
  });
});
