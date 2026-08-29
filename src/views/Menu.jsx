import React, { useState, useMemo } from "react";
import { Search, Info, Plus } from "lucide-react";
import { CATEGORIES, RESTAURANT_INFO, INITIAL_DISHES } from "../data/initialData";

export default function Menu({ dishes, onSelectDish, onAddToCartQuick, restaurantInfo }) {
  const info = restaurantInfo && restaurantInfo.phone ? restaurantInfo : RESTAURANT_INFO;
  const allergenNotice = info.allergenNotice || "Si sufres de alergias alimenticias, indícalo en el formulario de Checkout o ponte en contacto con nuestro equipo por WhatsApp antes de ordenar.";

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const activeDishesList = useMemo(() => {
    return (dishes && Array.isArray(dishes) && dishes.length > 0) ? dishes : INITIAL_DISHES;
  }, [dishes]);

  // Filter dishes based on search query and active category
  const filteredDishes = useMemo(() => {
    return activeDishesList.filter((dish) => {
      if (!dish) return false;
      const name = (dish.name || "").toLowerCase();
      const desc = (dish.description || "").toLowerCase();
      const query = (searchQuery || "").toLowerCase();

      const matchesSearch = name.includes(query) || desc.includes(query);
      const matchesCategory = activeCategory === "all" || dish.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [activeDishesList, activeCategory, searchQuery]);

  // Dynamically include custom categories from dishes that aren't in predefined CATEGORIES
  const allCategories = useMemo(() => {
    const customCatIds = Array.from(
      new Set(activeDishesList.map((d) => d.category).filter(Boolean))
    ).filter((catId) => !CATEGORIES.some((c) => c.id === catId));

    const customCats = customCatIds.map((catId) => ({
      id: catId,
      name: catId.charAt(0).toUpperCase() + catId.slice(1).replace(/-/g, " "),
      subtitle: "Categoría Especial"
    }));

    return [...CATEGORIES, ...customCats];
  }, [activeDishesList]);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-margin-desktop py-12 md:py-16 font-sans">
      
      {/* Title */}
      <section className="text-center mb-16 space-y-4">
        <span className="text-[10px] text-primary font-bold uppercase tracking-widest block">
          Nuestra Carta
        </span>
        <h1 className="font-serif text-5xl md:text-6xl text-primary font-bold tracking-tight">
          Nuestra Cocina
        </h1>
        <p className="text-sm md:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Disfruta de la sazón colombiana en Dubái. Explora nuestra variedad de platos tradicionales preparados al instante.
        </p>
      </section>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-12 relative">
        <input
          type="text"
          placeholder="Buscar platos o ingredientes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface-container border border-outline-variant/30 text-on-surface placeholder-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary px-5 py-4 pl-12 rounded-sm text-sm outline-none transition-all"
        />
        <Search className="w-5 h-5 text-on-surface-variant/50 absolute left-4 top-1/2 -translate-y-1/2" />
      </div>

      <div className="flex flex-col md:flex-row gap-gutter">
        
        {/* Sidebar categories navigation */}
        <aside className="w-full md:w-64 shrink-0 md:sticky md:top-28 h-fit space-y-6">
          <div className="border-b border-outline-variant/30 pb-3">
            <h3 className="font-bold text-xs uppercase tracking-widest text-primary">Categorías</h3>
          </div>
          
          <ul className="flex md:flex-col overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 gap-2 md:gap-3 font-sans text-sm text-on-surface-variant no-scrollbar">
            <li>
              <button
                onClick={() => setActiveCategory("all")}
                className={`w-full text-left shrink-0 px-4 py-2 border md:border-0 rounded-full md:rounded-none text-xs uppercase tracking-wider font-bold transition-all ${
                  activeCategory === "all"
                    ? "bg-primary md:bg-transparent text-background md:text-primary md:border-l-2 md:border-primary md:pl-3"
                    : "bg-surface-container-low border-outline-variant/30 md:bg-transparent md:border-0 hover:text-primary"
                }`}
              >
                Todos los platos
              </button>
            </li>
            {allCategories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full text-left shrink-0 px-4 py-2 border md:border-0 rounded-full md:rounded-none text-xs uppercase tracking-wider font-bold transition-all ${
                    activeCategory === cat.id
                      ? "bg-primary md:bg-transparent text-background md:text-primary md:border-l-2 md:border-primary md:pl-3"
                      : "bg-surface-container-low border-outline-variant/30 md:bg-transparent md:border-0 hover:text-primary"
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>

          <div className="hidden md:block p-5 bg-surface-container rounded-sm border border-outline-variant/15 space-y-3">
            <div className="flex items-center space-x-2 text-primary">
              <Info className="w-4 h-4" />
              <span className="font-bold text-[11px] uppercase tracking-wider">Aviso de Alérgenos</span>
            </div>
            <p className="text-[11px] text-on-surface-variant/80 leading-relaxed whitespace-pre-line">
              {allergenNotice}
            </p>
          </div>
        </aside>

        {/* Catalog grid */}
        <div className="flex-grow space-y-10">
          {filteredDishes.length === 0 ? (
            <div className="text-center py-20 bg-surface-container rounded-sm border border-outline-variant/10">
              <p className="font-serif text-lg font-bold">No encontramos platos</p>
              <p className="text-sm text-on-surface-variant mt-1">
                Intenta buscar otra palabra o cambia la categoría activa.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="group flex flex-col bg-surface-container-low border border-outline-variant/10 rounded-sm overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => onSelectDish(dish)}
                >
                  {/* Dish Image */}
                  <div className="aspect-square overflow-hidden relative border-b border-outline-variant/10 bg-surface-container-high/60 flex items-center justify-center">
                    {dish.image ? (
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <span className="font-serif italic text-6xl text-primary/40 font-bold select-none group-hover:scale-110 transition-transform duration-500">
                          {dish.name ? dish.name.charAt(0).toUpperCase() : "?"}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/60 mt-2">
                          Sin foto
                        </span>
                      </div>
                    )}
                    {dish.tags && dish.tags.length > 0 && (
                      <span className="absolute top-3 left-3 bg-secondary text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                        {dish.tags[0]}
                      </span>
                    )}
                  </div>

                  {/* Dish Details */}
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif font-bold text-base text-on-surface group-hover:text-primary transition-colors line-clamp-1 pr-2">
                          {dish.name}
                        </h4>
                        <span className="font-sans font-bold text-primary shrink-0 text-sm">
                          {dish.price} AED
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant/80 line-clamp-2 leading-relaxed">
                        {dish.description}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (dish.options) {
                            // If has options, open modal
                            onSelectDish(dish);
                          } else {
                            // Quick add
                            onAddToCartQuick(dish);
                          }
                        }}
                        className="flex-grow bg-transparent border border-primary text-primary hover:bg-primary hover:text-background font-bold text-[10px] uppercase py-2.5 tracking-wider transition-all rounded-sm"
                      >
                        {dish.options ? "Personalizar" : "Agregar"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDish(dish);
                        }}
                        className="bg-surface-container-high hover:bg-outline-variant/30 text-on-surface-variant p-2.5 rounded-sm transition-colors border border-outline-variant/20"
                        title="Ver detalles"
                      >
                        <Search className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
