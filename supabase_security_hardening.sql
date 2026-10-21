-- ==============================================================================
-- SALDOAUDIT - SCRIPT DE BLINDAJE DE SEGURIDAD ESTRICTA (SUPABASE RLS)
-- ==============================================================================
-- Proyecto: wbcfmanuhotyevquiaht
-- ==============================================================================

-- 1. ELIMINAR POLÍTICAS PERMISIVAS ANTERIORES PARA ANON
DROP POLICY IF EXISTS "Permitir todo a anon para saldoaudit_sellers" ON saldoaudit_sellers;
DROP POLICY IF EXISTS "Permitir todo a anon para saldoaudit_auditorias" ON saldoaudit_auditorias;
DROP POLICY IF EXISTS "Permitir todo a anon para saldoaudit_casos" ON saldoaudit_casos;

-- 2. POLÍTICA ANON: CERO LECTURA DE SELLERS O CASOS (PRIVACIDAD TOTAL)
-- El rol público 'anon' NO puede leer los clientes, los teléfonos ni los casos de nadie.
-- Solo se le permite INSERTAR prospectos desde un formulario público si el estado es 'lead_contactado'.
CREATE POLICY "Permitir insert publico formulario web"
ON saldoaudit_sellers
FOR INSERT
TO anon
WITH CHECK (estado_pipeline = 'lead_contactado');

-- 3. POLÍTICA AUTHENTICATED: CONTROL TOTAL EXCLUSIVO PARA JUAN OVIEDO
CREATE POLICY "Permitir todo a usuario autenticado autorizado"
ON saldoaudit_sellers
FOR ALL
TO authenticated
USING (
    (auth.jwt() ->> 'email') IN (
        'juanoviedo1987@gmail.com',
        'juan.oviedo@nexumtc.com.ar'
    )
)
WITH CHECK (
    (auth.jwt() ->> 'email') IN (
        'juanoviedo1987@gmail.com',
        'juan.oviedo@nexumtc.com.ar'
    )
);

CREATE POLICY "Permitir todo a auditorias para usuario autenticado"
ON saldoaudit_auditorias
FOR ALL
TO authenticated
USING (
    (auth.jwt() ->> 'email') IN (
        'juanoviedo1987@gmail.com',
        'juan.oviedo@nexumtc.com.ar'
    )
)
WITH CHECK (
    (auth.jwt() ->> 'email') IN (
        'juanoviedo1987@gmail.com',
        'juan.oviedo@nexumtc.com.ar'
    )
);

CREATE POLICY "Permitir todo a casos para usuario autenticado"
ON saldoaudit_casos
FOR ALL
TO authenticated
USING (
    (auth.jwt() ->> 'email') IN (
        'juanoviedo1987@gmail.com',
        'juan.oviedo@nexumtc.com.ar'
    )
)
WITH CHECK (
    (auth.jwt() ->> 'email') IN (
        'juanoviedo1987@gmail.com',
        'juan.oviedo@nexumtc.com.ar'
    )
);
