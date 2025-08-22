import pino from 'pino';

export const logger = pino({
  transport: {
    target: 'pino-pretty',
  },
});

export const escapeMd = (text: string) =>
  text.replace(/(\[[^\][]*]\(http[^()]*\))|[[\]()>#+\-=|{}.!]/gi, (x, y) =>
    y ? y : '\\' + x,
  );

export const trimObjectValues = <T>(obj: T) => {
  Object.keys(obj).forEach((key) => {
    obj[key] = obj[key]?.trim();
  });

  return obj;
};

export const minsToMs = (mins: number) => mins * 60 * 1000;
