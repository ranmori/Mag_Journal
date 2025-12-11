// src/utils/logger.js
// Create this utility file for consistent logging across your frontend

const isDevelopment = import.meta.env.MODE === 'development';

const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  
  error: (...args) => {
    if (isDevelopment) {
      console.error(...args);
    } else {
      // In production, you might want to send errors to a service like Sentry
      // sendToErrorTracking(args);
    }
  },
  
  warn: (...args) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  
  // Useful for grouped logs
  group: (label, callback) => {
    if (isDevelopment) {
      console.group(label);
      callback();
      console.groupEnd();
    }
  },
};

export default logger;

// Usage in your components:
// import logger from '@/utils/logger';
// logger.log('Component mounted');
// logger.error('API call failed', error);