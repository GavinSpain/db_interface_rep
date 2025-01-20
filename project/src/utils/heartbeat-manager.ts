import { logger } from './logger';
import { config } from '../config/env';
import fetch from 'cross-fetch';

export class HeartbeatManager {
  private static instance: HeartbeatManager;
  private intervalId?: NodeJS.Timeout;
  private readonly SERVICE_ID: number;
  private readonly HEARTBEAT_INTERVAL: number;
  private isStarted: boolean = false;
  private startPromise?: Promise<void>;

  private constructor() {
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
      // Initial heartbeat
      await this.sendHeartbeat();

      // Set up the interval for subsequent heartbeats
      this.intervalId = setInterval(() => {
        this.sendHeartbeat().catch(error => {
          logger.error('Failed to send heartbeat:', error);
        });
      }, this.HEARTBEAT_INTERVAL);

      this.isStarted = true;
    } catch (error) {
      logger.error('Failed to start heartbeat service:', error);
    } finally {
      this.startPromise = undefined;
    }
  }

  private cleanup(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isStarted = false;
  }

  public stop(): void {
    this.cleanup();
  }

  private async sendHeartbeat(): Promise<void> {
    try {
      const response = await fetch(`http://localhost:${config.ports.internal}/api/heartbeat/${this.SERVICE_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      logger.debug('Heartbeat sent successfully');
    } catch (error) {
      logger.error('Failed to send heartbeat:', error);
      throw error;
    }
  }
}