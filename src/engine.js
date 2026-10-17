// Motor SaldoAudit (ReclaMeli) en Node.js
const fs = require('fs');
const path = require('path');
const { generateClaimDossier, generateNavigationGuide } = require('./dossier');

let xlsx = null;
try {
  xlsx = require('xlsx');
} catch (e) {
  // Opcional si no está instalado
}

const COLUMN_ALIASES = {
  orderId: ["# de venta", "id de la venta", "nro. de venta", "número de venta", "orden", "order_id", "código de la venta", "id"],
  tracking: ["número de seguimiento", "número de envío", "nro de envio", "tracking", "código de seguimiento", "shipping_id"],
  itemTitle: ["título de la publicación", "producto", "item_title", "detalle", "descripción", "titulo"],
  amount: ["total (ars)", "ingresos por productos (ars)", "monto", "precio unitario", "total", "importe", "amount"],
  status: ["estado", "estado de la venta", "status", "situación"],
  statusDesc: ["descripción del estado", "subestado"],
  refundAmount: ["anulaciones y reembolsos (ars)"],
  openClaim: ["reclamo abierto"],
  closedClaim: ["reclamo cerrado"],
  returnStatus: ["estado del envío de la devolución", "estado de devolución", "return_status"],
  returnDate: ["fecha en camino", "fecha de despacho de devolución", "fecha de devolución", "fecha envio", "return_date", "fecha de admisión", "fecha de venta", "fecha"],
  returnDeliveredDate: ["fecha entregado", "fecha de entrega de devolución", "fecha entregada", "fecha recibido"],
  dueDate: ["fecha prometida", "fecha límite", "fecha limite", "fecha estimada de entrega", "fecha estimada", "due_date", "vencimiento", "fecha compromiso", "plazo de reclamo"],
  isFull: ["tipo de logística", "logística", "full", "es_full", "canal de envío", "forma de entrega"]
};

const SPANISH_MONTHS = {
  enero: 0, ene: 0,
  febrero: 1, feb: 1,
  marzo: 2, mar: 2,
  abril: 3, abr: 3,
  mayo: 4, may: 4,
  junio: 5, jun: 5,
  julio: 6, jul: 6,
  agosto: 7, ago: 7,
  septiembre: 8, setiembre: 8, sep: 8, set: 8,
  octubre: 9, oct: 9,
  noviembre: 10, nov: 10,
  diciembre: 11, dic: 11
};

