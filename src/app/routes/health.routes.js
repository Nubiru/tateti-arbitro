import express from 'express';
import logger from '../logger.js';
import {
  getBasicHealth,
  getDetailedHealth,
} from '../controllers/health.controller.js';

const router = express.Router();

/**
 * Rutas de verificación de salud
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

// Verificación de salud básica
router.get('/health', (req, res) => {
  logger.debug(
    'HEALTH',
    'CHECK',
    'REQUEST',
    'Solicitud de verificación de salud',
    {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    }
  );

  res.json(getBasicHealth());
});

// Verificación de salud detallada
router.get('/health/detailed', (req, res) => {
  res.json(getDetailedHealth());
});

export default router;
