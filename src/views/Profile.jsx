import React, { useState, useEffect } from "react";
import {
  User, Phone, MapPin, Mail, Lock, ShieldCheck, Sparkles, Gift,
  CheckCircle, ArrowLeft, LogOut, ShoppingBag, RotateCcw, AlertCircle
} from "lucide-react";
import LoyaltyCard from "../components/LoyaltyCard";
import { getLoyaltyCard } from "../utils/loyalty";
import { updateUserProfile, logoutUser } from "../utils/db";

export default function Profile({
  session,
  onUpdateSession,
  setView,
  onLogout
}) {
  const SHOW_LOYALTY = false;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    password: "",
  });

  const [loyaltyCard, setLoyaltyCard] = useState(null);
  const [loadingCard, setLoadingCard] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [guestPhone, setGuestPhone] = useState("");

  // Sync session data
  useEffect(() => {
    if (session) {
      setFormData({
        name: session.name || "",
        phone: session.phone || "",
        address: session.address || "",
        email: session.email || "",
        password: "",
      });

      if (session.phone) {
        fetchCard(session.phone);
      }
    }
  }, [session]);

  const fetchCard = async (phoneNumber) => {
    if (!phoneNumber || phoneNumber.length < 7) return;
    setLoadingCard(true);
    try {
      const card = await getLoyaltyCard(phoneNumber);
      setLoyaltyCard(card);
    } catch (e) {
      console.warn("Error fetching loyalty card in profile:", e);
    } finally {
      setLoadingCard(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (feedback.message) setFeedback({ type: "", message: "" });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: "", message: "" });

    try {
      const updated = await updateUserProfile(formData);
      if (onUpdateSession) onUpdateSession(updated);
      setFeedback({
        type: "success",
        message: "¡Tus datos han sido actualizados y guardados correctamente!",
      });
      // Re-fetch card if phone was changed
      if (formData.phone) {
        fetchCard(formData.phone);
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Error al actualizar la información.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGuestSearch = (e) => {
    e.preventDefault();
    if (guestPhone.trim()) {
      fetchCard(guestPhone.trim());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-margin-desktop py-10 md:py-16 font-sans">
      
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <button
          onClick={() => setView("menu")}
          className="inline-flex items-center space-x-2 text-on-surface-variant/80 hover:text-primary font-bold text-xs uppercase tracking-widest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al menú</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setView("menu")}
            className="bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-background font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-sm transition-all flex items-center space-x-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Hacer un Pedido</span>
          </button>
          {session && (
            <button
              onClick={() => {
                logoutUser();
                onLogout();
                setView("landing");
              }}
              className="bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-red-600 font-bold text-xs uppercase tracking-wider px-3 py-2 rounded-sm transition-all flex items-center space-x-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className={SHOW_LOYALTY ? "grid grid-cols-1 lg:grid-cols-12 gap-10 items-start" : "max-w-2xl mx-auto"}>
        
        {/* LEFT COLUMN: 3D Loyalty Card Experience (Oculto temporalmente) */}
        {SHOW_LOYALTY && (
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-amber-700 font-mono text-[11px] font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>PROGRAMA VIP TIERRA QUERIDA</span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-primary">
                Mi Tarjeta de Fidelidad 3D
              </h1>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Mueve el cursor o toca la tarjeta para explorarla en 3D. Cada pedido acumula un cuño oficial con nuestro logo.
              </p>
            </div>

            {/* 3D Card Display */}
            <div className="bg-stone-900/5 p-4 sm:p-6 rounded-2xl border border-outline-variant/15 flex flex-col items-center">
              <LoyaltyCard
                stamps={loyaltyCard?.stamps ?? 0}
                cyclesCompleted={loyaltyCard?.cyclesCompleted ?? 0}
                rewardReady={loyaltyCard?.rewardReady ?? false}
                customerName={session?.name || loyaltyCard?.customerName || formData.name || "Cliente VIP"}
                phone={session?.phone || loyaltyCard?.phone || formData.phone || ""}
                interactive={true}
              />
            </div>

            {/* Loyalty Status Indicators */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-container border border-outline-variant/20 p-4 rounded-sm text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 block">
                  Cuños Activos
                </span>
                <span className="font-serif text-2xl font-black text-amber-600">
                  {loyaltyCard?.stamps ?? 0} <span className="text-xs text-stone-400 font-sans font-normal">/ 10</span>
                </span>
              </div>

              <div className="bg-surface-container border border-outline-variant/20 p-4 rounded-sm text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 block">
                  Faltan p/ Premio
                </span>
                <span className="font-serif text-2xl font-black text-primary">
                  {Math.max(0, 10 - (loyaltyCard?.stamps ?? 0))}
                </span>
              </div>

              <div className="bg-surface-container border border-outline-variant/20 p-4 rounded-sm text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70 block">
                  Premios Ganados
                </span>
                <span className="font-serif text-2xl font-black text-secondary">
                  {loyaltyCard?.cyclesCompleted ?? 0} 🏆
                </span>
              </div>
            </div>

            {/* Reward Alert Box */}
            {loyaltyCard?.rewardReady ? (
              <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-yellow-500/15 border-2 border-amber-400 p-5 rounded-sm space-y-2 text-left">
                <div className="flex items-center space-x-2 text-amber-900 font-bold text-sm">
                  <Gift className="w-5 h-5 text-amber-600" />
                  <span>¡FELICIDADES! TIENES 100 AED DE REGALO LISTOS</span>
                </div>
                <p className="text-xs text-amber-950/80 leading-relaxed">
                  Has completado tus 10 cuños oficiales. En tu próximo pedido a domicilio se aplicará automáticamente un descuento de hasta <strong>100 AED</strong> en tu ticket de WhatsApp.
                </p>
                <button
                  onClick={() => setView("menu")}
                  className="mt-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-sm shadow-md transition-all inline-flex items-center space-x-2"
                >
                  <span>Usar mi Premio Ahora</span>
                  <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                </button>
              </div>
            ) : (
              <div className="bg-surface-container-low border border-outline-variant/20 p-5 rounded-sm text-xs text-on-surface-variant space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-primary text-[11px] flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>¿Cómo funciona el Programa de Fidelidad?</span>
                </h4>
                <ul className="space-y-1.5 list-disc pl-4 text-[11px] text-on-surface-variant/90 leading-relaxed">
                  <li>Cada vez que pides por nuestra página web a tu WhatsApp, sumas <strong>+1 cuño con el logo oficial</strong>.</li>
                  <li>Al llenar los 10 cuños, el sistema desbloquea automáticamente tu <strong>pedido gratis de hasta 100 AED</strong>.</li>
                  <li>Tu tarjeta está vinculada a tu número de WhatsApp para que nunca pierdas tu progreso.</li>
                </ul>
              </div>
            )}

            {/* Guest Search Card (if not logged in) */}
            {!session && (
              <form onSubmit={handleGuestSearch} className="bg-surface-container p-4 rounded-sm border border-outline-variant/30 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Consultar otra tarjeta por número de teléfono:
                </p>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="+971 50 ..."
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="flex-1 bg-background border border-outline-variant/30 text-on-surface px-3 py-2 text-xs rounded-sm outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="bg-primary text-background font-bold text-xs uppercase px-4 py-2 rounded-sm hover:bg-primary-container"
                  >
                    Consultar
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

        {/* RIGHT COLUMN: User Information & Settings */}
        <div className={SHOW_LOYALTY ? "lg:col-span-6 space-y-6" : "w-full space-y-6"}>
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-primary font-mono text-[11px] font-bold">
              <User className="w-3.5 h-3.5" />
              <span>AJUSTES DE CUENTA</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-primary">
              Información Personal
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Mantén tus datos de entrega actualizados para que tus pedidos lleguen sin demoras.
            </p>
          </div>

          <div className="bg-surface-container border border-outline-variant/30 p-6 sm:p-8 rounded-sm shadow-md space-y-6">
            
            {/* Feedback alert */}
            {feedback.message && (
              <div
                className={`p-4 text-xs rounded-sm flex items-start space-x-2.5 animate-fade-in ${
                  feedback.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-red-50 border border-red-200 text-red-800"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                )}
                <span className="font-medium">{feedback.message}</span>
              </div>
            )}

            {session ? (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                
                {/* Nombre */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center space-x-1">
                    <User className="w-3 h-3 text-primary" />
                    <span>Nombre Completo</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-background border border-outline-variant/30 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm rounded-sm outline-none"
                  />
                </div>

                {/* Teléfono */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-primary" />
                    <span>Teléfono (WhatsApp de pedidos & Tarjeta)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+971 50 ..."
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="bg-background border border-outline-variant/30 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm rounded-sm outline-none font-mono"
                  />
                  <span className="text-[10px] text-on-surface-variant/60">
                    Este teléfono se usa para acreditar tus cuños oficiales y generar tus tickets.
                  </span>
                </div>

                {/* Dirección */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span>Dirección Habitual de Entrega en Dubai</span>
                  </label>
                  <textarea
                    name="address"
                    rows="3"
                    placeholder="Edificio/Torre, Apartamento/Oficina, Business Bay u otra zona en Dubai..."
                    value={formData.address}
                    onChange={handleInputChange}
                    className="bg-background border border-outline-variant/30 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm rounded-sm outline-none"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center space-x-1">
                    <Mail className="w-3 h-3 text-primary" />
                    <span>Correo Electrónico / Usuario</span>
                  </label>
                  <input
                    type="text"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-background border border-outline-variant/30 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm rounded-sm outline-none"
                  />
                </div>

                {/* Contraseña */}
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center space-x-1">
                    <Lock className="w-3 h-3 text-primary" />
                    <span>Nueva Contraseña (dejar vacío si no deseas cambiarla)</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="bg-background border border-outline-variant/30 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm rounded-sm outline-none font-mono"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-primary text-background font-bold py-4 uppercase text-xs tracking-widest flex items-center justify-center space-x-2 hover:bg-primary-container transition-all shadow-lg active:scale-[0.98] rounded-sm mt-4"
                >
                  {saving ? (
                    <span>Guardando cambios...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Guardar Información</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="text-center py-8 space-y-4">
                <User className="w-12 h-12 text-on-surface-variant/40 mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-primary">Inicia Sesión para Personalizar tu Perfil</h3>
                  <p className="text-xs text-on-surface-variant">
                    Accede a tu cuenta para guardar tus direcciones favoritas y agilizar tus pedidos a domicilio en Dubai.
                  </p>
                </div>
                <button
                  onClick={() => setView("auth")}
                  className="bg-primary text-background font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-sm hover:bg-primary-container shadow-md"
                >
                  Iniciar Sesión / Registrarme
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
