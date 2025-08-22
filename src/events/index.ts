import { Events } from '@/util/types';
import { newIbayItemScraped } from './new-ibay-item.listener';
import { QueuedEventEmitter } from './queued-event-emitter';

const eventBus = new QueuedEventEmitter(1000); // 1 second delay by default

eventBus.on(Events.NewIBayItem, newIbayItemScraped);

export { eventBus, QueuedEventEmitter };
