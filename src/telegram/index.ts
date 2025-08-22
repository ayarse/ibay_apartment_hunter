import { Bot } from 'grammy';
import { env } from '../config';

export const bot = new Bot(env.TELEGRAM_TOKEN);
