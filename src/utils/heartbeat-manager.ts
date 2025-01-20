import { HeartbeatService } from '../services/heartbeat.service';
import { config } from '../config/env';
import { logger } from './logger';

export class HeartbeatManager {
  private static instance: HeartbeatManager;
  private heartbeatService: HeartbeatService;
  private intervalId?: NodeJS.Timeout;
  private readonly SERVICE_ID: number;
  private readonly HEARTBEAT_INTERVAL: number;
  private isUpdating: boolean = false;
  private lastHeartbeatTime?: Date;
  private isStarted: boolean = false;
  private startPromise?: Promise<void>;
  private failedAttempts: number = 0;
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly INITIAL_RETRY_DELAY = 1000; // 1 second

  private constructor() {
    this.heartbeatService = new HeartbeatService();
    this.SERVICE_ID = config.heartbeat.serviceId;
    this.HEARTBEAT_INTERVAL = config.heartbeat.intervalMs;
  }

  public static getInstance(): HeartbeatManager {
    if (!HeartbeatManager.instance) {
      HeartbeatManager.instance = new HeartbeatManager();
    }
    return HeartbeatManager.instance;
  }

  public async start(): Promise<void> {
    if (this.startPromise) {
      return this.startPromise;
    }

    if (this.isStarted) {
      return;
    }

    this.startPromise = this.startInternal();
    return this.startPromise;
  }

  private async startInternal(): Promise<void> {
    try {
      // Try initial heartbeat with retries
      await this.retryHeartbeat();

      // Set up the interval for subsequent heartbeats
      this.intervalId = setInterval(() => {
        this.sendHeartbeat().catch(() => {
          this.failedAttempts++;
          if (this.failedAttempts >= this.MAX_RETRY_ATTEMPTS) {
            logger.warn('Max heartbeat retry attempts reached, heartbeat service will continue to retry');
          }
        });
      }, this.HEARTBEAT_INTERVAL);

      this.isStarted = true;
    } catch (error) {
      logger.error('Failed to start heartbeat service:', error);
    } finally {
      this.startPromise = undefined;
    }
  }

  private async retryHeartbeat(): Promise<void> {
    for (let attempt = 0; attempt < this.MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        await this.sendHeartbeat();
        return; // Success, exit retry loop
      } catch (error) {
        const delay = this.INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        logger.warn(`Heartbeat attempt ${attempt + 1} failed, retrying in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    logger.warn('All heartbeat retry attempts failed, service will continue without heartbeat');
  }

  private cleanup(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isStarted = false;
    this.isUpdating = false;
    this.lastHeartbeatTime = undefined;
    this.failedAttempts = 0;
  }

  public stop(): void {
    this.cleanup();
  }

  private async sendHeartbeat(): Promise<void> {
    if (this.isUpdating) {
      return;
    }

    this.isUpdating = true;
    const currentTime = new Date();
    
    try {
      // Use fetch to make an HTTP request to the internal server
      const response = await fetch(`http://localhost:${config.ports.internal}/api/heartbeat/${this.SERVICE_ID}`, {
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
    } catch (error) {
      logger.error('Heartbeat update failed:', error);
      throw error;
    } finally {
      this.isUpdating = false;
    }
  }
}