import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, Send, CheckCircle, DollarSign, Lock, ShieldCheck,
  FileText, AlertCircle, MapPin, Navigation, Loader2, Gift, Star
} from "lucide-react";
import { saveOrder } from "../utils/db";
import { RESTAURANT_INFO } from "../data/initialData";
import LoyaltyCard from "../components/LoyaltyCard";
import { getLoyaltyCard, addLoyaltyStamp, redeemLoyaltyReward, buildStampDisplay } from "../utils/loyalty";
import {
  calculateDeliveryFromGPS,
  getDeliveryFeeForDistance,
  formatDistance,
  DEFAULT_DELIVERY_RATES,
  DEFAULT_MAX_DELIVERY_KM,
  DEFAULT_FREE_DELIVERY_MIN
} from "../utils/delivery";

const LOYALTY_REWARD_MAX = 100; // AED

export default function Checkout({
  cart,
  clearCart,
  setView,
  session,
  onUpdateSessionAddress,
  restaurantInfo,
  deliveryRates: deliveryRatesProp,
}) {
  const info = restaurantInfo && restaurantInfo.phone ? restaurantInfo : RESTAURANT_INFO;
  const rates = deliveryRatesProp?.rates || DEFAULT_DELIVERY_RATES;
  const maxKm = deliveryRatesProp?.maxKm ?? DEFAULT_MAX_DELIVERY_KM;
  const freeMin = deliveryRatesProp?.freeDeliveryMin ?? DEFAULT_FREE_DELIVERY_MIN;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    paymentMethod: "cod",
    deliveryTime: "asap",
  });

  const [orderCompleted, setOrderCompleted] = useState(false);
  const [ticketText, setTicketText] = useState("");
  const [orderId, setOrderId] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // ── Delivery distance state ──────────────────────────────────
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsResult, setGpsResult] = useState(null); // { fee, distanceKm, outOfRange, coords }
  const [gpsError, setGpsError] = useState("");

  // ── Loyalty card state ───────────────────────────────────────
  const [loyaltyCard, setLoyaltyCard] = useState(null);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (session) {
      setFormData((prev) => ({
        ...prev,
        name: session.name || "",
        phone: session.phone || "",
        address: session.address || "",
      }));
    }
  }, [session]);

  // Load loyalty card when phone changes (debounced)
  useEffect(() => {
    const phone = formData.phone.trim();
    if (phone.length < 8) { setLoyaltyCard(null); return; }
    const timer = setTimeout(async () => {
      setLoyaltyLoading(true);
      try {
        const card = await getLoyaltyCard(phone);
        setLoyaltyCard(card);
      } catch { setLoyaltyCard(null); }
      finally { setLoyaltyLoading(false); }
    }, 600);
    return () => clearTimeout(timer);
  }, [formData.phone]);

  // ── Computed totals ──────────────────────────────────────────
  const subtotal = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  
  // Tarifa fija de 20 AED por mensajería (temporalmente sin cálculo por KM)
  const deliveryFee = subtotal > 0 ? 20 : 0;
  const loyaltyDiscount = 0; // Oculto temporalmente
  const total = Math.max(0, subtotal + deliveryFee);

  // ── GPS handler ───────────────────────────────────────────────
  const handleGPSDetect = useCallback(async () => {
    setGpsLoading(true);
    setGpsError("");
    try {
      const result = await calculateDeliveryFromGPS(rates, maxKm, freeMin, subtotal);
      if (!result) {
        setGpsError("No se pudo obtener la ubicación GPS. Por favor permite el acceso o escribe tu dirección manualmente.");
      } else if (result.outOfRange) {
        setGpsError(`Estás a ${formatDistance(result.distanceKm)} del restaurante. Fuera del área de delivery estándar (máx ${maxKm} km). Contáctanos por WhatsApp.`);
        setGpsResult(result);
      } else {
        setGpsResult(result);
        setGpsError("");
      }
    } catch {
      setGpsError("Error al calcular distancia. Intenta nuevamente.");
    } finally {
      setGpsLoading(false);
    }
  }, [rates, maxKm, freeMin, subtotal]);

  // ── Form handlers ─────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (gpsResult?.outOfRange) return;
    completeOrder();
  };

  const completeOrder = async () => {
    if (session) onUpdateSessionAddress(formData.address, formData.phone);

    // ── Apply loyalty reward if active ──────────────────────
    let loyaltyCardFinal = loyaltyCard;
    let prizeApplied = false;
    if (loyaltyCard?.rewardReady) {
      prizeApplied = true;
      loyaltyCardFinal = await redeemLoyaltyReward(formData.phone);
    }

    // ── Add stamp for this order ────────────────────────────
    const updatedCard = await addLoyaltyStamp(formData.phone, formData.name);
    setLoyaltyCard(updatedCard);

    const orderItems = cart.map((item) => ({
      id: item.dish.id,
      name: item.dish.name,
      price: item.dish.price,
      quantity: item.quantity,
      selectedOption: item.selectedOption,
    }));

    const orderData = {
      items: orderItems,
      subtotal,
      deliveryFee,
      loyaltyDiscount: 0,
      total,
      customerName: formData.name,
      customerPhone: formData.phone,
      customerAddress: formData.address,
      paymentMethod: "Pedido por WhatsApp",
      paymentStatus: "Pending",
      deliveryTime: formData.deliveryTime === "asap" ? "Lo antes posible (35-45 min)" : "Programado",
      status: "Pendiente",
      distanceKm: null,
    };

    const newOrder = saveOrder(orderData);
    setOrderId(newOrder.id);

    // ── Build WhatsApp ticket ────────────────────────────────
    const shortId = newOrder.id.split("-")[1] || newOrder.id;
    let ticket = `*NUEVO PEDIDO - TIERRA QUERIDA* 🇨🇴🍖\n`;
    ticket += `*Pedido ID:* #${shortId}\n`;
    ticket += `-------------------------------------------\n`;
    ticket += `👤 *Cliente:* ${formData.name}\n`;
    ticket += `📞 *Teléfono:* ${formData.phone}\n`;
    ticket += `📍 *Dirección:* ${formData.address}\n`;
    ticket += `⏰ *Entrega:* ${orderData.deliveryTime}\n`;
    ticket += `💵 *Pago:* Efectivo (Contra entrega)\n`;
    ticket += `-------------------------------------------\n`;
    ticket += `🛒 *Detalle de Productos:*\n`;

    cart.forEach((item) => {
      ticket += `- *${item.quantity}x* ${item.dish.name}`;
      if (item.selectedOption) ticket += ` (${item.selectedOption})`;
      ticket += ` — _${item.dish.price * item.quantity} AED_\n`;
    });

    ticket += `-------------------------------------------\n`;
    ticket += `*Subtotal:* ${subtotal} AED\n`;
    ticket += `*Envío:* ${deliveryFee} AED (Mensajería fija Dubai)\n`;
    ticket += `\n*TOTAL DEL PEDIDO:* *${total} AED*\n`;
    ticket += `-------------------------------------------\n`;
    ticket += `¡Muchas gracias por su compra! Su pedido llegará pronto. ✨`;

    setTicketText(ticket);
    setOrderCompleted(true);
  };

  const handleWhatsAppRedirect = () => {
    const encodedText = encodeURIComponent(ticketText);
    const whatsappUrl = `https://wa.me/${info.phone.replace("+", "")}?text=${encodedText}`;
    window.open(whatsappUrl, "_blank");
    clearCart();
    setView("landing");
  };

  // ── ORDER COMPLETED SCREEN ────────────────────────────────────
  if (orderCompleted) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20 text-center space-y-10 font-sans">
        <div className="bg-surface-container-low border border-outline-variant/20 p-8 rounded-sm shadow-sm space-y-6">
          <CheckCircle className="w-16 h-16 text-secondary mx-auto stroke-[1.2] animate-bounce" />
          <div>
            <h2 className="font-serif text-3xl font-bold text-on-surface">¡Pedido Recibido!</h2>
            <p className="text-sm text-on-surface-variant mt-2">
              Tu pedido con ID <span className="font-bold text-primary">#{orderId.split("-")[1]}</span> se ha guardado.
            </p>
          </div>
        </div>

        <div className="bg-surface-container p-5 rounded-sm border border-outline-variant/30 text-left font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto custom-scrollbar">
          {ticketText}
        </div>

        <div className="pt-2 max-w-md mx-auto space-y-3">
          <button
            onClick={handleWhatsAppRedirect}
            className="w-full bg-primary text-background font-bold py-4 uppercase text-xs tracking-widest flex items-center justify-center space-x-2 hover:bg-primary-container transition-all shadow-lg rounded-sm"
          >
            <Send className="w-4 h-4 fill-current" />
            <span>Enviar Ticket por WhatsApp</span>
          </button>
          <button
            onClick={() => { clearCart(); setView("landing"); }}
            className="w-full bg-transparent text-on-surface-variant/70 hover:text-primary font-bold py-2 uppercase text-xs tracking-widest transition-all"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // ── CHECKOUT FORM ─────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-margin-desktop py-12 md:py-20 font-sans">

      {/* Back to Menu */}
      <button
        onClick={() => setView("menu")}
        className="inline-flex items-center space-x-2 text-on-surface-variant/80 hover:text-primary font-bold text-xs uppercase tracking-widest mb-10 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al menú</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

        {/* ── LEFT: Checkout Form ── */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-10">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-primary">
            Confirmar Domicilio
          </h1>

          {/* 01. Datos de Entrega */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 border-b border-outline-variant/30 pb-2">
              <span className="font-serif text-xl font-bold text-primary">01</span>
              <h2 className="font-bold text-xs uppercase tracking-widest text-on-surface">Información de Entrega</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nombre Completo</label>
                <input
                  type="text" name="name" required value={formData.name} onChange={handleInputChange}
                  className="bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm rounded-sm outline-none"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Teléfono (WhatsApp)</label>
                <input
                  type="tel" name="phone" required placeholder="+971 50 ..."
                  value={formData.phone} onChange={handleInputChange}
                  className="bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm rounded-sm outline-none"
                />
              </div>
            </div>

            {/* Address (Tarifa fija de mensajería) */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Dirección de Entrega en Dubai
                </label>
                <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-sm">
                  Tarifa fija de mensajería: 20 AED
                </span>
              </div>
              <textarea
                name="address"
                required
                rows="2"
                placeholder="Edificio, apartamento, calle o zona en Dubai..."
                value={formData.address}
                onChange={handleInputChange}
                className="w-full bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm rounded-sm outline-none"
              />
              <p className="text-[10px] text-on-surface-variant/60">
                Entrega a domicilio directa por mensajería en cualquier zona de Dubai (20 AED).
              </p>
            </div>
          </div>

          {/* 02. Horario */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 border-b border-outline-variant/30 pb-2">
              <span className="font-serif text-xl font-bold text-primary">02</span>
              <h2 className="font-bold text-xs uppercase tracking-widest text-on-surface">Horario de Entrega</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`p-4 border rounded-sm cursor-pointer flex justify-between items-center transition-all ${formData.deliveryTime === "asap" ? "border-primary bg-surface-container text-primary font-semibold" : "border-outline-variant/30 bg-surface-container-low text-on-surface-variant"}`}>
                <div>
                  <p className="text-sm">Lo antes posible</p>
                  <p className="text-[10px] text-on-surface-variant/80 mt-0.5">Llega en 35-45 min aprox.</p>
                </div>
                <input type="radio" name="deliveryTime" value="asap" checked={formData.deliveryTime === "asap"} onChange={handleInputChange} className="w-4 h-4 text-primary border-outline-variant focus:ring-primary focus:ring-1" />
              </label>
              <label className={`p-4 border rounded-sm cursor-pointer flex justify-between items-center transition-all ${formData.deliveryTime === "schedule" ? "border-primary bg-surface-container text-primary font-semibold" : "border-outline-variant/30 bg-surface-container-low text-on-surface-variant"}`}>
                <div>
                  <p className="text-sm">Programado hoy</p>
                  <p className="text-[10px] text-on-surface-variant/80 mt-0.5">Te llamamos para coordinar hora.</p>
                </div>
                <input type="radio" name="deliveryTime" value="schedule" checked={formData.deliveryTime === "schedule"} onChange={handleInputChange} className="w-4 h-4 text-primary border-outline-variant focus:ring-primary focus:ring-1" />
              </label>
            </div>
          </div>

          {/* 03. Pago */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 border-b border-outline-variant/30 pb-2">
              <span className="font-serif text-xl font-bold text-primary">03</span>
              <h2 className="font-bold text-xs uppercase tracking-widest text-on-surface">Método de Pago</h2>
            </div>
            <div className="p-4 border border-primary bg-surface-container rounded-sm flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-sm font-semibold text-primary">Pago en Efectivo (Contra Entrega)</p>
                  <p className="text-xs text-on-surface-variant/80 mt-0.5">Paga al repartidor al recibir tu comida.</p>
                </div>
              </div>
              <ShieldCheck className="w-5 h-5 text-secondary" />
            </div>
          </div>

          <button type="submit" className="hidden" id="hidden-submit" />
        </form>

        {/* ── RIGHT: Order Summary ── */}
        <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-4">
          
          <div className="bg-surface-container-low border border-outline-variant/15 p-8 rounded-sm space-y-8 shadow-sm">
            <h3 className="font-serif text-2xl font-bold text-primary border-b border-outline-variant/20 pb-4">
              Resumen de Compra
            </h3>

            {/* Cart items */}
            {cart.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No hay productos en el carrito.</p>
            ) : (
              <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar border-b border-outline-variant/20 pb-6">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-start text-sm">
                    <div>
                      <p className="font-bold text-on-surface">{item.quantity}x {item.dish.name}</p>
                      {item.selectedOption && (
                        <p className="text-[11px] text-on-surface-variant/80 italic mt-0.5">{item.selectedOption}</p>
                      )}
                    </div>
                    <span className="font-sans font-bold text-on-surface-variant text-sm">
                      {item.dish.price * item.quantity} AED
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Subtotal</span>
                <span>{subtotal} AED</span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Mensajería (Dubai)</span>
                <span>{deliveryFee} AED</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-primary border-t border-primary/10 pt-4 mt-2">
                <span>Total Pedido</span>
                <span>{total} AED</span>
              </div>
            </div>

            {/* Delivery flat fee info */}
            <div className="bg-surface-container border border-outline-variant/20 rounded-sm p-3.5 space-y-1">
              <div className="flex items-center space-x-1.5 text-primary font-bold text-xs uppercase tracking-wide">
                <span>🛵 Envío a Domicilio</span>
              </div>
              <p className="text-[11px] text-on-surface-variant/80 leading-relaxed">
                Tarifa fija de mensajería para toda la ciudad de Dubai: <strong>20 AED</strong>.
              </p>
            </div>

            {/* Submit button */}
            <button
              onClick={() => document.getElementById("hidden-submit").click()}
              disabled={cart.length === 0}
              className={`w-full font-bold py-5 uppercase text-xs tracking-widest flex items-center justify-center space-x-2 transition-all shadow-lg rounded-sm ${
                cart.length === 0
                  ? "bg-outline-variant text-on-surface-variant/40 cursor-not-allowed"
                  : "bg-primary text-background hover:bg-primary-container active:scale-[0.98]"
              }`}
            >
              <span>Confirmar Pedido</span>
            </button>
            <p className="text-center text-[10px] text-on-surface-variant/60 leading-relaxed">
              Al confirmar se generará el ticket para enviar por WhatsApp al restaurante.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
