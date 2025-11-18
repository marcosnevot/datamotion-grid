[English](README.md) | **Español**

# DataMotion Grid — Grid de datos en React virtualizado centrado en rendimiento y UX

![CI](https://github.com/marcosnevot/datamotion-grid/actions/workflows/ci.yml/badge.svg)

Una demo de grid de datos virtualizado de alto rendimiento construida con **React**, **TypeScript**, **Vite**,
**TanStack Table & TanStack Virtual**, **Zustand**, **Tailwind CSS** y **Framer Motion**.

El objetivo de este proyecto es mostrar cómo construir un grid de datos moderno y animado que escale
a decenas de miles de filas manteniendo una UX fluida, predecible y accesible.


## Tabla de contenidos

- [Visión general](#overview)
- [Características clave](#key-features)
- [Stack tecnológico](#tech-stack)
- [Arquitectura y documentación](#architecture--documentation)
- [Características de rendimiento](#performance-characteristics)
- [Experiencia de usuario y accesibilidad](#user-experience--accessibility)
- [Atajos de teclado](#keyboard-shortcuts)
- [Primeros pasos](#getting-started)
  - [Requisitos previos](#prerequisites)
  - [Instalación](#installation)
  - [Scripts npm disponibles](#available-npm-scripts)
- [Estructura del proyecto](#project-structure)
- [Desarrollo y pruebas](#development--testing)
- [Roadmap y estado](#roadmap--status)
- [Licencia](#license)


## Visión general

**DataMotion Grid** es una single-page application solo frontend que se centra en una cosa:
renderizar un dataset grande e interactivo de una forma que siga sintiéndose rápida y pulida.

No hay **backend** en este repositorio. En su lugar, la aplicación utiliza un generador determinista
de dataset simulado para representar datos realistas (IDs, nombres, correos electrónicos, estados, países,
fechas, importes numéricos…). Esto mantiene el proyecto autocontenido y aun así pone a prueba
restricciones de rendimiento y UX del mundo real.

Público objetivo:

- Ingenieros frontend interesados en tablas de alto rendimiento y virtualización.
- Ingenieros que revisan trabajo de portfolio (arquitectura, testing, UX y rendimiento).
- Desarrolladores que buscan patrones de referencia para React + TanStack Table + TanStack Virtual.


## Características clave

### Grid y datos

- Grid de datos virtualizado probado con **~20k filas** y diseñado para **5k–50k filas**.
- Generador determinista de dataset simulado (`generateMockDataset`) con:
  - IDs de fila estables.
  - Campos realistas (estado, país, fechas, importe numérico).
  - Número de filas y semilla configurables.
- Todos los datos se generan **en el cliente**; no se requieren llamadas a API.

### Interacciones

- **Ordenación**
  - Cabeceras de columna clicables con ciclo ascendente / descendente / sin ordenar.
  - Atributos ARIA (`aria-sort`) para tecnologías de asistencia.
- **Filtros por columna**
  - Filtros de texto (nombre, email, país) con lógica de “contiene” sin distinción de mayúsculas/minúsculas.
  - Filtro de selección para estado (p. ej. Active, Pending, Inactive).
  - Filtros numéricos y de fecha cuando proceda.
- **Búsqueda global**
  - Input con debounce (alrededor de 300 ms) sobre varias columnas clave.
  - Diseñada para seguir siendo reactiva con datasets grandes.
- **Barra de estadísticas**
  - `Showing X rows` o `Showing X of Y rows` dependiendo de los filtros/búsqueda.
  - Contadores de filtros activos y columnas ordenadas.

### Configuración de columnas y vistas

- **Visibilidad de columnas**
  - Panel dedicado para mostrar/ocultar columnas.
  - Nunca permite ocultar todas las columnas (se protege la última columna visible).
  - Reset a la visibilidad por defecto.
- **Orden de columnas**
  - Controles explícitos de “Move up / Move down” para un orden determinista.
  - Reset al orden por defecto (usando la definición de columnas como fuente de verdad).
- **Vistas guardadas (presets)**
  - Configuraciones de grid predefinidas como `Default`, `Active only`, `High amount`.
  - Cambiar de vista aplica filtros, ordenación, visibilidad y orden de columnas en un solo paso.
  - Las vistas están integradas con los atajos de teclado y la persistencia.

### Selección y panel lateral

- **Selección de filas**
  - Selección de una sola fila haciendo clic en la fila.
  - Distinción visual clara para el estado seleccionado.
- **RowDetailPanel**
  - 0 filas seleccionadas → estado vacío con indicaciones.
  - 1 fila seleccionada → tarjeta de resumen con campos clave y valores formateados.
  - Diseñado para poder ampliarse más adelante a agregados de multiselección.
- **Panel lateral contextual**
  - Panel fijo en el lado derecho para detalles de selección y contenido auxiliar.
  - Incluye una tarjeta dedicada que enumera los atajos de teclado.

### Temas y movimiento

- **Sistema de temas**
  - Modos de tema Light / Dark / System.
  - Preferencia almacenada en un pequeño store de tema y aplicada mediante la clase `dark` de Tailwind.
- **Animaciones y microinteracciones**
  - Framer Motion en layout, toolbar, barra de estadísticas, cabecera y filas.
  - Tokens de motion centralizados en `motionSettings.ts`.
  - Solo anima propiedades optimizadas por GPU (`opacity`, `transform`).
  - Respeta completamente `prefers-reduced-motion` mediante un único wrapper `MotionConfig`.


## Stack tecnológico

- **Core**
  - [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
  - [Vite](https://vitejs.dev/) (servidor de desarrollo y build)
- **Tabla y virtualización**
  - [`@tanstack/react-table`](https://tanstack.com/table/latest)
  - [`@tanstack/react-virtual`](https://tanstack.com/virtual/latest)
- **Gestión de estado**
  - [`zustand`](https://github.com/pmndrs/zustand) para los stores de grid y tema
- **Estilos y movimiento**
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Framer Motion](https://www.framer.com/motion/)
- **Testing**
  - [Vitest](https://vitest.dev/)
  - [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
  - [Playwright](https://playwright.dev/) para tests E2E


## Arquitectura y documentación

La implementación está documentada con más detalle en la carpeta `docs/`:

- [`docs/architecture.md`](./docs/architecture.md)  
  Arquitectura final, pipeline de datos, orquestación del grid, stores y layout.
- [`docs/performance-notes.md`](./docs/performance-notes.md)  
  Modelo de rendimiento, estrategia de virtualización, instrumentación y palancas de ajuste.
- [`docs/ux-guidelines.md`](./docs/ux-guidelines.md)  
  Principios de UX, diseño de interacciones, guías de motion y comportamiento del panel lateral.
- [`docs/keyboard-shortcuts.md`](./docs/keyboard-shortcuts.md)  
  Lista canónica de atajos de teclado y cómo se gestionan.


## Características de rendimiento

Al final del proyecto, el grid está diseñado para mantenerse fluido y usable en el rango de
**5k–50k filas**.

Puntos clave:

- El dataset se genera **una sola vez** en memoria usando `generateMockDataset`.
- El modelo de tabla se construye con TanStack Table y se pasa al cuerpo virtualizado.
- El rendimiento del scroll se controla con **TanStack Virtual** con:
  - Una altura estimada de fila fija.
  - Un overscan acotado (filas extra por encima y por debajo del viewport).
- Solo las filas visibles (más el overscan) se montan como nodos DOM en cada momento.
- La búsqueda global tiene debounce para reducir recomputaciones innecesarias.
- El estado extra (selección, vistas, configuración de columnas) se mantiene pequeño y acotado.
- Información básica de tiempos (p. ej. tiempo de generación del dataset) está disponible a través de
  un pequeño helper (`measureSync`) y flags de debug opcionales.


## Experiencia de usuario y accesibilidad

Objetivos de UX para DataMotion Grid:

- **Claridad sobre espectacularidad** – el movimiento y el color apoyan a los datos, no al revés.
- **Predictibilidad** – ordenación, filtros y configuración siguen reglas simples y repetibles.
- **Alta densidad** – orientado a uso analítico más que a formularios CRUD.
- **Accesibilidad por defecto** – la navegación por teclado y los atributos ARIA forman parte del
  diseño.
- **Respeto por las preferencias del usuario** – tema y movimiento respetan los ajustes a nivel de sistema operativo.

Aspectos destacados:

- Filtros de columna siempre visibles para flujos analíticos rápidos.
- Estados visuales claros para ordenación, filtrado y selección.
- Panel lateral con estados vacíos explícitos e indicaciones.
- Animaciones sutiles, cortas y que nunca bloquean la entrada del usuario.
- `prefers-reduced-motion` se respeta globalmente a través de `MotionConfig`.


## Atajos de teclado

Los atajos de teclado se documentan en detalle en
[`docs/keyboard-shortcuts.md`](./docs/keyboard-shortcuts.md) y se muestran en el
panel lateral de la interfaz.

Al final del proyecto, los atajos activos son:

- `F` – Enfocar el input de **búsqueda global** en la toolbar.
- `Alt + C` – Alternar el panel de **configuración de columnas** (visibilidad y orden).
- `Alt + 1` – Aplicar la vista **Default**.
- `Alt + 2` – Aplicar la vista **Active only**.
- `Alt + 3` – Aplicar la vista **High amount**.

Todos los atajos:

- Están acotados al contexto de la vista del grid.
- Se ignoran cuando el foco está dentro de un elemento editable (`input`, `textarea`, etc.).


## Primeros pasos

### Requisitos previos

- [Node.js](https://nodejs.org/) **18+** (se recomienda LTS)
- [npm](https://www.npmjs.com/) (incluido con Node)

### Instalación

Clona el repositorio e instala las dependencias:

```bash
git clone https://github.com/marcosnevot/datamotion-grid.git
cd datamotion-grid
npm install
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Luego abre la URL que aparece en la consola en tu navegador (normalmente `http://localhost:5173/`).


### Scripts npm disponibles

Los scripts exactos están definidos en `package.json`. Uso típico:

```bash
# Iniciar el servidor de desarrollo de Vite
npm run dev

# Ejecutar un build de producción
npm run build

# Previsualizar localmente el build de producción (después de build)
npm run preview

# Ejecutar ESLint sobre el codebase
npm run lint

# Formatear el codebase con Prettier
npm run format

# Ejecutar tests unitarios y de componentes con Vitest
npm run test

# Ejecutar tests end-to-end con Playwright (si está configurado)
npm run test:e2e
```


## Estructura del proyecto

Estructura de alto nivel (ver `docs/architecture.md` para más detalle):

```text
datamotion-grid/
  README.md
  package.json
  vite.config.ts
  tsconfig*.json
  tailwind.config.cjs
  postcss.config.cjs
  .eslintrc.cjs
  .prettierrc

  src/
    App.tsx
    main.tsx

    components/
      layout/         # App shell, header, footer, panel lateral

    features/
      datagrid/       # Grid core, config, store, hooks, components, utils
      dataset/        # Tipos de dataset, config, generador mock y hook
      theme/          # Store de tema, hook y componente toggle

    hooks/            # Hooks compartidos (debounced value, prefers-reduced-motion)
    styles/           # Puntos de entrada de Tailwind y estilos globales
    utils/            # Helpers de teclado y rendimiento
    tests/            # Tests unitarios, de componentes y e2e
    types/            # Tipos TypeScript compartidos

  docs/
    architecture.md
    performance-notes.md
    ux-guidelines.md
    keyboard-shortcuts.md
```


## Desarrollo y pruebas

Flujo de trabajo sugerido:

1. Ejecuta el servidor de desarrollo con `npm run dev`.
2. Haz cambios en las features bajo `src/features/` o en los componentes de layout.
3. Mantén `docs/` sincronizado si alteras la arquitectura, las características de rendimiento o la UX.
4. Antes de hacer commit:
   - `npm run lint`
   - `npm run test`
   - `npm run test:e2e` (si Playwright está configurado en tu entorno)
   - `npm run build`

Pirámide de testing (ver `docs/architecture.md` y `src/tests/`):

- **Unit tests**
  - Utilidades puras (`filterUtils`, `sortUtils`, `virtualizationUtils`, `performance`, `keyboard`).
  - Lógica de stores (`gridStore`, vistas y comportamiento de persistencia).
- **Component tests**
  - Componentes a nivel de grid (`DataGrid`, `DataGridToolbar`, `DataGridStatsBar`, `RowDetailPanel`, `SidePanel`, etc.).
- **End-to-end tests**
  - Un flujo básico de Playwright (`basic-flow.e2e.ts`) para verificar que ordenación, filtrado,
    búsqueda, selección y persistencia se comportan correctamente desde la perspectiva del usuario.


## Roadmap y estado

Estado del proyecto al final:

- La arquitectura core y las funcionalidades del grid están **completas** para el alcance previsto de la demo.
- El rendimiento y la UX están ajustados para **5k–50k filas** en hardware de escritorio típico.
- La documentación está consolidada bajo `docs/` y este `README.md`.

Posibles mejoras futuras (más allá del alcance actual):

- Navegación del grid dirigida completamente por teclado (flechas, selección de rango, “select all”).
- Analíticas más avanzadas en `RowDetailPanel` (p. ej. mini gráficos).
- Herramientas de rendimiento adicionales (widget de métricas en tiempo de ejecución, tests de rendimiento automatizados).
- Integración con un backend real o una fuente de datos en streaming.


## Licencia

Este proyecto está pensado principalmente como pieza de aprendizaje y portfolio.

La licencia recomendada para uso público es **MIT**. Al publicar este repositorio
como open source, añade un archivo `LICENSE` con el texto estándar de la licencia MIT para que
otras personas puedan reutilizar y adaptar el código con confianza.
