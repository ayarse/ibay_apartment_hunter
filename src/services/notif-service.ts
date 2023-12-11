import { UserService } from '.';
import { bot } from '../clients';
import { env } from '../config';
import { Listing } from '../types';

export const notifyUsersByPref = async (location: string, item: Listing) => {
  if (env.DEBUG) {
    bot.api.sendMessage(env.DEBUG_USER, item.url);

    return;
  }

  const users = await UserService.getUsersByPref(location);
  users.forEach((user) => {
    bot.api.sendMessage(user.tg_id, item.url);
  });
};

export const notifyAdmin = (message: string) => {
  bot.api.sendMessage(env.DEBUG_USER, message);
};
