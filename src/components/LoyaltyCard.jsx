import React from "react";

const TOTAL_SLOTS = 10;

export default function LoyaltyCard({ stamps = 0, cyclesCompleted = 0, rewardReady = false, compact = false }) {
  const filledCount = Math.min(stamps, TOTAL_SLOTS);

  if (compact) {
    // Small inline badge for checkout summary
    return (
      <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 rounded-sm px-3 py-2">
        <span className="text-base">🎯</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1">
            {Array.from({ length: TOTAL_SLOTS }).map((_, i) => (
              <span
                key={i}
                className={`text-base leading-none transition-all ${
                  i < filledCount ? "text-amber-500" : "text-amber-200"
                }`}
              >
                {i < filledCount ? "●" : "○"}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
            {rewardReady ? "🎁 ¡Premio listo para usar!" : `${filledCount}/10 sellos`}
            {cyclesCompleted > 0 && (
              <span className="ml-1 text-amber-500">· {cyclesCompleted} ciclo{cyclesCompleted !== 1 ? "s" : ""} completado{cyclesCompleted !== 1 ? "s" : ""}</span>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-sm p-5 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
            🎯
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Tarjeta Tierra Querida
            </h3>
            <p className="text-[10px] text-amber-700">
              10 pedidos = comida gratis (hasta 100 AED)
            </p>
          </div>
        </div>
        {cyclesCompleted > 0 && (
          <span className="text-[9px] font-bold bg-amber-400 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
            {cyclesCompleted} 🏆
          </span>
        )}
      </div>

      {/* Stamp slots */}
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: TOTAL_SLOTS }).map((_, i) => (
          <div
            key={i}
            className={`aspect-square rounded-full border-2 flex items-center justify-center text-lg transition-all duration-300 ${
              i < filledCount
                ? "bg-amber-400 border-amber-500 shadow-sm scale-105"
                : "bg-white border-amber-200"
            }`}
          >
            {i < filledCount ? (
              <span className="text-white text-xs font-bold">✓</span>
            ) : (
              <span className="text-amber-200 text-xs">{i + 1}</span>
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="w-full bg-amber-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-amber-400 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(filledCount / TOTAL_SLOTS) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-amber-700">
          <span>{filledCount}/{TOTAL_SLOTS} sellos acumulados</span>
          <span>{TOTAL_SLOTS - filledCount} para el premio</span>
        </div>
      </div>

      {/* Reward ready banner */}
      {rewardReady && (
        <div className="bg-amber-400 rounded-sm p-3 text-center animate-pulse">
          <p className="text-white font-bold text-sm">
            🎁 ¡Premio Desbloqueado!
          </p>
          <p className="text-amber-100 text-[11px] mt-0.5">
            Descuento de hasta 100 AED aplicado automáticamente en este pedido
          </p>
        </div>
      )}
    </div>
  );
}
