/**
 * Invisible Analytics Tracker ("Espía Invisible")
 * Registra visitas de forma 100% silenciosa en segundo plano.
 * Permite auditar:
 * - Total de visitas y visitantes únicos.
 * - Duración de cada sesión (tiempo en el sitio).
 * - Identificación especial del usuario ADMIN (accesos, tiempo y páginas vistas).
 * - Dispositivo (Móvil/PC/Tablet), resolución, origen (referrer).
 * - Historial de vistas navegadas.
 * 
 * Cumple con estándar Dual-Layer: persiste en Supabase y caché en localStorage.
 */

import { supabase, isSupabaseConfigured } from "./supabase";

const VID_KEY = "tq_spy_vid";
const SID_KEY = "tq_spy_sid";
const LOCAL_SESSIONS_KEY = "tq_spy_local_sessions";

// Helpers para identificar dispositivo
function getDeviceInfo() {
  const ua = navigator.userAgent || "";
  let deviceType = "Desktop";
  let os = "Desconocido";

  if (/Mobi|Android/i.test(ua)) {
    deviceType = "Móvil";
  } else if (/iPad|Tablet/i.test(ua)) {
    deviceType = "Tablet";
  }

  if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Macintosh|Mac OS/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  const screen = `${window.innerWidth || 0}x${window.innerHeight || 0}`;
  return { deviceType, os, screen, uaSummary: `${deviceType} (${os}) [${screen}]` };
}

// Generador de identificadores únicos
function getOrCreateVisitorId() {
  let vid = localStorage.getItem(VID_KEY);
  if (!vid) {
    vid = "v-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
    localStorage.setItem(VID_KEY, vid);
  }
  return vid;
}

function getOrCreateSessionId() {
  let sid = sessionStorage.getItem(SID_KEY);
  if (!sid) {
    sid = "spy-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
    sessionStorage.setItem(SID_KEY, sid);
  }
  return sid;
}

class SpyTracker {
  constructor() {
    this.sessionId = null;
    this.visitorId = null;
    this.device = null;
    this.startedAt = Date.now();
    this.durationSeconds = 0;
    this.viewsHistory = [];
    this.isAdmin = false;
    this.userName = "Visitante Anónimo";
    this.userRole = "anonymous";
    this.heartbeatTimer = null;
    this.initialized = false;
    this.referrer = "";
    this.timezone = "";
  }

  init(session, initialView = "landing") {
    if (this.initialized) return;
    this.initialized = true;

    try {
      this.visitorId = getOrCreateVisitorId();
      this.sessionId = getOrCreateSessionId();
      this.device = getDeviceInfo();
      this.referrer = document.referrer ? (document.referrer.substring(0, 100)) : "Directo / WhatsApp";
      this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Dubai";

      this.updateUserContext(session);
      this.recordView(initialView, false);

      // Enviar registro inicial inmediatamente
      this.syncToSupabase(true);

      // Iniciar latido cada 15 segundos
      this.heartbeatTimer = setInterval(() => {
        if (document.visibilityState === "visible") {
          this.durationSeconds = Math.max(1, Math.round((Date.now() - this.startedAt) / 1000));
          this.syncToSupabase(false);
        }
      }, 15000);

      // Listener para cambios de visibilidad o cierre de pestaña
      window.addEventListener("beforeunload", () => {
        this.durationSeconds = Math.max(1, Math.round((Date.now() - this.startedAt) / 1000));
        this.beaconFinalSync();
      });

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          this.durationSeconds = Math.max(1, Math.round((Date.now() - this.startedAt) / 1000));
          this.syncToSupabase(false);
        }
      });
    } catch (e) {
      // Totalmente silencioso
    }
  }

  updateUserContext(session) {
    if (!session) return;
    const wasAdmin = this.isAdmin;
    if (session.role === "admin") {
      this.isAdmin = true;
      this.userRole = "admin";
      this.userName = session.name || "Administrador (David/Admin)";
    } else if (session.name) {
      this.isAdmin = false;
      this.userRole = "customer";
      this.userName = session.name;
    }

    if (this.initialized && (!wasAdmin && this.isAdmin)) {
      this.syncToSupabase(false);
    }
  }

  recordView(viewName, syncNow = true) {
    if (!viewName) return;
    if (!this.viewsHistory.includes(viewName)) {
      this.viewsHistory.push(viewName);
    }
    if (syncNow && this.initialized) {
      this.syncToSupabase(false);
    }
  }

  buildPayload() {
    const roleLabel = this.isAdmin ? "👑 ADMIN" : (this.userRole === "customer" ? "👤 CLIENTE" : "👥 VISITANTE");
    const customerNameDisplay = `${roleLabel}: ${this.userName}`;
    const addressDetails = `${this.device?.uaSummary || "Web"} | Ref: ${this.referrer} | TZ: ${this.timezone}`;

    const metadata = {
      visitor_id: this.visitorId,
      session_id: this.sessionId,
      is_admin: this.isAdmin,
      user_role: this.userRole,
      user_name: this.userName,
      views_history: this.viewsHistory,
      device_type: this.device?.deviceType || "Desktop",
      os: this.device?.os || "Desconocido",
      screen: this.device?.screen || "",
      referrer: this.referrer,
      timezone: this.timezone,
      started_at: new Date(this.startedAt).toISOString(),
      duration_seconds: this.durationSeconds,
      last_heartbeat: new Date().toISOString()
    };

    return {
      id: this.sessionId,
      customer_name: customerNameDisplay,
      customer_phone: this.visitorId,
      customer_address: addressDetails,
      payment_method: "SPY_ANALYTICS",
      total: Number(this.durationSeconds), // Columna numérica para almacenar segundos exactos
      items: [metadata]
    };
  }

  async syncToSupabase(isInitial = false) {
    try {
      const payload = this.buildPayload();

      // Guardar también en localStorage como backup local
      try {
        localStorage.setItem(`tq_spy_${this.sessionId}`, JSON.stringify(payload));
      } catch (err) {}

      if (!isSupabaseConfigured || !supabase) return;

      if (isInitial) {
        // Intento de inserción
        const { error } = await supabase.from("orders").upsert(payload);
        if (error) {
          // Fallback silencioso
        }
      } else {
        // Actualización periódica por parche
        const { error } = await supabase
          .from("orders")
          .update({
            customer_name: payload.customer_name,
            total: payload.total,
            items: payload.items
          })
          .eq("id", this.sessionId);
        if (error) {
          // Si el registro no existía aún por alguna razón, usar upsert
          await supabase.from("orders").upsert(payload);
        }
      }
    } catch (e) {
      // Silencioso
    }
  }

  beaconFinalSync() {
    try {
      const payload = this.buildPayload();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !anonKey) return;

      const endpoint = `${supabaseUrl}/rest/v1/orders?id=eq.${this.sessionId}`;
      const body = JSON.stringify({
        customer_name: payload.customer_name,
        total: payload.total,
        items: payload.items
      });

      // Usar fetch keepalive para garantizar envío al cerrar pestaña
      if (typeof fetch !== "undefined") {
        fetch(endpoint, {
          method: "PATCH",
          headers: {
            "apikey": anonKey,
            "Authorization": `Bearer ${anonKey}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
          },
          body,
          keepalive: true
        }).catch(() => {});
      }
    } catch (e) {}
  }
}

export const spyTracker = new SpyTracker();
