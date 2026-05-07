function Cart({ cart, total, onBack, onCheckout, onRemove }) {
  if (cart.length === 0) {
    return (
      <div className="empty-cart" aria-live="polite">
        <span className="empty-icon" aria-hidden="true">🛒</span>
        <h2>Your cart is empty</h2>
        <p>Add some delicious items from the menu!</p>
        <button className="back-btn" onClick={onBack}>Browse Menu</button>
      </div>
    );
  }

  return (
    <div className="cart-view">
      <header className="cart-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1>🛒 Your Cart</h1>
      </header>

      <div className="cart-items">
        {cart.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <span className="cart-item-image" aria-hidden="true">{item.image_emoji || item.image}</span>
              <div>
                <h3>{item.name}</h3>
                <span className="cart-item-price">${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.price)}</span>
              </div>
            </div>
            <div className="cart-item-actions">
              <span className="quantity">x{item.quantity}</span>
              <button className="remove-btn" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.name}`}>−</button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-footer">
        <div className="total">
          <span>Total:</span>
          <span className="total-amount">${total.toFixed(2)}</span>
        </div>
        <button className="checkout-btn" onClick={onCheckout}>Checkout</button>
      </div>
    </div>
  );
}

export default Cart;