function parseMeliDate(rawVal) {
  if (rawVal === null || rawVal === undefined || rawVal === '') return null;
  if (rawVal instanceof Date && !isNaN(rawVal.getTime())) return rawVal;

  if (typeof rawVal === 'number' && rawVal > 25569 && rawVal < 70000) {
    const utcDays = Math.floor(rawVal - 25569);
    return new Date(utcDays * 86400 * 1000);
  }

  const str = String(rawVal).trim().toLowerCase();
  if (!str) return null;

  const esMatch = str.match(/(\d{1,2})\s+de\s+([a-záéíóú]+)(?:\s+de|\s+del?)?\s+(\d{4})/);
  if (esMatch) {
    const day = parseInt(esMatch[1], 10);
    const monthName = esMatch[2].normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const year = parseInt(esMatch[3], 10);
    if (SPANISH_MONTHS[monthName] !== undefined) {
      return new Date(year, SPANISH_MONTHS[monthName], day);
    }
  }

  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    let year = parseInt(dmyMatch[3], 10);
    if (year < 100) year += 2000;
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  const isoMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (isoMatch) {
    const d = new Date(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
    if (!isNaN(d.getTime())) return d;
  }

  const parsed = new Date(rawVal);
  return !isNaN(parsed.getTime()) ? parsed : null;
}

function parseMeliAmount(rawVal) {
  if (typeof rawVal === 'number') return Math.abs(rawVal);
  if (!rawVal) return 0;
  let str = String(rawVal).replace(/\$/g, '').replace(/ars/gi, '').trim();
  if (str.includes('.') && str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes('.') && /\.\d{3}$/.test(str)) {
    str = str.replace(/\./g, '');
  } else if (str.includes(',')) {
    str = str.replace(',', '.');
  }
  return Math.abs(parseFloat(str) || 0);
}

function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  
  let headerIdx = 0;
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const lower = lines[i].toLowerCase();
    if (lower.includes('# de venta') || lower.includes('id de la venta') || lower.includes('order_id')) {
      headerIdx = i;
      break;
    }
  }

  const sep = lines[headerIdx].includes(';') ? ';' : ',';
  const headers = lines[headerIdx].split(sep).map(h => h.trim().replace(/^["']|["']$/g, ''));
  const records = [];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const values = lines[i].split(sep).map(v => v.trim().replace(/^["']|["']$/g, ''));
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    records.push(row);
  }
  return records;
}

function parseXLSX(filePath) {
  if (!xlsx) {
    throw new Error("El paquete 'xlsx' no está instalado. Ejecuta npm install xlsx.");
  }
  const wb = xlsx.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(25, rows.length); i++) {
    const row = rows[i];
    if (Array.isArray(row)) {
      const rowText = row.map(c => String(c).toLowerCase()).join(' ');
      if ((rowText.includes('# de venta') || rowText.includes('id de la venta') || rowText.includes('número de venta') || rowText.includes('orden de compra')) && row.filter(c => c !== '').length > 4) {
        headerRowIndex = i;
        break;
      }
    }
  }

  const headers = rows[headerRowIndex].map(h => String(h || '').trim());
  const records = [];
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0 || !r.some(c => c !== '')) continue;
    const rowObj = {};
    headers.forEach((h, idx) => {
      if (h) rowObj[h] = r[idx] !== undefined ? r[idx] : '';
    });
    records.push(rowObj);
  }
  return records;
}

function findKey(row, aliases) {
  const rowKeys = Object.keys(row);
  for (const alias of aliases) {
    const found = rowKeys.find(k => k.trim().toLowerCase() === alias.toLowerCase());
    if (found && row[found] !== '' && row[found] !== null && row[found] !== undefined) {
      return row[found];
    }
  }
  return null;
}

class ReclaMeliEngine {
  constructor(options = {}) {
    this.minDaysStalled = options.minDaysStalled || 15;
    this.maxClaimWindowDays = options.maxClaimWindowDays || 60;
  }

  auditRecords(records, referenceDate = new Date()) {
    const discrepancies = [];
    const totalSales = records.length;

    for (const row of records) {
      const orderId = String(findKey(row, COLUMN_ALIASES.orderId) || 'S/D').trim();
      if (!orderId || orderId === 'S/D') continue;

      const tracking = String(findKey(row, COLUMN_ALIASES.tracking) || 'S/D').trim();
      const itemTitle = String(findKey(row, COLUMN_ALIASES.itemTitle) || 'Producto sin título').trim();
      
      const rawAmount = findKey(row, COLUMN_ALIASES.amount);
      const rawRefund = findKey(row, COLUMN_ALIASES.refundAmount);
      let amount = parseMeliAmount(rawAmount);
      if (amount === 0 && rawRefund) {
        amount = parseMeliAmount(rawRefund);
      }

      const returnStatus = String(findKey(row, COLUMN_ALIASES.returnStatus) || '').trim().toLowerCase();
      const statusDesc = String(findKey(row, COLUMN_ALIASES.statusDesc) || '').trim().toLowerCase();
      const saleStatus = String(findKey(row, COLUMN_ALIASES.status) || '').trim().toLowerCase();
      const combinedStatus = `${saleStatus} ${statusDesc} ${returnStatus}`.trim();

      const rawFull = findKey(row, COLUMN_ALIASES.isFull);
      const isFull = rawFull ? String(rawFull).toLowerCase().includes('full') : false;

      const hasRefund = rawRefund && parseFloat(String(rawRefund).replace(/\$/g, '').replace(/\./g, '').replace(/,/g, '.').trim()) < 0;
      const rawClaim = String(findKey(row, COLUMN_ALIASES.openClaim) || '').toLowerCase();
      const hasOpenClaim = rawClaim === 'sí' || rawClaim === 'si' || rawClaim === 'true' || rawClaim === '1';

      const isReturnOrCancelContext = 
        returnStatus.length > 0 ||
        hasRefund ||
        hasOpenClaim ||
        ['devoluc', 'devuelto', 'cancelad', 'reclamo', 'mediaci', 'reembols', 'siniestr', 'extraviad'].some(k => combinedStatus.includes(k));

      const rawDate = findKey(row, COLUMN_ALIASES.returnDate);
      const returnDate = parseMeliDate(rawDate);
      let daysStalled = 0;

      if (returnDate) {
        const diffMs = referenceDate.getTime() - returnDate.getTime();
        daysStalled = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      }

      const rawDueDate = findKey(row, COLUMN_ALIASES.dueDate);
      const parsedDue = parseMeliDate(rawDueDate);
      let daysToExpire = Math.max(0, this.maxClaimWindowDays - daysStalled);
      let hasExplicitDueDate = false;

      if (parsedDue) {
        hasExplicitDueDate = true;
        const diffMs = parsedDue.getTime() - referenceDate.getTime();
        daysToExpire = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      }

      const rawDeliveredDate = findKey(row, COLUMN_ALIASES.returnDeliveredDate);
      let returnDeliveredDate = parseMeliDate(rawDeliveredDate);

      const isReturnDelivered = isReturnOrCancelContext && (
        ['entregado al vendedor', 'devuelto al vendedor', 'devolución entregada', 'ingresado a stock', 'te devolvimos', 'entregado'].some(t => returnStatus.includes(t) || statusDesc.includes(t)) ||
        !!returnDeliveredDate
      );

      if (isReturnDelivered && !returnDeliveredDate && returnDate) {
        returnDeliveredDate = returnDate;
      }

      // Regla 0: Plazo crítico de 3 días corridos tras entrega de la devolución
      if (isReturnDelivered && returnDeliveredDate) {
        const diffMs = referenceDate.getTime() - returnDeliveredDate.getTime();
        const daysSinceDelivered = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        const dateDeliveredStr = returnDeliveredDate.toISOString().slice(0, 10);

        if (daysSinceDelivered <= 3) {
          const daysLeft3d = Math.max(0, 3 - daysSinceDelivered);
          const dossier = generateClaimDossier({ orderId, trackingCode: tracking, itemTitle, dateReturnDispatchedStr: dateDeliveredStr, daysStalled: daysSinceDelivered, isFull, type: 'three_day_review' });
          discrepancies.push({
            orderId,
            tracking,
            itemTitle,
            amount,
            daysStalled: daysSinceDelivered,
            daysToExpire: daysLeft3d,
            isThreeDayWindow: true,
            hasExplicitDueDate: false,
            discrepancyType: "Revisión Urgente (Plazo de 3 Días post-entrega)",
            carrierStatus: `Entregado hace ${daysSinceDelivered}d`,
            claimUrl: `https://www.mercadolibre.com.ar/ventas/${orderId}/detalle`,
            navigationGuide: generateNavigationGuide(orderId, 'three_day_review'),
            dossierText: dossier
          });
          continue;
        }
      }

      // Regla 1: Siniestro confirmado pero no indemnizado
      const isSiniestro = ['siniestrado', 'extraviado', 'perdido', 'robo', 'hurto'].some(t => combinedStatus.includes(t));
      if (isSiniestro) {
        const dateStr = returnDate ? returnDate.toISOString().slice(0, 10) : 'S/F';
        const dossier = generateClaimDossier({ orderId, trackingCode: tracking, itemTitle, dateReturnDispatchedStr: dateStr, daysStalled, isFull, type: 'stalled' });
        discrepancies.push({
          orderId,
          tracking,
          itemTitle,
          amount,
          daysStalled,
          daysToExpire,
          isThreeDayWindow: false,
          hasExplicitDueDate,
          discrepancyType: "Siniestro / Extravío No Indemnizado",
          carrierStatus: returnStatus || statusDesc || saleStatus,
          claimUrl: `https://www.mercadolibre.com.ar/ventas/${orderId}/detalle`,
          navigationGuide: generateNavigationGuide(orderId, 'stalled'),
          dossierText: dossier
        });
        continue;
      }

      // Regla 2: Devolución congelada en camino > minDaysStalled
      const isInTransit = isReturnOrCancelContext && ['en camino', 'en tránsito', 'en transito', 'demorado', 'revisión', 'en distribucion', 'retirando', 'correo'].some(t => returnStatus.includes(t) || statusDesc.includes(t));

      if (isInTransit && !isReturnDelivered && daysStalled >= this.minDaysStalled) {
        const discType = isFull ? "Faltante Interno en Depósito Full" : "Devolución Congelada en Camino";
        const dateStr = returnDate ? returnDate.toISOString().slice(0, 10) : 'S/F';
        const dossier = generateClaimDossier({ orderId, trackingCode: tracking, itemTitle, dateReturnDispatchedStr: dateStr, daysStalled, isFull, type: 'stalled' });

        discrepancies.push({
          orderId,
          tracking,
          itemTitle,
          amount,
          daysStalled,
          daysToExpire,
          isThreeDayWindow: false,
          hasExplicitDueDate,
          discrepancyType: discType,
          carrierStatus: returnStatus || statusDesc,
          claimUrl: `https://www.mercadolibre.com.ar/ventas/${orderId}/detalle`,
          navigationGuide: generateNavigationGuide(orderId, 'stalled'),
          dossierText: dossier
        });
      }
    }

    const totalAmount = discrepancies.reduce((acc, d) => acc + d.amount, 0);
    const expiringSoon = discrepancies.filter(d => (d.isThreeDayWindow && d.daysToExpire <= 2) || (!d.isThreeDayWindow && d.daysToExpire > 0 && d.daysToExpire <= 10)).length;

    return {
      totalSalesAudited: totalSales,
      totalDiscrepancies: discrepancies.length,
      totalAmountRecoverable: totalAmount,
      criticalExpiringSoon: expiringSoon,
      records: discrepancies
    };
  }

  auditFile(filePath, referenceDate = new Date()) {
    const ext = path.extname(filePath).toLowerCase();
    let records = [];

    if (ext === '.xlsx' || ext === '.xls') {
      records = parseXLSX(filePath);
    } else if (ext === '.json') {
      const content = fs.readFileSync(filePath, 'utf8');
      records = JSON.parse(content);
    } else if (ext === '.csv') {
      const content = fs.readFileSync(filePath, 'utf8');
      records = parseCSV(content);
    } else {
      throw new Error(`Formato no soportado directamente: ${ext}. Usa .xlsx, .xls o .csv`);
    }

    return this.auditRecords(records, referenceDate);
  }
}

module.exports = { ReclaMeliEngine, parseCSV, parseXLSX, parseMeliDate, parseMeliAmount };
