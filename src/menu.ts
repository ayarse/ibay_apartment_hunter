import type { Context } from 'grammy';
import { MenuMiddleware, MenuTemplate } from 'grammy-inline-menu';
import { UserService } from './services';
import { Locations } from './types';

const menuTemplate = new MenuTemplate<Context>(
  (_ctx) => `Select your preferred location`,
);
menuTemplate.select(
  'location',
  [Locations.All, Locations.Male, Locations.Hulhumale, Locations.Villigili],
  {
    columns: 2,
    set: async (ctx, key) => {
      await UserService.addSubscriber(ctx.chat.id.toString());
      await UserService.updateUserLocationPref(ctx.chat.id.toString(), key);
      await ctx.answerCallbackQuery(
        `Ok! Location is set to ${key}. Let's get this party started!`,
      );
      await ctx.deleteMessage();

      return true;
    },
    isSet: async (_, key) => {
      const user = await UserService.getSubscriber(_.chat.id.toString());

      return user?.pref_location === key;
    },
  },
);
export const menuMiddleware = new MenuMiddleware('/', menuTemplate);
