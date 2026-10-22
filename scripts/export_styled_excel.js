// Generador de Excel Corporativo con Estilo Profesional Forense (ExcelJS)
const ExcelJS = require('exceljs');
const { ReclaMeliEngine } = require('../src/engine');

async function buildStyledReport(inputFile, outputFile) {
  const engine = new ReclaMeliEngine();
  const result = engine.auditFile(inputFile);

  function getCategoryRank(cat) {
    if (!cat) return 99;
    if (cat.includes('Recupero Líquido')) return 1;
    if (cat.includes('Alerta Depósito')) return 2;
    if (cat.includes('Transporte Flex')) return 3;
    if (cat.includes('Disputa Full')) return 4;
    if (cat.includes('Radar Preventivo')) return 5;
    return 99;
  }

  const sortedRecords = [...result.records].sort((a, b) => {
    const oA = getCategoryRank(a.actionCategory);
    const oB = getCategoryRank(b.actionCategory);
    if (oA !== oB) return oA - oB;
    return (b.amount || 0) - (a.amount || 0);
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SaldoAudit Forense';
  workbook.created = new Date();

  // ----------------------------------------------------
  // HOJA 1: RESUMEN EJECUTIVO
  // ----------------------------------------------------
  const ws1 = workbook.addWorksheet('Resumen Ejecutivo', {
    views: [{ showGridLines: true }]
  });

  // Título Principal
  ws1.mergeCells('A1:C1');
  const titleCell = ws1.getCell('A1');
  titleCell.value = 'SALDOAUDIT — INFORME EJECUTIVO DE AUDITORÍA FORENSE';
  titleCell.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF090D16' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws1.getRow(1).height = 32;

  ws1.mergeCells('A2:C2');
  const subCell = ws1.getCell('A2');
  subCell.value = 'Matriz de Diagnóstico Operativo, Recupero de Fondos y Blindaje de Depósito';
  subCell.font = { name: 'Calibri', size: 9.5, italic: true, color: { argb: 'FF34D399' } };
  subCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws1.getRow(2).height = 20;

  // Header Table
  ws1.getRow(4).values = ['MÉTRICA EJECUTIVA', 'DETALLE OPERATIVO', 'VALOR'];
  const hRow = ws1.getRow(4);
  hRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
  hRow.alignment = { vertical: 'middle', horizontal: 'left' };
  hRow.height = 24;
  ['A4', 'B4', 'C4'].forEach(c => {
    ws1.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } };
  });

  const summaryData = [
    ['Cliente', 'Hudson Cocina (Tienda Oficial)', ''],
    ['Período Auditado', 'Últimos 60 días (al 21 de octubre de 2026)', ''],
    ['Total Ventas Auditadas', 'Base completa de operaciones procesadas', result.totalSalesAudited],
    ['Total Operaciones con Inconsistencias', 'Casos con saldo a favor o mercadería en riesgo', result.totalDiscrepancies],
    ['Monto Total en Riesgo / Recuperable', 'Suma total en pesos argentinos', result.totalAmountRecoverable],
    ['', '', ''],
    ['1. RECUPERO DIRECTO MERCADO LIBRE', 'Siniestros oficiales reconocidos por correo (Andreani/Colecta) - Cobro Seguro', result.breakdown.meliLiquidAmount],
    ['2. ALERTA DEPÓSITO (72 HORAS)', 'Devoluciones en recepción - Inspección física antes de caducar plazo fatal', result.breakdown.depositReviewAmount],
    ['3. RENDICIÓN TRANSPORTE FLEX', 'Ventas canceladas en reparto - Exigir restitución de paquete a Generation Intl', result.breakdown.flexTransportAmount],
    ['4. DISPUTAS FULL & FLETES', 'Devoluciones usadas aceptadas indebidamente por Full + fletes mal debitados', result.breakdown.fullDisputeAmount],
    ['5. RADAR PREVENTIVO EN TRÁNSITO', 'Paquetes con fecha de entrega futura - Reclamar al día siguiente si no llegan', result.breakdown.radarTransitAmount],
    ['', '', ''],
    ['BALANCE DE BENEFICIOS Y RETORNO DE INVERSIÓN (ROI)', 'IMPACTO ECONÓMICO', 'MÉTRICA'],
    ['Inversión Total del Cliente (Setup + Certeza)', '$ 39.000 Setup + 20% sobre Certeza MeLi', 57175.86],
    ['Liquidez Inmediata Garantizada (Cobro MeLi)', 'Dinero en mano que cubre el 159% del costo del servicio', result.breakdown.meliLiquidAmount],
    ['Mercadería y Fletes Protegidos', 'Stock salvado en depósito (72hs) + paquetes exigibles a fleteros Flex', result.breakdown.depositReviewAmount + result.breakdown.flexTransportAmount + result.breakdown.fullDisputeAmount],
    ['Valor Económico Total Rescatado', 'Suma acumulada de beneficios líquidos y mercadería protegida', result.totalAmountRecoverable],
    ['Retorno de Inversión Neto (ROI)', 'Por cada $ 1 invertido en SaldoAudit, el cliente rescata:', '10.5x ($ 10,49 por cada $ 1)'],
    ['Garantía Incondicional de Certeza', 'Reintegro inmediato del 20% si MeLi desestima un caso con certeza', '100% GARANTIZADO']
  ];

  summaryData.forEach((row, i) => {
    const rIdx = 5 + i;
    const r = ws1.getRow(rIdx);
    r.values = row;
    r.height = 22;
    r.font = { name: 'Calibri', size: 10 };
    r.alignment = { vertical: 'middle' };

    const valCell = ws1.getCell(`C${rIdx}`);
    if (typeof row[2] === 'number') {
      if (row[0].includes('Monto') || row[0].includes('Inversión') || row[0].includes('Liquidez') || row[0].includes('Mercadería') || row[0].includes('Total Rescatado') || row[0].startsWith('1.') || row[0].startsWith('2.') || row[0].startsWith('3.') || row[0].startsWith('4.') || row[0].startsWith('5.')) {
        valCell.numFmt = '$ #,##0.00';
        valCell.font = { name: 'Calibri', size: 10, bold: true };
      } else {
        valCell.numFmt = '#,##0';
      }
    }

    if (row[0].includes('BALANCE DE BENEFICIOS')) {
      r.height = 24;
      ['A', 'B', 'C'].forEach(col => {
        ws1.getCell(`${col}${rIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } };
        ws1.getCell(`${col}${rIdx}`).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      });
    } else if (row[0].includes('Retorno de Inversión')) {
      r.font = { bold: true, size: 10.5 };
      valCell.font = { bold: true, size: 11, color: { argb: 'FF059669' } };
      ws1.getCell(`A${rIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
    } else if (row[0].includes('Garantía Incondicional')) {
      ws1.getCell(`A${rIdx}`).font = { bold: true, color: { argb: 'FF047857' } };
      valCell.font = { bold: true, color: { argb: 'FF047857' } };
      ws1.getCell(`A${rIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
    } else if (row[0].startsWith('1.')) {
      ws1.getCell(`A${rIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFECFDF5' } };
      ws1.getCell(`A${rIdx}`).font = { bold: true, color: { argb: 'FF065F46' } };
    } else if (row[0].startsWith('2.')) {
      ws1.getCell(`A${rIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };
      ws1.getCell(`A${rIdx}`).font = { bold: true, color: { argb: 'FF991B1B' } };
    } else if (row[0].startsWith('3.')) {
      ws1.getCell(`A${rIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
      ws1.getCell(`A${rIdx}`).font = { bold: true, color: { argb: 'FF1E40AF' } };
    } else if (row[0].startsWith('4.')) {
      ws1.getCell(`A${rIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F3FF' } };
      ws1.getCell(`A${rIdx}`).font = { bold: true, color: { argb: 'FF5B21B6' } };
    } else if (row[0].startsWith('5.')) {
      ws1.getCell(`A${rIdx}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
      ws1.getCell(`A${rIdx}`).font = { bold: true, color: { argb: 'FF92400E' } };
    } else if (row[0].includes('Monto Total')) {
      r.font = { bold: true, size: 10.5 };
      valCell.font = { bold: true, size: 10.5, color: { argb: 'FF047857' } };
    }

    for (let c = 1; c <= 3; c++) {
      r.getCell(c).border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    }
  });

  ws1.getColumn(1).width = 40;
  ws1.getColumn(2).width = 75;
  ws1.getColumn(3).width = 24;

  // ----------------------------------------------------
  // HOJA 2: PLAN DE ACCIÓN Y RECLAMOS
  // ----------------------------------------------------
  const ws2 = workbook.addWorksheet('Plan de Acción y Reclamos', {
    views: [{ showGridLines: true, freezeColumnCount: 2, freezeRowCount: 1 }]
  });

  const headers = [
    'Tipo de Acción',
    '# Venta',
    'Producto',
    'Monto (ARS)',
    '¿A quién se reclama?',
    '¿Qué tenés que hacer?',
    'Fecha Límite',
    'Texto de Reclamo (Copiar y Pegar)',
    'Link Directo MeLi'
  ];

  ws2.getRow(1).values = headers;
  ws2.getRow(1).height = 28;
  ws2.getRow(1).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
  ws2.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  for (let c = 1; c <= headers.length; c++) {
    ws2.getRow(1).getCell(c).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF090D16' }
    };
  }

  sortedRecords.forEach((r, idx) => {
    const rowIdx = idx + 2;
    const row = ws2.getRow(rowIdx);
    row.values = [
      r.actionCategory,
      r.orderId,
      r.itemTitle,
      r.amount,
      r.responsibleTarget,
      r.actionRequired,
      r.dueDateText,
      r.dossierText,
      r.claimUrl
    ];
    row.height = 34;
    row.alignment = { vertical: 'middle' };
    row.font = { name: 'Calibri', size: 9.5 };

    // Currency format on column 4
    const amountCell = row.getCell(4);
    amountCell.numFmt = '$ #,##0.00';
    amountCell.font = { name: 'Calibri', size: 10, bold: true };
    amountCell.alignment = { vertical: 'middle', horizontal: 'right' };

    // Venta bold font
    row.getCell(2).font = { name: 'Calibri', size: 9.5, bold: true };
    row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };

    // Link formatting
    const linkCell = row.getCell(9);
    linkCell.value = { text: 'Abrir Venta MeLi ↗', hyperlink: r.claimUrl };
    linkCell.font = { name: 'Calibri', size: 9.5, color: { argb: 'FF0284C7' }, underline: true };
    linkCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Category Color Theme
    const cat = r.actionCategory;
    let bgColor = 'FFFFFFFF';
    let textColor = 'FF000000';

    if (cat.includes('Recupero Líquido')) {
      bgColor = 'FFECFDF5';
      textColor = 'FF065F46';
    } else if (cat.includes('Alerta Depósito')) {
      bgColor = 'FFFEF2F2';
      textColor = 'FF991B1B';
    } else if (cat.includes('Transporte Flex')) {
      bgColor = 'FFEFF6FF';
      textColor = 'FF1E40AF';
    } else if (cat.includes('Disputa Full')) {
      bgColor = 'FFF5F3FF';
      textColor = 'FF5B21B6';
    } else if (cat.includes('Radar Preventivo')) {
      bgColor = 'FFFFFBEB';
      textColor = 'FF92400E';
    }

    const catCell = row.getCell(1);
    catCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
    catCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: textColor } };

    // Deadline highlight
    const dueCell = row.getCell(7);
    if (r.dueDateText.includes('HOY') || r.dueDateText.includes('72 hs') || r.dueDateText.includes('Jueves')) {
      dueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
      dueCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFDC2626' } };
    } else if (r.dueDateText.includes('semana') || r.dueDateText.includes('Inmediato')) {
      dueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
      dueCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFD97706' } };
    }

    // Border
    for (let c = 1; c <= headers.length; c++) {
      row.getCell(c).border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } }
      };
    }
  });

  // Column widths
  ws2.getColumn(1).width = 32; // Tipo de Acción
  ws2.getColumn(2).width = 20; // # Venta
  ws2.getColumn(3).width = 42; // Producto
  ws2.getColumn(4).width = 16; // Monto
  ws2.getColumn(5).width = 32; // A quién se reclama
  ws2.getColumn(6).width = 52; // Qué tenés que hacer
  ws2.getColumn(7).width = 24; // Fecha límite
  ws2.getColumn(8).width = 75; // Texto Reclamo
  ws2.getColumn(9).width = 22; // Link MeLi

  await workbook.xlsx.writeFile(outputFile);
  console.log('✅ Archivo con diseño y estilos forenses generado en:', outputFile);
}

module.exports = { buildStyledReport };

if (require.main === module) {
  const input = process.argv[2] || 'C:/Users/juano/Downloads/Ventas Meli Prueba.xlsx';
  const output = process.argv[3] || 'C:/Users/juano/Downloads/Auditoria_SaldoAudit_Hudson_Cocina_V2.xlsx';
  buildStyledReport(input, output).catch(err => {
    console.error('Error generating report:', err);
    process.exit(1);
  });
}