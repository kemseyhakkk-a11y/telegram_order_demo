import { useState } from 'react';
import { supabase } from '../lib/supabase';

function Checkout({ cart, total, telegramUser, onBack, onComplete }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !address) return;

    setIsSubmitting(true);
    setError('');

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: name,
          customer_phone: phone,
          customer_address: address,
          customer_note: note,
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
        <h1>📝 Checkout</h1>
      </header>

      <form className="checkout-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
        </div>

        <div className="form-group">
          <label>Phone *</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your phone number" required />
        </div>

        <div className="form-group">
          <label>Delivery Address *</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, house, apartment" required />
        </div>

        <div className="form-group">
          <label>Note (optional)</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Special instructions..." rows={3} />
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          {cart.map((item) => (
            <div key={item.id} className="summary-item">
              <span>{item.image_emoji} {item.name} x{item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-total">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Processing...' : `Place Order ($${total.toFixed(2)})`}
        </button>
      </form>
    </div>
  );
}

export default Checkout;
