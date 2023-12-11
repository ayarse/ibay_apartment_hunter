// https://stackoverflow.com/a/60145565
export const escape = (text: string) =>
  text.replace(/(\[[^\][]*]\(http[^()]*\))|[[\]()>#+\-=|{}.!]/gi, (x, y) =>
    y ? y : '\\' + x,
  );

export const trimObjectValues = (obj: Record<string, string>) => {
  Object.keys(obj).forEach((key) => {
    obj[key] = obj[key]?.trim();
  });

  return obj;
};

export const minsToMs = (mins: number) => mins * 60 * 1000;
