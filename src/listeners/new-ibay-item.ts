import { NotifService } from '../services';
import { Listing } from '../types';
import { Events, eventBus } from '../util/event-bus';

const newIbayItemScraped = async (item: Listing) => {
  console.log(item);
  console.log('---------------');
  NotifService.notifyUsersByPref(item.location, item);
};

eventBus.on(Events.NewIBayItem, newIbayItemScraped);
