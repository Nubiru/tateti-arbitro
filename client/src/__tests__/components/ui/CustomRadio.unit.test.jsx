/**
 * Pruebas Unitarias para el Componente CustomRadio
 * @lastModified 2025-10-05
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomRadio from '../../../components/ui/CustomRadio';

describe('Componente CustomRadio', () => {
  const defaultProps = {
    id: 'test-radio',
    name: 'test-group',
    value: 'test-value',
    label: 'Test Label',
  };

  test('debería renderizar con props por defecto', () => {
    render(<CustomRadio {...defaultProps} />);

    expect(screen.getByRole('radio')).toBeInTheDocument();
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByRole('radio')).not.toBeChecked();
  });

  test('debería renderizar como marcado cuando checked es true', () => {
    render(<CustomRadio {...defaultProps} checked={true} />);

    expect(screen.getByRole('radio')).toBeChecked();
  });

  test('debería llamar onChange cuando se hace clic', () => {
    const handleChange = jest.fn();
    render(<CustomRadio {...defaultProps} onChange={handleChange} />);

    fireEvent.click(screen.getByRole('radio'));
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('debería renderizar sin etiqueta cuando no se proporciona', () => {
    const { label, ...propsWithoutLabel } = defaultProps;
    render(<CustomRadio {...propsWithoutLabel} />);

    expect(screen.getByRole('radio')).toBeInTheDocument();
    expect(screen.queryByText('Test Label')).not.toBeInTheDocument();
  });

  test('debería estar deshabilitado cuando disabled es true', () => {
    render(<CustomRadio {...defaultProps} disabled={true} />);

    expect(screen.getByRole('radio')).toBeDisabled();
  });

  test('debería no llamar onChange cuando está deshabilitado', () => {
    const handleChange = jest.fn();
    render(
      <CustomRadio {...defaultProps} disabled={true} onChange={handleChange} />
    );

    fireEvent.click(screen.getByRole('radio'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  test('debería aplicar className personalizado', () => {
    render(<CustomRadio {...defaultProps} className="custom-class" />);

    const radioContainer = screen.getByRole('radio').closest('.custom-radio');
    expect(radioContainer).toHaveClass('custom-class');
  });

  test('debería aplicar clase de tamaño cuando se proporciona', () => {
    render(<CustomRadio {...defaultProps} size="large" />);

    expect(screen.getByRole('radio').closest('.custom-radio')).toHaveClass(
      'size-large'
    );
  });

  test('debería usar tamaño por defecto cuando no se proporciona', () => {
    render(<CustomRadio {...defaultProps} />);

    const radioContainer = screen.getByRole('radio').closest('.custom-radio');
    expect(radioContainer).not.toHaveClass('size-small');
    expect(radioContainer).not.toHaveClass('size-large');
  });

  test('debería pasar props adicionales al input', () => {
    render(<CustomRadio {...defaultProps} data-testid="custom-radio" />);

    expect(screen.getByTestId('custom-radio')).toBeInTheDocument();
  });
});
