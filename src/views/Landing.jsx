import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Calendar, Star, Compass, Clock, MapPin, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import Map from "../components/Map";
import { RESTAURANT_INFO } from "../data/initialData";
import logo from "../assets/logo.png";
import heroVideo from "../assets/hero-video.mp4";
import PlanCustomizerModal from "../components/PlanCustomizerModal";
import grid1 from "../assets/heritage_grid_1.jpg";
import grid2 from "../assets/heritage_grid_2.jpg";
import grid3 from "../assets/heritage_grid_3.jpg";
import grid4 from "../assets/heritage_grid_4.jpg";

export default function Landing({ setView, onSelectDish, dishes, promotions = [], restaurantInfo }) {
  const info = restaurantInfo && restaurantInfo.phone ? restaurantInfo : RESTAURANT_INFO;
  
  const storyTitle = info.storyTitle || "Un pedacito de Colombia en Dubái";
  const storyText = info.storyText || `En Tierra Querida creemos que la comida tiene el poder de unir personas y despertar recuerdos. Cada receta está inspirada en los sabores tradicionales de Colombia y preparada diariamente con ingredientes frescos, recetas auténticas y mucho amor.

Desde nuestras arepas hechas a mano hasta los almuerzos caseros, queremos que cada visita sea una experiencia que te haga sentir como en casa.`;

  const point1Title = info.storyPoint1Title || "🌽 Sabores auténticos de Colombia";
  const point1Desc = info.storyPoint1Desc || "Recetas tradicionales elaboradas con ingredientes cuidadosamente seleccionados.";
  const point2Title = info.storyPoint2Title || "🥘 Preparación diaria";
  const point2Desc = info.storyPoint2Desc || "Cada plato se cocina al momento para garantizar frescura y calidad.";
  const point3Title = info.storyPoint3Title || "🚚 Entrega rápida en Dubái";
  const point3Desc = info.storyPoint3Desc || "Llevamos el auténtico sabor colombiano hasta tu puerta.";
  const point4Title = info.storyPoint4Title || "❤️ Hecho con pasión";
  const point4Desc = info.storyPoint4Desc || "Más que un restaurante, somos un rincón de Colombia para quienes extrañan su tierra y para quienes desean descubrir su gastronomía.";

  const img1 = info.gridImage1 || grid1;
  const img2 = info.gridImage2 || grid2;
  const img3 = info.gridImage3 || grid3;
  const img4 = info.gridImage4 || grid4;

  const heroBadge = info.heroBadge || "Tradición, Pasión y Sabor";
  const heroTitle = info.heroTitle || "El Alma de Colombia en tu Mesa.";
  const heroSubtitle = info.heroSubtitle || "Una experiencia gastronómica que fusiona la tradición andina con la sofisticación culinaria moderna. Del campo colombiano a Business Bay, Dubái, directo a tu hogar.";

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("express");

  // Carousel controls
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [isCarouselPlaying, setIsCarouselPlaying] = useState(true);
  const carouselTimerRef = useRef(null);

  useEffect(() => {
    if (promotions.length <= 1) return;

    if (isCarouselPlaying) {
      carouselTimerRef.current = setInterval(() => {
        setCurrentPromoIndex((prevIndex) => (prevIndex + 1) % promotions.length);
      }, 5000);
    } else {
      if (carouselTimerRef.current) {
        clearInterval(carouselTimerRef.current);
      }
    }

    return () => {
      if (carouselTimerRef.current) {
        clearInterval(carouselTimerRef.current);
      }
    };
  }, [isCarouselPlaying, promotions.length]);

  const handlePrevPromo = () => {
    if (promotions.length === 0) return;
    setCurrentPromoIndex((prevIndex) => (prevIndex - 1 + promotions.length) % promotions.length);
  };

  const handleNextPromo = () => {
    if (promotions.length === 0) return;
    setCurrentPromoIndex((prevIndex) => (prevIndex + 1) % promotions.length);
  };

  // Select a few dishes for the "Chef's Recommendations" (featured)
  // Let's pick Bandeja Paisa, Ajiaco Santafereño, and Aborrajado
  const featuredDishes = dishes.filter(d => 
    d.id === "fuer-1" || d.id === "fuer-2" || d.id === "ent-7"
  );

  return (
    <div className="space-y-20 pb-20 font-sans">
      
      {/* Hero Section */}
      <section className="relative h-[85vh] md:h-[90vh] w-full flex items-center overflow-hidden bg-reddish-white px-6 md:px-margin-desktop">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-35 contrast-105"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-reddish-white via-reddish-white/70 to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-4xl max-w-7xl mx-auto w-full">
          <div className="flex items-center space-x-3 mb-6 animate-fade-in">
            <img src={logo} alt="Tierra Querida Emblem" className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-full border border-primary/20 bg-white" />
            <span className="font-sans font-bold text-xs md:text-sm text-primary tracking-widest uppercase">
              {heroBadge}
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl text-primary mb-8 leading-[1.15] animate-fade-in font-bold whitespace-pre-line">
            {heroTitle}
          </h1>
          <p className="font-sans text-sm md:text-base text-tertiary max-w-xl mb-10 leading-relaxed animate-fade-in whitespace-pre-line">
            {heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
            <button
              onClick={() => setView("menu")}
              className="bg-primary text-background font-bold text-xs md:text-sm px-10 py-5 uppercase tracking-widest border border-transparent hover:bg-transparent hover:text-primary hover:border-primary transition-all duration-300 shadow-md"
            >
              Pedir a Domicilio
            </button>
            <button
              onClick={() => setView("menu")}
              className="border border-primary/40 text-primary font-bold text-xs md:text-sm px-10 py-5 uppercase tracking-widest hover:bg-primary/5 transition-all duration-300"
            >
              Ver Carta Completa
            </button>
          </div>
        </div>
      </section>

      {/* Dynamic Promotions Carousel Section */}
      {promotions && promotions.length > 0 && (
        <section className="w-full py-6 bg-surface-container-low/40 border-y border-outline-variant/10">
          <div className="text-center mb-8 space-y-2 px-6 md:px-margin-desktop">
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest block">
              Destacados & Eventos
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-primary font-bold tracking-tight">
              Promociones Especiales
            </h2>
          </div>

          <div 
            className="relative h-[280px] sm:h-[380px] md:h-[480px] w-full overflow-hidden group bg-surface-container"
            onMouseEnter={() => setIsCarouselPlaying(false)}
            onMouseLeave={() => setIsCarouselPlaying(true)}
          >
            {/* Slides */}
            {promotions.map((promo, idx) => (
              <div
                key={promo.id || idx}
                onClick={() => {
                  const text = encodeURIComponent(`Hola, me interesa la promoción: "${promo.text}"`);
                  const whatsappUrl = `https://wa.me/${info.phone.replace("+", "")}?text=${text}`;
                  window.open(whatsappUrl, "_blank");
                }}
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out cursor-pointer ${
                  idx === currentPromoIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                {/* Background Image */}
                {promo.image ? (
                  <img
                    src={promo.image}
                    alt={promo.text}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-container-high flex flex-col items-center justify-center text-center p-8 select-none">
                    <span className="font-serif italic text-7xl text-primary/45 font-bold">
                      Tierra Querida
                    </span>
                  </div>
                )}

                {/* Dark Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20 z-10" />

                {/* Promotional Text Banner */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20 text-white flex flex-col justify-end min-h-[120px]">
                  <div className="max-w-3xl space-y-2">
                    <span className="bg-primary text-background text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm w-fit block shadow-sm">
                      Anuncio Especial
                    </span>
                    <p className="font-serif text-lg sm:text-2xl md:text-3xl font-bold leading-snug tracking-tight drop-shadow-md text-white">
                      {promo.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation Arrows (visible on hover) */}
            {promotions.length > 1 && (
              <>
                <button
                  onClick={handlePrevPromo}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 bg-black/40 hover:bg-primary text-white border border-white/10 rounded-full transition-all duration-300 hover:scale-105 opacity-0 group-hover:opacity-100"
                  aria-label="Promoción Anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextPromo}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 bg-black/40 hover:bg-primary text-white border border-white/10 rounded-full transition-all duration-300 hover:scale-105 opacity-0 group-hover:opacity-100"
                  aria-label="Siguiente Promoción"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Bottom Controls Indicator */}
            {promotions.length > 1 && (
              <div className="absolute bottom-4 right-6 z-30 flex items-center space-x-3 bg-black/40 px-3.5 py-2 border border-white/10 rounded-full text-white backdrop-blur-xs select-none text-xs">
                {/* Play/Pause Button */}
                <button
                  onClick={() => setIsCarouselPlaying(!isCarouselPlaying)}
                  className="hover:text-primary transition-colors pr-1.5 border-r border-white/20"
                  title={isCarouselPlaying ? "Pausar Carrusel" : "Reproducir Carrusel"}
                >
                  {isCarouselPlaying ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                </button>

                {/* Dot Indicators */}
                <div className="flex space-x-2">
                  {promotions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPromoIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        idx === currentPromoIndex
                          ? "bg-primary scale-110"
                          : "bg-white/40 hover:bg-white/70"
                      }`}
                      aria-label={`Ir a promoción ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Our Heritage (Asymmetric Bento Grid) */}
      <section id="heritage" className="py-10 px-6 md:px-margin-desktop max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest block">
              Nuestra Historia
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-primary">
              {storyTitle}
            </h2>
            <div className="space-y-4 text-sm md:text-base text-on-surface-variant leading-relaxed">
              {storyText.split("\n\n").map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
            
            <div className="border-t border-outline-variant/20 pt-6 mt-6">
              <h3 className="font-serif text-xl font-bold text-primary mb-4">¿Por qué elegir Tierra Querida?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-primary uppercase tracking-wider">{point1Title}</h4>
                  <p className="text-xs text-on-surface-variant/80 leading-relaxed">{point1Desc}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-primary uppercase tracking-wider">{point2Title}</h4>
                  <p className="text-xs text-on-surface-variant/80 leading-relaxed">{point2Desc}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-primary uppercase tracking-wider">{point3Title}</h4>
                  <p className="text-xs text-on-surface-variant/80 leading-relaxed">{point3Desc}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-primary uppercase tracking-wider">{point4Title}</h4>
                  <p className="text-xs text-on-surface-variant/80 leading-relaxed">{point4Desc}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bento Images */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-4">
            <div className="mt-8 space-y-4">
              <div className="aspect-[3/4] overflow-hidden rounded-sm border border-outline-variant/15">
                <img
                  className="w-full h-full object-cover image-reveal"
                  src={img1}
                  alt="Nuestra Cocina Colombiana"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-sm border border-outline-variant/15">
                <img
                  className="w-full h-full object-cover image-reveal"
                  src={img2}
                  alt="Equipo y sabor Tierra Querida"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-sm border border-outline-variant/15">
                <img
                  className="w-full h-full object-cover image-reveal"
                  src={img3}
                  alt="Auténticas Empanadas"
                />
              </div>
              <div className="aspect-[3/4] overflow-hidden rounded-sm border border-outline-variant/15">
                <img
                  className="w-full h-full object-cover image-reveal"
                  src={img4}
                  alt="Deliciosos almuerzos Deliveroo"
                />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Subscription Plans */}
      <section id="monthly-plans" className="px-6 md:px-margin-desktop max-w-7xl mx-auto py-10 font-sans">
        <div
          className="relative overflow-hidden rounded-sm border border-outline-variant/20 p-8 md:p-12 space-y-8 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/bandeja_paisa_dubai.png')" }}
        >
          {/* Dark Overlay for Contrast */}
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px] z-0"></div>

          <div className="relative z-10 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <span className="text-[10px] text-[#FCD116] font-bold uppercase tracking-widest block">
                Mensualidades
              </span>
              <h3 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-white">
                Planes Mensuales Tierra Querida
              </h3>
              <p className="text-sm text-white/90 leading-relaxed">
                Disfruta de la mejor comida colombiana todos los días en la comodidad de tu oficina u hogar con nuestros planes de suscripción mensual altamente flexibles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Plan 15 dias */}
              <div
                onClick={() => {
                  setSelectedPlanId("express");
                  setIsCustomizerOpen(true);
                }}
                className="group cursor-pointer relative overflow-hidden rounded-sm p-1 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl flex flex-col justify-between"
              >
                {/* Colombian Flag Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FCD116] via-[#003893] to-[#CE1126] transition-transform duration-500 group-hover:scale-110"></div>
                
                {/* Dark Glass Overlay for Optimum Contrast */}
                <div className="relative z-10 bg-black/80 backdrop-blur-md text-white p-8 space-y-6 flex flex-col justify-between h-full border border-white/10 group-hover:bg-black/75 transition-colors flex-grow">
                  <div className="space-y-4">
                    <span className="font-bold text-xs text-[#FCD116] uppercase tracking-widest block">
                      Plan Express
                    </span>
                    <h4 className="font-serif text-3xl font-bold text-white">15 Días</h4>
                    <p className="text-xs text-white/80">Lunes a Sábado</p>
                    <ul className="space-y-2 text-sm text-white/95 list-disc list-inside pt-2">
                      <li>Tu plato favorito a elección diaria.</li>
                      <li>Envío prioritario a Business Bay y zonas aledañas.</li>
                      <li>Cancelaciones y reprogramaciones flexibles.</li>
                    </ul>
                  </div>
                  <button
                    className="w-full text-center bg-white text-black font-bold text-xs uppercase py-4 tracking-widest transition-all rounded-sm block font-sans group-hover:bg-[#FCD116] group-hover:text-black border border-transparent shadow-sm"
                  >
                    Personalizar y Cotizar
                  </button>
                </div>
              </div>

              {/* Plan 30 dias */}
              <div
                onClick={() => {
                  setSelectedPlanId("premium");
                  setIsCustomizerOpen(true);
                }}
                className="group cursor-pointer relative overflow-hidden rounded-sm p-1 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl flex flex-col justify-between"
              >
                {/* Colombian Flag Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FCD116] via-[#003893] to-[#CE1126] transition-transform duration-500 group-hover:scale-110"></div>
                
                {/* Special Tag */}
                <div className="absolute top-4 right-4 z-20 bg-[#FCD116] text-black text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                  Más Popular
                </div>

                {/* Dark Glass Overlay for Optimum Contrast */}
                <div className="relative z-10 bg-black/80 backdrop-blur-md text-white p-8 space-y-6 flex flex-col justify-between h-full border border-white/10 group-hover:bg-black/75 transition-colors flex-grow">
                  <div className="space-y-4">
                    <span className="font-bold text-xs text-[#FCD116] uppercase tracking-widest block">
                      Plan Premium Full
                    </span>
                    <h4 className="font-serif text-3xl font-bold text-white">30 Días</h4>
                    <p className="text-xs text-white/80">Todos los días (Horario flexible)</p>
                    <ul className="space-y-2 text-sm text-white/95 list-disc list-inside pt-2">
                      <li>Menú diario 100% personalizado según tus gustos.</li>
                      <li>Entregas rápidas programadas en el horario que prefieras.</li>
                      <li>Incluye una bebida natural gratis en cada entrega.</li>
                    </ul>
                  </div>
                  <button
                    className="w-full text-center bg-[#FCD116] text-black font-bold text-xs uppercase py-4 tracking-widest transition-all rounded-sm block font-sans group-hover:bg-white group-hover:text-black border border-transparent shadow-sm"
                  >
                    Personalizar y Cotizar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catering / Events */}
      <section id="events" className="px-6 md:px-margin-desktop max-w-7xl mx-auto py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="aspect-[4/3] rounded-sm border border-outline-variant/15 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=700"
              alt="Catering de carnes colombianas"
              className="w-full h-full object-cover image-reveal"
            />
          </div>
          <div className="space-y-6">
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest block">
              Servicio Especial
            </span>
            <h3 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-primary">
              Catering & Eventos Privados
            </h3>
            <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
              ¿Tienes una reunión, cumpleaños o evento corporativo en Dubái? Tierra Querida te acompaña con el mejor buffet de comida típica colombiana. Llevamos empanadas calientes, arepas rellenas, picadas abundantes y jugos naturales preparados al instante para deleitar a tus invitados.
            </p>
            <div className="pt-4">
              <a
                href={info.whatsappLink + "?text=" + encodeURIComponent("Hola, me gustaría cotizar catering para un evento.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 border-b-2 border-primary text-primary font-bold text-xs uppercase tracking-widest pb-1 hover:text-primary-container hover:border-primary-container transition-all"
              >
                <span>Cotizar Evento</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Map Section */}
      <section id="contact" className="px-6 md:px-margin-desktop max-w-7xl mx-auto py-10">
        <Map />
      </section>

      {/* Plan Customizer Modal */}
      <PlanCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        planId={selectedPlanId}
        dishes={dishes}
      />

    </div>
  );
}
