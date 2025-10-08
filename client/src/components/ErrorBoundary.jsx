import React from 'react';
import './ErrorBoundary.css';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    // Actualizar estado para que el siguiente render muestre la UI de respaldo
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Registrar error en consola y cualquier servicio de reporte de errores
    // console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      hasError: true,
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // UI de respaldo
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h1>¡Oops! Algo salió mal</h1>
            <p>
              Ha ocurrido un error inesperado. Por favor, recarga la página.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Recargar Página
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Detalles del Error</summary>
                <pre>{this.state.error && this.state.error.toString()}</pre>
                <pre>
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
