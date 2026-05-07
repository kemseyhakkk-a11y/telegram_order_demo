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
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.body.classList.toggle('light-mode', !darkMode);
    document.getElementById('theme-color')?.setAttribute('content', darkMode ? '#020617' : '#f8fafc');
  }, [darkMode]);

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
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('display_order');

    const availableCategoryIds = [...new Set((menuItems || []).map(item => item.category_id))];

    const { data: cats } = await supabase
      .from('menu_categories')
      .select('*')
      .in('id', availableCategoryIds)
      .order('display_order');

    setCategories(cats || []);
    setItems(menuItems || []);

    // Auto-expand first category
    if (cats && cats.length > 0) {
      setExpandedCategories({ [cats[0].id]: true });
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

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
    if (tg) tg.HapticFeedback.impactOccurred('light');
  };

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

  const updateQuantity = (itemId, delta) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (!existing) return prev;
      
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((i) => i.id !== itemId);
      }
      return prev.map((i) => i.id === itemId ? { ...i, quantity: newQty } : i);
    });
    if (tg) tg.HapticFeedback.impactOccurred('light');
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getCategoryItems = (categoryId) => {
    return items.filter(item => 
      item.category_id === categoryId && 
      (!searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

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
        onUpdateQuantity={updateQuantity}
      />
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="brand-row">
            <img src="/logo.jpg" alt="Tasty Bites" className="logo" />
            <div>
              <p className="brand-label">Tasty Bites</p>
              <h1 className="brand">Today's Menu</h1>
            </div>
          </div>
          <button 
            className="theme-toggle" 
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <div className="search-container">
          <div className="search-wrapper">
            <span className="search-icon" aria-hidden="true">🔍</span>
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
      </header>

      <div className="menu-sections">
        {categories.map((cat) => {
          const categoryItems = getCategoryItems(cat.id);
          const isExpanded = expandedCategories[cat.id];
          
          return (
            <div key={cat.id} className="menu-section">
              <button 
                className={`section-header ${isExpanded ? 'expanded' : ''}`}
                onClick={() => toggleCategory(cat.id)}
              >
                <div className="section-info">
                  <span className="section-icon" aria-hidden="true">{cat.icon}</span>
                  <span className="section-title">{cat.name}</span>
                  <span className="section-count">{categoryItems.length} items</span>
                </div>
                <span className="section-arrow">{isExpanded ? '−' : '+'}</span>
              </button>
              
              {isExpanded && (
                <div className="section-content">
                  <div className="menu-grid">
                    {categoryItems.map((item) => {
                      const cartItem = cart.find(c => c.id === item.id);
                      return (
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
                              {cartItem ? (
                                <div className="qty-controls">
                                  <button 
                                    className="qty-btn minus"
                                    onClick={() => updateQuantity(item.id, -1)}
                                    aria-label="Decrease quantity"
                                  >−</button>
                                  <span className="qty-value">{cartItem.quantity}</span>
                                  <button 
                                    className="qty-btn plus"
                                    onClick={() => updateQuantity(item.id, 1)}
                                    aria-label="Increase quantity"
                                  >+</button>
                                </div>
                              ) : (
                                <button 
                                  className="add-btn" 
                                  onClick={() => addToCart(item)}
                                  aria-label={`Add ${item.name} to cart`}
                                >
                                  +
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

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
              onKeyDown={(e) => e.key === 'Enter' && setView('cart')}
              aria-label="View cart and checkout"
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