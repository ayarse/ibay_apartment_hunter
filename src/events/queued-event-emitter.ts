import EventEmitter from 'node:events';
import PQueue from 'p-queue';

export class QueuedEventEmitter extends EventEmitter {
  private queue: PQueue;

  constructor() {
    super();
    this.queue = new PQueue({
      concurrency: 25,
      interval: 1000,
      intervalCap: 25,
    });
  }

  /**
   * Emit an event with the configured delay between emissions
   */
  emit(event: string | symbol, ...args: any[]): boolean {
    this.queue.add(async () => {
      super.emit(event, ...args);
    });

    return this.listenerCount(event) > 0;
  }

  /**
   * Wait for all queued events to be processed
   */
  async onIdle(): Promise<void> {
    await this.queue.onIdle();
  }
}
