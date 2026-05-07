import { Telegraf, Markup } from 'telegraf';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const MINI_APP_URL = process.env.MINI_APP_URL || 'https://your-mini-app.vercel.app';
const DELIVERY_APP_URL = process.env.DELIVERY_APP_URL || 'https://your-delivery-app.vercel.app';
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '-5178890371';

bot.start((ctx) => {
  ctx.reply(
    `🍽️ Welcome to Restaurant!\n\nChoose how you'd like to order:`,
    Markup.inlineKeyboard([
      [Markup.button.webApp('📦 Order for Pickup', MINI_APP_URL)],
      [Markup.button.webApp('🚴 Delivery', DELIVERY_APP_URL)],
    ])
  );
});

bot.command('menu', (ctx) => {
  ctx.reply(
    '🍽️ Choose your order type:',
    Markup.inlineKeyboard([
      [Markup.button.webApp('📦 Pickup', MINI_APP_URL)],
      [Markup.button.webApp('🚴 Delivery', DELIVERY_APP_URL)],
    ])
  );
});

bot.command('pickup', (ctx) => {
  ctx.reply(
    '📦 Order for Pickup:',
    Markup.inlineKeyboard([
      [Markup.button.webApp('📋 Open Menu', MINI_APP_URL)],
    ])
  );
});

bot.command('delivery', (ctx) => {
  ctx.reply(
    '🚴 Order for Delivery:',
    Markup.inlineKeyboard([
      [Markup.button.webApp('🚴 Open Delivery Menu', DELIVERY_APP_URL)],
    ])
  );
});

bot.command('help', (ctx) => {
  ctx.reply(
    '📖 How to use:\n\n1. Choose Pickup or Delivery\n2. Browse and add items to cart\n3. Checkout with your details\n4. Track your order status\n\nUse /pickup for pickup orders\nUse /delivery for delivery orders',
    Markup.inlineKeyboard([
      [Markup.button.webApp('📦 Pickup', MINI_APP_URL)],
      [Markup.button.webApp('🚴 Delivery', DELIVERY_APP_URL)],
    ])
  );
});

// Handle "Take Order" button click
bot.action(/take_order_(\d+)/, async (ctx) => {
  const orderId = parseInt(ctx.match[1]);
  const driver = ctx.from;
  
  await ctx.answerCbQuery();
  
  try {
    // Update order with driver info
    const { error } = await supabase
      .from('orders')
      .update({ 
        assigned_driver_id: driver.id.toString(),
        assigned_driver_name: driver.first_name || 'Driver',
        assigned_driver_username: driver.username || null,
        status: 'driver_assigned'
      })
      .eq('id', orderId);

    if (error) throw error;

    // Get customer info
    const { data: order } = await supabase
      .from('orders')
      .select('telegram_user_id, customer_name')
      .eq('id', orderId)
      .single();

    // Update the group message to show claimed
    try {
      await ctx.editMessageText(
        ctx.message.text + `\n\n✅ *Claimed by:* ${driver.first_name || 'Driver'} (@${driver.username || 'N/A'})`,
        { parse_mode: 'Markdown' }
      );
    } catch (e) {
      // Message might not be editable
    }

    // Notify admin
    ctx.telegram.sendMessage(
      ADMIN_CHAT_ID,
      `🚴 *Driver Assigned*\n\nOrder #${orderId}\nDriver: ${driver.first_name} (@${driver.username || 'no username'})\nClaimed at: ${new Date().toLocaleString()}`,
      { parse_mode: 'Markdown' }
    );

    // Ask driver to share location
    ctx.reply(
      `✅ You claimed Order #${orderId}\n\n📍 Please share your live location when you're on the way to the customer.`
    );

    // Notify customer if we have their ID
    if (order?.telegram_user_id) {
      try {
        await ctx.telegram.sendMessage(
          order.telegram_user_id,
          `🚴 *Your order has been assigned to a driver!*\n\nDriver: ${driver.first_name}${driver.username ? ` (@${driver.username})` : ''}\n\n📍 Please share your live location when the driver is on the way so you can track the delivery.`
        );
      } catch (e) {
        console.log('Could not notify customer');
      }
    }

  } catch (err) {
    console.error('Error assigning driver:', err);
    ctx.reply('⚠️ Error processing claim. Please try again.');
  }
});

// Handle "Delivered" button click
bot.action(/delivered_(\d+)/, async (ctx) => {
  const orderId = parseInt(ctx.match[1]);
  const driver = ctx.from;
  
  await ctx.answerCbQuery();
  
  try {
    // Update order status
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'delivered',
        delivered_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .eq('assigned_driver_id', driver.id.toString()); // Only driver who claimed can mark delivered

    if (error) throw error;

    // Get customer info
    const { data: order } = await supabase
      .from('orders')
      .select('telegram_user_id, customer_name, customer_address')
      .eq('id', orderId)
      .single();

    // Notify customer
    if (order?.telegram_user_id) {
      try {
        await ctx.telegram.sendMessage(
          order.telegram_user_id,
          `✅ *Order Delivered!*\n\nThank you for ordering with us. Your food has been delivered to:\n${order.customer_address}\n\nEnjoy your meal! 🍽️`
        );
      } catch (e) {
        console.log('Could not notify customer');
      }
    }

    // Notify admin
    ctx.telegram.sendMessage(
      ADMIN_CHAT_ID,
      `✅ *Order #${orderId} Delivered*\n\nDriver: ${driver.first_name}\nDelivered at: ${new Date().toLocaleString()}`
    );

    // Update group message
    try {
      await ctx.editMessageText(
        ctx.message.text + `\n\n✅ *DELIVERED by:* ${driver.first_name}`,
        { parse_mode: 'Markdown' }
      );
    } catch (e) {
      // Message might not be editable
    }

    ctx.reply('✅ Order marked as delivered!');

  } catch (err) {
    console.error('Error marking delivered:', err);
    ctx.reply('⚠️ Error updating order. You can only mark orders you claimed.');
  }
});

// Handle live location messages
bot.on('location', async (ctx) => {
  const location = ctx.message.location;
  const user = ctx.from;

  try {
    // Find active order for this driver
    const { data: order } = await supabase
      .from('orders')
      .select('id, telegram_user_id, customer_name, assigned_driver_id')
      .eq('assigned_driver_id', user.id.toString())
      .eq('status', 'driver_assigned')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (order) {
      // Send to customer
      if (order.telegram_user_id) {
        await ctx.telegram.sendLocation(
          order.telegram_user_id,
          location.latitude,
          location.longitude,
          { live_period: 3600 }
        );
      }

      // Also notify admin
      ctx.telegram.sendMessage(
        ADMIN_CHAT_ID,
        `📍 *Live Location Update*\n\nOrder #${order.id}\nDriver: ${user.first_name}\nLat: ${location.latitude.toFixed(5)}, Long: ${location.longitude.toFixed(5)}`,
        { parse_mode: 'Markdown' }
      );

      ctx.reply('📍 Location sent to customer!');
    } else {
      ctx.reply('No active delivery order found.');
    }
  } catch (err) {
    console.error('Error handling location:', err);
  }
});

bot.action('about', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply(
    '🏪 Restaurant Digital Menu\n\nOrder your favorite dishes for pickup or delivery directly through Telegram. Fresh ingredients, fast service!'
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