import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { generateReceiptImage } from '../lib/receiptGenerator';

const DELIVERY_GROUP_ID = '-5178890371';

function Checkout({ cart, total, telegramUser, onBack, onComplete }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!deliveryAddress.trim()) {
      setError('Please enter delivery address');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter phone number');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: telegramUser?.first_name || 'Telegram User',
          customer_phone: phone,
          customer_address: deliveryAddress,
          customer_note: note || 'Order via Telegram Mini App (Delivery)',
          total_amount: total,
          telegram_user_id: telegramUser?.id || null,
          order_type: 'delivery',
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

      // Send receipt to customer
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
        formData.append('caption', `🧾 Order #${order.id} Confirmed!\n📍 Delivery to: ${deliveryAddress}\n📞 ${phone}\n\n📍 Please share your live location when the driver is on the way.`);

        await fetch(`https://api.telegram.org/bot${import.meta.env.VITE_TELEGRAM_BOT_TOKEN}/sendPhoto`, {
          method: 'POST',
          body: formData
        });

        // Send to delivery group with inline buttons
        const deliveryGroupText = `🛵 *New Delivery Order #${order.id}*\n\n👤 *Customer:* ${telegramUser?.first_name || 'Customer'}\n📍 *Address:* ${deliveryAddress}\n📞 *Phone:* ${phone}\n📝 *Note:* ${note || 'None'}\n\n*Items:*\n${cart.map(item => `• ${item.name} x${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`).join('\n')}\n\n─────────────────────\n📦 Items: ${totalItems}\n💰 Total: $${total.toFixed(2)}\n─────────────────────`;

        const keyboard = JSON.stringify({
          inline_keyboard: [[
            { text: '🚴 Take Order', callback_data: `take_order_${order.id}` },
            { text: '✅ Delivered', callback_data: `delivered_${order.id}` }
          ]]
        });

        await fetch(`https://api.telegram.org/bot${import.meta.env.VITE_TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${DELIVERY_GROUP_ID}&text=${encodeURIComponent(deliveryGroupText)}&parse_mode=Markdown&reply_markup=${encodeURIComponent(keyboard)}`);
      } catch (receiptErr) {
        console.warn('Failed to send notifications:', receiptErr);
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
        <h1>Delivery Details</h1>
      </header>

      <form className="checkout-form" onSubmit={handleSubmit}>
        {error && <div className="error-message" role="alert" aria-live="polite">{error}</div>}

        <div className="delivery-form">
          <label className="form-label">
            <span className="label-icon">📍</span>
            Delivery Address *
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter your full address"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            required
            aria-label="Delivery address"
          />

          <label className="form-label">
            <span className="label-icon">📞</span>
            Phone Number *
          </label>
          <input
            type="tel"
            className="form-input"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            aria-label="Phone number"
          />

          <label className="form-label">
            <span className="label-icon">📝</span>
            Note (Optional)
          </label>
          <textarea
            className="form-input form-textarea"
            placeholder="Any special instructions..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            aria-label="Order note"
          />
        </div>

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