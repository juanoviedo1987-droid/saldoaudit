# Reglas Globales de Desarrollo - Juan Oviedo (Antigravity Workspace)

## 1. Identidad de Marca Oficial - SaldoAudit (OBLIGATORIO)
- **Paleta de Marca:** Fintech Emerald & Graphite (Despegue total de Nexum y AGN).
  - Fondo Primario Oscuro / Header: Grafito Obsidiana `#090D16` / `#0F172A`.
  - Color Primario / Acentos / CTA: **Fintech Emerald** `#059669` / `#10B981` / `#047857`.
  - Degradé Oficial: `linear-gradient(135deg, #059669 0%, #064E3B 100%)`.
  - Acentos de métricas en alza: Menta `#A7F3D0` y Oro Ámbar `#FBBF24`.
- **Isotipo Oficial:** Radar Forense (Lupa blanca con mango verde menta `#34D399` y 3 barras de métricas en alza en su interior).
- **Tipografías:**
  - Títulos y Brand: `Plus Jakarta Sans` (pesos 700 / 800 / 900).
  - Cuerpo de texto: `Inter` (pesos 400 / 500 / 600).
  - Datos numéricos y códigos: `JetBrains Mono`.
- **Regla de oro:** Cero azul genérico (`#3b82f6` o `#2563eb`). Toda comunicación, email, landing o interfaz debe respetar rigurosamente la paleta Fintech Emerald & Graphite.

## 2. Estándar Universal de Diseño y Frontend (OBLIGATORIO)

### Enfoque Mobile-First Obligatorio en TODOS los Proyectos
- Todo desarrollo, interfaz, pantalla, componente web o aplicación se concibe, diseña y prueba **Mobile-First** (resoluciones de 360px a 430px) y luego se expande armónicamente a pantallas medianas y de escritorio (`sm:`, `md:`, `lg:`, `xl:`).
- **Ergonomía Táctil Garantizada:**
  - Zonas de toque mínimas de 44px × 44px para botones, enlaces y campos.
  - Navegación principal accesible al alcance del pulgar (Bottom Navigation Bar o menú colapsable cómodo).
  - Formularios adaptativos de 1 sola columna en pantallas móviles.
  - Cero desbordes horizontales accidentales (`overflow-x` controlado).
- **Escalabilidad a Escritorio (Desktop/PC):**
  - Al abrirse en PC o monitores amplios, la aplicación aprovecha el ancho completo con layouts ejecutivos (tablas de múltiples columnas, paneles laterales fijos, métricas KPI en grid amplio).
  - Nunca degradar la experiencia de escritorio al adaptar a móvil, ni degradar la experiencia móvil al diseñar para escritorio.
