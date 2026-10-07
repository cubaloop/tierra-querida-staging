const https = require("https");

const SUPABASE_URL = "https://vqspnxgjsnvrwjaohccu.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxc3BueGdqc252cndqYW9oY2N1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDg3NTU5OCwiZXhwIjoyMTAwNDUxNTk4fQ.hx6NW9G5FFy0urdmspni0riY5MPag3FbwIHcgwmuviE";

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "< 15 seg";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s} seg`;
  return `${m}m ${s}s`;
}

function formatDate(isoStr) {
  if (!isoStr) return "N/A";
  const d = new Date(isoStr);
  return d.toLocaleString("es-ES", { timeZone: "Asia/Dubai", hour12: false }) + " (GST Dubai)";
}

const url = `${SUPABASE_URL}/rest/v1/orders?payment_method=eq.SPY_ANALYTICS&select=*&order=created_at.desc`;

const options = {
  headers: {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
    "Accept": "application/json"
  }
};

https.get(url, options, (res) => {
  let body = "";
  res.on("data", chunk => body += chunk);
  res.on("end", () => {
    try {
      const records = JSON.parse(body);
      if (!Array.isArray(records)) {
        console.error("Error al obtener registros:", body);
        return;
      }

      console.log("\n=======================================================");
      console.log("🕵️ REPORTE DEL ESPÍA INVISIBLE - TIERRA QUERIDA");
      console.log("=======================================================\n");

      if (records.length === 0) {
        console.log("📍 Aún no hay registros de visitas capturados.");
        console.log("   (El rastreador se activará en cuanto se despliegue y entre el primer visitante)");
        return;
      }

      const totalVisitas = records.length;
      const uniqueVisitors = new Set(records.map(r => r.customer_phone)).size;
      const adminVisits = records.filter(r => {
        const item = r.items?.[0] || {};
        return item.is_admin === true || (r.customer_name && r.customer_name.includes("ADMIN"));
      });
      const customerVisits = records.filter(r => !adminVisits.includes(r));

      const totalSeconds = records.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
      const avgSeconds = Math.round(totalSeconds / totalVisitas);

      console.log(`📊 TOTAL DE VISITAS REGISTRADAS: ${totalVisitas}`);
      console.log(`👥 VISITANTES ÚNICOS:             ${uniqueVisitors}`);
      console.log(`⏱️ TIEMPO PROMEDIO EN EL SITIO:   ${formatDuration(avgSeconds)}`);
      console.log(`👑 VISITAS DE ADMINISTRADOR:      ${adminVisits.length}`);
      console.log(`👤 VISITAS DE PÚBLICO / CLIENTES: ${customerVisits.length}\n`);

      if (adminVisits.length > 0) {
        console.log("-------------------------------------------------------");
        console.log("👑 REGISTRO EXCLUSIVO DEL USUARIO ADMIN");
        console.log("-------------------------------------------------------");
        adminVisits.forEach((v, i) => {
          const meta = v.items?.[0] || {};
          console.log(`[${i + 1}] Fecha:       ${formatDate(v.created_at)}`);
          console.log(`    Usuario:     ${v.customer_name}`);
          console.log(`    Tiempo:      ${formatDuration(v.total)}`);
          console.log(`    Dispositivo: ${meta.device_type || 'N/A'} (${meta.os || 'N/A'}) [${meta.screen || 'N/A'}]`);
          console.log(`    Páginas:     ${(meta.views_history || []).join(" ➔ ") || 'landing'}`);
          console.log(`    Zona / Ref:  ${v.customer_address}`);
          console.log("");
        });
      }

      console.log("-------------------------------------------------------");
      console.log("📋 REGISTRO RECIENTE DE TODAS LAS VISITAS");
      console.log("-------------------------------------------------------");
      records.slice(0, 20).forEach((v, i) => {
        const meta = v.items?.[0] || {};
        const isAdmin = meta.is_admin || (v.customer_name && v.customer_name.includes("ADMIN"));
        const tag = isAdmin ? "👑 [ADMIN]" : "👥 [VISITANTE]";
        console.log(`[${i + 1}] ${tag} ${formatDate(v.created_at)}`);
        console.log(`    Identificador: ${v.customer_name}`);
        console.log(`    Tiempo activo: ${formatDuration(v.total)}`);
        console.log(`    Dispositivo:   ${meta.device_type || 'N/A'} (${meta.os || 'N/A'}) [${meta.screen || 'N/A'}]`);
        console.log(`    Páginas:       ${(meta.views_history || []).join(" ➔ ") || 'landing'}`);
        console.log(`    Origen/Ref:    ${meta.referrer || 'Directo'}`);
        console.log("");
      });

    } catch (e) {
      console.error("Error parseando respuesta:", e.message);
    }
  });
}).on("error", (e) => {
  console.error("Error en petición https:", e.message);
});
