import { config } from '../config/index.js';

/**
 * Simple logger utility
 */
class Logger {
  constructor(context = 'APP') {
    this.context = context;
  }

  info(message, data = {}) {
    console.log(`[${new Date().toISOString()}] [${this.context}] INFO:`, message, data);
  }

  error(message, error = {}) {
    console.error(`[${new Date().toISOString()}] [${this.context}] ERROR:`, message, error);
  }

  warn(message, data = {}) {
    console.warn(`[${new Date().toISOString()}] [${this.context}] WARN:`, message, data);
  }

  debug(message, data = {}) {
    if (config.app.logLevel === 'debug') {
      console.debug(`[${new Date().toISOString()}] [${this.context}] DEBUG:`, message, data);
    }
  }
}

/**
 * Create a logger instance for a specific context
 * @param {string} context - The context name (e.g., 'EmailService', 'VisionService')
 * @returns {Logger}
 */
export function createLogger(context) {
  return new Logger(context);
}

export default Logger;
