import { Events } from '@/types';
import { newIbayItemScraped } from './new-ibay-item.listener';
import { ibayPageCrawler } from './new-ibay-page.listener';
import { QueuedEventEmitter } from './queued-event-emitter';

const eventBus = new QueuedEventEmitter(5000); // 5 second delay by default

eventBus.on(Events.NewIBayItem, newIbayItemScraped);
eventBus.on(Events.IbayPageCrawler, ibayPageCrawler);
export { eventBus, QueuedEventEmitter };
