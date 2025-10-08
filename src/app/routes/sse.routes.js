import express from 'express';
import eventBus from '../event-bus.js';

const router = express.Router();

/**
 * SSE routes for real-time updates
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

// GET /api/stream - SSE endpoint
router.get('/stream', (req, res) => {
  eventBus.addConnection(res);
});

// GET /api/stream/status - Get connection status
router.get('/stream/status', (req, res) => {
  res.json(eventBus.getMetrics());
});

export default router;
