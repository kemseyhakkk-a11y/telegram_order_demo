import { Telegraf, Markup } from 'telegraf';

const bot = new Telegraf(process.env.BOT_TOKEN);

const MINI_APP_URL = process.env.MINI_APP_URL || 'https://mini-app-six-green.vercel.app';

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

export default async (req, res) => {
  await bot.handleUpdate(req.body);
  res.status(200).send('OK');
};