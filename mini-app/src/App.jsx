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
    if (tg && cart.length > 0) {
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      tg.MainButton.setText(`View Cart ($${total.toFixed(2)})`);
      tg.MainButton.show();
      tg.MainButton.onClick(() => setView('cart'));
    } else if (tg) {
      tg.MainButton.hide();
    }
  }, [cart, tg]);

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

  const filteredItems = items.filter((item) => item.category_id === selectedCategory);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading menu...</p>
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
      <header className="header">
        <h1>🍽️ Restaurant Menu</h1>
        <button className="cart-btn" onClick={() => setView('cart')} aria-label={`Shopping cart with ${cartCount} items`}>
          🛒 {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </header>

      <div className="categories">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            <span className="category-icon" aria-hidden="true">{cat.icon}</span>
            <span className="category-name">{cat.name}</span>
          </button>
        ))}
      </div>

      <Menu items={filteredItems} onAddToCart={addToCart} />
    </div>
  );
}

export default App;
