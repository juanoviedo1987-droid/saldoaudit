import json
import os
import smtplib
import urllib.request
import urllib.error
from http.server import HTTPServer, BaseHTTPRequestHandler
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_USER = "saldoaudit.oficial@gmail.com"
SMTP_PASS = "lafibucojdnxxwln"
SENDER = "SaldoAudit <contacto@saldoaudit.com.ar>"
ADMIN_EMAIL = "saldoaudit.oficial@gmail.com"
MP_ACCESS_TOKEN = "APP_USR-7473723656950246-102214-e871bab63707479c340b6877091b9267-142574812"

CACHE_DIR = os.path.dirname(os.path.abspath(__file__))
PROCESSED_FILE = os.path.join(CACHE_DIR, "processed_payments.json")

def load_processed_payments():
    try:
        if os.path.exists(PROCESSED_FILE):
            with open(PROCESSED_FILE, "r", encoding="utf-8") as f:
                return set(json.load(f))
    except Exception as e:
        print(f"[CACHE LOAD ERROR] {e}")
    return set()

def mark_payment_processed(payment_id):
    try:
        processed_payments.add(str(payment_id))
        with open(PROCESSED_FILE, "w", encoding="utf-8") as f:
            json.dump(list(processed_payments), f)
        print(f"[CACHE] Payment {payment_id} registrado como procesado.")
    except Exception as e:
        print(f"[CACHE SAVE ERROR] {e}")

processed_payments = load_processed_payments()

def send_email(to_email, subject, html_content):
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SENDER
        msg["To"] = to_email
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        print(f"[EMAIL SUCCESS] Delivered to {to_email} (Subject: {subject})")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        return False

def get_mp_payment(payment_id):
    try:
        url = f"https://api.mercadopago.com/v1/payments/{payment_id}"
        req = urllib.request.Request(url, headers={
            "Authorization": f"Bearer {MP_ACCESS_TOKEN}",
            "Content-Type": "application/json"
        })
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status == 200:
                return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"[MP API ERROR] {e}")
    return None

def process_payment_notification(payment_id):
    str_pid = str(payment_id).strip()

    # 1. Antiduplicados estricto (Idempotencia)
    if str_pid in processed_payments:
        print(f"[ANTI-DUPLICADO] Payment {str_pid} ya fue procesado y notificado anteriormente. Se omite.")
        return True

    payment = get_mp_payment(str_pid)
    if not payment:
        print(f"[WARN] No se pudo obtener datos para payment_id: {str_pid}")
        return False

    status = payment.get("status")
    print(f"[MP PAYMENT {str_pid}] Status: {status}")
    if status != "approved":
        print(f"[MP PAYMENT {str_pid}] No aprobado ({status}), ignorando envío.")
        return False

    amount = payment.get("transaction_amount", 39000)
    payer = payment.get("payer", {}) or {}
    payer_email = (payer.get("email") or "").strip().lower()
    payer_name = f"{payer.get('first_name') or ''} {payer.get('last_name') or ''}".strip() or "Seller de Mercado Libre"
    date_approved = payment.get("date_approved") or "Recién"

    # Marcar como procesado inmediatamente para evitar colisiones concurrentes de webhooks
    mark_payment_processed(str_pid)

    # 2. Email de Aviso de Cobro al Administrador (SaldoAudit)
    admin_subject = f"💰 NUEVO COBRO EN SALDOAUDIT — $39.000 ARS de {payer_name}"
    admin_html = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; background-color: #090D16; color: #F8FAFC; padding: 20px;">
  <div style="max-width: 550px; margin: 0 auto; background-color: #0F172A; border: 1px solid #1E293B; border-radius: 16px; padding: 24px;">
    <div style="display: inline-block; padding: 4px 10px; background-color: rgba(16, 185, 129, 0.2); border-radius: 8px; color: #34D399; font-weight: bold; font-size: 12px; margin-bottom: 15px;">
      NUEVO COBRO CONFIRMADO
    </div>
    <h2 style="margin: 0 0 16px; color: #FFFFFF; font-size: 20px;">¡Cobro de $39.000 ARS Acreditado!</h2>
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #94A3B8;">
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #1E293B;"><strong>Monto:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #1E293B; color: #34D399; font-weight: bold; font-size: 16px;">${amount:,.2f} ARS</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #1E293B;"><strong>Cliente:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #1E293B; color: #FFFFFF;">{payer_name}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #1E293B;"><strong>Email:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #1E293B; color: #38BDF8;">{payer_email or 'No provisto por MP'}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #1E293B;"><strong>ID Pago MP:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #1E293B; color: #FFFFFF; font-family: monospace;">{str_pid}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0;"><strong>Fecha Aprobación:</strong></td>
        <td style="padding: 8px 0; color: #FFFFFF;">{date_approved}</td>
      </tr>
    </table>
    <p style="margin: 20px 0 0; font-size: 11px; color: #64748B;">
      El email transaccional con el enlace de desbloqueo ya fue enviado automáticamente al cliente.
    </p>
  </div>
