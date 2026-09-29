import React, { useState, useRef } from "react";
import logo from "../assets/logo.png";
import { Sparkles, Gift, Crown, Award, Check } from "lucide-react";

const TOTAL_SLOTS = 10;

export default function LoyaltyCard({
  stamps = 0,
  cyclesCompleted = 0,
  rewardReady = false,
  customerName = "",
  phone = "",
  compact = false,
  interactive = true,
}) {
  const filledCount = Math.min(stamps, TOTAL_SLOTS);
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  // 3D Tilt calculation on mouse move
  const handleMouseMove = (e) => {
    if (!interactive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -12; // tilt up/down
    const rotY = ((x - centerX) / centerX) * 14;  // tilt left/right

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.25,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50, opacity: 0 });
  };

  // Compact inline badge view for quick displays
  if (compact) {
    return (
      <div className="flex items-center space-x-2.5 bg-gradient-to-r from-stone-900 via-neutral-900 to-amber-950 border border-amber-500/40 rounded-sm px-3.5 py-2.5 shadow-md">
        <div className="w-8 h-8 rounded-full border border-amber-400/60 p-0.5 bg-stone-950 flex items-center justify-center shrink-0">
          <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1">
            {Array.from({ length: TOTAL_SLOTS }).map((_, i) => (
              <span
                key={i}
                className={`text-sm leading-none transition-all ${
                  i < filledCount ? "text-amber-400" : "text-neutral-600"
                }`}
              >
                {i < filledCount ? "●" : "○"}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-amber-200 font-semibold mt-0.5 truncate">
            {rewardReady ? "🎁 ¡Premio de 100 AED listo!" : `${filledCount}/10 sellos oficiales`}
            {cyclesCompleted > 0 && (
              <span className="ml-1.5 text-amber-400">· {cyclesCompleted} 🏆</span>
            )}
          </p>
        </div>
      </div>
    );
  }

  // Realistic 3D VIP Membership Card View
  return (
    <div
      className="w-full perspective-1000 select-none py-2"
      style={{ perspective: "1200px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        className="relative w-full rounded-2xl overflow-hidden transition-transform duration-200 ease-out shadow-2xl"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`,
          transformStyle: "preserve-3d",
          background: "linear-gradient(135deg, #1c1917 0%, #292524 35%, #181514 70%, #0c0a09 100%)",
          boxShadow: rewardReady
            ? "0 25px 50px -12px rgba(245, 158, 11, 0.45), 0 0 30px rgba(251, 191, 36, 0.3)"
            : "0 20px 45px -10px rgba(0, 0, 0, 0.7), 0 0 20px rgba(217, 119, 6, 0.15)",
          border: "1.5px solid rgba(245, 158, 11, 0.4)",
        }}
      >
        {/* Dynamic Glare Reflection Effect */}
        <div
          className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, ${glarePos.opacity}) 0%, rgba(255, 215, 0, 0.05) 45%, transparent 70%)`,
          }}
        />

        {/* Textured Carbon / Gold Foil Watermark Layer */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none bg-repeat"
          style={{
            backgroundImage: `radial-gradient(#fbbf24 1px, transparent 1px)`,
            backgroundSize: "16px 16px",
          }}
        />

        {/* Ambient Gold Sheen Corner Glows */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Card Content Container */}
        <div className="relative z-20 p-5 sm:p-6 flex flex-col justify-between text-white space-y-4">
          
          {/* Header Row: VIP Brand + EMV Chip + Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Golden EMV Smart Chip */}
              <div className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-600 via-amber-300 to-amber-500 p-1 border border-amber-200/60 shadow-inner flex flex-col justify-between">
                <div className="w-full h-[1px] bg-amber-900/40" />
                <div className="flex justify-between">
                  <div className="w-3 h-2 border border-amber-900/40 rounded-xs" />
                  <div className="w-3 h-2 border border-amber-900/40 rounded-xs" />
                </div>
                <div className="w-full h-[1px] bg-amber-900/40" />
              </div>

              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-serif tracking-widest text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 uppercase">
                    TIERRA QUERIDA
                  </span>
                  <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                </div>
                <p className="text-[9px] uppercase tracking-widest text-amber-400/80 font-mono font-medium">
                  Tarjeta VIP 10 Sellos
                </p>
              </div>
            </div>

            {/* Official Logo Brandmark Stamp */}
            <div className="flex items-center space-x-2">
              <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-amber-600 via-amber-300 to-amber-500 shadow-md">
                <img
                  src={logo}
                  alt="Tierra Querida"
                  className="w-full h-full object-cover rounded-full bg-stone-950 p-0.5"
                />
              </div>
            </div>
          </div>

          {/* Reward Ready Banner */}
          {rewardReady && (
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 p-3 text-stone-950 font-bold text-center shadow-lg border border-yellow-200 animate-pulse">
              <div className="flex items-center justify-center space-x-2">
                <Crown className="w-4 h-4 fill-stone-950" />
                <span className="text-xs uppercase tracking-wider font-extrabold">
                  ¡PREMIO DESBLOQUEADO: HASTA 100 AED GRATIS!
                </span>
                <Sparkles className="w-4 h-4 fill-stone-950" />
              </div>
              <p className="text-[10px] text-stone-900/90 font-medium mt-0.5">
                Se aplicará automáticamente un descuento de hasta 100 AED en tu próximo pedido.
              </p>
            </div>
          )}

          {/* 10 Stamp Slots Grid (The "Cuños" with Logo) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] tracking-wider uppercase text-amber-200/80 font-mono">
              <span className="flex items-center space-x-1">
                <span>Cuños acumulados:</span>
                <strong className="text-amber-400 font-bold text-xs">{filledCount}/10</strong>
              </span>
              <span className="text-stone-400 text-[9px]">
                {10 - filledCount > 0
                  ? `Faltan ${10 - filledCount} para el premio`
                  : "¡Tarjeta completa!"}
              </span>
            </div>

            {/* The 10 Circular Stamp Slots */}
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
              {Array.from({ length: TOTAL_SLOTS }).map((_, i) => {
                const isStamped = i < filledCount;
                const isTenth = i === 9;

                return (
                  <div
                    key={i}
                    className={`relative aspect-square rounded-full transition-all duration-300 flex items-center justify-center p-1 ${
                      isStamped
                        ? "bg-gradient-to-br from-amber-400/20 to-amber-600/30 border-2 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.35)] scale-100"
                        : isTenth
                        ? "bg-stone-950/80 border-2 border-dashed border-amber-500/60 shadow-inner"
                        : "bg-stone-950/60 border border-stone-700/60 shadow-inner"
                    }`}
                  >
                    {isStamped ? (
                      /* CUÑO OFICIAL CON EL LOGO */
                      <div
                        className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden p-0.5 transform rotate-[-4deg] transition-transform hover:rotate-0"
                        title={`Sello ${i + 1} completado`}
                      >
                        {/* Red / Gold wax stamp glow ring */}
                        <div className="absolute inset-0 rounded-full border border-amber-300/80 shadow-[inset_0_0_6px_rgba(245,158,11,0.5)]" />
                        
                        {/* The Restaurant Logo as the Stamp */}
                        <img
                          src={logo}
                          alt={`Cuño ${i + 1}`}
                          className="w-full h-full object-cover rounded-full filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                        />

                        {/* Verified Check Badge */}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-amber-400 rounded-full flex items-center justify-center shadow-xs">
                          <Check className="w-2 h-2 text-stone-950 stroke-[3]" />
                        </div>
                      </div>
                    ) : (
                      /* Empty Slot */
                      <div className="flex flex-col items-center justify-center text-center">
                        {isTenth ? (
                          <div className="flex flex-col items-center">
                            <Crown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                            <span className="text-[7px] font-black text-amber-300 font-mono tracking-tighter">
                              100 AED
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-mono font-bold text-stone-500">
                            {i + 1}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-stone-950/80 border border-stone-800 rounded-full h-2 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                style={{ width: `${(filledCount / TOTAL_SLOTS) * 100}%` }}
              />
            </div>
          </div>

          {/* Footer Info: Customer Name & Card Identifier */}
          <div className="pt-2 border-t border-amber-500/20 flex items-end justify-between text-[10px]">
            <div>
              <p className="text-[8px] uppercase tracking-wider text-amber-400/70 font-mono">
                Titular de la tarjeta
              </p>
              <p className="font-serif tracking-wider font-bold text-stone-200 uppercase truncate max-w-[180px]">
                {customerName || "Cliente Tierra Querida"}
              </p>
              {phone && (
                <p className="text-[9px] font-mono text-stone-400">
                  {phone}
                </p>
              )}
            </div>

            <div className="text-right">
              {cyclesCompleted > 0 && (
                <span className="inline-flex items-center space-x-1 bg-amber-500/20 border border-amber-400/40 text-amber-300 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold mb-1">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span>{cyclesCompleted} ciclo{cyclesCompleted !== 1 ? "s" : ""} ganado{cyclesCompleted !== 1 ? "s" : ""}</span>
                </span>
              )}
              <p className="text-[8px] tracking-widest text-amber-400/60 uppercase font-mono">
                10 Pedidos = 100 AED Gratis
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
