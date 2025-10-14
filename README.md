<!-- Encabezado principal -->
<h1 align="center">🕰️ Museo del Tiempo</h1>

<p align="center">
  <strong>Explorá arte, historia y música a través de las décadas</strong><br/>
  <em>Una experiencia inmersiva desarrollada con Next.js 15, TypeScript y Tailwind CSS v4</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js&style=flat-square" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&style=flat-square" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.0-38BDF8?logo=tailwindcss&style=flat-square" />
  <img src="https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel&style=flat-square" />
</p>

---

## 🌌 Descripción del Proyecto

**Museo del Tiempo** es una aplicación web interactiva que invita a viajar por distintas décadas (1950s, 60s, 70s, 80s, etc.) explorando su contexto cultural.  
Cada período combina **música, arte e historia**, brindando una experiencia visual y auditiva única y educativa.

💿 Cada vez que seleccionás una década:

1. 🎵 Se muestra una **canción aleatoria** de esa época (preview desde la API de iTunes).
2. 📜 Aparece un **resumen histórico** con información real de Wikipedia.
3. 🖼️ Se cargan **obras icónicas de arte** obtenidas desde la API del Art Institute of Chicago.

---

## ⚙️ Tecnologías Utilizadas

| Categoría               | Tecnologías                                                           |
| ----------------------- | --------------------------------------------------------------------- |
| **Framework principal** | [Next.js 15](https://nextjs.org/) + App Router                        |
| **Lenguaje**            | TypeScript                                                            |
| **Estilos**             | [Tailwind CSS v4](https://tailwindcss.com/) + PostCSS                 |
| **Librerías**           | Axios · Lucide React                                                  |
| **APIs externas**       | iTunes Search API · Wikipedia REST API · Art Institute of Chicago API |

---

## 🧠 Arquitectura del Proyecto

src/
├─ app/
│ ├─ components/
│ │ ├─ Header.tsx
│ │ ├─ AudioPlayer.tsx
│ │ ├─ ArtworkGrid.tsx
│ │ └─ DecadePicker.tsx
│ └─ page.tsx
└─ lib/
└─ apis.ts

---

## 🧩 Principales Funcionalidades

### 🎵 Canción Aleatoria por Década

- Función: `searchRandomSongByDecade(decade)`
- Elige un **año aleatorio dentro de la década** y un **país aleatorio** del catálogo de iTunes.
- Devuelve título, artista, portada y preview de 30 segundos.
- Incluye botón **🎲 “Otra canción”** para volver a sortear dinámicamente.

### 📜 Contexto Histórico

- API REST de **Wikipedia en español**.
- Devuelve un resumen corto, título y link a la página de la década.

### 🖼️ Obras Icónicas

- API del **Art Institute of Chicago**.
- Filtra obras cuya fecha de creación cae dentro del rango de la década.
- Elimina duplicados, evita piezas de siglos anteriores y baraja resultados para variedad.
- Muestra hasta **6 obras por década** con título, artista, año e imagen.

---

## 🎨 Diseño y Estilo

✨ **Paleta Cosmic**

- Fondo: `bg-cosmic-900` (violeta espacial)
- Cards translúcidas: `bg-white/10`
- Bordes brillantes y efectos eléctricos

💡 **Detalles visuales**

- Header translúcido con blur y tipografía moderna (`Plus Jakarta Sans`)
- Layout limpio, responsivo y legible
- Animaciones planeadas con **Framer Motion** (fade-in y transiciones entre décadas)

---

## 🚀 Instalación y Ejecución

```bash
# 1️⃣ Clonar el repositorio
git clone https://github.com/christofa2000/museo-del-tiempo.git

# 2️⃣ Instalar dependencias
npm install

# 3️⃣ Ejecutar en modo desarrollo
npm run dev

# 4️⃣ Abrir en el navegador
http://localhost:3000

🌐 APIs Utilizadas
🎧 iTunes Search API

https://itunes.apple.com/search

Usada para obtener una canción aleatoria por década.
Sin necesidad de API key.

📚 Wikipedia REST API

https://en.wikipedia.org/api/rest_v1/

Devuelve resúmenes cortos y enlaces de Wikipedia en español.

🖼️ Art Institute of Chicago API

https://api.artic.edu/api/v1/artworks/search

Permite consultar obras de arte filtradas por año, autor y estilo.

✨ Estado Actual

✅ Tailwind CSS v4 configurado correctamente
✅ Alias @/* funcionando
✅ Header y componentes estilizados
✅ Canción aleatoria por década
✅ Botón “🎲 Otra canción” operativo
✅ Wikipedia API funcionando
✅ Obras icónicas filtradas correctamente
✅ Diseño limpio y responsivo
✅ Sin errores de consola

🪶 Próximos Pasos

🎬 Agregar animaciones suaves con Framer Motion

🔄 Botón “Otras obras” para recargar la galería

🪶 Añadir tipografía secundaria (Cormorant Garamond)

💾 Guardar la última década visitada en localStorage

☁️ Publicar en Vercel (museodeltiempo.vercel.app)

👨‍💻 Autor

Christian Oscar Papa
Frontend Developer especializado en React + TypeScript

💫 “El verdadero desarrollo comienza cuando la técnica y la sensibilidad se encuentran.”
```
