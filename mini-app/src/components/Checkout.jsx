import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { generateReceiptImage } from '../lib/receiptGenerator';

function Checkout({ cart, total, telegramUser, onBack, onComplete }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError('');

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: telegramUser?.first_name || 'Telegram User',
          customer_phone: 'N/A',
          customer_address: 'Pickup',
          customer_note: 'Order via Telegram Mini App',
          total_amount: total,
          telegram_user_id: telegramUser?.id || null,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        item_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

      // Send receipt to user's Telegram chat
      try {
        const receiptBlob = await generateReceiptImage(
          cart, 
          total, 
          order.id, 
          telegramUser?.first_name || 'Customer'
        );

        const formData = new FormData();
        formData.append('photo', receiptBlob, 'receipt.png');
        formData.append('chat_id', telegramUser?.id);
        formData.append('caption', `🧾 Order #${order.id} Confirmed! Your order has been received and will be prepared shortly.`);

        await fetch(`https://api.telegram.org/bot${import.meta.env.VITE_TELEGRAM_BOT_TOKEN}/sendPhoto`, {
          method: 'POST',
          body: formData
        });

        // Also send to group chat (text only)
        const groupText = `🛒 *New Order #${order.id}*\n\n👤 *Customer:* ${telegramUser?.first_name || 'Customer'}\n📍 *Pickup*\n\n*Items:*\n${cart.map(item => `• ${item.name} x${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`).join('\n')}\n\n─────────────────────\n📦 Items: ${totalItems}\n💰 Total: $${total.toFixed(2)}\n─────────────────────\n⏰ ${new Date().toLocaleTimeString()}`;

        await fetch(`https://api.telegram.org/bot${import.meta.env.VITE_TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=-5178890371&text=${encodeURIComponent(groupText)}&parse_mode=Markdown`);
      } catch (receiptErr) {
        console.warn('Failed to send receipt:', receiptErr);
      }

      onComplete();
    } catch (err) {
      console.error('Order failed:', err);
      setError('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-view">
      <header className="checkout-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1>Confirm Order</h1>
      </header>

      <form className="checkout-form" onSubmit={handleSubmit}>
        {error && <div className="error-message" role="alert" aria-live="polite">{error}</div>}

        <div className="order-summary">
          <h3>Your Order</h3>
          {cart.map((item) => (
            <div key={item.id} className="summary-item">
              <span>{item.image_emoji || '🍽️'} {item.name} x{item.quantity}</span>
              <span>
                ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.price * item.quantity)}
              </span>
            </div>
          ))}
          <div className="summary-total">
            <span>Total:</span>
            <span>
              ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(total)}
            </span>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Processing…' : `Confirm Order ($${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(total)})`}
        </button>
      </form>
    </div>
  );
}

export default Checkout;