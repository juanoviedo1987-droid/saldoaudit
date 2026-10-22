# Modelo de Negocio Oficial — SaldoAudit 💼

> **Micro-SaaS B2B FinTech de Conciliación Forense y Recupero de Fondos en Mercado Libre Argentina.**  
> **Benchmark Global:** Ecosistema de compensaciones Amazon FBA (GETIDA / Carbon6).

---

## 1. Resumen Ejecutivo y Propuesta de Valor

### El Problema Operativo en Mercado Libre
Los vendedores de Mercado Libre en Argentina sufren pérdidas sistemáticas de capital en su operativa logística:
1. **Siniestros de transporte impagos:** Paquetes rotos, extraviados o cancelados en tránsito por el correo donde MeLi no acredita la indemnización a menos que el seller abra un ticket antes de los 60 días corridos.
2. **La ventana crítica de 72 horas:** Devoluciones con productos usados, rotos o cajas vacías donde el vendedor pierde el derecho a desconocer el estado si no actúa dentro de los 3 días corridos post-entrega.
3. **Fletes cobrados indebidamente en Full:** Devoluciones de reclamos infundados donde la logística inversa se le cobra indebidamente al seller.

---

## 2. Arquitectura de Ingresos en 2 Vías

### VÍA 1: Self-Service 100% Automatizado (Sellers Pequeños y Medianos)
* **Público:** Vendedores de hasta 1.500 ventas/mes.
* **Modelo:** **Scan Gratuito + Paywall Teaser ($39.000 ARS)**.
* **Flujo Operativo:**
  1. El seller carga su reporte de ventas (.xlsx / .csv) de forma 100% privada (*Zero-Cloud*).
  2. El sistema calcula en 1 segundo el monto total recuperable y muestra 3 casos de muestra con ID enmascarado.
  3. Las órdenes restantes quedan protegidas por un **Efecto Cortina con Candado** (aisladas del DOM y consola contra F12).
  4. Para desbloquear la lista completa y los dossiers de reclamo, abona **$39.000 ARS** vía Mercado Pago Checkout Pro.
  5. La computadora auto-detecta la acreditación (incluso si pagó vía QR en el celular) y desbloquea el informe al instante.
  6. **Costo operativo para SaldoAudit:** $0 ARS (100% margen bruto, proceso desatendido).

### VÍA 2: Plan Enterprise / Corporativo (+1.500 ventas / Tipo Hudson)
* **Público:** Cuentas grandes y marcas corporativas.
* **Modelo:** **$0 Upfront + 20% Success Fee** sobre dinero efectivamente recuperado.
* **Flujo Operativo:**
  1. Contacto directo vía WhatsApp institucional (+54 9 11 7237-6197) o formulario web.
  2. Diagnóstico forense histórico sin cargo (demostración de valor con datos reales).
  3. Entrega de dossiers legales y argumentos periciales listos para que el equipo administrativo del cliente abra los casos en MeLi (evitando bloqueos por permisos de colaboradores en MeLi).
  4. Liquidación quincenal o mensual del 20% contra el reporte de reintegros impactados en Mercado Pago.
  5. Contrato de monitoreo mensual recurrente.

---

## 3. Infraestructura y Ventajas Competitivas

1. **Privacidad Zero-Cloud:** Ninguna planilla ni dato de clientes se sube a servidores de terceros; el análisis forense se procesa íntegramente en la memoria del navegador.
2. **Dossier Pericial Preciso:** Cada orden incluye el argumento legal y la cita de normativa interna de MeLi para que el reclamo no sea rechazado por bots de primera línea.
3. **Conversión Inmediata con ROI Positivo:** El cliente ve que invierte $39.000 ARS para recuperar montos superiores a $150.000 ARS en 48 horas.
3. **Enfoque No-API / Privacidad Total:**
   * Procesamiento local en navegador sobre reportes estándar que el seller ya posee, sin solicitar permisos invasivos de cuenta.

---

## 5. Estrategia de Adquisición (Go-To-Market)

1. **Enfoque Educativo y de Alerta Temprana:** Explicar a los sellers la regla no escrita: *"Pasados 60 días de la devolución, MeLi ya no reconoce reclamos ni bonificaciones"*.
2. **Auditoría de Demoras en 30 Segundos:** Demostración en vivo mediante la aplicación web para que el seller vea sus envíos en riesgo de caducar.
3. **Alianzas con Agencias y Gestores de Cuentas.**

---

## 6. Métricas Clave de Negocio (KPIs a Medir en Piloto)

* **Tasa de Resolución Favorable:** % de expedientes presentados que obtienen resolución económica de MeLi.
* **Ratio de Compensación Real (%):** $\frac{\text{Monto efectivamente liquidado por MeLi}}{\text{Valor de venta del producto}}$. (Métrica crítica para fijar el pricing final).
* **Plazo de Liquidación:** Días corridos desde la apertura del reclamo en el detalle de la venta hasta la acreditación.
