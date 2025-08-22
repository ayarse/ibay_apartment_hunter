import { NotifService } from '../services';
import { Listing } from '../util/types';

export const newIbayItemScraped = async (item: Listing) => {
  console.log(item);
  console.log('---------------');
  NotifService.notifyUsersByPref(item.location, item);
};
