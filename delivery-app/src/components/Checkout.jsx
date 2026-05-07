import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { generateReceiptImage } from '../lib/receiptGenerator';

const DELIVERY_GROUP_ID = '-5178890371';
const DELIVERY_BOT_TOKEN = '8721362023:AAGUUSAmAGxN6CszdSnO4yK0MIoYAkyRmQg';

function Checkout({ cart, total, telegramUser, onBack, onComplete, tg }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [customerLocation, setCustomerLocation] = useState(null);

  const shareLocation = () => {
    if (!navigator.geolocation) {
      setError('Location not supported on this device');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setCustomerLocation(loc);
        setDeliveryAddress(`📍 Location shared (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})`);
      },
      () => {
        setError('Please allow location access or type your address manually');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

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
          customer_lat: customerLocation?.lat || null,
          customer_lng: customerLocation?.lng || null,
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

        const DELIVERY_BOT_TOKEN = '8721362023:AAGUUSAmAGxN6CszdSnO4yK0MIoYAkyRmQg';

        await fetch(`https://api.telegram.org/bot${DELIVERY_BOT_TOKEN}/sendPhoto`, {
          method: 'POST',
          body: formData
        });

        // Send to delivery group - clean single message
        const tgUsername = telegramUser?.username 
          ? `<a href="https://t.me/${telegramUser.username}">@${telegramUser.username}</a>`
          : telegramUser?.first_name || 'Customer';
        
        const itemsList = cart.map(item => `┃ ${item.name} x${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`).join('\n');
        const locLine = customerLocation ? `\n┃ 📌 <b>Location:</b> Shared via GPS` : '';
        
        const deliveryGroupText = `🛵 <b>New Delivery Order #${order.id}</b>\n\n┏━━━━━━━━━━━━━━━━━━┓\n┃ 👤 <b>Customer:</b> ${tgUsername}\n┃ 📍 <b>Address:</b> ${deliveryAddress}\n┃ 📞 <b>Phone:</b> ${phone}\n┃ 📝 <b>Note:</b> ${note || 'None'}${locLine}\n┃\n${itemsList}\n┃\n┃ 📦 <b>${totalItems} items</b> — 💰 <b>$${total.toFixed(2)}</b>\n┗━━━━━━━━━━━━━━━━━━┛`;

        const keyboardButtons = [[
          { text: '🚴 Take Order', callback_data: `take_order_${order.id}` }
        ]];
        
        if (customerLocation) {
          keyboardButtons[0].push({ text: '📍 Show Map', url: `https://maps.google.com/maps?q=${customerLocation.lat},${customerLocation.lng}` });
        }
        
        keyboardButtons[0].push({ text: '✅ Delivered', callback_data: `delivered_${order.id}` });

        const keyboard = JSON.stringify({
          inline_keyboard: keyboardButtons
        });

        await fetch(`https://api.telegram.org/bot${DELIVERY_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: DELIVERY_GROUP_ID,
            text: deliveryGroupText,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: keyboardButtons }
          })
        });
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
          <div className="location-input-row">
            <input
              type="text"
              className="form-input"
              placeholder="Enter your full address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              required
              aria-label="Delivery address"
            />
            <button 
              type="button" 
              className="location-btn"
              onClick={shareLocation}
              aria-label="Share location"
            >
              {customerLocation ? '✅' : '📍'}
            </button>
          </div>
          {customerLocation && <p className="location-hint">📍 Location shared! Driver can track you.</p>}

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