-- ==============================================================================
-- SALDOAUDIT - SCRIPT DE CONFIGURACIÓN CRM & SOPs (SUPABASE)
-- ==============================================================================
-- Proyecto: nexum-trade-consulting (wbcfmanuhotyevquiaht) o proyecto dedicado
-- ==============================================================================

CREATE TABLE IF NOT EXISTS saldoaudit_sellers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    empresa TEXT NOT NULL,
    rubro TEXT,
    tienda_oficial TEXT,
    contacto_nombre TEXT,
    contacto_cargo TEXT,
    contacto_telefono TEXT,
    contacto_email TEXT,
    contacto_linkedin TEXT,
    facturacion_mensual NUMERIC DEFAULT 0,
    estado_pipeline TEXT DEFAULT 'lead_contactado',
    modelo_cobro TEXT DEFAULT 'reporte_10',
    total_recuperable NUMERIC DEFAULT 0,
    total_recuperado NUMERIC DEFAULT 0,
    comision_cobrada NUMERIC DEFAULT 0,
    prioridad TEXT DEFAULT 'A',
    proxima_accion TEXT,
    fecha_proxima_accion DATE,
    notas TEXT
);

CREATE TABLE IF NOT EXISTS saldoaudit_auditorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES saldoaudit_sellers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    archivo_nombre TEXT,
    total_ventas INT DEFAULT 0,
    ventas_netas NUMERIC DEFAULT 0,
    total_recuperable NUMERIC DEFAULT 0,
    total_casos INT DEFAULT 0,
    urgentes_72hs INT DEFAULT 0,
    siniestros INT DEFAULT 0,
    fecha_desde TEXT,
    fecha_hasta TEXT,
    modelo_cobro TEXT DEFAULT 'reporte_10',
    comision_estimada NUMERIC DEFAULT 0,
    estado_cobro TEXT DEFAULT 'pendiente',
    notas TEXT
);

CREATE TABLE IF NOT EXISTS saldoaudit_casos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auditoria_id UUID REFERENCES saldoaudit_auditorias(id) ON DELETE CASCADE,
    order_id TEXT NOT NULL,
    fecha_venta TEXT,
    producto TEXT,
    monto NUMERIC DEFAULT 0,
    categoria TEXT,
    prioridad TEXT DEFAULT 'Media',
    estado_meli TEXT,
    descripcion_meli TEXT,
    accion_sugerida TEXT,
    link_reclamo TEXT,
    estado_reclamo TEXT DEFAULT 'pendiente_apertura'
);

-- RLS Habilitado
ALTER TABLE saldoaudit_sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE saldoaudit_auditorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE saldoaudit_casos ENABLE ROW LEVEL SECURITY;

-- Políticas de Acceso
DROP POLICY IF EXISTS "Permitir todo a anon para saldoaudit_sellers" ON saldoaudit_sellers;
CREATE POLICY "Permitir todo a anon para saldoaudit_sellers" ON saldoaudit_sellers FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a anon para saldoaudit_auditorias" ON saldoaudit_auditorias;
CREATE POLICY "Permitir todo a anon para saldoaudit_auditorias" ON saldoaudit_auditorias FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a anon para saldoaudit_casos" ON saldoaudit_casos;
CREATE POLICY "Permitir todo a anon para saldoaudit_casos" ON saldoaudit_casos FOR ALL TO anon USING (true) WITH CHECK (true);

-- Insert inicial con los datos reales de Hudson Cocina
INSERT INTO saldoaudit_sellers (
    empresa, rubro, tienda_oficial, contacto_nombre, contacto_cargo, contacto_telefono,
    contacto_linkedin, facturacion_mensual, estado_pipeline, modelo_cobro, total_recuperable, prioridad,
    proxima_accion, fecha_proxima_accion, notas
) VALUES (
    'Hudson Kitchenware (Hudson Cocina)',
    'Bazar y Cocina',
    'HUDSON COCINA',
    'Tomás Blousson',
    'Jefe de E-commerce',
    '+54 9 11 3560-2902',
    'https://www.linkedin.com/in/tomasblousson',
    145000000,
    'auditado_enviado',
    'reporte_10',
    599518.74,
    'A',
    'Seguimiento por WhatsApp de reclamos abiertos en MeLi',
    '2026-10-26',
    'Contacto derivado por Nahuel Beneitez (Director de Marketing). Auditoría de 8.016 ventas entregada el 21/10 con 15 órdenes críticas ($599.518,74 ARS).'
);
