# Índice Maestro de Procedimientos Operativos Estándar (SOPs) — SaldoAudit

> **Código:** SOP-SALDOAUDIT-2026  
> **Área:** Operaciones, Reconciliación & Reclamos en Mercado Libre

---

## 📌 SOP-01: Ingesta, Anonimización y Procesamiento de Reportes
1. **Requerimiento al cliente:**
   - Solicitar reporte de ventas en Excel de los últimos 60 días corridos desde *Ventas > Ventas > Exportar*.
   - Informar al cliente que puede eliminar las columnas de datos personales (Nombre del comprador, DNI, Teléfono y Dirección).
2. **Procesamiento en Motor SaldoAudit:**
   - Arrastrar el archivo en la suite local.
   - Si MeLi exportó columnas duplicadas (ej. "Estado" en columna 2 y en columna 41), el sistema aplica el disambiguador automático de encabezados.
   - Descargar el archivo `.xlsx` de auditoría procesado.

---

## 📌 SOP-02: Matriz Forense de Clasificación de Reclamos
Cada orden detectada se clasifica en una de las 4 categorías operativas:

1. **Urgente 72 Horas (Devolución entregada recientemente):**
   - *Condición:* Devolución con estado "entregado" en los últimos 3 días corridos.
   - *Acción:* Exigir al encargado de depósito abrir la caja física inmediatamente y verificar estado. Si vino roto, usado o vacío, desconocer la devolución en MeLi antes de la medianoche del 3er día.
2. **Siniestro / Extravío de Correo:**
   - *Condición:* Estado "No entregado", "inconveniente en el envío" o venta cancelada por demora del transportista sin retorno del paquete.
   - *Acción:* Abrir caso en soporte de MeLi bajo la tipología *Siniestro de Envío* exigiendo indemnización íntegra del producto.
3. **Devolución en Depósito Full con Flete Indebido:**
   - *Condición:* Producto revisado en Full donde el comprador reclamó marcas de uso y se le facturó el costo del envío al seller.
   - *Acción:* Solicitar bonificación del costo de logística inversa invocando el programa de protección al vendedor.
4. **Devolución Congelada en Tránsito:**
   - *Condición:* Paquete en camino con fecha comprometida de entrega vencida sin actualización en los últimos 15 días.
   - *Acción:* Reclamar estatus de extravío presunto.

---

## 📌 SOP-03: Entrega del Informe y Cierre Comercial
1. **Paso 1 (Audio de WhatsApp):**
   - Enviar audio personal de 20 a 25 segundos agradeciendo la confianza y adelantando que se detectaron casos recuperables interesantes.
2. **Paso 2 (Resumen Ejecutivo en Texto):**
   - Enviar total de ventas auditadas, número de casos detectados y monto en juego en ARS.
3. **Paso 3 (Planilla con Links):**
   - Adjuntar el Excel generado con las órdenes y los links directos a soporte de MeLi para que el equipo administrativo opere de inmediato.

---

## 📌 SOP-04: Alta y Operación como Colaborador Oficial en Mercado Libre
Para clientes del Plan VIP (20% a Éxito):
1. **Invitación:**
   - La empresa ingresa a *Ventas > Preferencias de venta > Colaboradores > Crear Rol*.
   - Nombre del Rol: **Auditoría de Reclamos y Posventa**.
   - Permisos concedidos: *Atención de Reclamos, Mensajería y Ventas*.
   - **Permisos expresamente denegados:** Retiro de dinero, transferencias en Mercado Pago, facturación y modificación de datos fiscales.
2. **Operación del Caso:**
   - SaldoAudit ingresa con su propio usuario, redacta el dossier de soporte y responde las mediaciones.
3. **Liquidación:**
   - Al finalizar el mes calendario, se extrae el reporte de indemnizaciones y reclamos acreditados en la cuenta del cliente y se emite la factura de comisión por el 20%.
