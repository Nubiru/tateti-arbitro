/**
 * Pruebas Unitarias de ErrorBoundary
 * Pruebas para el componente ErrorBoundary
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';

// Simular archivo CSS
jest.mock('../../components/ErrorBoundary.css', () => ({}));

// Simular window.location.reload
const mockReload = jest.fn();
Object.defineProperty(window, 'location', {
  value: {
    reload: mockReload,
  },
  writable: true,
});

// Componente que lanza un error
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Error de prueba');
  }
  return <div>Sin error</div>;
};

// Componente que lanza un error en render
const ThrowErrorInRender = () => {
  throw new Error('Error de render');
};

// Componente que lanza un error en componentDidCatch
const ThrowErrorInDidCatch = () => {
  const [shouldThrow, setShouldThrow] = React.useState(false);

  React.useEffect(() => {
    setShouldThrow(true);
  }, []);

  if (shouldThrow) {
    throw new Error('Error de DidCatch');
  }
  return <div>Sin error</div>;
};

describe('ErrorBoundary', () => {
  let originalConsoleError;
  let originalWindowConsoleError;

  beforeEach(() => {
    jest.clearAllMocks();
    // Simular console.error para prevenir logs de error durante las pruebas de ErrorBoundary
    originalConsoleError = console.error;
    console.error = jest.fn();

    // También simular window.console.error para JSDOM
    if (typeof window !== 'undefined' && window.console) {
      originalWindowConsoleError = window.console.error;
      window.console.error = jest.fn();
    }
  });

  afterEach(() => {
    // Restaurar console.error después de cada prueba
    console.error = originalConsoleError;

    // Restaurar window.console.error
    if (
      typeof window !== 'undefined' &&
      window.console &&
      originalWindowConsoleError
    ) {
      window.console.error = originalWindowConsoleError;
    }
  });

  describe('Renderizado Normal', () => {
    test('debería renderizar hijos cuando no ocurre error', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child">Componente hijo</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.getByText('Componente hijo')).toBeInTheDocument();
    });

    test('debería renderizar múltiples hijos cuando no ocurre error', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child1">Hijo 1</div>
          <div data-testid="child2">Hijo 2</div>
        </ErrorBoundary>
      );

      expect(screen.getByTestId('child1')).toBeInTheDocument();
      expect(screen.getByTestId('child2')).toBeInTheDocument();
    });

    test('debería renderizar hijos nulos', () => {
      render(<ErrorBoundary>{null}</ErrorBoundary>);

      // No debería fallar
      expect(screen.queryByText('Componente hijo')).not.toBeInTheDocument();
    });
  });

  describe('Manejo de Errores', () => {
    test('debería capturar errores y mostrar UI de respaldo', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument();
      expect(
        screen.getByText(
          'Ha ocurrido un error inesperado. Por favor, recarga la página.'
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Recargar Página')).toBeInTheDocument();
    });

    test('debería capturar errores lanzados en render', () => {
      render(
        <ErrorBoundary>
          <ThrowErrorInRender />
        </ErrorBoundary>
      );

      expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument();
    });

    test('debería capturar errores lanzados en useEffect', () => {
      render(
        <ErrorBoundary>
          <ThrowErrorInDidCatch />
        </ErrorBoundary>
      );

      expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument();
    });

    test('no debería renderizar hijos cuando ocurre error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
          <div data-testid="sibling">Componente hermano</div>
        </ErrorBoundary>
      );

      expect(screen.queryByTestId('sibling')).not.toBeInTheDocument();
      expect(screen.queryByText('Sin error')).not.toBeInTheDocument();
    });
  });

  describe('Detalles de Error en Desarrollo', () => {
    test('debería mostrar detalles de error en entorno de desarrollo', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Crear una instancia de ErrorBoundary y establecer manualmente su estado a error
      const errorBoundary = new ErrorBoundary({});
      errorBoundary.state = {
        hasError: true,
        error: new Error('Error de prueba'),
        errorInfo: { componentStack: 'Pila de prueba' },
      };

      // Renderizar el ErrorBoundary con estado de error
      const { container } = render(<div>{errorBoundary.render()}</div>);

      // Verificar si la UI del ErrorBoundary está renderizada
      expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument();
      expect(screen.getByText('Detalles del Error')).toBeInTheDocument();

      // Restaurar
      process.env.NODE_ENV = originalEnv;
    });

    test('no debería mostrar detalles de error en entorno de producción', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Detalles del Error')).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    test('no debería mostrar detalles de error en entorno de prueba', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Detalles del Error')).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Funcionalidad de Recarga', () => {
    test('debería llamar window.location.reload cuando se hace clic en el botón de recarga', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByText('Recargar Página');
      fireEvent.click(reloadButton);

      expect(mockReload).toHaveBeenCalledTimes(1);
    });

    test('debería tener las clases de botón correctas', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByText('Recargar Página');
      expect(reloadButton).toHaveClass('btn', 'btn-primary');
    });
  });

  describe('Gestión de Estado de Error', () => {
    test('debería inicializar con el estado correcto', () => {
      const errorBoundary = new ErrorBoundary({});
      expect(errorBoundary.state).toEqual({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    });

    test('debería actualizar estado cuando se llama getDerivedStateFromError', () => {
      const newState = ErrorBoundary.getDerivedStateFromError(
        new Error('Error de prueba')
      );
      expect(newState).toEqual({ hasError: true });
    });

    test('debería actualizar estado cuando se llama componentDidCatch', () => {
      const errorBoundary = new ErrorBoundary({});
      errorBoundary.state = { hasError: false, error: null, errorInfo: null };

      const error = new Error('Error de prueba');
      const errorInfo = { componentStack: 'Pila de prueba' };

      // Simular setState para capturar la actualización de estado
      const setStateSpy = jest.spyOn(errorBoundary, 'setState');

      errorBoundary.componentDidCatch(error, errorInfo);

      expect(setStateSpy).toHaveBeenCalledWith({
        hasError: true,
        error: error,
        errorInfo: errorInfo,
      });

      setStateSpy.mockRestore();
    });
  });

  describe('Clases CSS', () => {
    test('debería aplicar las clases CSS correctas a la UI de error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorBoundary = screen
        .getByText('¡Oops! Algo salió mal')
        .closest('.error-boundary');
      expect(errorBoundary).toHaveClass('error-boundary');

      const errorContent = screen
        .getByText('¡Oops! Algo salió mal')
        .closest('.error-content');
      expect(errorContent).toHaveClass('error-content');
    });

    test('debería aplicar las clases CSS correctas a los detalles de error', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const errorDetails = screen
        .getByText('Detalles del Error')
        .closest('.error-details');
      expect(errorDetails).toHaveClass('error-details');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Casos Límite', () => {
    test('debería manejar múltiples errores', () => {
      const MultipleErrors = () => {
        const [errorCount, setErrorCount] = React.useState(0);

        React.useEffect(() => {
          if (errorCount < 2) {
            setErrorCount(prev => prev + 1);
            throw new Error(`Error ${errorCount + 1}`);
          }
        }, [errorCount]);

        return <div>Sin error</div>;
      };

      render(
        <ErrorBoundary>
          <MultipleErrors />
        </ErrorBoundary>
      );

      expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument();
    });

    test('debería manejar errores sin mensaje', () => {
      const ThrowErrorNoMessage = () => {
        throw new Error();
      };

      render(
        <ErrorBoundary>
          <ThrowErrorNoMessage />
        </ErrorBoundary>
      );

      expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument();
    });

    test('debería manejar errores con errorInfo nulo', () => {
      const errorBoundary = new ErrorBoundary({});
      errorBoundary.state = { hasError: false, error: null, errorInfo: null };

      const error = new Error('Error de prueba');

      // Simular setState para capturar la actualización de estado
      const setStateSpy = jest.spyOn(errorBoundary, 'setState');

      errorBoundary.componentDidCatch(error, null);

      expect(setStateSpy).toHaveBeenCalledWith({
        hasError: true,
        error: error,
        errorInfo: null,
      });

      setStateSpy.mockRestore();
    });
  });

  describe('Accesibilidad', () => {
    test('debería tener estructura de encabezado apropiada', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('¡Oops! Algo salió mal');
    });

    test('debería tener botón accesible', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Recargar Página');
      expect(button).toHaveAttribute('type', 'button');
    });

    test('debería tener elemento de detalles accesible en desarrollo', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const details = screen.getByRole('group');
      expect(details).toHaveClass('error-details');

      process.env.NODE_ENV = originalEnv;
    });
  });
});
