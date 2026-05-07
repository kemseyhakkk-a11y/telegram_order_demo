const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

Deno.serve(async (req) => {
  try {
    const { order_id, telegram_user_id, cart, total, customer_name } = await req.json();

    if (!order_id || !telegram_user_id || !cart || !total) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build receipt message
    let receiptText = `🧾 *Order #${order_id} Confirmed*\n\n`;
    receiptText += `👤 *${customer_name || 'Customer'}*\n`;
    receiptText += `📍 *Pickup Order*\n\n`;
    receiptText += `*Items:*\n`;
    
    let totalItems = 0;
    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      totalItems += item.quantity;
      receiptText += `• ${item.image_emoji || '🍽️'} ${item.name} x${item.quantity} — $${itemTotal.toFixed(2)}\n`;
    });
    
    receiptText += `\n─────────────────────\n`;
    receiptText += `📦 Total Items: *${totalItems}*\n`;
    receiptText += `💰 Total: *$${total.toFixed(2)}*\n`;
    receiptText += `─────────────────────\n\n`;
    receiptText += `✅ Your order has been received and will be prepared shortly.`;

    // Send message via Telegram Bot API
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegram_user_id,
        text: receiptText,
        parse_mode: 'Markdown'
      })
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResult.ok) {
      console.error('Telegram API error:', telegramResult);
      return new Response(JSON.stringify({ 
        error: 'Failed to send message', 
        telegramError: telegramResult 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message_id: telegramResult.result.message_id 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});