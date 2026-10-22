// Generador de Dossiers y Textos de Reclamo Fácticos de SaldoAudit
// Adaptados por Responsable: Mercado Libre, Fletero Flex o Recepción de Depósito

function generateClaimDossier({ orderId, trackingCode, itemTitle, dateReturnDispatchedStr, daysStalled, isFull = false, carrier = '', shippingCost = 0, type = 'stalled' }) {
  if (type === 'flex_transport') {
    return (
      `Estimados [Transporte Flex / ${carrier || 'Logística'}]: ` +
      `Con relación a la orden #${orderId} (${itemTitle}), el envío figura cancelado en reparto por demora en la entrega. ` +
      `De acuerdo a los registros de la plataforma, el paquete quedó en poder de su chofer/cadetería y no registra devolución en nuestro depósito. ` +
      `Solicitamos la restitución física del bulto cerrado en nuestro centro de expedición dentro de las próximas 48 horas o, en su defecto, ` +
      `la emisión de la nota de crédito / débito de factura correspondiente por reposición de mercadería.`
    );
  }

  if (type === 'full_dispute') {
    const fleteTxt = shippingCost > 0 ? ` Adicionalmente, exigimos la anulación y reintegro inmediato del cargo de envío debitado por $${shippingCost.toLocaleString('es-AR')}.` : '';
    return (
      `Solicito intervención de mediación y aplicación de la cobertura de Envíos Full para la orden #${orderId} (${itemTitle}). ` +
      `Mercado Libre autorizó la devolución de un producto que fue remitido en estado nuevo y cerrado de fábrica, y el informe de revisión consigna que 'presenta marcas de uso' atribuibles al comprador. ` +
      `Bajo las Políticas de Devoluciones de la plataforma, los artículos usados o abiertos no califican para reintegro en perjuicio del vendedor.` +
      fleteTxt +
      ` Requerimos la liquidación de la indemnización por pérdida de condición comercial del ítem.`
    );
  }

  if (type === 'three_day_review') {
    return (
      `Informo que la devolución de la orden #${orderId} (${itemTitle}) figura entregada con fecha ${dateReturnDispatchedStr}. ` +
      `Dentro del plazo reglamentario de 72 horas corridas de revisión del vendedor, constato disconformidad con lo recibido: ` +
      `el producto presenta roturas/daños/marcas de uso no atribuibles a origen. ` +
      `Adjunto registro fotográfico de empaque, etiqueta y pieza dañada. ` +
      `Solicito la aplicación inmediata de la cobertura del Programa de Protección al Vendedor y el reintegro de los cargos aplicados.`
    );
  }

  if (type === 'official_carrier_siniestro') {
    return (
      `Solicito la acreditación formal de la indemnización por siniestro logístico de Mercado Envíos ` +
      `para la orden #${orderId} (${itemTitle}), transportada por ${carrier || 'correo oficial'}. ` +
      `El sistema consigna expresamente 'Detectamos un inconveniente en el envío y no podremos entregar tu producto' / 'No entregado'. ` +
      `Habiéndose reintegrado el dinero al comprador y encontrándose la mercadería retenida o extraviada bajo custodia de la logística de Mercado Libre, ` +
      `corresponde la liquidación del valor neto de la venta bajo el Programa de Protección al Vendedor.`
    );
  }

  if (type === 'radar_due_date') {
    return (
      `Cumplida la fecha de compromiso de entrega fijada por Mercado Libre (${dateReturnDispatchedStr}) sin que el paquete de la orden #${orderId} ` +
      `haya sido devuelto físicamente a nuestro domicilio, intimo la liquidación inmediata de la cobertura por extravío en transporte postal.`
    );
  }

  if (type === 'cancel_security') {
    return (
      `Para la orden #${orderId} (${itemTitle}), cancelada unilateralmente por Mercado Libre por 'irregularidades': ` +
      `Si el paquete ya había sido recolectado por el transporte oficial y no registra retorno a nuestro centro de distribución, ` +
      `exigimos la liquidación de la indemnización por mercadería despachada bajo autorización inicial de la plataforma.`
    );
  }

  return (
    `Solicito formalmente la intervención logística y aplicación de la cobertura por extravío de Mercado Envíos ` +
    `para la orden #${orderId}. ` +
    `La devolución fue admitida por el correo el ${dateReturnDispatchedStr} (Tracking: ${trackingCode}) ` +
    `y el seguimiento permanece inmovilizado habiendo superado la fecha límite comprometida. ` +
    `Solicito la acreditación de la indemnización correspondiente a favor del vendedor.`
  );
}

function generateNavigationGuide(orderId, type = 'stalled') {
  if (type === 'flex_transport') {
    return [
      `1. Copiar los datos de la orden (#${orderId}) y fecha de despacho.`,
      `2. Remitir el texto del dossier vía WhatsApp o correo formal a la empresa de logística Flex.`,
      `3. Solicitar acuse de recibo y coordinar la entrega física del bulto o el débito en la próxima liquidación quincenal.`
    ].join('\n');
  }

  if (type === 'three_day_review') {
    return [
      `1. Ingresar de inmediato a: https://www.mercadolibre.com.ar/ventas/${orderId}/detalle`,
      `2. 🚨 ALERTA 72 HS: Si el producto está dañado, reportar antes de cumplirse las 72 hs post-entrega.`,
      `3. Pulsar 'Ayuda con la venta' -> 'Tengo un problema con la devolución' -> 'El producto llegó dañado / incompleto / usado'.`,
      `4. Adjuntar fotos nítidas del empaque exterior, etiqueta del correo y rotura del producto.`,
      `5. Pegar el texto del dossier para exigir la cobertura al vendedor.`
    ].join('\n');
  }

  return [
    `1. Ingresar directamente a: https://www.mercadolibre.com.ar/ventas/${orderId}/detalle`,
    `2. Ir al pie de página y pulsar 'Ayuda con la venta' (o menú tres puntos).`,
    `3. Seleccionar 'Tengo un problema con un envío' -> 'El paquete está demorado / no llega'.`,
    `4. Si atiende el bot automático, seleccionar 'NO' a '¿Te sirvió la información?' para abrir caso con asesor humano.`,
    `5. Pegar el texto del dossier de SaldoAudit.`
  ].join('\n');
}

module.exports = { generateClaimDossier, generateNavigationGuide };
