"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatManager = void 0;
const heartbeat_service_1 = require("../services/heartbeat.service");
const env_1 = require("../config/env");
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
                        console.warn('Max heartbeat retry attempts reached, heartbeat service will continue to retry');
                        // Don't stop the service, just log the warning
                    }
                });
            }, this.HEARTBEAT_INTERVAL);
            this.isStarted = true;
        }
        catch (error) {
            console.error('Failed to start heartbeat service:', error);
            // Don't throw the error, allow the service to start without heartbeat
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
                console.warn(`Heartbeat attempt ${attempt + 1} failed, retrying in ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        // If we get here, all retries failed but we won't throw
        console.warn('All heartbeat retry attempts failed, service will continue without heartbeat');
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
            await this.heartbeatService.updateHeartbeat(this.SERVICE_ID, currentTime.toISOString());
            this.lastHeartbeatTime = currentTime;
            this.failedAttempts = 0; // Reset failed attempts on success
        }
        catch (error) {
            console.error('Heartbeat update failed:', error);
            throw error;
        }
        finally {
            this.isUpdating = false;
        }
    }
}
exports.HeartbeatManager = HeartbeatManager;
