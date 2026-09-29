import React, { useState, useEffect, useMemo } from "react";
import { Plus, Edit2, Trash2, RotateCcw, Package, ClipboardList, CheckCircle, Clock, Image as ImageIcon, LayoutDashboard, LogOut, Download, DollarSign, ArrowLeft, Settings, Menu as MenuIcon, X as CloseIcon, Eye, Star, MapPin, Loader2, Gift } from "lucide-react";
import { saveDish, deleteDish, resetDishes, getOrders, savePromotion, deletePromotion, resetPromotions, logoutUser, saveRestaurantInfo, resetRestaurantInfo, uploadRestaurantImage, getDeliveryRates, saveDeliveryRates } from "../utils/db";
import { getAllLoyaltyCards, adminUpdateLoyaltyCard, upsertLoyaltyCard } from "../utils/loyalty";
import { DEFAULT_DELIVERY_RATES } from "../utils/delivery";
import { CATEGORIES } from "../data/initialData";

const PROMO_IMAGE_BANK = [
  "promo_don_ramon.png",
  "promo_discount_mains.png",
  "promo_free_coffee.png"
];

const IMAGE_BANK = [
  "ARROZ CON POLLO .jpg.jpeg",
  "Aborrajados (x2).PNG",
  "Ajiaco santafereño from BOGOTÁ SPECIAL.PNG",
  "Arepa Full HD -Arepa MIX chicken and Beff .PNG",
  "Arepa con carne -AREPA WHIT MEAT  .jpg.jpeg",
  "Arepa con pollo- AREPA WHIT CHICKEN.JPEG",
  "Arepa con queso -AREPA WHIT CHESSE.PNG",
  "Arepa vegan 🌱 .PNG",
  "BOWL DE FRIJOLES .jpg.jpeg",
  "BOWL DE GULASH .PNG",
  "BOWL DE LENTEJAS .jpg.jpeg",
  "Beef rib soup .PNG",
  "Breaded Chicken Cutlet.PNG",
  "Calentado with beans and Rice .jpg.jpeg",
  "Changua (Milk and Egg Soup).jpg.jpeg",
  "Chicken Rice BIG FAMILY .PNG",
  "Chicken Stew Platter Breaded.PNG",
  "Colombian Buñuelos (x10).PNG",
  "Colombian Pandebonos (x10).PNG",
  "Colombian style Goulash (special dish).PNG",
  "Colombian- Style Fried Rice (Family)fullHD .PNG",
  "Deep-Fried Corn Cake Filled with Egg.jpg.jpeg",
  "Egg Arepa (5).PNG",
  "Fried Green Plantains with Guacamole.PNG",
  "Fried Green Plantains with Hogao.PNG",
  "Fried Sweet Plantain with Cheese.PNG",
  "Grilled Sweet Plantain with Cheese.PNG",
  "Lentil platter chicken.PNG",
  "Lentils with Grilled Beef special.PNG",
  "Mini Cheese Arepas (x3).PNG",
  "Mini Chicken Arepas (x3).PNG",
  "Mini Egg Arepas (x10).PNG",
  "Pericos Eggs with Plantains.jpg.jpeg",
  "Ring-Shaped Pandebono (x10).PNG",
  "SALCHIALITAS  .PNG",
  "SALCHIPAPA TRADICIONAL.PNG",
  "Salchi-Especial .PNG",
  "Salchiquerida .jpg.jpeg",
  "Sancocho Valluno with Chicken Stew.PNG",
  "Scrambled eggs whit mushrooms.jpg.jpeg",
  "Steak with Fried Egg.PNG",
  "Stuffed Potatoes (Large x5).PNG",
  "Stuffed Potatoes (Small)10 unit .PNG",
  "Style Fried Rice (personal)x3PEOPLE.PNG",
  "bandeja_paisa.jpg",
  "arroz_paisa_especial.jpg"
];

const formatImageLabel = (filename) => {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
};

