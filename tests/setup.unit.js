/**
 * Archivo de Configuración de Pruebas Unitarias
 * Entorno simulado para pruebas unitarias rápidas y aisladas
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

// Simular métodos de consola en pruebas unitarias para reducir ruido
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Use fake timers to prevent real timeouts from hanging tests
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// Simular Express solo para pruebas unitarias
jest.mock('express', () => {
  const mockApp = {
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    listen: jest.fn(),
    set: jest.fn(),
    static: jest.fn(),
    address: jest.fn(() => ({
      port: 3000,
      family: 'IPv4',
      address: '127.0.0.1',
    })),
    _router: {
      stack: [
        {
          name: 'errorHandler',
          handle: jest.fn((error, req, res, next) => {
            if (error.type === 'entity.too.large') {
              res
                .status(413)
                .json({ error: 'Entidad de solicitud demasiado grande' });
            } else {
              next(error);
            }
          }),
        },
        {
          name: 'serveStatic',
          handle: jest.fn(),
        },
        {
          route: { path: '/api/health' },
          handle: jest.fn((req, res) => {
            res.json({
              status: 'healthy',
              version: process.env.npm_package_version || '1.0.0',
            });
          }),
        },
        {
          route: { path: '/' },
          handle: jest.fn((req, res) => {
            res.sendFile('index.html');
          }),
        },
        {
          route: { path: '/api/tournament' },
          handle: jest.fn((req, res) => {
            res.json({ message: 'Tournament endpoint' });
          }),
        },
      ],
    },
  };

  const mockExpress = jest.fn(() => mockApp);
  mockExpress.json = jest.fn(() => (req, res, next) => next());
  mockExpress.urlencoded = jest.fn(() => (req, res, next) => next());
  mockExpress.static = jest.fn(() => (req, res, next) => next());

  return {
    __esModule: true,
    default: mockExpress,
  };
});
