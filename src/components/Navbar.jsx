import React from "react";
import { ShoppingBag, Truck, User, LogOut } from "lucide-react";
import logo from "../assets/logo.png";

export default function Navbar({
  currentView,
  setView,
  cart,
  setCartOpen,
  session,
  onLogout
}) {
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="docked full-width top-0 sticky z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant/30 transition-all duration-300">
      <div className="flex justify-between items-center w-full px-6 md:px-margin-desktop py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <button
          onClick={() => setView("landing")}
          className="flex items-center space-x-3 hover:opacity-85 transition-opacity text-left"
        >
          <img src={logo} alt="Tierra Querida Logo" className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-full border border-outline-variant/20 bg-white" />
          <span className="font-serif text-lg md:text-2xl tracking-tight text-primary font-bold uppercase">
            TIERRA QUERIDA
          </span>
        </button>

        {/* Links */}
        <nav className="hidden md:flex items-center space-x-8">
          <button
            onClick={() => setView("menu")}
            className={`font-sans font-semibold text-sm tracking-wider uppercase pb-1 border-b-2 transition-all duration-300 ${
              currentView === "menu"
                ? "text-primary border-primary"
                : "text-on-surface-variant/80 border-transparent hover:text-primary"
            }`}
          >
            Menú
          </button>
          <button
            onClick={() => {
              setView("landing");
              setTimeout(() => {
                document.getElementById("heritage")?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
            className="font-sans font-semibold text-sm tracking-wider uppercase text-on-surface-variant/80 hover:text-primary pb-1 border-b-2 border-transparent transition-all duration-300"
          >
            Herencia
          </button>
          <button
            onClick={() => setView("menu")}
            className="font-sans font-semibold text-sm tracking-wider uppercase text-on-surface-variant/80 hover:text-primary pb-1 border-b-2 border-transparent transition-all duration-300"
          >
            Delivery
          </button>
          <button
            onClick={() => {
              setView("landing");
              setTimeout(() => {
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
            className="font-sans font-semibold text-sm tracking-wider uppercase text-on-surface-variant/80 hover:text-primary pb-1 border-b-2 border-transparent transition-all duration-300"
          >
            Contacto
          </button>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4 md:space-x-6">
          {/* Cart Icon */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 text-on-surface-variant hover:text-primary transition-colors duration-300"
            aria-label="Abrir Carrito"
          >
            <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-background font-sans font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-background">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* User Section */}
          {session ? (
            <div className="flex items-center space-x-2 md:space-x-3">
              {session.role === "admin" ? (
                <button
                  onClick={() => setView("admin")}
                  className={`hidden sm:inline-block font-sans font-bold text-xs tracking-widest uppercase border border-primary text-primary px-3 py-1.5 hover:bg-primary hover:text-background transition-all rounded-sm ${
                    currentView === "admin" ? "bg-primary text-background" : ""
                  }`}
                >
                  Admin Panel
                </button>
              ) : (
                <span className="hidden sm:inline-block font-sans font-semibold text-xs text-on-surface-variant/80">
                  Hola, {session.name.split(" ")[0]}
                </span>
              )}
              <button
                onClick={onLogout}
                className="p-2 text-on-surface-variant hover:text-primary transition-colors duration-300"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setView("auth")}
              className="p-2 text-on-surface-variant hover:text-primary transition-colors duration-300"
              title="Iniciar Sesión"
            >
              <User className="w-6 h-6 stroke-[1.5]" />
            </button>
          )}

          {/* Call to Action */}
          <button
            onClick={() => setView("menu")}
            className="bg-primary text-background hover:bg-primary-container text-xs md:text-sm font-sans font-bold tracking-widest px-4 md:px-6 py-2 uppercase transition-all duration-300 transform active:scale-95 rounded-sm"
          >
            Pedir Domicilio
          </button>
        </div>
      </div>
    </header>
  );
}
