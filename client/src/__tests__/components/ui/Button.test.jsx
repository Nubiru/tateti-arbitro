/**
 * Pruebas Unitarias para el Componente Button
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../../components/ui/Button';

describe('Componente Button', () => {
  test('debería renderizar con props por defecto', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('button');
    expect(button).toHaveClass('primary');
    // Sin clase de tamaño para medium (por defecto)
  });

  test('debería renderizar con diferentes variantes', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('secondary');

    rerender(<Button variant="success">Success</Button>);
    expect(screen.getByRole('button')).toHaveClass('success');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByRole('button')).toHaveClass('danger');

    // Probar variante inválida (el componente la usa tal como está)
    rerender(<Button variant="invalid">Invalid</Button>);
    expect(screen.getByRole('button')).toHaveClass('invalid');
  });

  test('debería renderizar con diferentes tamaños', () => {
    const { rerender } = render(<Button size="small">Small</Button>);
    expect(screen.getByRole('button')).toHaveClass('small');

    rerender(<Button size="large">Large</Button>);
    expect(screen.getByRole('button')).toHaveClass('large');

    // Probar tamaño por defecto (sin clase)
    rerender(<Button size="medium">Medium</Button>);
    expect(screen.getByRole('button')).not.toHaveClass('small');
    expect(screen.getByRole('button')).not.toHaveClass('large');
  });

  test('debería manejar eventos de clic', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('debería estar deshabilitado cuando la prop disabled es true', () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    // Sin clase disabled - manejado por pseudo-selector :disabled
  });

  test('debería no llamar onClick cuando está deshabilitado', () => {
    const handleClick = jest.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  test('debería renderizar con className personalizado', () => {
    render(<Button className="custom-class">Custom</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  test('debería renderizar con diferentes tipos de botón', () => {
    render(<Button type="submit">Submit</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  test('debería pasar props adicionales', () => {
    render(
      <Button data-testid="custom-button" aria-label="Custom button">
        Custom
      </Button>
    );

    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-label', 'Custom button');
  });

  test('debería renderizar children correctamente', () => {
    render(
      <Button>
        <span>Icon</span> Text
      </Button>
    );

    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });
});
