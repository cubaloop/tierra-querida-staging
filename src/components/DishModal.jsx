import React, { useState, useEffect } from "react";
import { X, Plus, Minus, ShoppingBag, ShieldCheck } from "lucide-react";

export default function DishModal({ dish, onClose, onAddToCart }) {
  if (!dish) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState("");

  // Set default option if present
  useEffect(() => {
    if (dish.options && dish.options.choices && dish.options.choices.length > 0) {
      setSelectedOption(dish.options.choices[0]);
    } else {
      setSelectedOption("");
    }
    setQuantity(1);
  }, [dish]);

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAdd = () => {
    onAddToCart(dish, quantity, selectedOption);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/55 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-4xl bg-background border border-outline-variant/30 shadow-2xl flex flex-col md:flex-row overflow-hidden rounded-sm animate-fade-in my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 bg-background/80 hover:bg-primary hover:text-background p-2 rounded-full border border-outline-variant/30 text-on-surface transition-all"
          aria-label="Cerrar Detalle"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Image */}
        <div className="md:w-1/2 relative min-h-[300px] md:min-h-full bg-surface-container-high/60 flex items-center justify-center">
          {dish.image ? (
            <img
              src={dish.image}
              alt={dish.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8">
              <span className="font-serif italic text-8xl text-primary/45 font-bold select-none">
                {dish.name ? dish.name.charAt(0).toUpperCase() : "?"}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant/60 mt-4">
                Sin foto
              </span>
            </div>
          )}
          {dish.tags && dish.tags.length > 0 && (
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {dish.tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-secondary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Details & Options */}
        <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-between max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            
            {/* Header info */}
            <div>
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest block mb-2">
                Categoría: {dish.category.toUpperCase()}
              </span>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-on-surface">
                {dish.name}
              </h2>
              <div className="text-2xl font-bold text-primary mt-2">
                {dish.price} AED
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-on-surface-variant leading-relaxed pb-6 border-b border-outline-variant/20">
              {dish.description}
            </p>

            {/* Customize Options */}
            {dish.options && (
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-widest text-on-surface">
                  {dish.options.title}
                </h3>
                <div className="grid grid-cols-1 gap-2.5">
                  {dish.options.choices.map((choice, i) => (
                    <label
                      key={i}
                      className={`flex items-center justify-between p-4 border rounded-sm cursor-pointer transition-all ${
                        selectedOption === choice
                          ? "border-primary bg-surface-container text-primary font-semibold"
                          : "border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      <span className="text-sm">{choice}</span>
                      <input
                        type="radio"
                        name="dish-option"
                        value={choice}
                        checked={selectedOption === choice}
                        onChange={() => setSelectedOption(choice)}
                        className="w-4 h-4 text-primary border-outline-variant focus:ring-primary focus:ring-1"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Traditional touches */}
            <div className="bg-surface-container p-4 rounded-sm border border-outline-variant/15 flex items-center space-x-3 text-xs text-on-surface-variant">
              <ShieldCheck className="w-5 h-5 text-secondary shrink-0" />
              <span>
                Ingredientes frescos colombianos importados directamente para asegurar el sabor original de nuestra tierra.
              </span>
            </div>

          </div>

          {/* Pricing and Action */}
          <div className="pt-8 mt-6 border-t border-outline-variant/20 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Cantidad
              </span>
              
              {/* Qty Selector */}
              <div className="flex items-center border border-outline-variant/40 rounded-sm bg-surface-container-low">
                <button
                  onClick={handleDecrement}
                  className="px-3 py-2 text-sm hover:bg-surface-container-high transition-colors font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-5 font-bold text-sm" id="quantity">
                  {quantity}
                </span>
                <button
                  onClick={handleIncrement}
                  className="px-3 py-2 text-sm hover:bg-surface-container-high transition-colors font-bold border-l border-outline-variant/40"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAdd}
              className="w-full bg-primary text-background font-bold py-4 uppercase text-xs tracking-widest flex items-center justify-center space-x-2 hover:bg-primary-container transition-all shadow-lg active:scale-[0.98]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Añadir al Carrito — {dish.price * quantity} AED</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
