import { env } from '@/config';
import { bot } from '@/telegram';
import type { Listing } from '@/types';
import { UserService } from '.';

export const notifyAdmin = (message: string) => {
  bot.api.sendMessage(env.DEBUG_USER, message);
};

export const notifyUsersByPref = async (location: string, item: Listing) => {
  if (env.DEBUG) {
    notifyAdmin(item.url);

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
