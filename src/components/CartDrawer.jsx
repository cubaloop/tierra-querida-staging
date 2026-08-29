import React from "react";
import { X, Trash2, ArrowRight, ShoppingBag } from "lucide-react";

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQty,
  onRemoveItem,
  setView,
  restaurantInfo
}) {
  if (!isOpen) return null;

  const feePerDelivery = restaurantInfo && restaurantInfo.deliveryFee != null ? Number(restaurantInfo.deliveryFee) : 20;
  const subtotal = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? feePerDelivery : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md bg-surface-container border-l border-outline-variant/30 flex flex-col shadow-2xl animate-fade-in">
          
          {/* Header */}
          <div className="px-6 py-6 border-b border-outline-variant/30 flex justify-between items-center bg-background">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="font-serif text-xl font-bold uppercase tracking-tight text-primary">Tu Carrito</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full"
              aria-label="Cerrar Carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center space-y-4 py-20">
                <ShoppingBag className="w-16 h-16 text-on-surface-variant/30 stroke-[1]" />
                <div>
                  <p className="font-serif text-lg font-bold text-on-surface">Tu carrito está vacío</p>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Agrega algunos deliciosos platos colombianos de nuestra carta.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    setView("menu");
                  }}
                  className="bg-primary text-background px-6 py-2.5 font-bold uppercase text-xs tracking-widest hover:bg-primary-container transition-all"
                >
                  Ver Menú
                </button>
              </div>
            ) : (
              cart.map((item, index) => (
                <div key={index} className="flex space-x-4 pb-4 border-b border-outline-variant/20 items-start">
                  {/* Image */}
                  {item.dish.image ? (
                    <img
                      src={item.dish.image}
                      alt={item.dish.name}
                      className="w-20 h-20 object-cover rounded-sm border border-outline-variant/20 shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-surface-container-high/60 flex flex-col items-center justify-center text-center rounded-sm border border-outline-variant/20 shrink-0 select-none">
                      <span className="font-serif italic text-3xl text-primary/45 font-bold">
                        {item.dish.name ? item.dish.name.charAt(0).toUpperCase() : "?"}
                      </span>
                      <span className="text-[7px] font-bold uppercase tracking-wider text-on-surface-variant/60 mt-1">
                        Sin foto
                      </span>
                    </div>
                  )}
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif font-bold text-sm text-on-surface truncate pr-2" title={item.dish.name}>
                        {item.dish.name}
                      </h4>
                      <span className="font-sans font-bold text-sm text-primary shrink-0">
                        {item.dish.price * item.quantity} AED
                      </span>
                    </div>
                    
                    {/* Selected Options */}
                    {item.selectedOption && (
                      <p className="text-xs text-on-surface-variant/80 italic mt-0.5 truncate">
                        {item.selectedOption}
                      </p>
                    )}

                    {/* Qty and Actions */}
                    <div className="flex justify-between items-center mt-3">
                      {/* Qty Selector */}
                      <div className="flex items-center border border-outline-variant/40 rounded-sm">
                        <button
                          onClick={() => onUpdateQty(index, -1)}
                          className="px-2 py-1 text-xs hover:bg-surface-container-high transition-colors font-bold"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQty(index, 1)}
                          className="px-2 py-1 text-xs hover:bg-surface-container-high transition-colors font-bold border-l border-outline-variant/40"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveItem(index)}
                        className="text-on-surface-variant/60 hover:text-primary transition-colors p-1"
                        title="Eliminar item"
                      >
                        <Trash2 className="w-4 h-4 stroke-[1.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {cart.length > 0 && (
            <div className="p-6 bg-background border-t border-outline-variant/30 space-y-4">
              <div className="space-y-2 text-sm text-on-surface-variant">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{subtotal} AED</span>
                </div>
                <div className="flex justify-between">
                  <span>Domicilio (Business Bay)</span>
                  <span>{deliveryFee} AED</span>
                </div>
                <div className="flex justify-between text-base font-bold text-primary pt-2 border-t border-outline-variant/20">
                  <span>Total Estimado</span>
                  <span>{total} AED</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  setView("checkout");
                }}
                className="w-full bg-primary text-background font-bold py-4 uppercase text-xs tracking-widest flex items-center justify-center space-x-2 hover:bg-primary-container transition-all shadow-lg active:scale-[0.98]"
              >
                <span>Proceder al Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-[10px] text-on-surface-variant/60">
                Los precios de los adicionales se calculan en el checkout.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
