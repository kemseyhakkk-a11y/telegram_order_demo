function Menu({ items, onAddToCart }) {
  return (
    <div className="menu-container">
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          No items found
        </div>
      ) : (
        <div className="menu-grid">
          {items.map((item) => (
            <div key={item.id} className="menu-item">
              <div className="item-image" aria-hidden="true">
                {item.image_emoji || '🍽️'}
              </div>
              <div className="item-info">
                <h3>{item.name}</h3>
                <p>{item.description || 'Delicious dish from our menu'}</p>
                <div className="item-bottom">
                  <span className="price">
                    ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.price)}
                  </span>
                  <button 
                    className="add-btn" 
                    onClick={() => onAddToCart(item)}
                    aria-label={`Add ${item.name} to cart`}
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Menu;