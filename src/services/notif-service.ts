import { UserService } from '.';
import { bot } from '@/telegram';
import { env } from '@/config';
import { Listing } from '@/util/types';

export const notifyUsersByPref = async (location: string, item: Listing) => {
  if (env.DEBUG) {
    bot.api.sendMessage(env.DEBUG_USER, item.url);

    return;
  }

  const users = await UserService.getUsersByPref(location);
  users.forEach((user) => {
    bot.api.sendMessage(user.tg_id, item.url).catch((err) => {
      // If the user has blocked the bot set is_blocked to true
      if (
        err &&
        typeof err.message === 'string' &&
        err.message.includes('Forbidden: bot was blocked by the user')
      ) {
        UserService.blockUser(user.tg_id);
      }
    });
  });
};

export const notifyAdmin = (message: string) => {
  bot.api.sendMessage(env.DEBUG_USER, message);
};
