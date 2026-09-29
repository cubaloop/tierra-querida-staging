import { Phone, Clock, MapPin, Send, Mail } from "lucide-react";
import { RESTAURANT_INFO as STATIC_INFO } from "../data/initialData";
import logo from "../assets/logo.png";

export default function Footer({ setView, restaurantInfo }) {
  const info = restaurantInfo && restaurantInfo.name ? restaurantInfo : STATIC_INFO;
  // Simple check to see if the kitchen is open (simulated open status)
  const isKitchenOpen = true;

  return (
    <footer className="bg-surface-container-highest dark:bg-surface-container-low text-on-surface border-t border-outline-variant/30 mt-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-6 md:px-margin-desktop py-16 max-w-7xl mx-auto">
        
        {/* Brand Information */}
        <div className="space-y-6 md:col-span-1">
          <button
            onClick={() => setView("landing")}
            className="flex items-center space-x-2.5 hover:opacity-85 transition-opacity text-left"
          >
            <img src={logo} alt="Tierra Querida Logo" className="w-10 h-10 object-cover rounded-full border border-outline-variant/20 bg-white" />
            <span className="font-serif text-lg text-primary font-bold uppercase tracking-tight">
              TIERRA QUERIDA
            </span>
          </button>
          <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
            Celebrando la riqueza gastronómica de Colombia a través de una lente moderna y sofisticada en el corazón de Dubái.
          </p>
          {/* Social Links */}
          <div className="flex space-x-4">
            <a
              href={info.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-outline-variant/40 flex items-center justify-center rounded-full hover:bg-primary hover:text-background hover:border-primary transition-all duration-300"
              title="Instagram @colombianasendubai"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href={info.instagram} // Secondary IG link or just use same
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-outline-variant/40 flex items-center justify-center rounded-full hover:bg-primary hover:text-background hover:border-primary transition-all duration-300"
              title="Instagram @tierraqueridadubai"
            >
              <span className="font-sans text-[10px] font-extrabold">TQ</span>
            </a>
            <a
              href={info.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-outline-variant/40 flex items-center justify-center rounded-full hover:bg-primary hover:text-background hover:border-primary transition-all duration-300"
              title="Facebook"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </a>
            <a
              href={info.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border border-outline-variant/40 flex items-center justify-center rounded-full hover:bg-primary hover:text-background hover:border-primary transition-all duration-300"
              title="TikTok"
            >
              {/* Custom TikTok text icon */}
              <span className="font-sans text-xs font-extrabold uppercase">TT</span>
            </a>
          </div>
        </div>

        {/* Explore Links */}
        <div className="space-y-4">
          <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-primary">Explorar</h4>
          <ul className="space-y-3 font-sans text-sm text-on-surface-variant">
            <li>
              <button onClick={() => setView("menu")} className="hover:text-primary transition-colors">
                Nuestra Carta
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setView("landing");
                  setTimeout(() => {
                    document.getElementById("heritage")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="hover:text-primary transition-colors"
              >
                Herencia & Tradición
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setView("landing");
                  setTimeout(() => {
                    document.getElementById("monthly-plans")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="hover:text-primary transition-colors"
              >
                Planes Mensuales
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  setView("landing");
                  setTimeout(() => {
                    document.getElementById("events")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="hover:text-primary transition-colors"
              >
                Eventos Especiales
              </button>
            </li>
            <li>
              <button onClick={() => setView("profile")} className="hover:text-primary transition-colors font-medium text-amber-700 dark:text-amber-400">
                Mi Tarjeta de Fidelidad 3D 🎯
              </button>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-primary">Contacto & Pedidos</h4>
          <ul className="space-y-3 font-sans text-sm text-on-surface-variant">
            <li className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <a href={info.whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                {info.phone} (WhatsApp)
              </a>
            </li>
            <li className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>{info.address}</span>
            </li>
            {info.email && (
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href={`mailto:${info.email}`} className="hover:text-primary transition-colors font-mono text-xs">
                  {info.email}
                </a>
              </li>
            )}
            <li className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span>{info.schedule || "Todos los días: 11:00 AM - 11:00 PM"}</span>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div className="space-y-4">
          <h4 className="font-sans font-bold text-xs uppercase tracking-widest text-primary">Boletín Gastronómico</h4>
          <p className="font-sans text-sm text-on-surface-variant">
            Suscríbete para recibir eventos privados de catas de café y menús de autor.
          </p>
          <form className="flex border-b border-primary/30 pb-1 pt-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder-on-surface-variant/50 p-1 outline-none"
            />
            <button type="submit" className="text-primary hover:text-primary-container p-1 transition-colors" aria-label="Suscribirse">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* Sub-footer */}
      <div className="max-w-7xl mx-auto px-6 md:px-margin-desktop py-8 border-t border-outline-variant/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-on-surface-variant/60 font-sans text-xs">
        <span>© {new Date().getFullYear()} Tierra Querida. Todos los derechos reservados.</span>
        
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${isKitchenOpen ? "bg-secondary" : "bg-primary"}`}></span>
          <span className={`uppercase font-bold tracking-widest text-[10px] ${isKitchenOpen ? "text-secondary" : "text-primary"}`}>
            {isKitchenOpen ? "Cocina Abierta (Delivery Activo)" : "Cocina Cerrada"}
          </span>
        </div>
      </div>
    </footer>
  );
}
