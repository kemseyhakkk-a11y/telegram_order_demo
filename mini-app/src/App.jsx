import { useState, useEffect } from 'react';
import { useTelegram } from './hooks/useTelegram';
import { supabase } from './lib/supabase';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import './index.css';

function App() {
  const { tg, user, expand, ready } = useTelegram();
  const [view, setView] = useState('menu');
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    ready();
    expand();
    return () => {
      if (tg) tg.MainButton.hide();
    };
  }, [tg, ready, expand]);

  useEffect(() => {
    fetchMenu();
  }, []);

  async function fetchMenu() {
    const { data: cats } = await supabase
      .from('menu_categories')
      .select('*')
      .order('display_order');

    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('display_order');

    setCategories(cats || []);
    setItems(menuItems || []);

    if (cats && cats.length > 0) {
      setSelectedCategory(cats[0].id);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (tg) {
      tg.BackButton.onClick(() => {
        if (view === 'cart') setView('menu');
        else if (view === 'checkout') setView('cart');
      });
    }
  }, [tg, view]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    if (tg) tg.HapticFeedback.impactOccurred('light');
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter((i) => i.id !== itemId);
    });
    if (tg) tg.HapticFeedback.impactOccurred('light');
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredItems = items.filter((item) => {
    const matchesCategory = item.category_id === selectedCategory;
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p style={{ color: '#94a3b8' }}>Loading menu...</p>
      </div>
    );
  }

  if (view === 'checkout') {
    return (
      <Checkout
        cart={cart}
        total={cartTotal}
        telegramUser={user}
        onBack={() => setView('cart')}
        onComplete={() => { clearCart(); setView('menu'); }}
      />
    );
  }

  if (view === 'cart') {
    return (
      <Cart
        cart={cart}
        total={cartTotal}
        onBack={() => setView('menu')}
        onCheckout={() => setView('checkout')}
        onRemove={removeFromCart}
      />
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <p className="brand-label">Tasty Bites</p>
            <h1 className="brand">Today's Menu</h1>
          </div>
        </div>

        <div className="search-container">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="search"
              className="search-input"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search menu"
            />
          </div>
        </div>

        <div className="categories-container">
          <div className="categories-scroll">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <Menu items={filteredItems} onAddToCart={addToCart} />

      {cartCount > 0 && (
        <footer className="cart-bar">
          <div className="cart-content">
            <div className="cart-info">
              <span className="cart-count">{cartCount} items</span>
              <span className="cart-total">${cartTotal.toFixed(2)} total</span>
            </div>
            <button 
              className="cart-checkout-btn"
              onClick={() => setView('cart')}
            >
              View cart & checkout
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;