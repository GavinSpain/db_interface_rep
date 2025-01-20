"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = require("path");
const logger_1 = require("../utils/logger");
function startServer(script, name) {
    const server = (0, child_process_1.spawn)('node', [script], {
        stdio: 'inherit',
        cwd: process.cwd()
    });
    server.on('error', (error) => {
        logger_1.logger.error(`${name} server error:`, error);
    });
    return server;
}
// Start both servers
const internalServer = startServer((0, path_1.join)(__dirname, 'internal.js'), 'Internal');
const externalServer = startServer((0, path_1.join)(__dirname, 'external.js'), 'External');
// Handle process termination
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received. Shutting down servers...');
    internalServer.kill();
    externalServer.kill();
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT received. Shutting down servers...');
    internalServer.kill();
    externalServer.kill();
});
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught exception:', error);
    internalServer.kill();
    externalServer.kill();
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled rejection:', { reason, promise });
});
