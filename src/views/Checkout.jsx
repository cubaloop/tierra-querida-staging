import React, { useState, useEffect } from "react";
import { ArrowLeft, Send, CheckCircle, CreditCard, DollarSign, Lock, ShieldCheck, FileText, Check, AlertCircle } from "lucide-react";
import { saveOrder } from "../utils/db";
import { RESTAURANT_INFO } from "../data/initialData";

export default function Checkout({
  cart,
  clearCart,
  setView,
  session,
  onUpdateSessionAddress,
  restaurantInfo
}) {
  const info = restaurantInfo && restaurantInfo.phone ? restaurantInfo : RESTAURANT_INFO;
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    paymentMethod: "cod", // 'cod' (Cash on Delivery) or 'card' (Stripe Card)
    deliveryTime: "asap", // 'asap' or 'schedule'
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: ""
  });

  const [orderCompleted, setOrderCompleted] = useState(false);
  const [ticketText, setTicketText] = useState("");
  const [orderId, setOrderId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState(0); // 0: Idle, 1: Contacting Stripe, 2: 3D Secure, 3: Completed
  const [validationErrors, setValidationErrors] = useState({});

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (session) {
      setFormData((prev) => ({
        ...prev,
        name: session.name || "",
        phone: session.phone || "",
        address: session.address || ""
      }));
    }
  }, [session]);

  const feePerDelivery = restaurantInfo && restaurantInfo.deliveryFee != null ? Number(restaurantInfo.deliveryFee) : 20;
  const subtotal = cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? feePerDelivery : 0;
  const total = subtotal + deliveryFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Format card input values
    if (name === "cardNumber") {
      const formatted = value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setFormData((prev) => ({ ...prev, [name]: formatted.substring(0, 19) }));
    } else if (name === "cardExpiry") {
      const formatted = value.replace(/\s?/g, '').replace(/(\d{2})/g, '$1/').trim();
      setFormData((prev) => ({ ...prev, [name]: formatted.substring(0, 5) }));
    } else if (name === "cardCvc") {
      const numeric = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, [name]: numeric.substring(0, 4) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateCardDetails = () => {
    const errors = {};
    if (!formData.cardName.trim()) errors.cardName = "El nombre es obligatorio.";
    
    const cardDigits = formData.cardNumber.replace(/\s/g, '');
    if (cardDigits.length !== 16 || !/^\d+$/.test(cardDigits)) {
      errors.cardNumber = "Número de tarjeta inválido (debe tener 16 dígitos).";
    }

    if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
      errors.cardExpiry = "Formato MM/AA inválido.";
    } else {
      const [month, year] = formData.cardExpiry.split("/").map(Number);
      if (month < 1 || month > 12) {
        errors.cardExpiry = "Mes inválido.";
      }
    }

    if (formData.cardCvc.length < 3 || formData.cardCvc.length > 4) {
      errors.cardCvc = "CVC inválido (3 o 4 dígitos).";
    }

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (formData.paymentMethod === "card") {
      const errors = validateCardDetails();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      // Start simulated Stripe EAU payment flow
      setIsProcessingPayment(true);
      setPaymentStep(1);

      setTimeout(() => {
        setPaymentStep(2); // 3D Secure validation
      }, 1000);

      setTimeout(() => {
        setPaymentStep(3); // Payment Aproved
      }, 2200);

      setTimeout(() => {
        // Complete the order after payment approval animation
        const txnId = `ch_Stripe_EAU_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        setTransactionId(txnId);
        completeOrder(txnId);
        setIsProcessingPayment(false);
        setPaymentStep(0);
      }, 3000);
    } else {
      completeOrder(null);
    }
  };

  const completeOrder = (txnId) => {
    // Save to local session address if user changes it
    if (session) {
      onUpdateSessionAddress(formData.address, formData.phone);
    }

    // Save order in mock DB
    const orderItems = cart.map((item) => ({
      id: item.dish.id,
      name: item.dish.name,
      price: item.dish.price,
      quantity: item.quantity,
      selectedOption: item.selectedOption
    }));

    const orderData = {
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      customerName: formData.name,
      customerPhone: formData.phone,
      customerAddress: formData.address,
      paymentMethod: formData.paymentMethod === "cod" ? "Efectivo (Contra entrega)" : "Tarjeta de Crédito (Procesado Online)",
      paymentStatus: txnId ? "Paid" : "Pending",
      transactionId: txnId || "",
      deliveryTime: formData.deliveryTime === "asap" ? "Lo antes posible (35-45 min)" : "Programado",
      status: "Pendiente"
    };

    const newOrder = saveOrder(orderData);
    setOrderId(newOrder.id);

    // Build the ticket text for WhatsApp
    let ticket = `*NUEVO PEDIDO - TIERRA QUERIDA* 🇨🇴🍖\n`;
    ticket += `*Pedido ID:* #${newOrder.id.split("-")[1] || newOrder.id}\n`;
    ticket += `-------------------------------------------\n`;
    ticket += `👤 *Cliente:* ${formData.name}\n`;
    ticket += `📞 *Teléfono:* ${formData.phone}\n`;
    ticket += `📍 *Dirección:* ${formData.address}\n`;
    ticket += `⏰ *Entrega:* ${orderData.deliveryTime}\n`;
    ticket += `💵 *Pago:* ${orderData.paymentMethod}\n`;
    if (txnId) {
      ticket += `💳 *Transacción:* ${txnId} (Stripe UAE)\n`;
      ticket += `✅ *Estado de Pago:* APROBADO ONLINE\n`;
    }
    ticket += `-------------------------------------------\n`;
    ticket += `🛒 *Detalle de Productos:*\n`;

    cart.forEach((item) => {
      ticket += `- *${item.quantity}x* ${item.dish.name}`;
      if (item.selectedOption) {
        ticket += ` (${item.selectedOption})`;
      }
      ticket += ` — _${item.dish.price * item.quantity} AED_\n`;
    });

    ticket += `-------------------------------------------\n`;
    ticket += `*Subtotal:* ${subtotal} AED\n`;
    ticket += `*Envío:* ${deliveryFee} AED\n`;
    ticket += `*TOTAL DEL PEDIDO:* *${total} AED*\n`;
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

  const handleWhatsAppCustomerNotification = () => {
    // Simulated WhatsApp link to the client for confirmation receipt
    const customerMsg = `*Tierra Querida - Confirmación de Pago* 🇨🇴✨\n\nHola *${formData.name}*,\nConfirmamos la recepción de tu pago seguro por *${total} AED* mediante Stripe EAU para tu pedido *#${orderId.split("-")[1]}*.\n\nTu pedido está en cocina y será despachado en breve a la dirección:\n📍 ${formData.address}\n\n¡Gracias por preferir Tierra Querida Dubai! 🎉`;
    const encodedText = encodeURIComponent(customerMsg);
    const whatsappUrl = `https://wa.me/${formData.phone.replace(/\D/g, "")}?text=${encodedText}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleDownloadInvoice = () => {
    // Generate and download text receipt
    const dateStr = new Date().toLocaleString("es-AE", { timeZone: "Asia/Dubai" });
    const receiptContent = `
========================================
       RECIBO DE PAGO - TIERRA QUERIDA
        Business Bay, Dubai, UAE
========================================
Fecha: ${dateStr} (Dubai Time)
Pedido ID: #${orderId.split("-")[1]}
Transacción Stripe ID: ${transactionId}
Estado: APROBADO (PAGO EN LÍNEA SEGURO)
----------------------------------------
Cliente: ${formData.name}
Teléfono: ${formData.phone}
Dirección: ${formData.address}
----------------------------------------
DETALLE DE PRODUCTOS:
${cart.map(item => `  ${item.quantity}x ${item.dish.name} ${item.selectedOption ? `(${item.selectedOption})` : ""} - ${item.dish.price * item.quantity} AED`).join("\n")}
----------------------------------------
Subtotal: ${subtotal} AED
Domicilio: ${deliveryFee} AED
TOTAL PROCESADO: ${total} AED
----------------------------------------
Pasarela de Pago: Stripe UAE
Moneda: Dirham de los EAU (AED)
Seguridad: PCI-DSS Compliant (Secure Tokenization)
========================================
¡Gracias por tu compra!
Tierra Querida Restaurant & Café Dubai
`;
    const element = document.createElement("a");
    const file = new Blob([receiptContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `comprobante_tierra_querida_${orderId.split("-")[1]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (orderCompleted) {
    const isOnlinePayment = formData.paymentMethod === "card";

    return (
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20 text-center space-y-10 font-sans">
        
        {/* Header Confirmation card */}
        <div className="bg-surface-container-low border border-outline-variant/20 p-8 rounded-sm shadow-sm space-y-6">
          <CheckCircle className="w-16 h-16 text-secondary mx-auto stroke-[1.2] animate-bounce" />
          <div>
            <h2 className="font-serif text-3xl font-bold text-on-surface">¡Pedido Recibido!</h2>
            <p className="text-sm text-on-surface-variant mt-2">
              Tu pedido con ID <span className="font-bold text-primary">#{orderId.split("-")[1]}</span> se ha guardado en nuestro sistema.
            </p>
          </div>
          
          {isOnlinePayment && (
            <div className="max-w-md mx-auto bg-green-50/50 border border-green-200/50 p-4 rounded-sm flex items-center justify-between text-left">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full text-green-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-green-900 uppercase tracking-wide">Pago Seguro Stripe EAU</h4>
                  <p className="text-[10px] text-green-700 mt-0.5">ID: {transactionId}</p>
                </div>
              </div>
              <span className="bg-green-200 text-green-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                Aprobado
              </span>
            </div>
          )}
        </div>

        {/* WhatsApp Notification Hub (Conditional display based on payment method) */}
        {isOnlinePayment ? (
          <div className="bg-surface-container-low border border-outline-variant/20 p-6 md:p-8 rounded-sm text-left space-y-6 shadow-sm">
            <div className="flex items-center space-x-2 border-b border-outline-variant/20 pb-4">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              <h3 className="font-bold text-xs uppercase tracking-widest text-primary">Centro de Notificaciones WhatsApp</h3>
            </div>
            
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Como realizaste tu <strong>Pago Seguro en Línea</strong>, hemos disparado notificaciones automáticas por la API de WhatsApp para confirmar la transacción:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Restaurant Notification */}
              <div className="bg-surface-container p-4 rounded-sm border border-outline-variant/15 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Restaurante (+971 56 846 0179)</span>
                  <span className="bg-green-100 text-green-800 text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm">Enviada</span>
                </div>
                <div className="bg-background/80 p-3 rounded-sm border border-outline-variant/10 text-[11px] text-on-surface font-sans leading-relaxed italic">
                  "¡Nuevo Pago Seguro Online Recibido! Pedido: #{orderId.split("-")[1]}. Cliente: {formData.name}. Total: {total} AED. Estado: Pagado por Stripe EAU. ID Transacción: {transactionId}."
                </div>
              </div>

              {/* Customer Notification */}
              <div className="bg-surface-container p-4 rounded-sm border border-outline-variant/15 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Cliente ({formData.phone})</span>
                  <span className="bg-green-100 text-green-800 text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm">Enviada</span>
                </div>
                <div className="bg-background/80 p-3 rounded-sm border border-outline-variant/10 text-[11px] text-on-surface font-sans leading-relaxed italic">
                  "Hola {formData.name}, confirmamos la recepción de tu pago de {total} AED mediante Stripe EAU para tu pedido #${orderId.split("-")[1]}. ¡Gracias por comprar en Tierra Querida!"
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container p-5 rounded-sm border border-outline-variant/30 text-left font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto custom-scrollbar">
            {ticketText}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 max-w-md mx-auto space-y-3">
          {isOnlinePayment ? (
            <>
              <button
                onClick={handleWhatsAppRedirect}
                className="w-full bg-primary text-background font-bold py-4 uppercase text-xs tracking-widest flex items-center justify-center space-x-2 hover:bg-primary-container transition-all shadow-lg rounded-sm"
              >
                <Send className="w-4 h-4 fill-current" />
                <span>Enviar Ticket al Restaurante</span>
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleWhatsAppCustomerNotification}
                  className="w-full bg-transparent border border-primary text-primary font-bold py-3 uppercase text-[10px] tracking-wider hover:bg-primary/5 transition-all rounded-sm flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5 fill-current" />
                  <span>Notificar Cliente</span>
                </button>
                <button
                  onClick={handleDownloadInvoice}
                  className="w-full bg-transparent border border-outline-variant text-on-surface-variant font-bold py-3 uppercase text-[10px] tracking-wider hover:bg-surface-container transition-all rounded-sm flex items-center justify-center space-x-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Guardar Recibo</span>
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={handleWhatsAppRedirect}
              className="w-full bg-primary text-background font-bold py-4 uppercase text-xs tracking-widest flex items-center justify-center space-x-2 hover:bg-primary-container transition-all shadow-lg rounded-sm"
            >
              <Send className="w-4 h-4 fill-current" />
              <span>Enviar Ticket por WhatsApp</span>
            </button>
          )}
          
          <button
            onClick={() => {
              clearCart();
              setView("landing");
            }}
            className="w-full bg-transparent text-on-surface-variant/70 hover:text-primary font-bold py-2 uppercase text-xs tracking-widest transition-all"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-margin-desktop py-12 md:py-20 font-sans">
      
      {/* Stripe payment overlay loading screen */}
      {isProcessingPayment && (
        <div className="fixed inset-0 bg-background/95 z-[9999] flex flex-col items-center justify-center space-y-6">
          <div className="relative flex items-center justify-center w-24 h-24">
            <div className="absolute border-4 border-primary/20 border-t-primary rounded-full w-20 h-20 animate-spin" />
            <Lock className="w-8 h-8 text-primary absolute" />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="font-serif text-2xl font-bold text-primary">Procesando Pago Seguro</h3>
            <p className="text-xs text-on-surface-variant/80 uppercase tracking-widest font-mono">
              {paymentStep === 1 && "Conectando con Stripe UAE..."}
              {paymentStep === 2 && "Validando credenciales 3D Secure..."}
              {paymentStep === 3 && "Pago aprobado con éxito!"}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 bg-surface-container border border-outline-variant/30 px-4 py-2.5 rounded-sm">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Conexión Encriptada SSL 256 bits</span>
          </div>
        </div>
      )}

      {/* Back to Menu */}
      <button
        onClick={() => setView("menu")}
        className="inline-flex items-center space-x-2 text-on-surface-variant/80 hover:text-primary font-bold text-xs uppercase tracking-widest mb-10 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al menú</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Checkout Forms (Left) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-10">
          
          <h1 className="font-serif text-4xl font-bold tracking-tight text-primary">
            Confirmar Domicilio
          </h1>

          {/* 1. Datos Personales */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 border-b border-outline-variant/30 pb-2">
              <span className="font-serif text-xl font-bold text-primary">01</span>
              <h2 className="font-bold text-xs uppercase tracking-widest text-on-surface">Información de Entrega</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Nombre Completo</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm rounded-sm outline-none outline-0"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Teléfono (WhatsApp)</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+971 50 ..."
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm rounded-sm outline-none outline-0"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Dirección de Entrega en Dubai</label>
              <textarea
                name="address"
                required
                rows="3"
                placeholder="Edificio/Torre, Apartamento/Oficina, Business Bay u otra zona en Dubai..."
                value={formData.address}
                onChange={handleInputChange}
                className="bg-surface-container border border-outline-variant/30 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary px-4 py-3 text-sm rounded-sm outline-none outline-0"
              />
            </div>
          </div>

          {/* 2. Horario de entrega */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 border-b border-outline-variant/30 pb-2">
              <span className="font-serif text-xl font-bold text-primary">02</span>
              <h2 className="font-bold text-xs uppercase tracking-widest text-on-surface">Horario de Entrega</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                className={`p-4 border rounded-sm cursor-pointer flex justify-between items-center transition-all ${
                  formData.deliveryTime === "asap"
                    ? "border-primary bg-surface-container text-primary font-semibold"
                    : "border-outline-variant/30 bg-surface-container-low text-on-surface-variant"
                }`}
              >
                <div>
                  <p className="text-sm">Lo antes posible</p>
                  <p className="text-[10px] text-on-surface-variant/80 mt-0.5">Llega en 35 - 45 min aprox.</p>
                </div>
                <input
                  type="radio"
                  name="deliveryTime"
                  value="asap"
                  checked={formData.deliveryTime === "asap"}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary border-outline-variant focus:ring-primary focus:ring-1"
                />
              </label>

              <label
                className={`p-4 border rounded-sm cursor-pointer flex justify-between items-center transition-all ${
                  formData.deliveryTime === "schedule"
                    ? "border-primary bg-surface-container text-primary font-semibold"
                    : "border-outline-variant/30 bg-surface-container-low text-on-surface-variant"
                }`}
              >
                <div>
                  <p className="text-sm">Programado hoy</p>
                  <p className="text-[10px] text-on-surface-variant/80 mt-0.5">Te llamamos para coordinar hora.</p>
                </div>
                <input
                  type="radio"
                  name="deliveryTime"
                  value="schedule"
                  checked={formData.deliveryTime === "schedule"}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary border-outline-variant focus:ring-primary focus:ring-1"
                />
              </label>
            </div>
          </div>

          {/* 3. Forma de Pago */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 border-b border-outline-variant/30 pb-2">
              <span className="font-serif text-xl font-bold text-primary">03</span>
              <h2 className="font-bold text-xs uppercase tracking-widest text-on-surface">Método de Pago</h2>
            </div>

            <div className="space-y-4">
              {/* COD */}
              <label
                className={`p-4 border rounded-sm cursor-pointer flex justify-between items-center transition-all ${
                  formData.paymentMethod === "cod"
                    ? "border-primary bg-surface-container text-primary font-semibold"
                    : "border-outline-variant/30 bg-surface-container-low text-on-surface-variant"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="text-sm font-semibold">Pago en Efectivo (Contra Entrega)</p>
                    <p className="text-xs text-on-surface-variant/80 mt-0.5">Paga al repartidor al recibir tu comida.</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === "cod"}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary border-outline-variant focus:ring-primary focus:ring-1"
                />
              </label>

              {/* CARD (Stripe) */}
              <label
                className={`p-4 border rounded-sm cursor-pointer flex justify-between items-center transition-all ${
                  formData.paymentMethod === "card"
                    ? "border-primary bg-surface-container text-primary font-semibold"
                    : "border-outline-variant/30 bg-surface-container-low text-on-surface-variant"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Tarjeta de Crédito / Pago Online Seguro</p>
                    <p className="text-xs text-on-surface-variant/80 mt-0.5">Procesado de forma segura en EAU a través de Stripe.</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === "card"}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary border-outline-variant focus:ring-primary focus:ring-1"
                />
              </label>

              {/* Card Form Mock */}
              {formData.paymentMethod === "card" && (
                <div className="p-6 bg-surface-container border border-outline-variant/20 rounded-sm space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-outline-variant/15 pb-2.5 mb-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center space-x-1">
                      <Lock className="w-3 h-3 text-secondary mr-1" />
                      <span>Pago Encriptado con SSL</span>
                    </span>
                    <span className="text-[9px] text-on-surface-variant/60 font-semibold uppercase tracking-wider">
                      Stripe UAE | PCI-DSS
                    </span>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Nombre en la Tarjeta</label>
                    <input
                      type="text"
                      name="cardName"
                      placeholder="CARLOS GOMEZ"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      className={`bg-background border text-on-surface px-4 py-2.5 text-xs rounded-sm outline-none ${
                        validationErrors.cardName ? "border-red-500" : "border-outline-variant/30 focus:border-primary"
                      }`}
                    />
                    {validationErrors.cardName && (
                      <span className="text-[10px] text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{validationErrors.cardName}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Número de Tarjeta</label>
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="4000 1234 5678 9010"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className={`bg-background border text-on-surface px-4 py-2.5 text-xs rounded-sm outline-none ${
                        validationErrors.cardNumber ? "border-red-500" : "border-outline-variant/30 focus:border-primary"
                      }`}
                    />
                    {validationErrors.cardNumber && (
                      <span className="text-[10px] text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{validationErrors.cardNumber}</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Vencimiento</label>
                      <input
                        type="text"
                        name="cardExpiry"
                        placeholder="MM/AA"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        className={`bg-background border text-on-surface px-4 py-2.5 text-xs rounded-sm outline-none ${
                          validationErrors.cardExpiry ? "border-red-500" : "border-outline-variant/30 focus:border-primary"
                        }`}
                      />
                      {validationErrors.cardExpiry && (
                        <span className="text-[10px] text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{validationErrors.cardExpiry}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">CVC</label>
                      <input
                        type="text"
                        name="cardCvc"
                        placeholder="123"
                        value={formData.cardCvc}
                        onChange={handleInputChange}
                        className={`bg-background border text-on-surface px-4 py-2.5 text-xs rounded-sm outline-none ${
                          validationErrors.cardCvc ? "border-red-500" : "border-outline-variant/30 focus:border-primary"
                        }`}
                      />
                      {validationErrors.cardCvc && (
                        <span className="text-[10px] text-red-600 flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{validationErrors.cardCvc}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="hidden"
            id="hidden-submit"
          />
        </form>

        {/* Order Summary Sidebar (Right) */}
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <div className="bg-surface-container-low border border-outline-variant/15 p-8 rounded-sm space-y-8 shadow-sm">
            <h3 className="font-serif text-2xl font-bold text-primary border-b border-outline-variant/20 pb-4">
              Resumen de Compra
            </h3>

            {/* Cart Items list */}
            {cart.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No hay productos en el carrito.</p>
            ) : (
              <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar border-b border-outline-variant/20 pb-6">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-start text-sm">
                    <div>
                      <p className="font-bold text-on-surface">
                        {item.quantity}x {item.dish.name}
                      </p>
                      {item.selectedOption && (
                        <p className="text-[11px] text-on-surface-variant/80 italic mt-0.5">
                          {item.selectedOption}
                        </p>
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
                <span>Domicilio</span>
                <span>{deliveryFee} AED</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-primary border-t border-primary/10 pt-4 mt-2">
                <span>Total Pedido</span>
                <span>{total} AED</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                document.getElementById("hidden-submit").click();
              }}
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
              {formData.paymentMethod === "card" 
                ? "Al confirmar, se procesará el pago seguro en línea mediante la pasarela integrada de Stripe EAU."
                : "Al confirmar el pedido se generará el ticket tradicional que podrás enviar directamente a nuestro WhatsApp."
              }
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
