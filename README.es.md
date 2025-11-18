[English](README.md) | **Español**

# DataMotion Grid — Grid de datos virtualizada en React centrada en rendimiento y experiencia de usuario

![CI](https://github.com/marcosnevot/datamotion-grid/actions/workflows/ci.yml/badge.svg)

Una demo de grid de datos virtualizada y de alto rendimiento construida con **React**, **TypeScript**, **Vite**,
**TanStack Table & TanStack Virtual**, **Zustand**, **Tailwind CSS** y **Framer Motion**.

El objetivo de este proyecto es mostrar cómo construir una grid de datos moderna y animada que escale
a decenas de miles de filas manteniendo una experiencia de usuario fluida, predecible y accesible.


## Tabla de contenidos

- [Visión general](#visión-general)
- [Características clave](#características-clave)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura y documentación](#arquitectura-y-documentación)
- [Características de rendimiento](#características-de-rendimiento)
- [Experiencia de usuario y accesibilidad](#experiencia-de-usuario-y-accesibilidad)
- [Atajos de teclado](#atajos-de-teclado)
- [Primeros pasos](#primeros-pasos)
  - [Requisitos previos](#requisitos-previos)
  - [Instalación](#instalación)
  - [Scripts npm disponibles](#scripts-npm-disponibles)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Desarrollo y testing](#desarrollo-y-testing)
- [Roadmap y estado](#roadmap-y-estado)
- [Licencia](#licencia)


## Visión general

**DataMotion Grid** es una single-page application puramente frontend que se centra en una sola cosa:
renderizar un conjunto de datos grande e interactivo de una forma que siga sintiéndose rápida y pulida.

En este repositorio **no hay backend**. En su lugar, la aplicación utiliza un generador determinista
de datos de prueba para simular datos realistas (IDs, nombres, emails, estados, países,
fechas, cantidades numéricas…). Esto mantiene el proyecto autocontenido y al mismo tiempo pone a prueba
las restricciones de rendimiento y UX de un caso real.

Público objetivo:

- Frontend engineers interesados en tablas de alto rendimiento y virtualización.
- Ingenieros que revisan trabajo de portfolio (arquitectura, testing, UX y rendimiento).
- Desarrolladores que buscan patrones de referencia para React + TanStack Table + TanStack Virtual.


## Características clave

### Grid y datos

- Grid de datos virtualizada probada con **~20k filas** y diseñada para **5k–50k filas**.
- Generador determinista de datos de prueba (`generateMockDataset`) con:
  - IDs de fila estables.
  - Campos realistas (estado, país, fechas, cantidad numérica).
  - Número de filas y semilla configurables.
- Todos los datos se generan **en el cliente**; no se requieren llamadas a API.

### Interacciones

- **Ordenación**
  - Cabeceras de columna clicables con ciclo ascendente / descendente / sin orden.
  - Atributos ARIA (`aria-sort`) para tecnologías de asistencia.
- **Filtros por columna**
  - Filtros de texto (nombre, email, país) con lógica “contiene” sin distinción de mayúsculas.
  - Filtro de selección para estado (p. ej. Active, Pending, Inactive).
  - Filtros numéricos y de fecha donde aplica.
- **Búsqueda global**
  - Input con debounce (alrededor de 300 ms) sobre varias columnas clave.
  - Diseñada para seguir siendo responsiva con datasets grandes.
- **Barra de estadísticas**
  - `Showing X rows` o `Showing X of Y rows` según los filtros/búsqueda.
  - Contadores de filtros activos y columnas ordenadas.

### Configuración de columnas y vistas

- **Visibilidad de columnas**
  - Panel dedicado para mostrar/ocultar columnas.
  - Nunca permite ocultar todas las columnas (la última visible está protegida).
  - Reset al estado de visibilidad por defecto.
- **Orden de columnas**
  - Controles explícitos de “Move up / Move down” para un orden determinista.
  - Reset al orden por defecto (usando la definición de columnas como fuente de verdad).
- **Vistas guardadas (presets)**
  - Configuraciones de grid predefinidas como `Default`, `Active only`, `High amount`.
  - Al cambiar de vista se aplican filtros, ordenación, visibilidad y orden en un solo paso.
  - Las vistas están integradas con atajos de teclado y persistencia.

### Selección y panel lateral

- **Selección de filas**
  - Selección de una sola fila al hacer clic sobre ella.
  - Distinción visual clara para el estado seleccionado.
- **RowDetailPanel**
  - 0 filas seleccionadas → estado vacío con guía.
  - 1 fila seleccionada → tarjeta de resumen con campos clave y valores formateados.
  - Diseñado para que pueda extenderse más adelante a agregados de multi-selección.
- **Panel lateral contextual**
  - Panel fijo en el lado derecho para detalles de selección y contenido de ayuda.
  - Incluye una tarjeta dedicada que lista los atajos de teclado.

### Temas y motion

- **Sistema de temas**
  - Modos Light / Dark / System.
  - Preferencia almacenada en un pequeño store de tema y aplicada vía la clase `dark` de Tailwind.
- **Animaciones y microinteracciones**
  - Framer Motion en layout, toolbar, barra de estadísticas, cabecera y filas.
  - Tokens de motion centralizados en `motionSettings.ts`.
  - Solo anima propiedades amigables con la GPU (`opacity`, `transform`).
  - Respeta completamente `prefers-reduced-motion` mediante un único wrapper `MotionConfig`.


## Stack tecnológico

- **Core**
  - [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
  - [Vite](https://vitejs.dev/) (dev server y build)
- **Tabla y virtualización**
  - [`@tanstack/react-table`](https://tanstack.com/table/latest)
  - [`@tanstack/react-virtual`](https://tanstack.com/virtual/latest)
- **Gestión de estado**
  - [`zustand`](https://github.com/pmndrs/zustand) para los stores de grid y tema
- **Estilos y motion**
  - [Tailwind CSS](https://tailwindcss.com/)
  - [Framer Motion](https://www.framer.com/motion/)
- **Testing**
  - [Vitest](https://vitest.dev/)
  - [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
  - [Playwright](https://playwright.dev/) para tests E2E


## Arquitectura y documentación

La implementación se documenta con más detalle en la carpeta `docs/`:

- [`docs/architecture.md`](./docs/architecture.md)  
  Arquitectura final, pipeline de datos, orquestación del grid, stores y layout.
- [`docs/performance-notes.md`](./docs/performance-notes.md)  
  Modelo de rendimiento, estrategia de virtualización, instrumentación y puntos de ajuste.
- [`docs/ux-guidelines.md`](./docs/ux-guidelines.md)  
  Principios de UX, diseño de interacción, guías de movimiento y comportamiento del panel lateral.
- [`docs/keyboard-shortcuts.md`](./docs/keyboard-shortcuts.md)  
  Lista canónica de atajos de teclado y cómo se gestionan.


## Características de rendimiento

Al final del proyecto, la grid está diseñada para mantenerse fluida y usable en el
rango de **5k–50k filas**.

Puntos clave:

- El dataset se genera **una sola vez** en memoria usando `generateMockDataset`.
- El modelo de tabla se construye con TanStack Table y se pasa al cuerpo virtualizado.
- El rendimiento de scroll se controla mediante **TanStack Virtual** con:
  - Una altura de fila estimada fija.
  - Overscan acotado (filas extra por encima y por debajo del viewport).
- Solo las filas visibles (más el overscan) están montadas como nodos del DOM en todo momento.
- La búsqueda global está “debounced” para reducir recomputaciones innecesarias.
- El estado extra (selección, vistas, configuración de columnas) se mantiene pequeño y acotado.
- Información básica de tiempos (p. ej. tiempo de generación del dataset) está disponible a través
  de un pequeño helper (`measureSync`) y flags de debug opcionales.


## Experiencia de usuario y accesibilidad

Objetivos de UX para DataMotion Grid:

- **Claridad por encima del espectáculo** – la animación y el color apoyan a los datos, no al revés.
- **Predictibilidad** – la ordenación, los filtros y la configuración siguen reglas simples y repetibles.
- **Alta densidad** – orientada a uso analítico más que a formularios CRUD.
- **Accesibilidad por defecto** – la navegación por teclado y los atributos ARIA forman parte
  del diseño.
- **Respeto por las preferencias del usuario** – el tema y el movimiento respetan la configuración del sistema operativo.

Destacados:

- Filtros de columna siempre visibles para flujos analíticos rápidos.
- Estados visuales claros para ordenación, filtros y selección.
- Panel lateral con estados vacíos explícitos y guía.
- Animaciones sutiles, cortas y que nunca bloquean la interacción.
- `prefers-reduced-motion` respetado globalmente mediante `MotionConfig`.


## Atajos de teclado

Los atajos de teclado están documentados en detalle en
[`docs/keyboard-shortcuts.md`](./docs/keyboard-shortcuts.md) y se muestran también
en el panel lateral de la UI.

Al final del proyecto, los atajos activos son:

- `F` – Focalizar el **buscador global** en la toolbar.
- `Alt + C` – Alternar el panel de **configuración de columnas** (visibilidad y orden).
- `Alt + 1` – Aplicar la vista **Default**.
- `Alt + 2` – Aplicar la vista **Active only**.
- `Alt + 3` – Aplicar la vista **High amount**.

Todos los atajos:

- Están acotados a la vista del grid.
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

Después abre la URL que imprime Vite en tu navegador (normalmente `http://localhost:5173/`).


### Scripts npm disponibles

Los scripts exactos están definidos en `package.json`. Uso típico:

```bash
# Iniciar el servidor de desarrollo de Vite
npm run dev

# Ejecutar un build de producción
npm run build

# Previsualizar localmente el build de producción (tras build)
npm run preview

# Linter de la base de código con ESLint
npm run lint

# Formatear la base de código con Prettier
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
      layout/         # App shell, cabecera, footer, panel lateral

    features/
      datagrid/       # Grid principal, config, store, hooks, componentes, utils
      dataset/        # Tipos de dataset, config, generador de datos de prueba y hook
      theme/          # Store de tema, hook y componente de toggle

    hooks/            # Hooks compartidos (valor con debounce, prefers-reduced-motion)
    styles/           # Entrypoints de Tailwind y estilos globales
    utils/            # Helpers de teclado y rendimiento
    tests/            # Tests unitarios, de componentes y e2e
    types/            # Tipos TypeScript compartidos

  docs/
    architecture.md
    performance-notes.md
    ux-guidelines.md
    keyboard-shortcuts.md
```


## Desarrollo y testing

Flujo de trabajo sugerido:

1. Ejecutar el dev server con `npm run dev`.
2. Hacer cambios en features bajo `src/features/` o en componentes de layout.
3. Mantener `docs/` sincronizado si se altera arquitectura, rendimiento o UX.
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
  - Un flujo básico de Playwright (`basic-flow.e2e.ts`) que verifica que la ordenación, los filtros,
    la búsqueda, la selección y la persistencia se comportan correctamente desde la perspectiva del usuario.


## Roadmap y estado

Estado del proyecto al cierre:

- La arquitectura core y las features de grid están **completas** para el alcance de demo previsto.
- El rendimiento y la UX están ajustados para **5k–50k filas** en hardware de escritorio típico.
- La documentación está consolidada en `docs/` y en este `README.es.md`.

Posibles mejoras futuras (fuera del alcance actual):

- Navegación del grid dirigida por teclado (teclas de flecha, selección por rango, “seleccionar todo”).
- Analítica más avanzada en `RowDetailPanel` (p. ej. mini gráficas).
- Herramientas de rendimiento adicionales (widget de métricas en tiempo de ejecución, tests de perf automatizados).
- Integración con un backend real o una fuente de datos en streaming.


## Licencia

Este proyecto está pensado principalmente como pieza de aprendizaje y portfolio.

Este proyecto está licenciado bajo la **Licencia MIT**.  
Consulta el archivo [LICENSE](./LICENSE) para ver el texto completo.
