import { bot } from '../clients';
import env from '../config';

export const notifyAdmin = (message: string) => {
  bot.api.sendMessage(env.DEBUG_USER, message);
};
