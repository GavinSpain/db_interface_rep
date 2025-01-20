"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatManager = void 0;
const heartbeat_service_1 = require("../services/heartbeat.service");
const env_1 = require("../config/env");
const logger_1 = require("./logger");
class HeartbeatManager {
    constructor() {
        this.isUpdating = false;
        this.isStarted = false;
        this.failedAttempts = 0;
        this.MAX_RETRY_ATTEMPTS = 3;
        this.INITIAL_RETRY_DELAY = 1000; // 1 second
        this.heartbeatService = new heartbeat_service_1.HeartbeatService();
        this.SERVICE_ID = env_1.config.heartbeat.serviceId;
        this.HEARTBEAT_INTERVAL = env_1.config.heartbeat.intervalMs;
    }
    static getInstance() {
        if (!HeartbeatManager.instance) {
            HeartbeatManager.instance = new HeartbeatManager();
        }
        return HeartbeatManager.instance;
    }
    async start() {
        if (this.startPromise) {
            return this.startPromise;
        }
        if (this.isStarted) {
            return;
        }
        this.startPromise = this.startInternal();
        return this.startPromise;
    }
    async startInternal() {
        try {
            // Try initial heartbeat with retries
            await this.retryHeartbeat();
            // Set up the interval for subsequent heartbeats
            this.intervalId = setInterval(() => {
                this.sendHeartbeat().catch(() => {
                    this.failedAttempts++;
                    if (this.failedAttempts >= this.MAX_RETRY_ATTEMPTS) {
                        logger_1.logger.warn('Max heartbeat retry attempts reached, heartbeat service will continue to retry');
                    }
                });
            }, this.HEARTBEAT_INTERVAL);
            this.isStarted = true;
        }
        catch (error) {
            logger_1.logger.error('Failed to start heartbeat service:', error);
        }
        finally {
            this.startPromise = undefined;
        }
    }
    async retryHeartbeat() {
        for (let attempt = 0; attempt < this.MAX_RETRY_ATTEMPTS; attempt++) {
            try {
                await this.sendHeartbeat();
                return; // Success, exit retry loop
            }
            catch (error) {
                const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, attempt);
                logger_1.logger.warn(`Heartbeat attempt ${attempt + 1} failed, retrying in ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        logger_1.logger.warn('All heartbeat retry attempts failed, service will continue without heartbeat');
    }
    cleanup() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
        }
        this.isStarted = false;
        this.isUpdating = false;
        this.lastHeartbeatTime = undefined;
        this.failedAttempts = 0;
    }
    stop() {
        this.cleanup();
    }
    async sendHeartbeat() {
        if (this.isUpdating) {
            return;
        }
        this.isUpdating = true;
        const currentTime = new Date();
        try {
            // Use fetch to make an HTTP request to the internal server
            const response = await fetch(`http://localhost:${env_1.config.ports.internal}/api/heartbeat/${this.SERVICE_ID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.lastHeartbeatTime = currentTime;
            this.failedAttempts = 0; // Reset failed attempts on success
        }
        catch (error) {
            logger_1.logger.error('Heartbeat update failed:', error);
            throw error;
        }
        finally {
            this.isUpdating = false;
        }
    }
}
exports.HeartbeatManager = HeartbeatManager;
