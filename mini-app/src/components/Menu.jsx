function Menu({ items, onAddToCart }) {
  return (
    <div className="menu-items">
      {items.map((item) => (
        <div key={item.id} className="menu-item">
          <div className="item-image">{item.image}</div>
          <div className="item-info">
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <div className="item-bottom">
              <span className="price">${item.price.toFixed(2)}</span>
              <button className="add-btn" onClick={() => onAddToCart(item)}>Add</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Menu;