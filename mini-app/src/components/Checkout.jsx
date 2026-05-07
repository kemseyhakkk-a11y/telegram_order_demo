import { useState } from 'react';
import { supabase } from '../lib/supabase';

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
        <h1>📝 Confirm Order</h1>
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