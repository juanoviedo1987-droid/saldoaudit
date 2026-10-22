/**
 * SaldoAudit - Outbound Transactional Mailer
 * Brand Identity: Fintech Emerald & Graphite (#090D16, #059669, #10B981)
 * Remitente Oficial: SaldoAudit <contacto@saldoaudit.com.ar>
 */
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Load environment variables from .env.cloudflare
const envPath = path.resolve(__dirname, '..', '.env.cloudflare');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key && rest.length > 0) {
      process.env[key.trim()] = rest.join('=').trim();
    }
  }
}

const SMTP_USER = process.env.SMTP_USER || 'saldoaudit.oficial@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || 'lafibucojdnxxwln';
const SENDER_NAME = process.env.SENDER_NAME || 'SaldoAudit';
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'contacto@saldoaudit.com.ar';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

const logoIconPath = path.resolve(__dirname, '..', 'assets', 'logo-saldoaudit-icon.png');

function buildTemplate({ title, badge, contentHtml, ctaText, ctaUrl }) {
  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', Helvetica, Arial, sans-serif; background-color: #090D16; margin: 0; padding: 24px; color: #1E293B; }
      .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 1px solid #1E293B; }
      .header { background: #090D16; padding: 28px 24px; text-align: center; border-bottom: 2px solid #059669; }
      .header-content { display: inline-flex; align-items: center; justify-content: center; gap: 12px; }
      .logo-img { width: 44px; height: 44px; border-radius: 10px; display: inline-block; vertical-align: middle; }
      .brand-title { font-size: 26px; font-weight: 800; color: #ffffff; margin-left: 10px; display: inline-block; vertical-align: middle; letter-spacing: -0.5px; font-family: 'Segoe UI', Roboto, sans-serif; }
      .brand-title span { color: #10B981; }
      .badge-container { margin-top: 10px; }
      .badge { display: inline-block; padding: 4px 14px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.35); color: #34D399; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
      .body-content { padding: 32px 28px; line-height: 1.6; color: #334155; }
      .email-title { font-size: 21px; font-weight: 800; color: #090D16; margin-top: 0; margin-bottom: 16px; letter-spacing: -0.3px; }
      .card { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; padding: 18px 20px; margin: 22px 0; }
      .card-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; border-bottom: 1px dashed #DCFCE7; }
      .card-row:last-child { border-bottom: none; }
      .card-label { color: #065F46; font-weight: 600; }
      .card-val { color: #090D16; font-weight: 700; font-family: monospace; }
      .btn { display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; margin-top: 14px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35); text-align: center; }
      .footer { background: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 22px 24px; text-align: center; font-size: 12px; color: #64748B; }
      .footer strong { color: #090D16; }
      .footer a { color: #059669; text-decoration: none; font-weight: 600; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="header-content">
          <img src="cid:saldoaudit-logo-icon" class="logo-img" alt="SaldoAudit Logo">
          <span class="brand-title">Saldo<span>Audit</span></span>
        </div>
        <div class="badge-container">
          <span class="badge">${badge || 'Auditoría Forense en Mercado Libre'}</span>
        </div>
      </div>
      
      <div class="body-content">
        <h2 class="email-title">${title}</h2>
        ${contentHtml}
        
        ${ctaText && ctaUrl ? `
          <div style="text-align: center; margin-top: 24px;">
            <a href="${ctaUrl}" class="btn" target="_blank">${ctaText}</a>
          </div>
        ` : ''}
      </div>

      <div class="footer">
        <strong>SaldoAudit · Auditoría Forense y Recupero de Fondos</strong><br>
        Infraestructura Cloudflare &bull; Motor Seguro TLS &bull; Buenos Aires, Argentina<br>
        <a href="https://saldoaudit.com.ar">saldoaudit.com.ar</a> &bull; <a href="mailto:contacto@saldoaudit.com.ar">contacto@saldoaudit.com.ar</a>
      </div>
    </div>
  </body>
  </html>
  `;
}

async function sendEmail({ to, subject, title, badge, contentHtml, ctaText, ctaUrl, text, attachments = [] }) {
  console.log(`[SaldoAudit Mailer] Conectando a SMTP Google (${SMTP_USER})...`);
  console.log(`[SaldoAudit Mailer] Remitente Oficial: "${SENDER_NAME}" <${SENDER_EMAIL}>`);
  console.log(`[SaldoAudit Mailer] Destinatario: ${to}`);

  const html = buildTemplate({
    title,
    badge,
    contentHtml,
    ctaText,
    ctaUrl,
  });

  const mailAttachments = [
    {
      filename: 'logo-saldoaudit-icon.png',
      path: logoIconPath,
      cid: 'saldoaudit-logo-icon',
    },
    ...attachments,
  ];

  const info = await transporter.sendMail({
    from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
    to,
    replyTo: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
    subject,
    text: text || title,
    html,
    attachments: mailAttachments,
  });

  console.log(`[SaldoAudit Mailer] Mensaje enviado con éxito! ID: ${info.messageId}`);
  return info;
}

// Execution if run directly
if (require.main === module) {
  const targetEmail = process.argv[2] || 'saldoaudit.oficial@gmail.com';

  const sampleHtml = `
    <p>Te damos la bienvenida al canal oficial de comunicaciones de <strong>SaldoAudit</strong> con la nueva identidad de marca <strong>Fintech Emerald & Graphite</strong>.</p>
    
    <div class="card">
      <div class="card-row">
        <span class="card-label">Identidad Oficial:</span>
        <span class="card-val">Fintech Emerald &amp; Graphite</span>
      </div>
      <div class="card-row">
        <span class="card-label">Isotipo de Marca:</span>
        <span class="card-val">Radar Forense (Lupa + Métricas)</span>
      </div>
      <div class="card-row">
        <span class="card-label">Remitente:</span>
        <span class="card-val">contacto@saldoaudit.com.ar</span>
      </div>
      <div class="card-row">
        <span class="card-label">Ruteo Inbound:</span>
        <span class="card-val">Cloudflare Email Routing Activo</span>
      </div>
      <div class="card-row">
        <span class="card-label">Entregabilidad:</span>
        <span class="card-val" style="color: #059669;">● 100% Verificado</span>
      </div>
    </div>

    <p>A partir de este momento, todos los reportes periciales, análisis de desfasajes de liquidaciones y notificaciones de recupero a sellers se emiten bajo esta rigurosa línea visual.</p>
  `;

  sendEmail({
    to: targetEmail,
    subject: 'SaldoAudit Oficial · Actualización de Identidad Visual (Fintech Emerald)',
    title: 'Identidad Corporativa Oficial Actualizada',
    badge: 'Fintech Emerald & Graphite Oficial',
    contentHtml: sampleHtml,
    ctaText: 'Abrir Suite Operativa SaldoAudit',
    ctaUrl: 'https://saldoaudit.com.ar/app.html',
    text: 'Identidad Corporativa Oficial Actualizada - SaldoAudit Fintech Emerald & Graphite.',
  })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[SaldoAudit Mailer Error]', err);
      process.exit(1);
    });
}

module.exports = { sendEmail };
