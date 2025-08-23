import EventEmitter from 'node:events';

interface QueuedEvent {
  event: string | symbol;
  args: any[];
  timestamp: number;
}

export class QueuedEventEmitter extends EventEmitter {
  private queue: QueuedEvent[] = [];
  private isProcessing = false;
  private delay: number;

  constructor(delayMs: number = 1000) {
    super();
    this.delay = delayMs;
  }

  /**
   * Emit an event with the configured delay between emissions
   */
  emit(event: string | symbol, ...args: any[]): boolean {
    const queuedEvent: QueuedEvent = {
      event,
      args,
      timestamp: Date.now(),
    };

    this.queue.push(queuedEvent);
    this.processQueue();

    return this.listenerCount(event) > 0;
  }

  /**
   * Set a new delay between events
   */
  setDelay(delayMs: number): void {
    this.delay = delayMs;
  }

  /**
   * Get the current delay
   */
  getDelay(): number {
    return this.delay;
  }

  /**
   * Get the current queue length
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Clear the queue without processing remaining events
   */
  clearQueue(): void {
    this.queue = [];
  }

  /**
   * Process the queue with delays between events
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const queuedEvent = this.queue.shift()!;

      // Emit the event using the parent EventEmitter's emit method
      super.emit(queuedEvent.event, ...queuedEvent.args);

      // Wait for the configured delay before processing the next event
      if (this.queue.length > 0) {
        await this.sleep(this.delay);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Sleep for the specified number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
