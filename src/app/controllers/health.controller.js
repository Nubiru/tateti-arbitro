/**
 * Health check controller with pure functions
 * @lastModified 2025-10-03
 * @version 1.0.0
 */

/**
 * Get basic health data
 * @returns {Object} Basic health information
 */
export function getBasicHealth() {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
  };
}

/**
 * Get detailed health data
 * @returns {Object} Detailed health information
 */
export function getDetailedHealth() {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();

  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: uptime,
      formatted: `${Math.floor(uptime / 3600)}h ${Math.floor(
        (uptime % 3600) / 60
      )}m ${Math.floor(uptime % 60)}s`,
    },
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
    },
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
    },
    version: process.env.npm_package_version || '1.0.0',
  };
}

/**
 * Format uptime in human readable format
 * @param {number} uptimeSeconds - Uptime in seconds
 * @returns {string} Formatted uptime string
 */
export function formatUptime(uptimeSeconds) {
  return `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor(
    (uptimeSeconds % 3600) / 60
  )}m ${Math.floor(uptimeSeconds % 60)}s`;
}

/**
 * Format memory usage in MB
 * @param {number} bytes - Memory in bytes
 * @returns {string} Memory in MB
 */
export function formatMemory(bytes) {
  if (bytes < 0) {
    return '0 MB';
  }
  const mb = Math.round(bytes / 1024 / 1024);
  return `${mb} MB`;
}
