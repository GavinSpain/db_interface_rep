import { spawn } from 'child_process';
import { join } from 'path';
import { logger } from '../utils/logger';

function startServer(script: string, name: string) {
  const server = spawn('node', [script], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  server.on('error', (error) => {
    logger.error(`${name} server error:`, error);
  });

  return server;
}

// Start both servers
const internalServer = startServer(join(__dirname, 'internal.js'), 'Internal');
const externalServer = startServer(join(__dirname, 'external.js'), 'External');

// Handle process termination
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down servers...');
  internalServer.kill();
  externalServer.kill();
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down servers...');
  internalServer.kill();
  externalServer.kill();
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  internalServer.kill();
  externalServer.kill();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection:', { reason, promise });
});