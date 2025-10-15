/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * @lastModified 2025-10-15
 * @version 1.0.0
 */

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(_error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);

    // Update state with error info
    this.setState({
      hasError: true,
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div
          className="error-boundary"
          style={{
            padding: '20px',
            textAlign: 'center',
            color: '#ff6b6b',
            backgroundColor: '#ffe0e0',
            border: '1px solid #ff6b6b',
            borderRadius: '8px',
            margin: '20px',
          }}
        >
          <div className="error-content">
            <h3>¡Oops! Algo salió mal</h3>
            <p>
              Ha ocurrido un error inesperado. Por favor, recarga la página.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Recargar Página
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details
              className="error-details"
              style={{ marginTop: '20px', textAlign: 'left' }}
            >
              <summary>Detalles del error (desarrollo)</summary>
              <pre
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '10px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                }}
              >
                {this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
