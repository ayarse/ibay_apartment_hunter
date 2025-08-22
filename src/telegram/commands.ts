import type { Context } from 'grammy';
import { bot } from '../telegram';
import { env } from '../config';
import { UserService } from '../services';
import { menuMiddleware } from './menu';

export default async function initCommands() {
  await bot.api.setMyCommands([
    { command: 'start', description: 'Subscribe to updates' },
    { command: 'stop', description: 'Unsubscribe from updates' },
    { command: 'location', description: 'Change your preferred location' },
  ]);

  /**
   * [ /start ] - Subscribe to updates
   */
  bot.command('start', async (ctx) => {
    const userId = ctx.chat.id.toString();
    await UserService.addSubscriber(userId);

    ctx.reply(
      `
          Hey ${ctx.from.first_name}, thanks for subscribing. I'll keep sending you new apartment listings as I find them 😀

          *Commands:*
          /start - Subscribe to updates
          /stop - Unsubscribe from updates
          /location - Change your preferred location
      `,
    );
  });

  /**
   * [ /stop ] - Unsubscribe from updates
   */
  bot.command('stop', async (ctx) => {
    const userId = ctx.chat.id.toString();

    if (!(await UserService.hasSubscriber(userId))) {
      ctx.reply(`You're not subscribed to my updates yet`);
      return;
    }

    await UserService.removeSubscriber(userId);
    ctx.reply(`Okay... I've unsubscribed you... 😔`);
  });

  /**
   * [ /location ] - Change user's location preference if subscribed
   */
  bot.use(menuMiddleware);
  bot.command('location', (ctx) =>
    menuMiddleware.replyToContext(ctx as unknown as Context),
  );

  /**
   * [ /usercount ] - Displays the number of subscribed users.
   * Response is sent only if the command comes from the DEBUG_USER's id.
   */
  bot.command('usercount', async (ctx) => {
    if (ctx.chat.id.toString() !== env.DEBUG_USER) {
      ctx.reply(`Heh... heh... 🤓`);

      return;
    }

    const count = await UserService.countUsers();
    ctx.reply(`${count}`);
  });

  /**
   * [ /announce ] - Send a message to all users.
   * This command can only be used by the admin/debug user.
   */
  bot.command('announce', async (ctx) => {
    if (ctx.chat.id.toString() !== env.DEBUG_USER) {
      ctx.reply(`You don't have permission to use this command.`);
      return;
    }

    const message = ctx.message.text.split(' ').slice(1).join(' ');
    if (!message) {
      ctx.reply(`Please provide a message to announce.`);
      return;
    }

    const subscribers = await UserService.getAllSubscribers();
    subscribers.forEach(async ({ tg_id }) => {
      await bot.api.sendMessage(tg_id, message);
    });

    ctx.reply(`Announcement sent to all users.`);
  });
}
