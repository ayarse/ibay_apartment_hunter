import puppeteer from 'puppeteer';

export const getBrowser = async () => {
  return puppeteer.launch({
    headless: 'new',
  });
};
