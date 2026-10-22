const fs = require('fs');
const path = require('path');

// Leer credenciales
const envPath = path.join(__dirname, '..', '.env.cloudflare');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const ACCESS_TOKEN = env.MP_ACCESS_TOKEN;

async function createPreference() {
  const body = {
    items: [
      {
        id: "saldoaudit-informe-pericial",
        title: "SaldoAudit — Informe Pericial y Dossier de Reclamos MeLi",
        description: "Desbloqueo completo de órdenes retenidas, enlaces de mediación y argumentos periciales para cobro a Mercado Libre.",
        quantity: 1,
        currency_id: "ARS",
        unit_price: 39000
      }
    ],
    back_urls: {
      success: "https://saldoaudit.com.ar/?status=approved",
      pending: "https://saldoaudit.com.ar/?status=pending",
      failure: "https://saldoaudit.com.ar/?status=failure"
    },
    auto_return: "approved",
    notification_url: "https://34-135-56-126.sslip.io/webhook/saldoaudit-mp-payment",
    statement_descriptor: "SALDOAUDIT",
    external_reference: "saldoaudit_unlock_39k"
  };

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  console.log("STATUS:", res.status);
  console.log("PREFERENCE_ID:", data.id);
  console.log("INIT_POINT:", data.init_point);
}

createPreference().catch(console.error);
