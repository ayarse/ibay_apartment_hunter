import { Locations } from './types';

const ibayBaseUrl = process.env.IBAY_BASE_URL ?? 'https://ibay.com.mv';

export const IBAY_URLS: Record<Locations, string> = {
  All: `${ibayBaseUrl}/index.php?page=search&s_res=AND&cid=25&off=0&lang=&s_by=hw_added`,
  Male: `${ibayBaseUrl}/index.php?page=search&s_res=AND&cid=25&off=0&lang=&s_by=hw_added&reg1_ex=11&reg2_ex=100`,
  Hulhumale: `${ibayBaseUrl}/index.php?page=search&s_res=AND&cid=25&s_by=hw_added&f_location_ex=Male+--+HulhuMale`,
  Villigili: `${ibayBaseUrl}/index.php?page=search&s_res=AND&cid=25&s_by=hw_added&f_location_ex=Male+--+Villingili`,
};
