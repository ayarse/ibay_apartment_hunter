import EventEmitter from 'node:events';
import { Events } from '../util/types';
import { newIbayItemScraped } from './new-ibay-item.listener';

const eventBus = new EventEmitter();

eventBus.on(Events.NewIBayItem, newIbayItemScraped);

export { eventBus };
