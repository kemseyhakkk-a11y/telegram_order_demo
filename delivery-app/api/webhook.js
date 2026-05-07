const SUPABASE_URL = 'https://onvhmwjhiydhzirfcatp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9udmhtd2poaXlkaHppcmZjYXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNDM1OTgsImV4cCI6MjA5MzYxOTU5OH0.kxgGBEbGCleAGsv5903iutUbEQt6G7kaf12qm_f0tFQ';
const BOT_TOKEN = '8721362023:AAGUUSAmAGxN6CszdSnO4yK0MIoYAkyRmQg';
const ADMIN_CHAT_ID = '-5178890371';

async function supabaseQuery(table, query, method = 'GET', body = null) {
  let url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  if (method === 'PATCH' || method === 'POST') {
    const resp = await fetch(url, { method, headers, body: JSON.stringify(body) });
    return resp.json();
  }
  const resp = await fetch(url, { headers });
  return resp.json();
}

async function telegramAPI(method, body) {
  const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return resp.json();
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const update = req.body;

  try {
    if (update.callback_query) {
      const ctx = update.callback_query;
      const data = ctx.data;
      const user = ctx.from;

      await telegramAPI('answerCallbackQuery', { callback_query_id: ctx.id });

      if (data.startsWith('take_order_')) {
        const orderId = parseInt(data.replace('take_order_', ''));

        const [order] = await supabaseQuery(
          `orders?id=eq.${orderId}`,
          '',
          'PATCH',
          { 
            assigned_driver_id: user.id.toString(),
            assigned_driver_name: user.first_name || 'Driver',
            assigned_driver_username: user.username || null,
            status: 'driver_assigned'
          }
        );

        if (order) {
          const claimedText = ctx.message.text + 
            '\n\n<b>🚴 Claimed by:</b> <a href="tg://user?id=' + user.id + '">' + user.first_name + '</a>' +
            (user.username ? ' (@' + user.username + ')' : '') + '\n' +
            '<i>⏰ ' + new Date().toLocaleTimeString() + '</i>';

          const claimedButtons = [[
            { text: '🚴 Claimed by ' + user.first_name, callback_data: 'claimed' },
            { text: '📍 Show Map', url: 'https://maps.google.com/maps?q=' + (order.customer_lat || 0) + ',' + (order.customer_lng || 0) },
            { text: '✅ Delivered', callback_data: 'delivered_' + orderId }
          ]];

          try {
            await telegramAPI('editMessageText', {
              chat_id: ADMIN_CHAT_ID,
              message_id: ctx.message?.message_id,
              text: claimedText,
              parse_mode: 'HTML',
              reply_markup: { inline_keyboard: claimedButtons }
            });
          } catch (e) {}

          await telegramAPI('sendMessage', {
            chat_id: user.id,
            text: '✅ You claimed Order #' + orderId + '\n\n📍 Please share live location when on the way!'
          });

          if (order.telegram_user_id) {
            try {
              await telegramAPI('sendMessage', {
                chat_id: order.telegram_user_id,
                text: '🚴 *Your order has a driver!*\n\nDriver: ' + user.first_name + (user.username ? ' (@' + user.username + ')' : '') + '\n\n📍 Please share your live location when driver is on the way so you can track delivery.',
                parse_mode: 'Markdown'
              });
            } catch (e) {}
          }
        }
      }

      else if (data.startsWith('delivered_')) {
        const orderId = parseInt(data.replace('delivered_', ''));

        const [order] = await supabaseQuery(
          `orders?id=eq.${orderId}&assigned_driver_id=eq.${user.id.toString()}`,
          '',
          'PATCH',
          { 
            status: 'delivered',
            delivered_at: new Date().toISOString()
          }
        );

        if (order) {
          try {
            const deliveredText = ctx.message.text + 
              '\n\n✅ <b>DELIVERED</b> by <a href="tg://user?id=' + user.id + '">' + user.first_name + '</a>\n' +
              '<i>⏰ ' + new Date().toLocaleTimeString() + '</i>';
            
            await telegramAPI('editMessageText', {
              chat_id: ADMIN_CHAT_ID,
              message_id: ctx.message?.message_id,
              text: deliveredText,
              parse_mode: 'HTML'
            });
          } catch (e) {}

          if (order.telegram_user_id) {
            try {
              await telegramAPI('sendMessage', {
                chat_id: order.telegram_user_id,
                text: '✅ *Order Delivered!*\n\nYour food has been delivered to:\n' + order.customer_address + '\n\nEnjoy your meal! 🍽️',
                parse_mode: 'Markdown'
              });
            } catch (e) {}
          }
        } else {
          await telegramAPI('sendMessage', {
            chat_id: user.id,
            text: '⚠️ You can only mark orders you claimed.'
          });
        }
      }
    }

    if (update.message?.location) {
      const location = update.message.location;
      const user = update.message.from;

      const [order] = await supabaseQuery(
        `orders?assigned_driver_id=eq.${user.id.toString()}&status=eq.driver_assigned&order=created_at.desc&limit=1`,
        ''
      );

      if (order) {
        if (order.telegram_user_id) {
          await telegramAPI('sendLocation', {
            chat_id: order.telegram_user_id,
            latitude: location.latitude,
            longitude: location.longitude,
            live_period: 3600
          });
        }

        await telegramAPI('sendMessage', {
          chat_id: ADMIN_CHAT_ID,
          text: '📍 *Live Location Update*\n\nOrder #' + order.id + '\nDriver: ' + user.first_name + '\nLat: ' + location.latitude.toFixed(5) + ', Long: ' + location.longitude.toFixed(5),
          parse_mode: 'Markdown'
        });

        await telegramAPI('sendMessage', {
          chat_id: user.id,
          text: '📍 Location sent to customer!'
        });
      }
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Error:', error);
    res.json({ ok: false, error: error.message });
  }
};