</body>
</html>"""
    send_email(ADMIN_EMAIL, admin_subject, admin_html)

    # 3. Email Transaccional al Cliente (solo si el cliente tiene un email real y distinto al del admin)
    admin_aliases = [ADMIN_EMAIL.lower(), "contacto@saldoaudit.com.ar", "juan@saldoaudit.com.ar"]
    if payer_email and payer_email not in admin_aliases:
        client_subject = f"✅ Acceso a tu Informe Pericial SaldoAudit (#{str_pid})"
        client_html = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#090D16;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#F8FAFC;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#090D16;padding:30px 15px;">
    <tr><td align="center">
      <table width="100%" style="max-width:600px;background-color:#0F172A;border:1px solid #1E293B;border-radius:24px;overflow:hidden;">
        <tr>
          <td style="padding:28px;background:linear-gradient(135deg,#059669 0%,#064E3B 100%);text-align:center;">
            <h1 style="margin:0;font-size:24px;font-weight:800;color:#FFFFFF;">SaldoAudit</h1>
            <p style="margin:4px 0 0;font-size:13px;color:#A7F3D0;font-weight:600;">Auditoría Forense de Mercado Libre</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 28px;">
            <div style="display:inline-block;padding:4px 12px;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.3);border-radius:9999px;font-size:11px;font-weight:700;color:#34D399;margin-bottom:18px;">
              ✓ Pago Acreditado Exitosamente
            </div>
            <h2 style="margin:0 0 14px;font-size:20px;font-weight:700;color:#FFFFFF;">¡Hola, {payer_name}!</h2>
            <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#94A3B8;">
              Confirmamos la acreditación de tu pago de <strong>${amount:,.2f} ARS</strong> (Operación MP #{str_pid}). Tu <strong>Informe Pericial Forense y Dossier de Reclamos</strong> ya está 100% habilitado.
            </p>
            <div style="background-color:#090D16;border:1px solid #1E293B;border-radius:16px;padding:20px;margin-bottom:24px;text-align:center;">
              <p style="margin:0 0 14px;font-size:13px;color:#E2E8F0;">Accedé de inmediato a tu informe pericial haciendo clic abajo:</p>
              <a href="https://saldoaudit.com.ar/?status=approved&payment_id={str_pid}" style="display:inline-block;padding:14px 28px;background-color:#10B981;color:#090D16;text-decoration:none;font-weight:800;font-size:14px;border-radius:12px;">
                Abrir Informe Completo (.xlsx)
              </a>
            </div>
            <p style="margin:0 0 6px;font-size:13px;color:#E2E8F0;font-weight:600;">Instrucciones para iniciar tus reclamos:</p>
            <ol style="margin:0 0 20px;padding-left:20px;font-size:13px;line-height:1.7;color:#94A3B8;">
              <li>Descargá la planilla con los números de orden y productos completos.</li>
              <li>Utilizá el argumento legal redactado por peritos para exigir el recupero a Mercado Libre.</li>
              <li>Recordá que el 20% a éxito se abona únicamente contra dinero acreditado. Si MeLi rechaza, costo = $0.</li>
            </ol>
            <p style="margin:0;font-size:12px;color:#64748B;">
              ¿Necesitás asistencia? Escribinos a <a href="mailto:contacto@saldoaudit.com.ar" style="color:#34D399;text-decoration:none;">contacto@saldoaudit.com.ar</a>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px;background-color:#090D16;border-top:1px solid #1E293B;text-align:center;font-size:11px;color:#64748B;">
            SaldoAudit Argentina &bull; saldoaudit.com.ar
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>"""
        send_email(payer_email, client_subject, client_html)
    else:
        print(f"[INFO] Payer email ({payer_email}) coincide con admin. Se evita enviar doble correo a la misma casilla.")

    return True

class WebhookHandler(BaseHTTPRequestHandler):
    def do_HEAD(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(b'{"status":"saldoaudit_webhook_alive"}')

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body_str = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            data = json.loads(body_str) if body_str else {}
            
            # Responder 200 OK inmediatamente a Mercado Pago
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"status":"ok"}')

            payment_id = None
            if "data" in data and isinstance(data["data"], dict) and "id" in data["data"]:
                payment_id = data["data"]["id"]
            elif "id" in data:
                payment_id = data["id"]
            
            if payment_id:
                print(f"[WEBHOOK MP] Recibido evento para payment_id: {payment_id}")
                process_payment_notification(payment_id)
            else:
                print(f"[WEBHOOK MP] Evento recibido sin payment_id: {data.get('action') or data.get('type')}")

        except Exception as e:
            print(f"[WEBHOOK ERROR] {e}")
            try:
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b'{"status":"error_logged"}')
            except:
                pass

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 5055), WebhookHandler)
    print("SaldoAudit Webhook daemon listening on 0.0.0.0:5055...")
    server.serve_forever()
