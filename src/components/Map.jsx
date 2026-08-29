import React from "react";
import { MapPin, Navigation, Car, Landmark } from "lucide-react";
import { getRestaurantInfo } from "../utils/db";

export default function Map() {
  const info = getRestaurantInfo();
  return (
    <div className="bg-surface-container rounded-sm border border-outline-variant/20 p-6 md:p-10 space-y-8 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Information */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest block mb-2">
              Ubicación
            </span>
            <h3 className="font-serif text-3xl font-bold tracking-tight text-on-surface">
              Visítanos en Dubai
            </h3>
          </div>

          <p className="text-sm text-on-surface-variant leading-relaxed">
            Nos encontramos en el <strong>Al Faris Mall</strong>, un espacio diseñado para transportarte a las montañas colombianas a través del sabor, el aroma de café y la hospitalidad latina en el corazón de Dubái.
          </p>

          <div className="space-y-4 pt-4 border-t border-outline-variant/20">
            <div className="flex items-start space-x-3 text-sm">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-on-surface">Dirección Oficial</p>
                <p className="text-on-surface-variant mt-0.5">Al Faris Mall Shop, Dubai, UAE</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 text-sm">
              <Car className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-on-surface">Parqueadero</p>
                <p className="text-on-surface-variant mt-0.5">Estacionamiento disponible en Al Faris Mall.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-sm">
              <Landmark className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-on-surface">Reserva de Mesa</p>
                <p className="text-on-surface-variant mt-0.5">
                  Reservamos mesa para <strong>grupos de hasta 6 personas</strong>.<br />
                  Precio: <strong>15 AED por hora</strong>.<br />
                  Contáctanos por WhatsApp para coordinar tu reserva.
                </p>
              </div>
            </div>
          </div>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=Al+Faris+Mall+Dubai`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-primary text-background text-xs font-bold uppercase tracking-widest px-6 py-3.5 hover:bg-primary-container transition-all rounded-sm shadow-md"
          >
            <Navigation className="w-4 h-4" />
            <span>Cómo Llegar (Google Maps)</span>
          </a>
        </div>

        {/* Map Iframe Container */}
        <div className="lg:col-span-7 h-[350px] md:h-[450px] w-full bg-surface-container-high rounded-sm border border-outline-variant/15 overflow-hidden relative shadow-inner">
          <iframe
            title="Tierra Querida Al Faris Mall Dubai Map"
            src="https://maps.google.com/maps?q=Al+Faris+Mall+Dubai&t=&z=15&ie=UTF8&iwloc=&output=embed"
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
