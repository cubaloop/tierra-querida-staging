import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Coffee, Sparkles } from "lucide-react";
import { getRestaurantInfo } from "../utils/db";

const DAYS_OF_WEEK = [
  { key: "lunes", name: "Lunes", label: "Lunes" },
  { key: "martes", name: "Martes", label: "Martes" },
  { key: "miercoles", name: "Miércoles", label: "Miércoles" },
  { key: "jueves", name: "Jueves", label: "Jueves" },
  { key: "viernes", name: "Viernes", label: "Viernes" },
  { key: "sabado", name: "Sábado", label: "Sábado" },
  { key: "domingo", name: "Domingo", label: "Domingo" }
];

const TIME_SLOTS = [
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM",
  "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM",
  "08:00 PM"
];

export default function PlanCustomizerModal({ isOpen, onClose, planId, dishes }) {
  if (!isOpen) return null;

  const isPremium = planId === "premium";
  const planName = isPremium ? "Plan Premium Full (30 Días)" : "Plan Express (15 Días)";
  const multiplier = isPremium ? 4.3 : 2.5;

  // Filter lunch dishes (not beverages, not sides/adicionales, not promos)
  const lunchDishes = dishes.filter(
    (d) =>
      d.category !== "bebidas" &&
      d.category !== "adicionales" &&
      d.category !== "promos"
  );

  // Filter beverages
  const beverages = dishes.filter((d) => d.category === "bebidas");

  // Default dish and beverage to populate initial state
  const defaultDish = lunchDishes[0] || { id: "", name: "Plato no disponible", price: 0 };
  const defaultBeverage = beverages[0] || { id: "", name: "Bebida no disponible", price: 0 };

  // Set initial days configurations
  // Express: Mon-Sat active by default
  // Premium: Mon-Sun active by default
  const [dayConfigs, setDayConfigs] = useState(() => {
    const initial = {};
    DAYS_OF_WEEK.forEach((day) => {
      const isDefaultActive = isPremium ? true : day.key !== "domingo";
      initial[day.key] = {
        active: isDefaultActive,
        dishId: defaultDish.id,
        beverageId: defaultBeverage.id,
        deliveryTime: "12:30 PM"
      };
    });
    return initial;
  });

  // Bulk delivery time setter
  const [generalTime, setGeneralTime] = useState("12:30 PM");

  const applyGeneralTimeToAll = (time) => {
    setGeneralTime(time);
    setDayConfigs((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((dayKey) => {
        updated[dayKey].deliveryTime = time;
      });
      return updated;
    });
  };

  const toggleDay = (dayKey) => {
    setDayConfigs((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        active: !prev[dayKey].active
      }
    }));
  };

  const handleDaySelectChange = (dayKey, field, value) => {
    setDayConfigs((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value
      }
    }));
  };

  // Calculate pricing
  const calculateCosts = () => {
    let weeklySum = 0;
    let activeDaysCount = 0;

    DAYS_OF_WEEK.forEach((day) => {
      const config = dayConfigs[day.key];
      if (config.active) {
        activeDaysCount += 1;
        const selectedDish = lunchDishes.find((d) => d.id === config.dishId) || { price: 0 };
        const selectedBev = beverages.find((d) => d.id === config.beverageId) || { price: 0 };
        weeklySum += selectedDish.price + selectedBev.price;
      }
    });

    const monthlyTotal = Math.round(weeklySum * multiplier);
    return {
      weeklySum,
      activeDaysCount,
      monthlyTotal
    };
  };

  const { weeklySum, activeDaysCount, monthlyTotal } = calculateCosts();

  const handleWhatsAppConfirm = () => {
    if (activeDaysCount === 0) {
      alert("Por favor activa al menos un día en el calendario de tu plan.");
      return;
    }

    let text = `*COTIZACIÓN DE PLAN MENSUAL - TIERRA QUERIDA* 🇨🇴✨\n`;
    text += `*Plan Seleccionado:* ${planName}\n`;
    text += `-------------------------------------------\n`;
    text += `📅 *Configuración Semanal:* (${activeDaysCount} días activos)\n\n`;

    DAYS_OF_WEEK.forEach((day) => {
      const config = dayConfigs[day.key];
      if (config.active) {
        const selectedDish = lunchDishes.find((d) => d.id === config.dishId);
        const selectedBev = beverages.find((d) => d.id === config.beverageId);
        text += `• *${day.name}:*\n`;
        text += `  🍽️ _Almuerzo:_ ${selectedDish ? selectedDish.name : "N/A"}\n`;
        text += `  🥤 _Bebida:_ ${selectedBev ? selectedBev.name : "N/A"}\n`;
        text += `  ⏰ _Horario:_ ${config.deliveryTime}\n\n`;
      } else {
        text += `• *${day.name}:* ❌ _Sin entrega_\n\n`;
      }
    });

    text += `-------------------------------------------\n`;
    text += `💵 *Detalle de Cotización:*\n`;
    text += `- Costo semanal base: *${weeklySum} AED*\n`;
    text += `- Multiplicador del plan: *x${multiplier}*\n`;
    text += `- *TOTAL MENSUAL COTIZADO:* *${monthlyTotal} AED*\n`;
    text += `-------------------------------------------\n`;
    text += `¡Hola! Acabo de armar mi menú mensual en el sitio web y me gustaría confirmar mi suscripción con estos platos.`;

    const info = getRestaurantInfo();
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${info.phone.replace("+", "")}?text=${encodedText}`;
    window.open(whatsappUrl, "_blank");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-background border border-outline-variant/30 w-full max-w-4xl rounded-sm shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh] animate-fade-in">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-primary text-background p-6">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 stroke-[1.5]" />
            <div>
              <h2 className="font-serif text-xl md:text-2xl font-bold tracking-tight">{planName}</h2>
              <p className="text-[10px] uppercase tracking-widest text-background/80 mt-0.5">
                Personalizador de menú de 7 días
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-background/80 hover:text-background transition-colors p-1.5 hover:bg-background/10 rounded-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-grow space-y-8 custom-scrollbar">
          {/* Quick info / Bulk Settings */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container p-4 rounded-sm border border-outline-variant/20">
            <div>
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider block mb-1">
                Instrucciones
              </span>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Selecciona qué días deseas recibir el almuerzo, elige tu plato + bebida favorita, y fija la hora de entrega. Las entregas se realizan entre las <strong>12:00 PM y las 8:00 PM</strong>.
              </p>
            </div>

            {/* General Time Setter */}
            <div className="flex flex-col space-y-1 shrink-0">
              <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Hora de entrega general:
              </label>
              <select
                value={generalTime}
                onChange={(e) => applyGeneralTimeToAll(e.target.value)}
                className="bg-background border border-outline-variant/30 text-on-surface px-3 py-2 text-xs rounded-sm outline-none w-full"
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Calendar list of 7 days */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-primary border-b border-outline-variant/20 pb-2">
              Configurar Calendario Semanal
            </h3>

            <div className="divide-y divide-outline-variant/20">
              {DAYS_OF_WEEK.map((day) => {
                const config = dayConfigs[day.key];
                const selectedDish = lunchDishes.find((d) => d.id === config.dishId) || defaultDish;
                const selectedBev = beverages.find((d) => d.id === config.beverageId) || defaultBeverage;

                return (
                  <div
                    key={day.key}
                    className={`py-4 md:py-5 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center transition-all ${
                      config.active ? "opacity-100" : "opacity-60 bg-surface-container-low/20"
                    }`}
                  >
                    {/* Day Column / Active Toggle */}
                    <div className="w-full lg:w-44 flex items-center justify-between lg:justify-start gap-4">
                      <button
                        onClick={() => toggleDay(day.key)}
                        className={`text-xs font-bold uppercase tracking-wider px-3.5 py-2 border rounded-sm transition-all ${
                          config.active
                            ? "bg-secondary text-background border-transparent"
                            : "border-outline-variant/60 text-on-surface-variant hover:bg-surface-container-low"
                        }`}
                      >
                        {config.active ? "✓ Activo" : "✗ Inactivo"}
                      </button>
                      <span className="font-serif text-lg font-bold text-on-surface">
                        {day.name}
                      </span>
                    </div>

                    {/* Selectors Form (Displayed only if active) */}
                    {config.active ? (
                      <div className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-3">
                        
                        {/* Lunch Selection */}
                        <div className="md:col-span-6 flex flex-col space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/80">
                            Plato de Almuerzo:
                          </label>
                          <select
                            value={config.dishId}
                            onChange={(e) => handleDaySelectChange(day.key, "dishId", e.target.value)}
                            className="bg-background border border-outline-variant/30 text-on-surface px-3 py-2 text-xs rounded-sm outline-none w-full truncate"
                          >
                            {lunchDishes.map((dish) => (
                              <option key={dish.id} value={dish.id}>
                                {dish.name} ({dish.price} AED)
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Beverage Selection */}
                        <div className="md:col-span-3 flex flex-col space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/80 flex items-center gap-1">
                            <Coffee className="w-3 h-3 text-secondary" /> Bebida:
                          </label>
                          <select
                            value={config.beverageId}
                            onChange={(e) => handleDaySelectChange(day.key, "beverageId", e.target.value)}
                            className="bg-background border border-outline-variant/30 text-on-surface px-3 py-2 text-xs rounded-sm outline-none w-full truncate"
                          >
                            {beverages.map((bev) => (
                              <option key={bev.id} value={bev.id}>
                                {bev.name} ({bev.price} AED)
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Custom Time Selection */}
                        <div className="md:col-span-3 flex flex-col space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/80 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-secondary" /> Horario:
                          </label>
                          <select
                            value={config.deliveryTime}
                            onChange={(e) => handleDaySelectChange(day.key, "deliveryTime", e.target.value)}
                            className="bg-background border border-outline-variant/30 text-on-surface px-3 py-2 text-xs rounded-sm outline-none w-full"
                          >
                            {TIME_SLOTS.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>

                      </div>
                    ) : (
                      <div className="flex-grow flex items-center">
                        <span className="text-xs text-on-surface-variant/50 italic py-2">
                          No se realizarán entregas este día. Haz click en "Inactivo" para activarlo.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Quote Section */}
          <div className="bg-surface-container-high p-6 rounded-sm border border-outline-variant/40 space-y-6">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-serif text-lg font-bold text-primary">
                Cotización de Suscripción Mensual
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-on-surface-variant">Días de entrega / semana:</span>
                <p className="text-lg font-bold text-on-surface">{activeDaysCount} días activos</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-on-surface-variant">Costo Base Semanal:</span>
                <p className="text-lg font-bold text-on-surface">{weeklySum} AED</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-on-surface-variant">Multiplicador Mensual:</span>
                <p className="text-lg font-bold text-primary">
                  {multiplier}x <span className="text-xs text-on-surface-variant">({isPremium ? "30 entregas" : "15 entregas"})</span>
                </p>
              </div>
            </div>

            <div className="border-t border-outline-variant/30 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs text-on-surface-variant/80 uppercase tracking-wider block">
                  Total Estimado Mensual
                </span>
                <span className="font-serif text-3xl font-bold text-primary">{monthlyTotal} AED</span>
                <span className="text-[10px] text-on-surface-variant/60 block mt-1">
                  *Impuestos y envío prioritario ya incluidos.
                </span>
              </div>

              <button
                onClick={handleWhatsAppConfirm}
                className="w-full sm:w-auto bg-primary text-background font-bold text-xs uppercase px-8 py-4 tracking-widest hover:bg-primary-container transition-all rounded-sm shadow-md"
              >
                Confirmar Plan por WhatsApp
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
