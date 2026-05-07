import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const MINI_APP_URL = process.env.MINI_APP_URL || 'https://your-mini-app.vercel.app';

bot.start((ctx) => {
  ctx.reply(
    `🍽️ Welcome to Restaurant Menu!\n\nBrowse our digital menu and order directly from Telegram.`,
    Markup.inlineKeyboard([
      [Markup.button.webApp('📋 View Menu', MINI_APP_URL)],
      [Markup.button.callback('ℹ️ About', 'about')],
    ])
  );
});

bot.command('menu', (ctx) => {
  ctx.reply(
    '🍽️ Explore our menu:',
    Markup.inlineKeyboard([
      [Markup.button.webApp('📋 Open Menu', MINI_APP_URL)],
    ])
  );
});

bot.command('help', (ctx) => {
  ctx.reply(
    '📖 How to use:\n\n1. Tap "Open Menu" to browse our dishes\n2. Add items to your cart\n3. Checkout and place your order\n4. Track your order status',
    Markup.inlineKeyboard([
      [Markup.button.webApp('📋 Browse Menu', MINI_APP_URL)],
    ])
  );
});

bot.action('about', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply(
    '🏪 Restaurant Digital Menu\n\nOrder your favorite dishes directly through Telegram. Fresh ingredients, fast delivery!'
  );
});

bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('⚠️ Something went wrong. Please try again.');
});

const PORT = process.env.PORT || 3000;

bot.launch({
  webhook: {
    domain: process.env.WEBHOOK_URL,
    port: PORT,
  },
}).then(() => {
  console.log('Bot launched successfully');
}).catch((err) => {
  console.log('Polling mode - specify WEBHOOK_URL for production');
  bot.launch();
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));