export default function AdminPanel({
  setView,
  dishes,
  onRefreshDishes,
  promotions = [],
  onRefreshPromotions,
  onLogout,
  restaurantInfo,
  onRefreshInfo
}) {
  const [tab, setTab] = useState("dashboard"); // 'dashboard', 'dishes', 'orders', 'promotions', 'contact', 'loyalty'
  const [editingDish, setEditingDish] = useState(null); // null means list view, object means edit form, empty object means create form
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Loyalty cards state
  const [loyaltyCards, setLoyaltyCards] = useState([]);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);
  const [loyaltySearch, setLoyaltySearch] = useState("");
  const [editingLoyalty, setEditingLoyalty] = useState(null); // card being edited
  const [loyaltySaveMsg, setLoyaltySaveMsg] = useState("");

  // Delivery rates state
  const [deliveryRatesForm, setDeliveryRatesForm] = useState(getDeliveryRates());
  const [deliverySaveMsg, setDeliverySaveMsg] = useState("");

  // Contact Info state
  const [infoForm, setInfoForm] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
    instagram: "",
    tiktok: "",
    facebook: "",
    storyTitle: "",
    storyText: "",
    storyPoint1Title: "",
    storyPoint1Desc: "",
    storyPoint2Title: "",
    storyPoint2Desc: "",
    storyPoint3Title: "",
    storyPoint3Desc: "",
    storyPoint4Title: "",
    storyPoint4Desc: "",
    gridImage1: "",
    gridImage2: "",
    gridImage3: "",
    gridImage4: "",
    heroBadge: "",
    heroTitle: "",
    heroSubtitle: "",
    schedule: "",
    allergenNotice: "",
    deliveryFee: 20,
    cardPaymentEnabled: false
  });

  // Sync state if props change
  useEffect(() => {
    if (restaurantInfo) {
      setInfoForm({
        name: restaurantInfo.name || "",
        phone: restaurantInfo.phone || "",
        address: restaurantInfo.address || "",
        email: restaurantInfo.email || "",
        instagram: restaurantInfo.instagram || "",
        tiktok: restaurantInfo.tiktok || "",
        facebook: restaurantInfo.facebook || "",
        storyTitle: restaurantInfo.storyTitle || "",
        storyText: restaurantInfo.storyText || "",
        storyPoint1Title: restaurantInfo.storyPoint1Title || "",
        storyPoint1Desc: restaurantInfo.storyPoint1Desc || "",
        storyPoint2Title: restaurantInfo.storyPoint2Title || "",
        storyPoint2Desc: restaurantInfo.storyPoint2Desc || "",
        storyPoint3Title: restaurantInfo.storyPoint3Title || "",
        storyPoint3Desc: restaurantInfo.storyPoint3Desc || "",
        storyPoint4Title: restaurantInfo.storyPoint4Title || "",
        storyPoint4Desc: restaurantInfo.storyPoint4Desc || "",
        gridImage1: restaurantInfo.gridImage1 || "",
        gridImage2: restaurantInfo.gridImage2 || "",
        gridImage3: restaurantInfo.gridImage3 || "",
        gridImage4: restaurantInfo.gridImage4 || "",
        heroBadge: restaurantInfo.heroBadge || "",
        heroTitle: restaurantInfo.heroTitle || "",
        heroSubtitle: restaurantInfo.heroSubtitle || "",
        schedule: restaurantInfo.schedule || "",
        allergenNotice: restaurantInfo.allergenNotice || "",
        deliveryFee: restaurantInfo.deliveryFee != null ? restaurantInfo.deliveryFee : 20,
        cardPaymentEnabled: !!restaurantInfo.cardPaymentEnabled
      });
    }
  }, [restaurantInfo]);

  const handleInfoInputChange = (e) => {
    const { name, value } = e.target;
    setInfoForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGridImageChange = async (e, imageField) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const publicUrl = await uploadRestaurantImage(file);
        setInfoForm((prev) => ({ ...prev, [imageField]: publicUrl }));
        alert(`Imagen subida y enlazada correctamente.`);
      } catch (err) {
        console.error("Error al subir imagen de historia:", err);
        alert("Error al subir la imagen a la nube.");
      }
    }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveRestaurantInfo(infoForm);
      if (onRefreshInfo) onRefreshInfo();
      alert("Datos de contacto y configuración actualizados correctamente.");
    } catch (err) {
      console.error("Error al guardar datos:", err);
      alert("Error al guardar en el servidor. Por favor intenta de nuevo.");
    }
  };

  const handleInfoReset = () => {
    if (window.confirm("¿Deseas restablecer los datos de contacto originales de fábrica?")) {
      const reset = resetRestaurantInfo();
      setInfoForm(reset);
      if (onRefreshInfo) onRefreshInfo();
    }
  };

  // ─── Loyalty card handlers ───────────────────────────────────
  const loadLoyaltyCards = async () => {
    setLoyaltyLoading(true);
    try {
      const cards = await getAllLoyaltyCards();
      setLoyaltyCards(cards);
    } catch (e) {
      console.error("Error loading loyalty cards:", e);
    } finally {
      setLoyaltyLoading(false);
    }
  };

  const handleLoyaltySave = async (phone, stamps, cycles, rewardReady) => {
    try {
      await adminUpdateLoyaltyCard(phone, stamps, cycles, rewardReady);
      setLoyaltySaveMsg("✓ Guardado");
      setTimeout(() => setLoyaltySaveMsg(""), 2000);
      await loadLoyaltyCards();
      setEditingLoyalty(null);
    } catch (e) {
      console.error("Error saving loyalty card:", e);
    }
  };

  const handleDeleteLoyaltyCard = async (phone) => {
    if (!window.confirm(`¿Eliminar la tarjeta de ${phone}? Esta acción no se puede deshacer.`)) return;
    try {
      const { supabase, isSupabaseConfigured } = await import("../utils/supabase");
      if (isSupabaseConfigured) {
        await supabase.from("loyalty_cards").delete().eq("phone", phone);
      }
      setLoyaltyCards((prev) => prev.filter((c) => c.phone !== phone));
    } catch (e) {
      console.error("Error deleting loyalty card:", e);
    }
  };

  // ─── Delivery rates handlers ──────────────────────────────────
  const handleDeliveryRateSave = async () => {
    try {
      await saveDeliveryRates(deliveryRatesForm);
      setDeliverySaveMsg("✓ Tarifas guardadas");
      setTimeout(() => setDeliverySaveMsg(""), 2500);
    } catch (e) {
      console.error("Error saving delivery rates:", e);
    }
  };

  const handleDeliveryRateChange = (index, field, value) => {
    setDeliveryRatesForm((prev) => {
      const newRates = [...prev.rates];
      newRates[index] = { ...newRates[index], [field]: Number(value) };
      return { ...prev, rates: newRates };
    });
  };

  const handleAddDeliveryTier = () => {
    setDeliveryRatesForm((prev) => ({
      ...prev,
      rates: [...prev.rates, { minKm: prev.rates.at(-1)?.maxKm ?? 20, maxKm: prev.rates.at(-1)?.maxKm + 10 ?? 30, fee: 30 }]
    }));
  };

  const handleRemoveDeliveryTier = (index) => {
    setDeliveryRatesForm((prev) => ({
      ...prev,
      rates: prev.rates.filter((_, i) => i !== index)
    }));
  };

  const handleExportMenu = () => {
    const currentDishes = dishes;
    const currentPromos = promotions;
    const info = restaurantInfo || {
      name: "Tierra Querida",
      phone: "+971568460179",
      whatsappLink: "https://wa.me/971568460179",
      address: "Business Bay, Dubai, UAE",
      email: "info@tierraqueridadubai.com",
      instagram: "https://www.instagram.com/colombianasendubai",
      tiktok: "https://www.tiktok.com/@tierraqueridadubai",
      facebook: "https://www.facebook.com/tierraqueridadubai"
    };
    
    const fileContent = `// Archivo de Datos Iniciales Generado desde el Dashboard
// Tierra Querida Restaurant - Dubai

export const RESTAURANT_INFO = ${JSON.stringify(info, null, 2)};

export const CATEGORIES = [
  { id: "desayunos", name: "Desayunos", subtitle: "Breakfast Classics" },
  { id: "entradas", name: "Entradas", subtitle: "Small Plates & Starters" },
  { id: "fuertes", name: "Almuerzos Especiales", subtitle: "Colombian Specialty Mains" },
  { id: "bowls", name: "Bowls", subtitle: "Customizable Bowls" },
  { id: "arepas", name: "Arepas", subtitle: "Traditional Stuffed Corn Cakes" },
  { id: "comidas-rapidas", name: "Comidas Rápidas", subtitle: "Latin Street Food" },
  { id: "promos", name: "Promos", subtitle: "Empanada Packages" },
  { id: "saludable", name: "Saludable", subtitle: "Balanced & Healthy Plates" },
  { id: "ensaladas", name: "Ensaladas", subtitle: "Fresh Salads" },
  { id: "salchipapas", name: "Salchipapas", subtitle: "Loaded Fries Platter" },
  { id: "adicionales", name: "Adicionales", subtitle: "Extras & Sides" },
  { id: "bebidas", name: "Bebidas", subtitle: "Drinks & Refreshments" },
  { id: "jugos-naturales", name: "Jugos Naturales", subtitle: "Fresh Natural Juices" }
];

export const INITIAL_DISHES = ${JSON.stringify(currentDishes, null, 2)};

export const INITIAL_PROMOTIONS = ${JSON.stringify(currentPromos, null, 2)};
`;
    const blob = new Blob([fileContent], { type: "text/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "initialData.js";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [imagePreset, setImagePreset] = useState("custom");
  const [isCustomImage, setIsCustomImage] = useState(true);

  const allCategories = useMemo(() => {
    const customCatIds = Array.from(
      new Set((dishes || []).map((d) => d.category).filter(Boolean))
    ).filter((catId) => !CATEGORIES.some((c) => c.id === catId));

    const customCats = customCatIds.map((catId) => ({
      id: catId,
      name: catId.charAt(0).toUpperCase() + catId.slice(1).replace(/-/g, " "),
      subtitle: "Categoría Especial"
    }));

    return [...CATEGORIES, ...customCats];
  }, [dishes]);

  // Promotions management states
  const [editingPromo, setEditingPromo] = useState(null); // null means list, object means form
  const [promoForm, setPromoForm] = useState({ id: "", text: "", image: "" });
  const [promoImagePreset, setPromoImagePreset] = useState("custom");
  const [isCustomPromoImage, setIsCustomPromoImage] = useState(true);
  
  const [dishForm, setDishForm] = useState({
    id: "",
    name: "",
    price: 0,
    category: "desayunos",
    description: "",
    image: "",
    tags: "",
    optionsTitle: "",
    optionsChoices: ""
  });

  const orders = getOrders().reverse(); // Show newest first

  // Promotions handlers
  const handleEditPromoClick = (promo) => {
    setEditingPromo(promo);
    const matchedPreset = PROMO_IMAGE_BANK.find(img => `/images/${img}` === promo.image);
    if (matchedPreset) {
      setPromoImagePreset(`/images/${matchedPreset}`);
      setIsCustomPromoImage(false);
    } else {
      setPromoImagePreset("custom");
      setIsCustomPromoImage(true);
    }
    setPromoForm({
      id: promo.id || "",
      text: promo.text || "",
      image: promo.image || ""
    });
  };

  const handleAddNewPromoClick = () => {
    setEditingPromo({});
    const defaultImg = `/images/${PROMO_IMAGE_BANK[0]}`;
    setPromoImagePreset(defaultImg);
    setIsCustomPromoImage(false);
    setPromoForm({
      id: "",
      text: "",
      image: defaultImg
    });
  };

  const handlePromoInputChange = (e) => {
    const { name, value } = e.target;
    setPromoForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePromoPresetChange = (e) => {
    const val = e.target.value;
    setPromoImagePreset(val);
    if (val === "custom") {
      setIsCustomPromoImage(true);
      setPromoForm((prev) => ({ ...prev, image: "" }));
    } else {
      setIsCustomPromoImage(false);
      setPromoForm((prev) => ({ ...prev, image: val }));
    }
  };

  const handlePromoFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const publicUrl = await uploadRestaurantImage(file);
        setPromoForm((prev) => ({ ...prev, image: publicUrl }));
        setPromoImagePreset("custom");
        setIsCustomPromoImage(true);
        alert("¡Imagen de promoción subida con éxito!");
      } catch (err) {
        console.error("Error al subir imagen de promoción:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPromoForm((prev) => ({ ...prev, image: reader.result }));
          setPromoImagePreset("custom");
          setIsCustomPromoImage(true);
          alert("Imagen cargada de forma local (formato base64) debido a un error de conexión.");
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDeletePromoClick = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta promoción?")) {
      try {
        await deletePromotion(id);
        if (onRefreshPromotions) onRefreshPromotions();
      } catch (err) {
        console.error("Error al eliminar promo:", err);
      }
    }
  };

  const handleResetPromotionsClick = () => {
    if (window.confirm("¿Deseas restablecer las promociones por defecto? Se perderán todos tus cambios.")) {
      resetPromotions();
      if (onRefreshPromotions) onRefreshPromotions();
    }
  };

  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    const promoToSave = {
      text: promoForm.text,
      image: promoForm.image
    };
    if (promoForm.id) {
      promoToSave.id = promoForm.id;
    }
    try {
      await savePromotion(promoToSave);
      setEditingPromo(null);
      if (onRefreshPromotions) onRefreshPromotions();
      alert("¡Promoción guardada exitosamente!");
    } catch (err) {
      console.error("Error al guardar promoción:", err);
      alert("Error al guardar promoción en el servidor.");
    }
  };

  const handleEditClick = (dish) => {
    setEditingDish(dish);
    const matchedPreset = IMAGE_BANK.find(img => `/images/${img}` === dish.image);
    if (matchedPreset) {
      setImagePreset(`/images/${matchedPreset}`);
      setIsCustomImage(false);
    } else {
      setImagePreset("custom");
      setIsCustomImage(true);
    }
    setDishForm({
      id: dish.id || "",
      name: dish.name || "",
      price: dish.price || 0,
      category: dish.category || "desayunos",
      description: dish.description || "",
      image: dish.image || "",
      tags: dish.tags ? dish.tags.join(", ") : "",
      optionsTitle: dish.options ? dish.options.title : "",
      optionsChoices: dish.options && dish.options.choices ? dish.options.choices.join(", ") : ""
    });
  };

  const handleAddNewClick = () => {
    setEditingDish({});
    const defaultImg = `/images/${IMAGE_BANK[0]}`;
    setImagePreset(defaultImg);
    setIsCustomImage(false);
    setDishForm({
      id: "",
      name: "",
      price: 0,
      category: "desayunos",
      description: "",
      image: defaultImg,
      tags: "",
      optionsTitle: "",
      optionsChoices: ""
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDishForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePresetChange = (e) => {
    const val = e.target.value;
    setImagePreset(val);
    if (val === "custom") {
      setIsCustomImage(true);
      setDishForm((prev) => ({ ...prev, image: "" }));
    } else {
      setIsCustomImage(false);
      setDishForm((prev) => ({ ...prev, image: val }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const publicUrl = await uploadRestaurantImage(file);
        setDishForm((prev) => ({ ...prev, image: publicUrl }));
        setImagePreset("custom");
        setIsCustomImage(true);
        alert("¡Imagen del plato subida con éxito!");
      } catch (err) {
        console.error("Error al subir imagen del plato:", err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setDishForm((prev) => ({ ...prev, image: reader.result }));
          setImagePreset("custom");
          setIsCustomImage(true);
          alert("Imagen cargada de forma local (formato base64) debido a un error de conexión.");
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este plato?")) {
      try {
        await deleteDish(id);
        if (onRefreshDishes) onRefreshDishes();
        alert("¡Plato eliminado exitosamente!");
      } catch (err) {
        console.error("Error al eliminar plato:", err);
      }
    }
  };

  const handleResetClick = () => {
    if (window.confirm("¿Deseas restablecer la carta original por defecto? Se perderán todos tus cambios.")) {
      resetDishes();
      if (onRefreshDishes) onRefreshDishes();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Parse tags
    const tagsArray = dishForm.tags
      ? dishForm.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
    
    // Parse options
    let optionsObject = null;
    if (dishForm.optionsTitle.trim() && dishForm.optionsChoices.trim()) {
      optionsObject = {
        type: "radio",
        title: dishForm.optionsTitle.trim(),
        choices: dishForm.optionsChoices.split(",").map((c) => c.trim()).filter(Boolean)
      };
    }

    const dishToSave = {
      name: dishForm.name,
      price: Number(dishForm.price),
      category: dishForm.category,
      description: dishForm.description,
      image: dishForm.image,
      tags: tagsArray
    };

    if (dishForm.id) {
      dishToSave.id = dishForm.id;
    }
    if (optionsObject) {
      dishToSave.options = optionsObject;
    }

    try {
      await saveDish(dishToSave);
      setEditingDish(null);
      if (onRefreshDishes) onRefreshDishes();
      alert("¡Plato guardado exitosamente!");
    } catch (err) {
      console.error("Error al guardar plato:", err);
      alert("Error al guardar plato en el servidor.");
    }
  };

  const filteredDishes = (filterCategory === "all"
    ? dishes
    : dishes.filter((d) => d.category === filterCategory)
  ).filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#faf6f6] text-on-surface overflow-hidden font-sans relative">
      
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 md:hidden animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Slide-over Drawer for Mobile */}
      <div className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white z-50 flex flex-col justify-between shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div>
          {/* Mobile Drawer Header */}
          <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="font-serif italic text-xl font-bold text-primary">Tierra Querida</span>
              <span className="bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm">
                Admin
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 text-on-surface-variant hover:text-primary rounded-full"
              aria-label="Cerrar menú"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links in Mobile Drawer */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => { setTab("dashboard"); setEditingDish(null); setEditingPromo(null); setMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all ${
                tab === "dashboard"
                  ? "bg-primary text-background shadow-xs font-bold"
                  : "text-on-surface-variant/80 hover:bg-primary/5 hover:text-primary"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Resumen</span>
            </button>

            <button
              onClick={() => { setTab("dishes"); setEditingDish(null); setEditingPromo(null); setMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all ${
                tab === "dishes"
                  ? "bg-primary text-background shadow-xs font-bold"
                  : "text-on-surface-variant/80 hover:bg-primary/5 hover:text-primary"
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Gestionar Carta ({dishes.length})</span>
            </button>

            <button
              onClick={() => { setTab("promotions"); setEditingDish(null); setEditingPromo(null); setMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all ${
                tab === "promotions"
                  ? "bg-primary text-background shadow-xs font-bold"
                  : "text-on-surface-variant/80 hover:bg-primary/5 hover:text-primary"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Gestionar Promos ({promotions.length})</span>
            </button>

            <button
              onClick={() => { setTab("orders"); setEditingDish(null); setEditingPromo(null); setMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all ${
                tab === "orders"
                  ? "bg-primary text-background shadow-xs font-bold"
                  : "text-on-surface-variant/80 hover:bg-primary/5 hover:text-primary"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Historial Pedidos ({orders.length})</span>
            </button>

            <button
              onClick={() => { setTab("contact"); setEditingDish(null); setEditingPromo(null); setMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all ${
                tab === "contact"
                  ? "bg-primary text-background shadow-xs font-bold"
                  : "text-on-surface-variant/80 hover:bg-primary/5 hover:text-primary"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Datos & Configuración</span>
            </button>

            <button
              onClick={() => { setTab("loyalty"); setEditingDish(null); setEditingPromo(null); setMobileMenuOpen(false); loadLoyaltyCards(); }}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all ${
                tab === "loyalty"
                  ? "bg-amber-400 text-white shadow-xs font-bold"
                  : "text-amber-700 hover:bg-amber-50 hover:text-amber-800"
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Fidelizaci&#xF3;n &#x1F3AF;</span>
            </button>
          </nav>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-outline-variant/20 space-y-2">
          <button
            onClick={() => { handleExportMenu(); setMobileMenuOpen(false); }}
            className="w-full flex items-center justify-center space-x-2 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest py-3 rounded-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Datos</span>
          </button>
          <button
            onClick={() => { setView("landing"); setMobileMenuOpen(false); }}
            className="w-full flex items-center justify-center space-x-2 bg-transparent text-on-surface-variant/70 hover:text-primary text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ver Sitio Web</span>
          </button>
          <button
            onClick={() => {
              logoutUser();
              onLogout();
              setView("landing");
            }}
            className="w-full flex items-center justify-center space-x-2 bg-red-50 text-red-600 text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-outline-variant/30 flex-col justify-between shrink-0 shadow-xs">
        <div>
          {/* Logo & Brand Header */}
          <div className="p-6 border-b border-outline-variant/20 flex items-center space-x-3">
            <span className="font-serif italic text-xl font-bold text-primary">Tierra Querida</span>
            <span className="bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm">
              Admin
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => { setTab("dashboard"); setEditingDish(null); setEditingPromo(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-sm transition-all ${
                tab === "dashboard"
                  ? "bg-primary text-background shadow-xs font-bold"
                  : "text-on-surface-variant/80 hover:bg-primary/5 hover:text-primary"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Resumen</span>
            </button>

            <button
              onClick={() => { setTab("dishes"); setEditingDish(null); setEditingPromo(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-sm transition-all ${
                tab === "dishes"
                  ? "bg-primary text-background shadow-xs font-bold"
                  : "text-on-surface-variant/80 hover:bg-primary/5 hover:text-primary"
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>Gestionar Carta</span>
            </button>

            <button
              onClick={() => { setTab("promotions"); setEditingDish(null); setEditingPromo(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-sm transition-all ${
                tab === "promotions"
                  ? "bg-primary text-background shadow-xs font-bold"
                  : "text-on-surface-variant/80 hover:bg-primary/5 hover:text-primary"
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Gestionar Promos</span>
            </button>

            <button
              onClick={() => { setTab("orders"); setEditingDish(null); setEditingPromo(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-sm transition-all ${
                tab === "orders"
                  ? "bg-primary text-background shadow-xs font-bold"
                  : "text-on-surface-variant/80 hover:bg-primary/5 hover:text-primary"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Historial Pedidos ({orders.length})</span>
            </button>

            <button
              onClick={() => { setTab("contact"); setEditingDish(null); setEditingPromo(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-sm transition-all ${
                tab === "contact"
                  ? "bg-primary text-background shadow-xs font-bold"
                  : "text-on-surface-variant/80 hover:bg-primary/5 hover:text-primary"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Datos de Contacto</span>
            </button>

            <button
              onClick={() => { setTab("loyalty"); setEditingDish(null); setEditingPromo(null); loadLoyaltyCards(); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-sm transition-all ${
                tab === "loyalty"
                  ? "bg-amber-400 text-white shadow-xs font-bold"
                  : "text-amber-700 hover:bg-amber-50 hover:text-amber-800"
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Fidelizaci&#xF3;n &#x1F3AF;</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="p-4 border-t border-outline-variant/20 space-y-2">
          {/* Export button */}
          <button
            onClick={handleExportMenu}
            className="w-full flex items-center justify-center space-x-2 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest py-3 rounded-sm transition-colors"
            title="Descargar archivo initialData.js actualizado para producción"
          >
            <Download className="w-4 h-4" />
            <span>Exportar initialData.js</span>
          </button>

          {/* Go to web link */}
          <button
            onClick={() => setView("landing")}
            className="w-full flex items-center justify-center space-x-2 bg-transparent text-on-surface-variant/60 hover:text-primary text-[10px] font-bold uppercase tracking-widest py-2 rounded-sm transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ver Sitio Web</span>
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              logoutUser();
              onLogout();
              setView("landing");
            }}
            className="w-full flex items-center justify-center space-x-2 bg-transparent hover:bg-primary/5 text-primary hover:text-red-600 text-[10px] font-bold uppercase tracking-widest py-3 rounded-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden bg-[#faf6f6] w-full">
        {/* Top Header - Responsive */}
        <header className="h-14 md:h-16 border-b border-outline-variant/20 px-4 md:px-8 flex items-center justify-between shrink-0 bg-white shadow-xs z-10">
          <div className="flex items-center space-x-3 min-w-0">
            {/* Hamburger Button (Mobile Only) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 -ml-1 text-on-surface hover:text-primary rounded-sm md:hidden"
              aria-label="Abrir menú"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-on-surface-variant/80 font-mono truncate">
              {tab === "dashboard" && "Resumen General"}
              {tab === "dishes" && "Gestión de Carta"}
              {tab === "promotions" && "Anuncios y Promos"}
              {tab === "orders" && "Historial de Pedidos"}
              {tab === "contact" && "Configuración y Contacto"}
              {tab === "loyalty" && "🎯 Fidelización de Clientes"}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <button
              onClick={() => setView("landing")}
              className="md:hidden p-2 text-on-surface-variant hover:text-primary"
              title="Ver Sitio Web"
            >
              <Eye className="w-4 h-4" />
            </button>
            <span className="hidden sm:inline text-xs text-on-surface-variant/70">Conectado:</span>
            <span className="text-[10px] sm:text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-sm">
              Admin
            </span>
          </div>
        </header>

        {/* Scrollable Viewport with mobile bottom navigation padding */}
        <div className="flex-grow p-3.5 sm:p-6 md:p-8 pb-24 md:pb-8 overflow-y-auto">
          {tab === "dashboard" && (
            <div className="space-y-8 animate-fade-in">
              {/* Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-white border border-outline-variant/20 p-6 rounded-sm space-y-2 shadow-xs">
                  <div className="flex justify-between items-center text-on-surface-variant/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Ingresos Totales</span>
                    <DollarSign className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-3xl font-bold font-sans text-primary">
                    {orders.reduce((sum, o) => sum + Number(o.total || 0), 0)} AED
                  </div>
                  <span className="text-[9px] text-on-surface-variant/40 block">Facturación total de pedidos</span>
                </div>

                <div className="bg-white border border-outline-variant/20 p-6 rounded-sm space-y-2 shadow-xs">
                  <div className="flex justify-between items-center text-on-surface-variant/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Platos en Carta</span>
                    <ClipboardList className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-on-surface">
                    {dishes.length}
                  </div>
                  <span className="text-[9px] text-on-surface-variant/40 block">Productos activos configurados</span>
                </div>

                <div className="bg-white border border-outline-variant/20 p-6 rounded-sm space-y-2 shadow-xs">
                  <div className="flex justify-between items-center text-on-surface-variant/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Pedidos Recibidos</span>
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-on-surface">
                    {orders.length}
                  </div>
                  <span className="text-[9px] text-on-surface-variant/40 block">Transacciones registradas</span>
                </div>

                <div className="bg-white border border-outline-variant/20 p-6 rounded-sm space-y-2 shadow-xs">
                  <div className="flex justify-between items-center text-on-surface-variant/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Promociones Activas</span>
                    <ImageIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-on-surface">
                    {promotions.length}
                  </div>
                  <span className="text-[9px] text-on-surface-variant/40 block">Anuncios en carrusel principal</span>
                </div>

              </div>

              {/* Middle Section: Recents and Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white border border-outline-variant/20 p-6 rounded-sm space-y-4 shadow-xs">
                  <h3 className="font-serif text-lg font-bold text-primary">Últimos Pedidos</h3>
                  
                  {orders.length === 0 ? (
                    <p className="text-xs text-on-surface-variant/40 py-8 text-center">No hay registros de pedidos.</p>
                  ) : (
                    <div className="divide-y divide-outline-variant/20 text-xs">
                      {orders.slice(0, 5).map((ord) => (
                        <div key={ord.id} className="py-3 flex justify-between items-center hover:bg-primary/5 px-2 transition-colors rounded-sm text-on-surface">
                          <div>
                            <span className="font-bold text-on-surface">{ord.customerName}</span>
                            <span className="text-on-surface-variant/40 mx-2">|</span>
                            <span className="text-on-surface-variant/70">{ord.id}</span>
                            <span className="block text-[10px] text-on-surface-variant/60 mt-0.5">
                              {new Date(ord.date).toLocaleString()} — {ord.paymentMethod}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-primary font-sans">{ord.total} AED</span>
                            <span className="block text-[9px] text-on-surface-variant/60 mt-0.5">
                              {ord.items.length} items
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Actions & System Info */}
                <div className="bg-white border border-outline-variant/20 p-6 rounded-sm space-y-6 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg font-bold text-primary">Acciones Rápidas</h3>
                    <div className="space-y-2.5">
                      <button
                        onClick={() => { setTab("dishes"); handleAddNewClick(); }}
                        className="w-full text-left flex items-center justify-between p-3 bg-[#faf6f6] border border-outline-variant/30 hover:border-primary/40 rounded-sm transition-all group"
                      >
                        <span className="text-xs text-on-surface-variant/80 group-hover:text-primary">Añadir Nuevo Plato</span>
                        <Plus className="w-4 h-4 text-primary" />
                      </button>

                      <button
                        onClick={() => { setTab("promotions"); handleAddNewPromoClick(); }}
                        className="w-full text-left flex items-center justify-between p-3 bg-[#faf6f6] border border-outline-variant/30 hover:border-primary/40 rounded-sm transition-all group"
                      >
                        <span className="text-xs text-on-surface-variant/80 group-hover:text-primary">Añadir Nueva Promo</span>
                        <Plus className="w-4 h-4 text-primary" />
                      </button>

                      <button
                        onClick={handleResetClick}
                        className="w-full text-left flex items-center justify-between p-3 bg-[#faf6f6] border border-outline-variant/30 hover:bg-primary/5 hover:border-primary/30 rounded-sm transition-all group"
                      >
                        <span className="text-xs text-primary/80 group-hover:text-primary">Restablecer Menú</span>
                        <RotateCcw className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-outline-variant/20 pt-4 mt-4 space-y-2">
                    <div className="flex justify-between items-center text-[10px] uppercase text-on-surface-variant/60">
                      <span>Estado del Sitio</span>
                      <span className="text-green-600 font-bold">● ACTIVO</span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant/60 leading-relaxed">
                      El sitio web está conectado correctamente en modo local persistente. Puedes descargar el archivo de datos para integrarlo permanentemente en Netlify.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 1. GESTIONAR PLATOS */}
          {tab === "dishes" && (
            <div className="space-y-6">
              
              {editingDish === null ? (
                // LIST VIEW
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-on-surface">Platos de la Carta</h3>
                    
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      <button
                        onClick={handleResetClick}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 border border-outline-variant/40 bg-white text-on-surface-variant font-bold text-xs uppercase px-3.5 py-2.5 tracking-wider hover:bg-[#faf6f6] transition-colors rounded-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restablecer</span>
                      </button>
                      <button
                        onClick={handleAddNewClick}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 bg-primary text-background font-bold text-xs uppercase px-4 py-2.5 tracking-wider hover:bg-primary-container transition-colors rounded-sm shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nuevo Plato</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4">
                    <input
                      type="text"
                      placeholder="🔍 Buscar plato por nombre o descripción..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-grow bg-white border border-outline-variant/20 px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm rounded-sm outline-none text-on-surface focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-white border border-outline-variant/20 px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm rounded-sm outline-none text-on-surface focus:border-primary"
                    >
                      <option value="all">Todas las Categorías</option>
                      {allCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {filteredDishes.length === 0 ? (
                    <div className="text-center py-12 bg-white border border-outline-variant/10 rounded-sm p-4">
                      <p className="text-sm text-on-surface-variant">No se encontraron platos con los criterios seleccionados.</p>
                    </div>
                  ) : (
                    <>
                      {/* Mobile Cards View (Hidden on Desktop) */}
                      <div className="block md:hidden space-y-3">
                        {filteredDishes.map((dish) => (
                          <div key={dish.id} className="bg-white border border-outline-variant/20 p-3.5 rounded-sm shadow-xs space-y-2.5">
                            <div className="flex space-x-3 items-start">
                              {dish.image ? (
                                <img
                                  src={dish.image}
                                  alt={dish.name}
                                  className="w-16 h-16 object-cover rounded-sm border border-outline-variant/20 shrink-0"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-surface-container flex items-center justify-center rounded-sm border border-outline-variant/20 text-xs font-serif italic text-primary/50 font-bold shrink-0">
                                  {dish.name.charAt(0)}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-1">
                                  <h4 className="font-serif font-bold text-sm text-on-surface truncate" title={dish.name}>
                                    {dish.name}
                                  </h4>
                                  <span className="font-mono font-bold text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-sm shrink-0">
                                    {dish.price} AED
                                  </span>
                                </div>
                                <span className="text-[9px] text-primary font-bold uppercase tracking-wider block mt-0.5">
                                  {CATEGORIES.find((c) => c.id === dish.category)?.name || dish.category}
                                </span>
                                {dish.description && (
                                  <p className="text-[11px] text-on-surface-variant/80 mt-1 line-clamp-2 leading-relaxed">
                                    {dish.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Mobile Action Buttons */}
                            <div className="flex border-t border-outline-variant/15 pt-2 space-x-2">
                              <button
                                onClick={() => handleEditClick(dish)}
                                className="flex-1 bg-surface-container hover:bg-primary/10 text-on-surface hover:text-primary font-bold text-xs py-2 rounded-sm transition-colors flex items-center justify-center space-x-1"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Editar</span>
                              </button>
                              <button
                                onClick={() => handleDeleteClick(dish.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-3 py-2 rounded-sm transition-colors flex items-center justify-center space-x-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Table View (Hidden on Mobile) */}
                      <div className="hidden md:block bg-white border border-outline-variant/20 rounded-sm overflow-x-auto shadow-xs">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                          <thead>
                            <tr className="border-b border-outline-variant/20 text-xs font-bold uppercase tracking-widest text-primary bg-surface-container-low">
                              <th className="p-4 pl-6 w-24">Imagen</th>
                              <th className="p-4">Nombre / Categoría</th>
                              <th className="p-4">Descripción</th>
                              <th className="p-4 w-28">Precio</th>
                              <th className="p-4 pr-6 text-right w-32">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm text-on-surface-variant divide-y divide-outline-variant/15">
                            {filteredDishes.map((dish) => (
                              <tr key={dish.id} className="hover:bg-primary/5 transition-colors">
                                <td className="p-4 pl-6">
                                  {dish.image ? (
                                    <img
                                      src={dish.image}
                                      alt={dish.name}
                                      className="w-16 h-12 object-cover rounded-sm border border-outline-variant/20 shadow-xs animate-fade-in"
                                    />
                                  ) : (
                                    <div className="w-16 h-12 bg-background flex items-center justify-center rounded-sm border border-outline-variant/20 text-[10px] font-bold text-on-surface-variant/40 select-none">
                                      {dish.name.charAt(0)}
                                    </div>
                                  )}
                                </td>
                                <td className="p-4">
                                  <div className="font-bold text-on-surface">{dish.name}</div>
                                  <div className="text-[10px] text-primary uppercase font-mono tracking-wider mt-0.5">
                                    {CATEGORIES.find((c) => c.id === dish.category)?.name || dish.category}
                                  </div>
                                </td>
                                <td className="p-4 text-xs text-on-surface-variant/80 max-w-xs truncate">
                                  {dish.description}
                                </td>
                                <td className="p-4 font-mono font-bold text-on-surface">
                                  {dish.price} AED
                                </td>
                                <td className="p-4 pr-6 text-right space-x-3">
                                  <button
                                    onClick={() => handleEditClick(dish)}
                                    className="inline-flex items-center text-on-surface-variant hover:text-primary transition-colors text-xs font-bold"
                                    title="Editar plato"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(dish.id)}
                                    className="inline-flex items-center text-primary hover:text-red-600 transition-colors text-xs font-bold"
                                    title="Eliminar plato"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </>
              ) : (
                // FORM VIEW (Create/Edit Dish)
                <div className="bg-white border border-outline-variant/20 p-8 rounded-sm shadow-sm max-w-3xl mx-auto space-y-8 animate-fade-in text-on-surface">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-primary">
                      {dishForm.id ? "Editar Plato del Menú" : "Añadir Nuevo Plato a la Carta"}
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Completa el formulario para actualizar el menú del restaurante.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Nombre del Plato</label>
                        <input
                          type="text"
                          required
                          name="name"
                          value={dishForm.name}
                          onChange={handleInputChange}
                          className="bg-background border border-outline-variant/30 text-on-surface px-4 py-3 text-sm rounded-sm outline-none focus:border-primary"
                        />
                      </div>
                      
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Precio (AED)</label>
                        <input
                          type="number"
                          required
                          name="price"
                          value={dishForm.price}
                          onChange={handleInputChange}
                          className="bg-background border border-outline-variant/30 text-on-surface px-4 py-3 text-sm rounded-sm outline-none focus:border-primary font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Categoría</label>
                        <select
                          name="category"
                          value={dishForm.category}
                          onChange={handleInputChange}
                          className="bg-background border border-outline-variant/30 text-on-surface px-4 py-3 text-sm rounded-sm outline-none focus:border-primary"
                        >
                          {allCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="O escribe una categoría nueva aquí (ej. postres, cocteles)..."
                          value={dishForm.category}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const catId = raw.toLowerCase().replace(/[^a-z0-9-]/g, "-");
                            setDishForm((prev) => ({ ...prev, category: catId }));
                          }}
                          className="bg-background border border-outline-variant/30 text-on-surface px-3 py-2 text-xs rounded-sm outline-none mt-1 font-mono placeholder:font-sans"
                        />
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Etiquetas (separadas por coma)</label>
                        <input
                          type="text"
                          name="tags"
                          placeholder="Fuego Lento, Queso, Popular..."
                          value={dishForm.tags}
                          onChange={handleInputChange}
                          className="bg-background border border-outline-variant/30 text-on-surface px-4 py-3 text-sm rounded-sm outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Descripción del Plato</label>
                      <textarea
                        required
                        name="description"
                        rows="3"
                        value={dishForm.description}
                        onChange={handleInputChange}
                        className="bg-background border border-outline-variant/30 text-on-surface px-4 py-3 text-sm rounded-sm outline-none focus:border-primary"
                      />
                    </div>

                    {/* Image Selector Section */}
                    <div className="p-4 bg-surface-container border border-outline-variant/20 rounded-sm space-y-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">
                        Método para cambiar la foto del plato
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 1. Banco de fotos preset */}
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">1. Elegir del Banco de Fotos</label>
                          <select
                            value={imagePreset}
                            onChange={handlePresetChange}
                            className="bg-background border border-outline-variant/30 text-on-surface px-3 py-2 text-xs rounded-sm outline-none w-full"
                          >
                            <option value="custom">— Subir Archivo o URL —</option>
                            {IMAGE_BANK.map((filename) => {
                              const path = `/images/${filename}`;
                              return (
                                <option key={filename} value={path}>
                                  {filename.replace(/\.[^/.]+$/, "").replace(/_/g, " ")}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {/* 2. Subida de archivo local */}
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">2. Subir desde Dispositivo</label>
                          <input
                            type="file"
                            accept="image/*"
                            id="upload-dish-image"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="upload-dish-image"
                            className="bg-background border border-outline-variant/30 text-on-surface px-3 py-2 text-xs rounded-sm outline-none text-center cursor-pointer hover:bg-surface-container hover:border-primary transition-colors font-bold uppercase tracking-wider block"
                          >
                            📁 Seleccionar Foto
                          </label>
                        </div>

                        {/* 3. URL de Internet */}
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">3. URL de Internet</label>
                          <input
                            type="text"
                            name="image"
                            placeholder="https://ejemplo.com/foto.jpg"
                            value={imagePreset === "custom" ? dishForm.image : ""}
                            onChange={(e) => {
                              setImagePreset("custom");
                              setIsCustomImage(true);
                              setDishForm((prev) => ({ ...prev, image: e.target.value }));
                            }}
                            className="bg-background border border-outline-variant/30 text-on-surface px-3 py-2 text-xs rounded-sm outline-none"
                          />
                        </div>
                      </div>

                      {/* Display image path & Base64 warning */}
                      <div className="flex flex-col space-y-1 border-t border-outline-variant/20 pt-3">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Ruta de la imagen activa:</label>
                        <input
                          type="text"
                          required
                          readOnly
                          name="image-display"
                          value={dishForm.image}
                          className="bg-surface-container-low/60 border border-outline-variant/10 text-on-surface-variant px-3 py-2 text-xs rounded-sm outline-none cursor-not-allowed w-full font-mono text-xs"
                        />
                        <span className="text-[8px] text-on-surface-variant/50">
                          *Nota: Al subir una imagen de tu dispositivo, se subirá de forma automática y permanente a la nube (Supabase Storage) si está configurado. De lo contrario, se usará el almacenamiento local temporal del navegador.
                        </span>
                      </div>
                    </div>

                    {/* Previsualización en Tiempo Real */}
                    <div className="mt-1 flex items-center space-x-4 p-4 bg-background border border-outline-variant/20 rounded-sm">
                      {dishForm.image ? (
                        <img
                          src={dishForm.image}
                          alt="Vista previa de plato"
                          className="w-24 h-16 object-cover rounded-sm border border-outline-variant/20 bg-surface-container"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "";
                          }}
                        />
                      ) : (
                        <div className="w-24 h-16 bg-surface-container-low flex items-center justify-center rounded-sm border border-outline-variant/20 text-xs font-serif italic text-primary/45 font-bold">
                          {dishForm.name ? dishForm.name.charAt(0) : "S"}
                        </div>
                      )}
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary block">
                          Vista Previa de la Foto
                        </span>
                        <span className="text-xs text-on-surface-variant/60 max-w-lg block truncate font-mono">
                          {dishForm.image || "Sin imagen (Se renderizará el fallback itálico de la marca)"}
                        </span>
                      </div>
                    </div>

                    {/* Opciones Personalizadas (Acompañamientos / Bebidas) */}
                    <div className="p-4 bg-surface-container border border-outline-variant/20 rounded-sm space-y-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">
                        Opciones Personalizables (Acompañamientos / Salsas / Bebida)
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Título de la Opción (Ej. Elige tu acompañamiento)</label>
                          <input
                            type="text"
                            name="optionsTitle"
                            placeholder="Ej. Elige tu acompañamiento o salsa"
                            value={dishForm.optionsTitle}
                            onChange={handleInputChange}
                            className="bg-background border border-outline-variant/30 text-on-surface px-3 py-2.5 text-xs rounded-sm outline-none focus:border-primary"
                          />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Opciones Disponibles (separadas por coma)</label>
                          <input
                            type="text"
                            name="optionsChoices"
                            placeholder="Ej. Papas Fritas, Yuca Frita, Patacón"
                            value={dishForm.optionsChoices}
                            onChange={handleInputChange}
                            className="bg-background border border-outline-variant/30 text-on-surface px-3 py-2.5 text-xs rounded-sm outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex space-x-3 pt-6 border-t border-outline-variant/20">
                      <button
                        type="submit"
                        className="flex-1 bg-primary text-background font-bold text-xs uppercase py-4 tracking-widest hover:bg-primary-container transition-colors rounded-sm shadow-md"
                      >
                        Guardar Plato
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingDish(null)}
                        className="flex-1 bg-transparent border border-outline-variant text-on-surface-variant font-bold text-xs uppercase py-4 tracking-widest hover:bg-surface-container transition-colors rounded-sm"
                      >
                        Cancelar
                      </button>
                    </div>

                  </form>
                </div>
              )}
            </div>
          )}

          {/* 2. GESTIONAR PROMOCIONES */}
          {tab === "promotions" && (
            <div className="space-y-6">
              {editingPromo === null ? (
                // LIST VIEW
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-on-surface">Promociones Activas</h3>
                    
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      <button
                        onClick={handleResetPromotionsClick}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 border border-outline-variant/40 bg-[#ffffff] text-on-surface-variant font-bold text-xs uppercase px-3.5 py-2.5 tracking-wider hover:bg-[#faf6f6] transition-colors rounded-sm"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restablecer</span>
                      </button>
                      <button
                        onClick={handleAddNewPromoClick}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 bg-primary text-background font-bold text-xs uppercase px-4 py-2.5 tracking-wider hover:bg-primary-container transition-colors rounded-sm shadow-md"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nueva Promo</span>
                      </button>
                    </div>
                  </div>

                  {promotions.length === 0 ? (
                    <div className="text-center py-12 bg-white border border-outline-variant/10 rounded-sm p-4">
                      <p className="text-sm text-on-surface-variant">No hay promociones configuradas.</p>
                    </div>
                  ) : (
                    <>
                      {/* Mobile Cards View for Promos */}
                      <div className="block md:hidden space-y-3">
                        {promotions.map((promo, idx) => (
                          <div key={promo.id || idx} className="bg-white border border-outline-variant/20 p-3.5 rounded-sm shadow-xs space-y-3">
                            <div className="flex space-x-3 items-start">
                              {promo.image ? (
                                <img
                                  src={promo.image}
                                  alt="Promoción"
                                  className="w-20 h-14 object-cover rounded-sm border border-outline-variant/20 shrink-0"
                                />
                              ) : (
                                <div className="w-20 h-14 bg-surface-container flex items-center justify-center rounded-sm border border-outline-variant/20 text-[9px] font-bold uppercase text-on-surface-variant/50 select-none shrink-0">
                                  Sin foto
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-on-surface text-xs leading-relaxed line-clamp-3">
                                  {promo.text}
                                </p>
                              </div>
                            </div>

                            <div className="flex border-t border-outline-variant/15 pt-2 space-x-2">
                              <button
                                onClick={() => handleEditPromoClick(promo)}
                                className="flex-1 bg-surface-container hover:bg-primary/10 text-on-surface hover:text-primary font-bold text-xs py-2 rounded-sm transition-colors flex items-center justify-center space-x-1"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Editar</span>
                              </button>
                              <button
                                onClick={() => handleDeletePromoClick(promo.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs px-3 py-2 rounded-sm transition-colors flex items-center justify-center space-x-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Table View */}
                      <div className="hidden md:block bg-white border border-outline-variant/20 rounded-sm overflow-x-auto shadow-xs">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                          <thead>
                            <tr className="border-b border-outline-variant/20 text-xs font-bold uppercase tracking-widest text-primary bg-surface-container-low">
                              <th className="p-4 pl-6 w-32">Imagen</th>
                              <th className="p-4">Texto de la Promoción</th>
                              <th className="p-4 pr-6 text-right w-32">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm text-on-surface-variant divide-y divide-outline-variant/15">
                            {promotions.map((promo, idx) => (
                              <tr key={promo.id || idx} className="hover:bg-primary/5 transition-colors">
                                <td className="p-4 pl-6">
                                  {promo.image ? (
                                    <img
                                      src={promo.image}
                                      alt="Promoción"
                                      className="w-24 h-16 object-cover rounded-sm border border-outline-variant/20 shadow-xs"
                                    />
                                  ) : (
                                    <div className="w-24 h-16 bg-background flex items-center justify-center rounded-sm border border-outline-variant/20 text-[9px] font-bold uppercase text-on-surface-variant/50 select-none">
                                      Sin foto
                                    </div>
                                  )}
                                </td>
                                <td className="p-4 font-bold text-on-surface text-sm leading-relaxed max-w-md">
                                  {promo.text}
                                </td>
                                <td className="p-4 pr-6 text-right space-x-3">
                                  <button
                                    onClick={() => handleEditPromoClick(promo)}
                                    className="inline-flex items-center text-on-surface-variant hover:text-primary transition-colors text-xs font-bold"
                                    title="Editar promoción"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePromoClick(promo.id)}
                                    className="inline-flex items-center text-primary hover:text-red-600 transition-colors text-xs font-bold"
                                    title="Eliminar promoción"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </>
              ) : (
                // FORM VIEW (Create/Edit Promo)
                <div className="bg-white border border-outline-variant/20 p-8 rounded-sm shadow-sm max-w-2xl mx-auto space-y-8 animate-fade-in text-on-surface">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-primary">
                      {promoForm.id ? "Editar Promoción" : "Crear Nueva Promoción"}
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Configura los detalles de la diapositiva promocional. Se actualizará en el carrusel principal inmediatamente.
                    </p>
                  </div>

                  <form onSubmit={handlePromoSubmit} className="space-y-6">
                    
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Texto de la Promoción</label>
                      <textarea
                        required
                        name="text"
                        rows="3"
                        value={promoForm.text}
                        onChange={handlePromoInputChange}
                        placeholder="Ej. ¡Platos fuertes con 20% de descuento este fin de semana!"
                        className="bg-background border border-outline-variant/30 text-on-surface px-4 py-3 text-sm rounded-sm outline-none focus:border-primary"
                      />
                    </div>

                    {/* Promo Image Management Section */}
                    <div className="p-4 bg-surface-container border border-outline-variant/20 rounded-sm space-y-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">
                        Método para cambiar la foto de la promoción
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Predefined select */}
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">1. Elegir del Banco de Fotos</label>
                          <select
                            value={promoImagePreset}
                            onChange={handlePromoPresetChange}
                            className="bg-background border border-outline-variant/30 text-on-surface px-3 py-2 text-xs rounded-sm outline-none w-full"
                          >
                            <option value="custom">— Subida o URL de Internet —</option>
                            {PROMO_IMAGE_BANK.map((filename) => {
                              const path = `/images/${filename}`;
                              return (
                                <option key={filename} value={path}>
                                  {filename.replace(/\.[^/.]+$/, "").replace(/_/g, " ")}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {/* Upload button */}
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">2. Subir desde Dispositivo</label>
                          <input
                            type="file"
                            accept="image/*"
                            id="upload-promo-image"
                            onChange={handlePromoFileChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="upload-promo-image"
                            className="bg-background border border-outline-variant/30 text-on-surface px-3 py-2 text-xs rounded-sm outline-none text-center cursor-pointer hover:bg-surface-container hover:border-primary transition-colors font-bold uppercase tracking-wider block"
                          >
                            📁 Seleccionar Archivo
                          </label>
                        </div>

                        {/* Internet URL input */}
                        <div className="flex flex-col space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">3. URL de Internet</label>
                          <input
                            type="text"
                            name="image"
                            placeholder="https://ejemplo.com/foto.jpg"
                            value={promoImagePreset === "custom" ? promoForm.image : ""}
                            onChange={(e) => {
                              setPromoImagePreset("custom");
                              setIsCustomPromoImage(true);
                              setPromoForm((prev) => ({ ...prev, image: e.target.value }));
                            }}
                            className="bg-background border border-outline-variant/30 text-on-surface px-3 py-2 text-xs rounded-sm outline-none"
                          />
                        </div>
                      </div>

                      {/* Image Path display & note */}
                      <div className="flex flex-col space-y-1 border-t border-outline-variant/20 pt-3">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Ruta actual de la imagen:</label>
                        <input
                          type="text"
                          required
                          readOnly
                          name="image-display"
                          value={promoForm.image}
                          className="bg-surface-container-low/60 border border-outline-variant/10 text-on-surface-variant px-3 py-2 text-xs rounded-sm outline-none cursor-not-allowed w-full font-mono text-xs"
                        />
                        <span className="text-[8px] text-on-surface-variant/50">
                          *Nota: Al subir una imagen de tu dispositivo, se subirá de forma automática y permanente a la nube (Supabase Storage) si está configurado. De lo contrario, se convertirá localmente a formato Base64.
                        </span>
                      </div>
                    </div>

                    {/* Real-time image preview */}
                    <div className="mt-1 flex items-center space-x-4 p-3 bg-background border border-outline-variant/20 rounded-sm">
                      {promoForm.image ? (
                        <img
                          src={promoForm.image}
                          alt="Vista previa de promoción"
                          className="w-24 h-16 object-cover rounded-sm border border-outline-variant/30 bg-surface-container"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "";
                          }}
                        />
                      ) : (
                        <div className="w-24 h-16 bg-surface-container-low flex items-center justify-center rounded-sm border border-outline-variant/20 text-xs font-bold text-on-surface-variant/50 select-none">
                          Sin foto
                        </div>
                      )}
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary block">
                          Vista Previa del Anuncio
                        </span>
                        <span className="text-xs text-on-surface-variant/60 max-w-md block truncate font-mono">
                          {promoForm.image || "Sin imagen asignada (se mostrará el fondo gris por defecto)"}
                        </span>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex space-x-3 pt-6 border-t border-outline-variant/20">
                      <button
                        type="submit"
                        className="flex-1 bg-primary text-background font-bold text-xs uppercase py-4 tracking-widest hover:bg-primary-container transition-all rounded-sm shadow-md"
                      >
                        Guardar Promoción
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingPromo(null)}
                        className="flex-1 bg-transparent border border-outline-variant text-on-surface-variant font-bold text-xs uppercase py-4 tracking-widest hover:bg-surface-container transition-colors rounded-sm"
                      >
                        Cancelar
                      </button>
                    </div>

                  </form>
                </div>
              )}
            </div>
          )}

          {/* 3. HISTORIAL PEDIDOS */}
          {tab === "orders" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
                <h3 className="font-serif text-2xl font-bold text-primary">Historial de Pedidos Recibidos</h3>
                <span className="text-xs text-on-surface-variant bg-white border border-outline-variant/20 px-3 py-1.5 rounded-sm font-mono font-bold">
                  Total Pedidos: {orders.length}
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-16 bg-white border border-outline-variant/10 rounded-sm">
                  <p className="text-sm text-on-surface-variant">No se han registrado pedidos en línea todavía.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-white border border-outline-variant/20 p-6 rounded-sm space-y-4 shadow-xs flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start border-b border-outline-variant/20 pb-3">
                          <div>
                            <span className="font-serif font-bold text-lg text-primary">
                              {ord.customerName}
                            </span>
                            <span className="block text-[10px] text-on-surface-variant/50 font-mono mt-0.5">
                              ID: {ord.id} — {new Date(ord.date).toLocaleString()}
                            </span>
                          </div>
                          <span className="bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm">
                            Completado
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary">
                            Detalles del Pedido
                          </h4>
                          <ul className="text-xs text-on-surface-variant/80 space-y-1 divide-y divide-outline-variant/15">
                            {ord.items.map((item, i) => (
                              <li key={i} className="pt-1 flex justify-between">
                                <span>
                                  <span className="font-bold text-on-surface">{item.qty}x</span> {item.name}
                                  {item.selectedOption && (
                                    <span className="text-[10px] text-on-surface-variant/50 block pl-4 italic">
                                      ({item.selectedOption})
                                    </span>
                                  )}
                                </span>
                                <span className="font-mono text-on-surface-variant/80">{item.price * item.qty} AED</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="border-t border-outline-variant/20 pt-3 space-y-1">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary">
                            Envío & Pago
                          </h4>
                          <p className="text-xs text-on-surface-variant/80 leading-relaxed">
                            📍 <span className="font-bold text-on-surface">Dirección:</span> {ord.customerAddress}
                          </p>
                          <p className="text-xs text-on-surface-variant/80">
                            📞 <span className="font-bold text-on-surface">WhatsApp:</span> {ord.customerPhone}
                          </p>
                          <p className="text-xs text-on-surface-variant/80">
                            💳 <span className="font-bold text-on-surface">Pago:</span> {ord.paymentMethod}
                          </p>
                        </div>

                        <div className="border-t border-outline-variant/20 pt-3 flex justify-between items-end">
                          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/50">Total</span>
                          <span className="font-sans font-bold text-xl text-primary">{ord.total} AED</span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. DATOS DE CONTACTO */}
          {tab === "contact" && (
            <div className="bg-white border border-outline-variant/20 p-8 rounded-sm shadow-sm max-w-3xl mx-auto space-y-8 animate-fade-in text-on-surface">
              <div>
                <h3 className="font-serif text-2xl font-bold text-primary">
                  Datos de Contacto del Restaurante
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Administra la información de contacto pública mostrada en el sitio web (teléfono, correo, dirección y enlaces a redes sociales).
                </p>
              </div>

              <form onSubmit={handleInfoSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Nombre Comercial</label>
                    <input
                      type="text"
                      required
                      name="name"
                      value={infoForm.name}
                      onChange={handleInfoInputChange}
                      className="bg-background border border-outline-variant/30 text-on-surface px-4 py-3 text-sm rounded-sm outline-none focus:border-primary"
                    />
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Teléfono / WhatsApp (ej. +971568460179)</label>
                    <input
                      type="text"
                      required
                      name="phone"
                      value={infoForm.phone}
                      onChange={handleInfoInputChange}
                      className="bg-background border border-outline-variant/30 text-on-surface px-4 py-3 text-sm rounded-sm outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Dirección Física</label>
                    <input
                      type="text"
                      required
                      name="address"
                      value={infoForm.address}
                      onChange={handleInfoInputChange}
                      className="bg-background border border-outline-variant/30 text-on-surface px-4 py-3 text-sm rounded-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Correo Electrónico de Información</label>
                    <input
                      type="email"
                      required
                      name="email"
                      value={infoForm.email}
                      onChange={handleInfoInputChange}
                      className="bg-background border border-outline-variant/30 text-on-surface px-4 py-3 text-sm rounded-sm outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>

                <div className="border-t border-outline-variant/20 pt-6 space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">
                    Enlaces de Redes Sociales
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Instagram</label>
                      <input
                        type="url"
                        name="instagram"
                        value={infoForm.instagram}
                        onChange={handleInfoInputChange}
                        className="bg-background border border-outline-variant/30 text-on-surface px-3 py-2 text-xs rounded-sm outline-none focus:border-primary"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">TikTok</label>
                      <input
                        type="url"
                        name="tiktok"
                        value={infoForm.tiktok}
                        onChange={handleInfoInputChange}
                        className="bg-background border border-outline-variant/30 text-on-surface px-3 py-2 text-xs rounded-sm outline-none focus:border-primary"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Facebook</label>
                      <input
                        type="url"
                        name="facebook"
                        value={infoForm.facebook}
                        onChange={handleInfoInputChange}
                        className="bg-background border border-outline-variant/30 text-on-surface px-3 py-2 text-xs rounded-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-outline-variant/20 pt-6 space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">
                    Configuración de Pedidos & Pagos
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Precio Domicilio / Delivery Fee (AED)</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        name="deliveryFee"
                        value={infoForm.deliveryFee != null ? infoForm.deliveryFee : 20}
                        onChange={handleInfoInputChange}
                        className="bg-background border border-outline-variant/30 text-on-surface px-4 py-3 text-sm rounded-sm outline-none focus:border-primary font-mono"
                      />
                    </div>

                    <div className="flex flex-col justify-center space-y-2 p-3.5 bg-surface-container-low border border-outline-variant/20 rounded-sm">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="cardPaymentEnabled"
                          checked={!!infoForm.cardPaymentEnabled}
                          onChange={(e) => setInfoForm(prev => ({ ...prev, cardPaymentEnabled: e.target.checked }))}
                          className="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary mt-0.5"
                        />
                        <div>
                          <span className="text-xs font-bold text-on-surface block">Activar Pasarela de Pago Online (Tarjeta / Stripe)</span>
                          <span className="text-[10px] text-on-surface-variant/70 block mt-0.5">
                            {infoForm.cardPaymentEnabled 
                              ? "🟢 Activado: Los clientes pueden pagar con tarjeta o efectivo." 
                              : "🔴 Desactivado: El sistema funciona únicamente con pedido por ticket al WhatsApp / Efectivo contra entrega."}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-outline-variant/20 pt-6 space-y-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">
                    Textos del Encabezado Principal (Hero Section) & Horarios
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Etiqueta Superior (Hero Badge)</label>
                      <input
                        type="text"
                        name="heroBadge"
                        value={infoForm.heroBadge}
                        onChange={handleInfoInputChange}
                        placeholder="Ej. Tradición, Pasión y Sabor"
                        className="bg-background border border-outline-variant/30 text-on-surface px-4 py-3 text-sm rounded-sm outline-none focus:border-primary"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Horario de Atención Público</label>
                      <input
                        type="text"
                        name="schedule"
                        value={infoForm.schedule}
                        onChange={handleInfoInputChange}
                        placeholder="Ej. Lunes a Domingo: 11:00 AM - 11:00 PM"
                        className="bg-background border border-outline-variant/30 text-on-surface px-4 py-3 text-sm rounded-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Título Principal del Banner (Hero Title)</label>
                    <input
                      type="text"
                      name="heroTitle"
                      value={infoForm.heroTitle}
                      onChange={handleInfoInputChange}
                      placeholder="Ej. El Alma de Colombia en tu Mesa."
                      className="bg-background border border-outline-variant/30 text-on-surface px-4 py-3 text-sm rounded-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Subtítulo Principal del Banner (Hero Subtitle)</label>
                    <textarea
                      name="heroSubtitle"
                      rows="2"
                      value={infoForm.heroSubtitle}
                      onChange={handleInfoInputChange}
                      placeholder="Ej. Una experiencia gastronómica que fusiona la tradición andina..."
                      className="bg-background border border-outline-variant/30 text-on-surface px-4 py-3 text-sm rounded-sm outline-none focus:border-primary resize-y leading-relaxed"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Aviso de Alérgenos (Barra Lateral del Menú)</label>
                    <textarea
                      name="allergenNotice"
                      rows="2"
                      value={infoForm.allergenNotice}
                      onChange={handleInfoInputChange}
                      placeholder="Ej. Si sufres de alergias alimenticias, indícalo en el formulario..."
                      className="bg-background border border-outline-variant/30 text-on-surface px-4 py-3 text-sm rounded-sm outline-none focus:border-primary resize-y leading-relaxed"
                    />
                  </div>
                </div>

                <div className="border-t border-outline-variant/20 pt-6 space-y-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">
                    Nuestra Historia & Imágenes de la Página
                  </span>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Título de la Historia</label>
                    <input
                      type="text"
                      name="storyTitle"
                      value={infoForm.storyTitle}
                      onChange={handleInfoInputChange}
                      className="bg-background border border-outline-variant/30 text-on-surface px-4 py-3 text-sm rounded-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Texto de la Historia</label>
                    <textarea
                      name="storyText"
                      rows="6"
                      value={infoForm.storyText}
                      onChange={handleInfoInputChange}
                      className="bg-background border border-outline-variant/30 text-on-surface px-4 py-3 text-sm rounded-sm outline-none focus:border-primary resize-y leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Punto Clave 1 (Título)</label>
                      <input
                        type="text"
                        name="storyPoint1Title"
                        value={infoForm.storyPoint1Title}
                        onChange={handleInfoInputChange}
                        className="bg-background border border-outline-variant/30 text-on-surface px-3 py-2 text-xs rounded-sm outline-none focus:border-primary"
                      />
                      <label className="text-[9px] text-on-surface-variant/70 mt-1">Descripción</label>
                      <input
                        type="text"
                        name="storyPoint1Desc"
                        value={infoForm.storyPoint1Desc}
                        onChange={handleInfoInputChange}
                        className="bg-background border border-outline-variant/20 text-on-surface px-3 py-2 text-xs rounded-sm outline-none focus:border-primary"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Punto Clave 2 (Título)</label>
                      <input
                        type="text"
                        name="storyPoint2Title"
                        value={infoForm.storyPoint2Title}
                        onChange={handleInfoInputChange}
                        className="bg-background border border-outline-variant/30 text-on-surface px-3 py-2 text-xs rounded-sm outline-none focus:border-primary"
                      />
                      <label className="text-[9px] text-on-surface-variant/70 mt-1">Descripción</label>
                      <input
                        type="text"
                        name="storyPoint2Desc"
                        value={infoForm.storyPoint2Desc}
                        onChange={handleInfoInputChange}
                        className="bg-background border border-outline-variant/20 text-on-surface px-3 py-2 text-xs rounded-sm outline-none focus:border-primary"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Punto Clave 3 (Título)</label>
                      <input
                        type="text"
                        name="storyPoint3Title"
                        value={infoForm.storyPoint3Title}
                        onChange={handleInfoInputChange}
                        className="bg-background border border-outline-variant/30 text-on-surface px-3 py-2 text-xs rounded-sm outline-none focus:border-primary"
                      />
                      <label className="text-[9px] text-on-surface-variant/70 mt-1">Descripción</label>
                      <input
                        type="text"
                        name="storyPoint3Desc"
                        value={infoForm.storyPoint3Desc}
                        onChange={handleInfoInputChange}
                        className="bg-background border border-outline-variant/20 text-on-surface px-3 py-2 text-xs rounded-sm outline-none focus:border-primary"
                      />
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Punto Clave 4 (Título)</label>
                      <input
                        type="text"
                        name="storyPoint4Title"
                        value={infoForm.storyPoint4Title}
                        onChange={handleInfoInputChange}
                        className="bg-background border border-outline-variant/30 text-on-surface px-3 py-2 text-xs rounded-sm outline-none focus:border-primary"
                      />
                      <label className="text-[9px] text-on-surface-variant/70 mt-1">Descripción</label>
                      <input
                        type="text"
                        name="storyPoint4Desc"
                        value={infoForm.storyPoint4Desc}
                        onChange={handleInfoInputChange}
                        className="bg-background border border-outline-variant/20 text-on-surface px-3 py-2 text-xs rounded-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="border-t border-outline-variant/10 pt-4 space-y-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                      Imágenes del Bento Grid (Sección Historia)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col space-y-2 border border-outline-variant/15 p-3 rounded-sm bg-surface-container-low">
                        <label className="text-[9px] font-bold uppercase text-on-surface-variant">Imagen 1 (Grande vertical - Chef)</label>
                        <div className="flex items-center space-x-3">
                          {infoForm.gridImage1 && (
                            <img src={infoForm.gridImage1} className="w-12 h-16 object-cover rounded-sm border border-outline-variant/20" />
                          )}
                          <div className="flex-grow">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleGridImageChange(e, "gridImage1")}
                              className="text-xs text-on-surface-variant"
                            />
                            <span className="text-[8px] text-on-surface-variant/40 block mt-1 truncate max-w-[200px]">URL: {infoForm.gridImage1 || 'Por defecto'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 border border-outline-variant/15 p-3 rounded-sm bg-surface-container-low">
                        <label className="text-[9px] font-bold uppercase text-on-surface-variant">Imagen 2 (Cuadrada - Banner)</label>
                        <div className="flex items-center space-x-3">
                          {infoForm.gridImage2 && (
                            <img src={infoForm.gridImage2} className="w-12 h-12 object-cover rounded-sm border border-outline-variant/20" />
                          )}
                          <div className="flex-grow">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleGridImageChange(e, "gridImage2")}
                              className="text-xs text-on-surface-variant"
                            />
                            <span className="text-[8px] text-on-surface-variant/40 block mt-1 truncate max-w-[200px]">URL: {infoForm.gridImage2 || 'Por defecto'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 border border-outline-variant/15 p-3 rounded-sm bg-surface-container-low">
                        <label className="text-[9px] font-bold uppercase text-on-surface-variant">Imagen 3 (Cuadrada - Empanada)</label>
                        <div className="flex items-center space-x-3">
                          {infoForm.gridImage3 && (
                            <img src={infoForm.gridImage3} className="w-12 h-12 object-cover rounded-sm border border-outline-variant/20" />
                          )}
                          <div className="flex-grow">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleGridImageChange(e, "gridImage3")}
                              className="text-xs text-on-surface-variant"
                            />
                            <span className="text-[8px] text-on-surface-variant/40 block mt-1 truncate max-w-[200px]">URL: {infoForm.gridImage3 || 'Por defecto'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 border border-outline-variant/15 p-3 rounded-sm bg-surface-container-low">
                        <label className="text-[9px] font-bold uppercase text-on-surface-variant">Imagen 4 (Grande vertical - Deliveroo)</label>
                        <div className="flex items-center space-x-3">
                          {infoForm.gridImage4 && (
                            <img src={infoForm.gridImage4} className="w-12 h-16 object-cover rounded-sm border border-outline-variant/20" />
                          )}
                          <div className="flex-grow">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleGridImageChange(e, "gridImage4")}
                              className="text-xs text-on-surface-variant"
                            />
                            <span className="text-[8px] text-on-surface-variant/40 block mt-1 truncate max-w-[200px]">URL: {infoForm.gridImage4 || 'Por defecto'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-3 pt-6 border-t border-outline-variant/20">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-background font-bold text-xs uppercase py-4 tracking-widest hover:bg-primary-container transition-colors rounded-sm shadow-md"
                  >
                    Guardar Cambios de Contacto
                  </button>
                  <button
                    type="button"
                    onClick={handleInfoReset}
                    className="flex-1 bg-transparent border border-outline-variant text-on-surface-variant font-bold text-xs uppercase py-4 tracking-widest hover:bg-surface-container transition-colors rounded-sm"
                  >
                    Restablecer de Fábrica
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* ── LOYALTY TAB ── */}
          {tab === "loyalty" && (
            <div className="space-y-8 animate-fade-in">

              {/* ── Delivery Rates Section ── */}
              <div className="bg-white border border-outline-variant/20 p-6 rounded-sm shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">Tarifas de Delivery por Distancia</h3>
                  </div>
                  {deliverySaveMsg && <span className="text-[10px] text-emerald-600 font-bold">{deliverySaveMsg}</span>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold uppercase text-on-surface-variant">Radio Máx. de Delivery (km)</label>
                    <input type="number" min="1" max="100"
                      value={deliveryRatesForm.maxKm}
                      onChange={(e) => setDeliveryRatesForm(prev => ({ ...prev, maxKm: Number(e.target.value) }))}
                      className="bg-surface-container border border-outline-variant/30 text-on-surface px-3 py-2 text-sm rounded-sm outline-none focus:border-primary" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] font-bold uppercase text-on-surface-variant">Mínimo para Envío Gratis (AED, 0 = desactivado)</label>
                    <input type="number" min="0"
                      value={deliveryRatesForm.freeDeliveryMin}
                      onChange={(e) => setDeliveryRatesForm(prev => ({ ...prev, freeDeliveryMin: Number(e.target.value) }))}
                      className="bg-surface-container border border-outline-variant/30 text-on-surface px-3 py-2 text-sm rounded-sm outline-none focus:border-primary" />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant">Tramos de Tarifa</p>
                  {deliveryRatesForm.rates.map((tier, i) => (
                    <div key={i} className="flex items-center space-x-2 bg-surface-container p-3 rounded-sm border border-outline-variant/15">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[9px] uppercase text-on-surface-variant/60">Desde (km)</label>
                          <input type="number" min="0" value={tier.minKm}
                            onChange={(e) => handleDeliveryRateChange(i, "minKm", e.target.value)}
                            className="w-full bg-white border border-outline-variant/30 px-2 py-1.5 text-xs rounded-sm outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase text-on-surface-variant/60">Hasta (km)</label>
                          <input type="number" min="0" value={tier.maxKm}
                            onChange={(e) => handleDeliveryRateChange(i, "maxKm", e.target.value)}
                            className="w-full bg-white border border-outline-variant/30 px-2 py-1.5 text-xs rounded-sm outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase text-on-surface-variant/60">Tarifa (AED)</label>
                          <input type="number" min="0" value={tier.fee}
                            onChange={(e) => handleDeliveryRateChange(i, "fee", e.target.value)}
                            className="w-full bg-white border border-outline-variant/30 px-2 py-1.5 text-xs rounded-sm outline-none" />
                        </div>
                      </div>
                      <button onClick={() => handleRemoveDeliveryTier(i)}
                        className="text-red-500 hover:text-red-700 p-1" title="Eliminar tramo">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={handleAddDeliveryTier}
                    className="w-full border border-dashed border-outline-variant text-on-surface-variant text-xs py-2 rounded-sm hover:bg-surface-container transition-colors">
                    + Agregar Tramo
                  </button>
                </div>

                <button onClick={handleDeliveryRateSave}
                  className="w-full bg-primary text-background font-bold text-xs uppercase py-3 tracking-widest hover:bg-primary-container transition-colors rounded-sm">
                  Guardar Tarifas de Delivery
                </button>
              </div>

              {/* ── Loyalty Cards Section ── */}
              <div className="bg-white border border-outline-variant/20 p-6 rounded-sm shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface">Tarjetas de Fidelización ({loyaltyCards.length})</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {loyaltySaveMsg && <span className="text-[10px] text-emerald-600 font-bold">{loyaltySaveMsg}</span>}
                    <button onClick={loadLoyaltyCards}
                      disabled={loyaltyLoading}
                      className="flex items-center space-x-1 text-[10px] font-bold bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-sm hover:bg-primary/20 transition-colors">
                      {loyaltyLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                      <span>Recargar</span>
                    </button>
                  </div>
                </div>

                {/* Search */}
                <input
                  type="text"
                  placeholder="Buscar por nombre o teléfono..."
                  value={loyaltySearch}
                  onChange={(e) => setLoyaltySearch(e.target.value)}
                  className="w-full bg-surface-container border border-outline-variant/30 px-4 py-2.5 text-sm rounded-sm outline-none focus:border-primary"
                />

                {loyaltyLoading && (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}

                {!loyaltyLoading && loyaltyCards.length === 0 && (
                  <div className="text-center py-10 text-on-surface-variant/60">
                    <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Todavía no hay clientes con tarjeta de fidelización.</p>
                    <p className="text-xs mt-1 opacity-70">Se crean automáticamente cuando un cliente completa su primer pedido.</p>
                  </div>
                )}

                {!loyaltyLoading && loyaltyCards
                  .filter(c => !loyaltySearch ||
                    c.phone.includes(loyaltySearch) ||
                    c.customerName.toLowerCase().includes(loyaltySearch.toLowerCase()))
                  .map(card => (
                    <div key={card.phone} className="border border-outline-variant/20 rounded-sm p-4 space-y-3 bg-surface-container-low">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-sm text-on-surface">{card.customerName || "Sin nombre"}</p>
                          <p className="text-xs text-on-surface-variant">{card.phone}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {card.rewardReady && (
                            <span className="text-[9px] font-bold bg-amber-400 text-white px-2 py-0.5 rounded-full uppercase">🎁 Premio Listo</span>
                          )}
                          <span className="text-[10px] bg-surface-container px-2 py-0.5 rounded-sm border border-outline-variant/20 font-mono">{card.stamps}/10</span>
                          <span className="text-[9px] text-on-surface-variant/60">{card.cyclesCompleted} ciclo(s)</span>
                        </div>
                      </div>

                      {/* Stamp dots */}
                      <div className="flex space-x-1.5">
                        {Array.from({length: 10}).map((_, i) => (
                          <div key={i} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[9px] ${i < card.stamps ? "bg-amber-400 border-amber-500 text-white" : "bg-white border-amber-200 text-amber-200"}`}>
                            {i < card.stamps ? "✓" : i+1}
                          </div>
                        ))}
                      </div>

                      {/* Edit row */}
                      {editingLoyalty === card.phone ? (
                        <div className="pt-2 border-t border-outline-variant/20 space-y-3">
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-[9px] uppercase font-bold text-on-surface-variant">Sellos (0-9)</label>
                              <input type="number" min="0" max="9"
                                defaultValue={card.stamps}
                                id={`stamps-${card.phone}`}
                                className="w-full border border-outline-variant/30 bg-white px-2 py-1.5 text-xs rounded-sm outline-none" />
                            </div>
                            <div>
                              <label className="text-[9px] uppercase font-bold text-on-surface-variant">Ciclos</label>
                              <input type="number" min="0"
                                defaultValue={card.cyclesCompleted}
                                id={`cycles-${card.phone}`}
                                className="w-full border border-outline-variant/30 bg-white px-2 py-1.5 text-xs rounded-sm outline-none" />
                            </div>
                            <div className="flex flex-col justify-end">
                              <label className="text-[9px] uppercase font-bold text-on-surface-variant">Premio Listo</label>
                              <input type="checkbox"
                                defaultChecked={card.rewardReady}
                                id={`reward-${card.phone}`}
                                className="w-5 h-5 mt-1" />
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleLoyaltySave(
                                card.phone,
                                document.getElementById(`stamps-${card.phone}`).value,
                                document.getElementById(`cycles-${card.phone}`).value,
                                document.getElementById(`reward-${card.phone}`).checked
                              )}
                              className="flex-1 bg-primary text-background text-xs font-bold py-2 rounded-sm uppercase tracking-wider">
                              Guardar
                            </button>
                            <button onClick={() => setEditingLoyalty(null)}
                              className="px-4 bg-surface-container text-on-surface-variant text-xs font-bold py-2 rounded-sm border border-outline-variant">
                              Cancelar
                            </button>
                            <button onClick={() => handleDeleteLoyaltyCard(card.phone)}
                              className="px-3 bg-red-50 text-red-600 text-xs font-bold py-2 rounded-sm border border-red-200">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setEditingLoyalty(card.phone)}
                          className="text-[10px] font-bold text-primary hover:underline flex items-center space-x-1">
                          <Edit2 className="w-3 h-3" />
                          <span>Editar sellos</span>
                        </button>
                      )}
                    </div>
                  ))}
              </div>

            </div>
          )}


        </div>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-outline-variant/30 flex justify-around items-center py-2 px-1 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <button
          onClick={() => { setTab("dashboard"); setEditingDish(null); setEditingPromo(null); }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-sm transition-all ${
            tab === "dashboard" ? "text-primary font-bold" : "text-on-surface-variant/60 hover:text-primary"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-tighter mt-1 font-semibold">Resumen</span>
        </button>

        <button
          onClick={() => { setTab("dishes"); setEditingDish(null); setEditingPromo(null); }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-sm transition-all ${
            tab === "dishes" ? "text-primary font-bold" : "text-on-surface-variant/60 hover:text-primary"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-tighter mt-1 font-semibold">Carta</span>
        </button>

        <button
          onClick={() => { setTab("promotions"); setEditingDish(null); setEditingPromo(null); }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-sm transition-all ${
            tab === "promotions" ? "text-primary font-bold" : "text-on-surface-variant/60 hover:text-primary"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-tighter mt-1 font-semibold">Promos</span>
        </button>

        <button
          onClick={() => { setTab("orders"); setEditingDish(null); setEditingPromo(null); }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-sm transition-all ${
            tab === "orders" ? "text-primary font-bold" : "text-on-surface-variant/60 hover:text-primary"
          }`}
        >
          <Package className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-tighter mt-1 font-semibold">Pedidos</span>
        </button>

        <button
          onClick={() => { setTab("contact"); setEditingDish(null); setEditingPromo(null); }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-sm transition-all ${
            tab === "contact" ? "text-primary font-bold" : "text-on-surface-variant/60 hover:text-primary"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-tighter mt-1 font-semibold">Ajustes</span>
        </button>
      </nav>

    </div>
  );
}
