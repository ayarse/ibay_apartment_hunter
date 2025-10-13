import { Events } from '@/types';
import { newIbayItemScraped } from './new-ibay-item.listener';
import { ibayPageCrawler } from './new-ibay-page.listener';
import { QueuedEventEmitter } from './queued-event-emitter';

const eventBus = new QueuedEventEmitter();

eventBus.on(Events.NewIBayItem, newIbayItemScraped);
eventBus.on(Events.IbayPageCrawler, ibayPageCrawler);
export { eventBus, QueuedEventEmitter };
