import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import DishModal from "./components/DishModal";

// Views
import Landing from "./views/Landing";
import Menu from "./views/Menu";
import Checkout from "./views/Checkout";
import Auth from "./views/Auth";
import AdminPanel from "./views/AdminPanel";
import Profile from "./views/Profile";

// DB utilities
import {
  initDB,
  getDishes,
  getCurrentSession,
  logoutUser,
  updateCurrentSessionAddress,
  getPromotions,
  isSiteLocked,
  setSiteLocked,
  getRestaurantInfo,
  syncFromSupabase,
  getDeliveryRates
} from "./utils/db";

export default function App() {
  const [view, setView] = useState("landing"); // landing, menu, checkout, auth, admin
  const [session, setSession] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const [locked, setLocked] = useState(false);
  const [restaurantInfo, setRestaurantInfo] = useState({});
  const [deliveryRates, setDeliveryRates] = useState(null);

  // Initialize DB and load session/dishes on mount
  useEffect(() => {
    initDB();
    setLocked(isSiteLocked());
    setDishes(getDishes());
    setPromotions(getPromotions());
    setSession(getCurrentSession());
    setRestaurantInfo(getRestaurantInfo());
    setDeliveryRates(getDeliveryRates());

    // Background cloud sync
    syncFromSupabase().then((synced) => {
      if (synced) {
        setDishes(getDishes());
        setPromotions(getPromotions());
        setRestaurantInfo(getRestaurantInfo());
      }
    });
  }, []);

  // Update session address
  const handleUpdateSessionAddress = (address, phone) => {
    updateCurrentSessionAddress(address, phone);
    setSession(getCurrentSession());
  };

  // Load fresh dishes list from localStorage (e.g. after CRUD edit)
  const refreshDishes = () => {
    setDishes(getDishes());
  };

  // Load fresh promotions list from localStorage (e.g. after CRUD edit)
  const refreshPromotions = () => {
    setPromotions(getPromotions());
  };

  const refreshRestaurantInfo = () => {
    setRestaurantInfo(getRestaurantInfo());
  };

  const handleLoginSuccess = (user) => {
    setSession(user);
  };

  const handleLogout = () => {
    logoutUser();
    setSession(null);
    setView("landing");
  };

  // Cart operations
  const handleAddToCart = (dish, quantity, selectedOption) => {
    setCart((prevCart) => {
      // Find if item already exists with the same custom option
      const existingIdx = prevCart.findIndex(
        (item) => item.dish.id === dish.id && item.selectedOption === selectedOption
      );

      if (existingIdx !== -1) {
        // Increment quantity
        const newCart = [...prevCart];
        newCart[existingIdx].quantity += quantity;
        return newCart;
      } else {
        // Append new item
        return [...prevCart, { dish, quantity, selectedOption }];
      }
    });
    setCartOpen(true);
  };

  const handleAddToCartQuick = (dish) => {
    // Quick add from menu view (no customizations, qty = 1)
    handleAddToCart(dish, 1, "");
  };

  const handleUpdateCartQty = (index, delta) => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      const newQty = newCart[index].quantity + delta;
      if (newQty >= 1) {
        newCart[index].quantity = newQty;
      }
      return newCart;
    });
  };

  const handleRemoveCartItem = (index) => {
    setCart((prevCart) => prevCart.filter((_, idx) => idx !== index));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleUnlock = (code) => {
    if (code === "buenapaga") {
      setSiteLocked(false);
      setLocked(false);
    } else {
      alert("Código de desbloqueo incorrecto.");
    }
  };

  const isAdminView = view === "admin" && session?.role === "admin";

  if (locked) {
    return (
      <div className="min-h-screen bg-[#0a0505] text-[#ffdfdf] flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#180f0f] border border-[#ff3b3b]/20 p-8 rounded-sm text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-[#ff3b3b]/10 border border-[#ff3b3b] text-[#ff3b3b] flex items-center justify-center rounded-full mx-auto animate-pulse">
            <span className="font-bold text-2xl font-serif">!</span>
          </div>
          
          <div className="space-y-2">
            <h1 className="font-serif text-2xl font-bold uppercase tracking-widest text-[#ff3b3b]">
              SITIO TEMPORALMENTE INACTIVO
            </h1>
            <p className="text-xs text-[#ffbaba]/70 leading-relaxed">
              Fuera de servicio por mantenimiento técnico. Por favor, comuníquese con soporte técnico o intente más tarde.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUnlock(e.target.elements.unlockCode.value);
              e.target.elements.unlockCode.value = "";
            }}
            className="space-y-4 pt-4 border-t border-[#ff3b3b]/10"
          >
            <div className="flex flex-col space-y-1.5 text-left">
              <label className="text-[9px] font-bold uppercase tracking-wider text-[#ffbaba]/50">Código de Autorización</label>
              <input
                type="password"
                name="unlockCode"
                required
                placeholder="••••••••"
                className="w-full bg-[#0a0505] border border-[#ff3b3b]/30 text-white px-4 py-3 text-sm rounded-sm outline-none focus:border-[#ff3b3b] text-center font-mono tracking-widest"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#ff3b3b] text-white font-bold py-3.5 uppercase text-xs tracking-widest hover:bg-[#ff5555] transition-all"
            >
              Validar Acceso
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-between">
      
      {/* Navbar */}
      {!isAdminView && (
        <Navbar
          currentView={view}
          setView={setView}
          cart={cart}
          setCartOpen={setCartOpen}
          session={session}
          onLogout={handleLogout}
        />
      )}

      {/* Main Content Router */}
      <main className="flex-grow">
        {view === "landing" && (
          <Landing
            setView={setView}
            onSelectDish={setSelectedDish}
            dishes={dishes}
            promotions={promotions}
            restaurantInfo={restaurantInfo}
          />
        )}
        
        {view === "menu" && (
          <Menu
            dishes={dishes}
            onSelectDish={setSelectedDish}
            onAddToCartQuick={handleAddToCartQuick}
            restaurantInfo={restaurantInfo}
          />
        )}

        {view === "checkout" && (
          <Checkout
            cart={cart}
            clearCart={clearCart}
            setView={setView}
            session={session}
            onUpdateSessionAddress={handleUpdateSessionAddress}
            restaurantInfo={restaurantInfo}
            deliveryRates={deliveryRates}
          />
        )}

        {view === "auth" && (
          <Auth
            setView={setView}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {view === "profile" && (
          <Profile
            session={session}
            onUpdateSession={(updated) => setSession(updated)}
            setView={setView}
            onLogout={handleLogout}
          />
        )}

        {view === "admin" && session?.role === "admin" && (
          <AdminPanel
            setView={setView}
            dishes={dishes}
            onRefreshDishes={refreshDishes}
            promotions={promotions}
            onRefreshPromotions={refreshPromotions}
            onLogout={handleLogout}
            restaurantInfo={restaurantInfo}
            onRefreshInfo={refreshRestaurantInfo}
          />
        )}
      </main>

      {/* Footer */}
      {!isAdminView && <Footer setView={setView} restaurantInfo={restaurantInfo} />}

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        setView={setView}
        restaurantInfo={restaurantInfo}
      />

      {/* Customization & Add to Cart Modal */}
      {selectedDish && (
        <DishModal
          dish={selectedDish}
          onClose={() => setSelectedDish(null)}
          onAddToCart={handleAddToCart}
        />
      )}

    </div>
  );
}
