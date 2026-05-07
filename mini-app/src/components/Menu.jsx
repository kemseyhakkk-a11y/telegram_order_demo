function Menu({ items, onAddToCart }) {
  return (
    <div className="menu-container">
      <div className="menu-grid">
        {items.map((item) => (
          <div key={item.id} className="menu-item">
            <div className="item-image" aria-hidden="true">
              {item.image_emoji || '🍽️'}
            </div>
            <div className="item-info">
              <h3>{item.name}</h3>
              <p>{item.description || 'Delicious item from our menu'}</p>
              <div className="item-bottom">
                <span className="price">
                  ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.price)}
                </span>
                <button 
                  className="add-btn" 
                  onClick={() => onAddToCart(item)}
                  aria-label={`Add ${item.name} to cart`}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Menu;