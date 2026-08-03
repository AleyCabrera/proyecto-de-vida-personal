<div align="center">

# 🚀 Proyecto de Vida Personal

**Aplicación web integral para la gestión y seguimiento de tu proyecto de vida personal.**

Diseñada para ayudarte a planificar, organizar y visualizar tus metas, proyectos, estudios y más en un solo lugar.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat&logo=chart.js&logoColor=white)
![License MIT](https://img.shields.io/badge/Licencia-MIT-green?style=flat)

</div>

---

## 📋 Tabla de Contenidos

- [🚀 Proyecto de Vida Personal](#-proyecto-de-vida-personal)
  - [📋 Tabla de Contenidos](#-tabla-de-contenidos)
  - [✨ Características](#-características)
  - [🖥️ Capturas de Pantalla](#️-capturas-de-pantalla)
  - [🛠️ Tecnologías](#️-tecnologías)
  - [📂 Estructura del Proyecto](#-estructura-del-proyecto)
  - [🚀 Instalación y Ejecución](#-instalación-y-ejecución)
    - [Requisitos Previos](#requisitos-previos)
    - [Pasos para Ejecutar](#pasos-para-ejecutar)
    - [📌 Notas de Ejecución](#-notas-de-ejecución)
  - [📦 Módulos Principales](#-módulos-principales)
  - [💾 Persistencia de Datos](#-persistencia-de-datos)
  - [🎨 Personalización](#-personalización)
    - [Cambiar Colores y Tema](#cambiar-colores-y-tema)
    - [Añadir Nuevos Módulos](#añadir-nuevos-módulos)
    - [Modificar Datos Iniciales](#modificar-datos-iniciales)
  - [🤝 Contribución](#-contribución)
    - [Directrices de Contribución](#directrices-de-contribución)
  - [⚠️ Notas Adicionales](#️-notas-adicionales)
  - [📄 Licencia](#-licencia)
  - [📧 Contacto](#-contacto)
  - [🙏 Agradecimientos](#-agradecimientos)

---

## ✨ Características

| | |
|---|---|
| 🎯 **Metas Estratégicas** | Define y visualiza tus metas a corto, mediano y largo plazo con orden cronológico. |
| 📅 **Horario 24/7** | Gestiona tu semana con una tabla interactiva de 24 horas, con resaltado en tiempo real de la hora actual (zona horaria Colombia). |
| 📊 **Prioridades Diarias** | Asigna horas de dedicación a tus prioridades y visualiza tu productividad con gráficos dinámicos. |
| 💻 **Proyectos** | Administra tus proyectos con filtros por estado, nivel, prioridad y progreso. |
| 🏆 **Certificaciones** | Realiza un seguimiento detallado de tus certificaciones, incluyendo progreso, fechas y niveles. |
| 🎓 **Plan de Estudio** | Visualiza tu ruta académica con una línea de tiempo interactiva y filtros por estado. |
| 👤 **CV y Habilidades** | Gestiona tus habilidades y herramientas técnicas de forma modular. |
| 💾 **Persistencia Local** | Todos los datos se guardan automáticamente en el navegador con `localStorage`. |
| 📱 **Responsive** | Diseño adaptable a dispositivos móviles, tablets y escritorio. |

---

## 🖥️ Capturas de Pantalla

| Página | Descripción |
| :--- | :--- |
| **Inicio** | Panel de control con resumen de proyectos, certificaciones y video motivacional. |
| **Metas** | Gestión de metas activas y completadas con orden cronológico. |
| **Horario** | Tabla semanal interactiva con edición en tiempo real. |
| **Prioridades** | Gráfico de barras y lista de prioridades con estadísticas. |
| **Proyectos** | Lista de proyectos con filtros y ordenamiento personalizados. |
| **Certificaciones** | Seguimiento de certificaciones con barras de progreso. |
| **Plan de Estudio** | Línea de tiempo académica con filtros y ordenamiento. |
| **CV y Habilidades** | Gestión de habilidades y herramientas técnicas. |

---

## 🛠️ Tecnologías

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS)
- **Gráficos:** [Chart.js](https://www.chartjs.org/) para visualizaciones dinámicas
- **Iconos:** [Font Awesome](https://fontawesome.com/) para iconografía
- **Tipografías:** [Google Fonts](https://fonts.google.com/) (Inter, Space Mono, JetBrains Mono)
- **Persistencia:** `localStorage` del navegador

---

## 📂 Estructura del Proyecto

```
proyecto-de-vida-personal/
├── index.html                 # Página principal
├── README.md                  # Documentación del proyecto
├── assets/
│   └── img/
│       └── phoenix.svg        # Logo del proyecto
├── css/                        # Estilos modulares
│   ├── styles.css             # Estilos globales y base
│   ├── goal.css                # Estilos para metas
│   ├── schedule.css           # Estilos para horario
│   ├── priorities.css         # Estilos para prioridades
│   ├── projects.css           # Estilos para proyectos
│   ├── certificaciones.css    # Estilos para certificaciones
│   ├── studyplan.css          # Estilos para plan de estudio
│   └── cv.css                  # Estilos para CV y habilidades
└── js/                          # Lógica modular
    ├── main.js                 # Navegación, horario y lógica principal
    ├── goal.js                 # Gestión de metas (CRUD)
    ├── priorities.js           # Gestión de prioridades y gráficos
    ├── projects.js             # Gestión de proyectos (CRUD, filtros)
    ├── certificaciones.js      # Gestión de certificaciones (CRUD, progreso)
    ├── studyplan.js            # Gestión de plan de estudio (CRUD, timeline)
    ├── cv.js                    # Gestión de CV (habilidades y herramientas)
    └── confirm.js               # Modal de confirmación personalizado
```

---

## 🚀 Instalación y Ejecución

### Requisitos Previos

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexión a internet (para cargar fuentes, iconos y Chart.js)

### Pasos para Ejecutar

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/proyecto-de-vida-personal.git
   ```

2. **Navegar al directorio del proyecto:**
   ```bash
   cd proyecto-de-vida-personal
   ```

3. **Abrir el archivo principal:**
   - **Opción 1 (Recomendada):** Usa un servidor local como *Live Server* en VS Code.
   - **Opción 2:** Abre directamente el archivo `index.html` en tu navegador.

### 📌 Notas de Ejecución

> - La aplicación no requiere dependencias de Node.js ni procesos de compilación.
> - Todo el código es JavaScript vanilla (sin frameworks).
> - Los datos se almacenan localmente en tu navegador.

---

## 📦 Módulos Principales

<details>
<summary><strong>1. Gestión de Metas</strong> (<code>goal.js</code>)</summary>

- **CRUD:** Crear, leer, editar y eliminar metas.
- **Ordenamiento:** Las metas se ordenan automáticamente por año (cronológico).
- **Historial:** Las metas completadas se archivan con fecha de finalización.
- **Validaciones:** Título y año requeridos, año válido (1900–2100).
</details>

<details>
<summary><strong>2. Horario 24/7</strong> (<code>main.js</code>)</summary>

- **Tabla Semanal:** Interactiva con 24 filas (horas) y 7 columnas (días).
- **Edición:** Click en cualquier celda para abrir modal de edición.
- **Tipos de Actividad:** Trabajo, Estudio, Personal, Descanso (con iconos).
- **Hora Actual:** Resalta en tiempo real la hora actual (zona horaria Colombia).
- **Persistencia:** Guarda y restaura el horario con `localStorage`.
</details>

<details>
<summary><strong>3. Prioridades</strong> (<code>priorities.js</code>)</summary>

- **CRUD:** Crear, editar y eliminar prioridades.
- **Asignación de Tiempo:** Horas diarias dedicadas a cada prioridad.
- **Gráfico:** Visualización de barras con Chart.js.
- **Estadísticas:** Total de horas, número de prioridades y productividad.
</details>

<details>
<summary><strong>4. Proyectos</strong> (<code>projects.js</code>)</summary>

- **CRUD:** Crear, editar y eliminar proyectos.
- **Tecnologías:** Añadir tecnologías asociadas al proyecto.
- **Filtros:** Por estado (En progreso, Planificado, Completado, Pausado).
- **Ordenamiento:** Por estado, fecha, nivel y nombre.
- **Progreso:** Barra de progreso y detección de proyectos atrasados.
</details>

<details>
<summary><strong>5. Certificaciones</strong> (<code>certificaciones.js</code>)</summary>

- **CRUD:** Crear, editar y eliminar certificaciones.
- **Progreso:** Actualización con modal interactivo (slider y botones rápidos).
- **Niveles:** Fundamentos, Junior, Intermedia, Senior, Experto.
- **Estados:** Planificado, En curso, Completado.
- **Estadísticas:** Conteo de certificaciones por estado y promedio de progreso.
</details>

<details>
<summary><strong>6. Plan de Estudio</strong> (<code>studyplan.js</code>)</summary>

- **CRUD:** Crear, editar y eliminar estudios.
- **Línea de Tiempo:** Visualización vertical con puntos de hitos.
- **Niveles:** Técnico, Tecnólogo, Pregrado, Especialización, Maestría, Doctorado.
- **Filtros:** Por estado (Planificado, En curso, Completado, Pausado).
- **Ordenamiento:** Por fecha, nivel y nombre.
</details>

<details>
<summary><strong>7. CV y Habilidades</strong> (<code>cv.js</code>)</summary>

- **CRUD:** Crear y eliminar habilidades y herramientas.
- **Dos Categorías:** Habilidades (soft skills) y Herramientas (tech skills).
- **Estadísticas:** Conteo total de habilidades y herramientas.
</details>

<details>
<summary><strong>8. Modal de Confirmación</strong> (<code>confirm.js</code>)</summary>

- **Personalizado:** Reemplaza el `confirm()` nativo.
- **Estilo:** Consistente con el diseño de la aplicación.
- **Callbacks:** Soporte para acciones de aceptar y cancelar.
</details>

---

## 💾 Persistencia de Datos

Todos los módulos utilizan `localStorage` para guardar los datos de forma persistente. Las claves utilizadas son:

| Módulo | Clave de `localStorage` |
| :--- | :--- |
| Metas — Activas | `aley_goals_active` |
| Metas — Completadas | `aley_goals_completed` |
| Horario | `aley_schedule_data` |
| Prioridades | `aley_priorities_data` |
| Proyectos | `aley_projects_data` |
| Certificaciones | `aley_certifications_data` |
| Plan de Estudio | `aley_studyplan_data_v2` |
| CV (Habilidades y Herramientas) | `aley_cv_data` |

**Ejemplo de uso:**

```javascript
// Guardar datos
localStorage.setItem('aley_goals_active', JSON.stringify(goalsList));

// Cargar datos
const savedGoals = localStorage.getItem('aley_goals_active');
if (savedGoals) {
    goalsList = JSON.parse(savedGoals);
}
```

---

## 🎨 Personalización

### Cambiar Colores y Tema

- Los colores principales (rojo `#dc2626`) se pueden modificar en `css/styles.css`.
- Busca y reemplaza `#dc2626` por tu color deseado.
- También puedes ajustar el fondo (`#0a0f1a`) y los bordes.

### Añadir Nuevos Módulos

1. **CSS:** Crea un nuevo archivo `css/mi-modulo.css` y enlázalo en `index.html`.
2. **JavaScript:** Crea un nuevo archivo `js/mi-modulo.js` usando el patrón IIFE.
3. **HTML:** Añade una nueva sección `<section>` con la clase `page`.
4. **Nav:** Añade un botón en `.nav-links` con `data-page="mi-modulo"`.
5. **Exporta:** Expón las funciones necesarias globalmente.

### Modificar Datos Iniciales

Cada módulo tiene un conjunto de datos iniciales (ejemplo: `certificationsList`, `projectsList`). Modifica estos arrays directamente en los archivos JavaScript para cambiar los datos por defecto.

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Si deseas mejorar este proyecto:

1. Haz un **fork** del repositorio.
2. Crea una rama para tu característica: `git checkout -b feature/nueva-caracteristica`.
3. Realiza tus cambios y asegúrate de que el código siga las buenas prácticas.
4. Haz commit de tus cambios: `git commit -am 'Añadir nueva característica'`.
5. Haz push a la rama: `git push origin feature/nueva-caracteristica`.
6. Abre un **Pull Request** detallando los cambios realizados.

### Directrices de Contribución

- Mantén la coherencia del estilo de código.
- Documenta las nuevas funciones con comentarios claros.
- Asegúrate de que la aplicación siga siendo responsiva.
- Prueba los cambios en diferentes navegadores.

---

## ⚠️ Notas Adicionales

**Zona Horaria**
El horario utiliza la zona horaria de Colombia (UTC-5) para el resaltado de la hora actual. Puedes cambiar la zona horaria modificando la función `getCurrentColombiaDateTime()` en `main.js`.

**Navegadores Soportados**

| Navegador | Versión mínima |
| :--- | :--- |
| Chrome | 60+ |
| Firefox | 55+ |
| Edge | 80+ |
| Safari | 12+ |
| Opera | 50+ |

**Problemas Conocidos**
- **VS Code Live Server:** Asegúrate de que el servidor esté configurado correctamente para evitar errores de CORS.
- **Móvil:** En dispositivos muy pequeños, algunas tablas pueden requerir desplazamiento horizontal.
- **Font Awesome:** Si los iconos no se muestran, verifica tu conexión a internet.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

## 📧 Contacto

| | |
|---|---|
| **Autor** | Aley Cabrera D. |
| **Email** | aley.cabrera@gmail.com |
| **GitHub** | [@AleyCabreraD](https://github.com/AleyCabrera) |
| **LinkedIn** | [Aley Cabrera D](https://www.linkedin.com/in/aley-cabrera/) |

---

## 🙏 Agradecimientos

- [Chart.js](https://www.chartjs.org/) por la librería de gráficos.
- [Font Awesome](https://fontawesome.com/) por los iconos.
- [Google Fonts](https://fonts.google.com/) por las tipografías.

---

<div align="center">

**¡Disfruta gestionando tu proyecto de vida! 🚀🎯**

</div>
