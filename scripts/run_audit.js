// Runner CLI para ejecutar auditorías en Node.js
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { ReclaMeliEngine } = require('../src/engine');

function formatCurrency(num) {
  return '$ ' + (num || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function main() {
  const args = process.argv.slice(2);
  const defaultFile = path.join(__dirname, '..', 'data', 'samples', 'sample_ventas_meli.csv');
  const targetFile = args[0] || defaultFile;

  if (!fs.existsSync(targetFile)) {
    console.error(`❌ Error: El archivo ${targetFile} no existe.`);
    process.exit(1);
  }

  console.log(`\n🔍 Analizando archivo: ${path.basename(targetFile)} con SaldoAudit Forense V2...`);
  const engine = new ReclaMeliEngine({ minDaysStalled: 15, maxClaimWindowDays: 60 });
  const summary = engine.auditFile(targetFile);

  console.log('\n' + '='.repeat(80));
  console.log('📊 SALDOAUDIT — REPORTE EJECUTIVO FORENSE Y MATRIZ OPERATIVA');
  console.log('='.repeat(80));
  console.log(`Total de ventas analizadas:             ${summary.totalSalesAudited.toLocaleString('es-AR')}`);
  console.log(`Inconsistencias y riesgos detectados:   ${summary.totalDiscrepancies}`);
  console.log(`Monto Total en Riesgo / Recuperable:    ${formatCurrency(summary.totalAmountRecoverable)} ARS`);
  console.log('-'.repeat(80));
  console.log(`🟢 1. Recupero Líquido MeLi (Seguro):   ${formatCurrency(summary.breakdown?.meliLiquidAmount)} ARS`);
  console.log(`🟡 2. Alerta Depósito (Ventana 72hs):   ${formatCurrency(summary.breakdown?.depositReviewAmount)} ARS`);
  console.log(`🔵 3. Rendición Transporte Flex:        ${formatCurrency(summary.breakdown?.flexTransportAmount)} ARS`);
  console.log(`🟣 4. Disputas Full & Fletes:           ${formatCurrency(summary.breakdown?.fullDisputeAmount)} ARS`);
  console.log(`⏱️ 5. Radar Preventivo (En Tránsito):    ${formatCurrency(summary.breakdown?.radarTransitAmount)} ARS`);
  console.log(`📦 Fletes debitados al vendedor:        ${formatCurrency(summary.breakdown?.totalShippingDebit)} ARS`);
  console.log('='.repeat(80));

  if (summary.records.length > 0) {
    console.log('\n📋 DETALLE OPERATIVO POR DESTINO DE RECLAMO:\n');
    summary.records.forEach((r, idx) => {
      console.log(`[#${idx + 1}] ORDEN: ${r.orderId} | MONTO: ${formatCurrency(r.amount)} ARS`);
      console.log(`    Categoría:   ${r.actionCategory}`);
      console.log(`    Responsable: ${r.responsibleTarget}`);
      console.log(`    Acción:      ${r.actionRequired}`);
      console.log(`    Plazo:       ${r.dueDateText}`);
      console.log(`    Link MeLi:   ${r.claimUrl}`);
      console.log('-'.repeat(80));
    });

    function getCategoryRank(cat) {
      if (!cat) return 99;
      if (cat.includes('Recupero Líquido')) return 1;
      if (cat.includes('Alerta Depósito')) return 2;
      if (cat.includes('Transporte Flex')) return 3;
      if (cat.includes('Disputa Full')) return 4;
      if (cat.includes('Radar Preventivo')) return 5;
      return 99;
    }

    const sortedRecords = [...summary.records].sort((a, b) => {
      const oA = getCategoryRank(a.actionCategory);
      const oB = getCategoryRank(b.actionCategory);
      if (oA !== oB) return oA - oB;
      return (b.amount || 0) - (a.amount || 0);
    });

    // Guardar Excel Multi-Hoja Simplificado
    const wb = xlsx.utils.book_new();

    const resumenRows = [
      { 'MÉTRICA': 'AUDITORÍA FORENSE SALDOAUDIT', 'DETALLE': 'Matriz Operativa de Recupero y Blindaje', 'VALOR': '' },
      { 'MÉTRICA': 'TOTAL OPERACIONES AUDITADAS', 'DETALLE': 'Base analizada de ventas', 'VALOR': summary.totalSalesAudited },
      { 'MÉTRICA': 'TOTAL OPERACIONES CON DISCREPANCIA', 'DETALLE': 'Casos en riesgo o con saldo a favor', 'VALOR': summary.totalDiscrepancies },
      { 'MÉTRICA': 'MONTO TOTAL EN RIESGO (ARS)', 'DETALLE': 'Suma total analizada', 'VALOR': summary.totalAmountRecoverable },
      { 'MÉTRICA': '', 'DETALLE': '', 'VALOR': '' },
      { 'MÉTRICA': '1. RECUPERO DIRECTO MERCADO LIBRE', 'DETALLE': 'Siniestros oficiales reconocidos por correo (Cobro Seguro)', 'VALOR': summary.breakdown?.meliLiquidAmount || 0 },
      { 'MÉTRICA': '2. ALERTA DEPÓSITO (72 HORAS)', 'DETALLE': 'Devoluciones en recepción - Inspección física antes de caducar', 'VALOR': summary.breakdown?.depositReviewAmount || 0 },
      { 'MÉTRICA': '3. RENDICIÓN TRANSPORTE FLEX', 'DETALLE': 'Ventas canceladas en reparto - Exigir restitución al fletero Flex', 'VALOR': summary.breakdown?.flexTransportAmount || 0 },
      { 'MÉTRICA': '4. DISPUTAS FULL & FLETES', 'DETALLE': 'Devoluciones usadas aceptadas indebidamente por Full + fletes', 'VALOR': summary.breakdown?.fullDisputeAmount || 0 },
      { 'MÉTRICA': '5. RADAR PREVENTIVO EN TRÁNSITO', 'DETALLE': 'Paquetes con fecha de entrega futura - Reclamar al vencimiento', 'VALOR': summary.breakdown?.radarTransitAmount || 0 }
    ];
    const wsResumen = xlsx.utils.json_to_sheet(resumenRows);
    wsResumen['!cols'] = [{ wch: 38 }, { wch: 70 }, { wch: 22 }];
    xlsx.utils.book_append_sheet(wb, wsResumen, 'Resumen Ejecutivo');

    // HOJA 2: PLAN DE ACCIÓN SIMPLIFICADO (9 COLUMNAS ESENCIALES, ORDENADO POR ACCIÓN)
    const exportRows = sortedRecords.map(r => ({
      "Tipo de Acción": r.actionCategory,
      "# Venta": r.orderId,
      "Producto": r.itemTitle,
      "Monto (ARS)": r.amount,
      "¿A quién se reclama?": r.responsibleTarget,
      "¿Qué tenés que hacer?": r.actionRequired,
      "Fecha Límite": r.dueDateText,
      "Texto de Reclamo (Copiar y Pegar)": r.dossierText,
      "Link Directo MeLi": r.claimUrl
    }));
    const wsAction = xlsx.utils.json_to_sheet(exportRows);
    wsAction['!cols'] = [
      { wch: 32 },
      { wch: 20 },
      { wch: 45 },
      { wch: 18 },
      { wch: 32 },
      { wch: 55 },
      { wch: 22 },
      { wch: 80 },
      { wch: 55 }
    ];
    xlsx.utils.book_append_sheet(wb, wsAction, 'Plan de Acción y Reclamos');

    const outXlsx = path.join(path.dirname(targetFile), `SaldoAudit_Auditoria_${path.basename(targetFile, path.extname(targetFile))}.xlsx`);
    xlsx.writeFile(wb, outXlsx);
    console.log(`\n📁 Reporte Excel Multi-Pestaña generado en:\n👉 ${outXlsx}\n`);
  } else {
    console.log('\n✅ No se encontraron inconsistencias. Todas las devoluciones están al día.');
  }
}

main();
