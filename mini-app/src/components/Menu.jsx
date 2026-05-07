function Menu({ items, onAddToCart }) {
  return (
    <div className="menu-items">
      {items.map((item) => (
        <div key={item.id} className="menu-item">
          <div className="item-image" aria-hidden="true">{item.image_emoji || item.image}</div>
          <div className="item-info">
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <div className="item-bottom">
              <span className="price">${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(item.price)}</span>
              <button className="add-btn" onClick={() => onAddToCart(item)}>Add</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Menu;