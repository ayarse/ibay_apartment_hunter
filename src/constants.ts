import { Locations } from './types';

export const IBAY_URLS: Record<Locations, string> = {
  All: 'https://ibay.com.mv/index.php?page=search&s_res=AND&cid=25&off=0&lang=&s_by=hw_added',
  Male: 'https://ibay.com.mv/index.php?page=search&s_res=AND&cid=25&off=0&lang=&s_by=hw_added&reg1_ex=11&reg2_ex=100',
  Hulhumale:
    'https://ibay.com.mv/index.php?page=search&s_res=AND&cid=25&s_by=hw_added&f_location_ex=Male+--+HulhuMale',
  Villigili:
    'https://ibay.com.mv/index.php?page=search&s_res=AND&cid=25&s_by=hw_added&f_location_ex=Male+--+Villingili',
};
