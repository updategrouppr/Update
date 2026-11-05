# Update Group — Website

Website de [Update Group](https://www.updategrouppr.com), en español e inglés.

- `index.html`: página principal.
- `services.html`: página de servicios con fotos y detalle de cada servicio.
- `site.css`: estilos compartidos por las dos páginas.
- `js/`: el código JavaScript de las páginas (`main.js` para la principal, `services.js` para servicios).
- `img/`: fotos de los servicios (generadas con AI en Higgsfield).
- `mark.png`: símbolo de la marca.
- `portal.html`, `propuesta.html`, `portafolio.html` y `portal.css`: el portal de clientes (ver abajo).

## Verlo y publicarlo
- Local: abrir `index.html` en el navegador.
- En línea: cada push a `main` publica el website automáticamente con GitHub Actions
  (`.github/workflows/deploy.yml`). El progreso se ve en la pestaña **Actions** del repo.
- Requisito, una sola vez: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
- La rama `pruebas` no se publica sola; para publicar sus cambios hay que pasarlos a `main`.

## Inglés y español (dos URLs)
- `index.html` y `services.html` son páginas **bilingües**: cada texto va dos veces, en `<span class="en">` y `<span class="es">` (o `<i>`). Se editan aquí, en un solo lugar.
- Al publicar, `tools/build_site.py` genera la carpeta `_site/` con:
  - `/` y `/services.html` → solo inglés.
  - `/es/` y `/es/services.html` → solo español, con título y descripción propios para Google.
  - `sitemap.xml` con las 4 páginas y las etiquetas `hreflang` que le dicen a Google cuál es cuál.
- En el sitio publicado el botón **EN/ES** lleva a la otra URL y recuerda la preferencia.
- Probarlo local: `python3 tools/build_site.py` y abrir `_site/index.html`.
- Los títulos y descripciones en español están en `ES_META`, dentro de `tools/build_site.py`.

## SEO
- Título, descripción, canonical, Open Graph (imagen `img/og-image.jpg`) y datos estructurados de negocio (JSON-LD) en el `<head>`.
- `robots.txt` y `sitemap.xml` usan el dominio `https://www.updategrouppr.com/`. Si el sitio se publica en otro dominio, hay que cambiarlos junto con los `canonical`.
- `404.html`: página de error con la marca.
- Favicons: `favicon.png`, `favicon-48.png`, `apple-touch-icon.png`, `icon-512.png`.

## Seguridad
- Las dos páginas tienen una política de seguridad (Content-Security-Policy) en el `<head>`. Solo deja cargar código desde este mismo sitio y las fuentes de Google.
- Por eso **no se puede poner código `<script>` directo dentro del HTML**: el navegador lo bloquea. Todo el JavaScript va en archivos dentro de `js/`.
- Si se añade algo de otra página (un video, un mapa, un chat), hay que permitir ese dominio en la política o no va a cargar.

## Portal de clientes
- `portal.html`: el cliente escribe su clave. La clave es el nombre de un archivo en `proposals/` (clave `UPDATE2026` → `proposals/update2026.json`).
- `propuesta.html`: la propuesta como página animada, armada desde ese archivo: portada, resumen, objetivos, servicios, plan, quiénes somos, trabajo relacionado y aprobación por WhatsApp. **No lleva precios.**
- `portafolio.html`: galería de trabajos con filtros y visor en grande.
- **Crear una propuesta:** copiar `proposals/update2026.json` con otro nombre (solo letras minúsculas, números y guiones) y cambiar los textos. En el resumen, `**texto**` sale resaltado. En `trabajo` se escoge qué trabajos del portafolio se muestran (`sectores`: gob, marca, causa; `tipos`: redes, campana, evento, impreso, web).
- **Añadir un trabajo al portafolio:** subir la imagen a `img/portfolio/` y añadir una línea en `js/portfolio-data.js`.

## Importante antes de usarlo con clientes reales
- **Portal de clientes:** es un prototipo. Este repo es público y los archivos de `proposals/` se pueden abrir sin clave, así que **no subir propuestas de clientes reales aquí**. Antes, el acceso tiene que validarse en el servidor (Contabo) y las propuestas tienen que vivir fuera del repo.
- **Formulario de contacto:** envía a `/api/contact`, que necesita un servidor. En GitHub Pages ese servidor no existe, así que ahí el formulario muestra el aviso para escribir por WhatsApp.
