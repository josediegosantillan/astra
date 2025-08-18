# Guía: Animación de estrellas para contenedores

Breve: esta guía describe cómo crear un campo de estrellas eficiente y responsivo usando pseudo‑elementos CSS, `radial-gradient` para cada punto y animaciones por keyframes que simulan estrellas que se acercan (efecto hiperespacial). Está pensada para el proyecto `AstraLumina`.

Checklist (qué cubriré)
- [x] Estructura HTML mínima
- [x] CSS para overlay y pseudo‑elementos (`::before` y `::after`)
- [x] Técnica de `radial-gradient` para puntos (estrellas)
- [x] Animaciones: movimiento hacia adelante sin parpadeo abrupto
- [x] Capa central con recorrido más largo
- [x] Preferencias de reducción de movimiento y optimizaciones de rendimiento
- [x] Parámetros que puedes ajustar (densidad, tamaño, duración)

## 1. Estructura HTML
Coloca un elemento overlay dentro del contenedor donde quieras las estrellas (por ejemplo, sobre el logo):

<div style="font-style:italic">HTML:</div>

<div style="background:#f6f6f6;padding:8px;border-radius:4px">&lt;div class="logo-container"&gt;
  &lt;div class="stars-overlay" aria-hidden="true"&gt;&lt;/div&gt;
  &lt;img src="..." /&gt;
&lt;/div&gt;</div>

- `pointer-events: none` evita que las estrellas interrumpan la interacción.
- Usa `position: relative` en el contenedor padre para que el overlay pueda cubrirlo con `inset:0`.

## 2. CSS base del overlay
- Usa pseudo‑elementos (`::before`, `::after`) para crear muchas estrellas sin añadir nodos DOM.
- `background` con múltiples `radial-gradient` posicionadas por porcentajes crea puntos en lugares distintos.
- Añade `will-change`, `transform: translateZ(0)` y `filter` para acelerar renderizado cuando sea apropiado.

Puntos clave:
- `.stars-overlay { position:absolute; inset:0; pointer-events:none; z-index: x; }`
- `.stars-overlay::before, .stars-overlay::after { content:''; position:absolute; inset:0; background-repeat:no-repeat; will-change: transform, opacity; }`

## 3. Construir estrellas con radial-gradients
Cada estrella se representa por un `radial-gradient(circle at X% Y%, color size, transparent ...)`.
- Tamaños pequeños: usa valores de 0.3px a 0.6px para el radio visible.
- Transparencia suave: colores intermedios con alpha para bordes suaves.

Ejemplo (una capa con varias estrellas):

<div style="background:#f6f6f6;padding:8px;border-radius:4px">background:
  radial-gradient(circle at 3% 6%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
  radial-gradient(circle at 22% 30%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
  ...;</div>

Consejo: agrupa muchas estrellas pequeñas en `::before` y reserva `::after` para estrellas centrales o especiales.

## 4. Animación: movimiento hacia adelante sin parpadeo
Objetivo: que las estrellas "vengan hacia adelante" (escala) pero sin parpadear de forma abrupta.

- Mantén tamaño base pequeño; aplica una escala moderada (por ejemplo 0.8 → 1.2) para la mayoría.
- Para evitar desapariciones bruscas, controla `opacity` con entradas/guardas (ej.: 0% invisible → 10% aparece → 90% visible → 100% desaparece).
- Si quieres que algunas estrellas centrales sigan más tiempo, usa otra animación con mayor duración y mayor escala.

Ejemplo de keyframes (concepto):

<div style="background:#f6f6f6;padding:8px;border-radius:4px">@keyframes stars-move {
  0% { transform: scale(0.8) translateZ(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: scale(1.2) translateZ(0); opacity: 0; }
}

@keyframes stars-move-center {
  0% { transform: scale(0.5) translateZ(0); opacity: 0; }
  5% { opacity: 1; }
  95% { opacity: 1; }
  100% { transform: scale(2.5) translateZ(0); opacity: 0; }
}</div>

- Aplica `animation: stars-move 6s linear infinite;` a `::before` y `animation: stars-move-center 10s linear infinite;` a `::after` cuando uses dos capas.

## 5. Accesibilidad y rendimiento
- Respeta `@media (prefers-reduced-motion: reduce)` y desactiva las animaciones para usuarios que lo prefieran.
- Evita animar propiedades que fuerzen reflow (mejor `transform` y `opacity`).
- Usa `will-change: transform, opacity` con moderación y elimínalo si no es necesario o si genera memoria alta.
- Usa `pointer-events: none` y `aria-hidden="true"` para mejorar UX y compatibilidad con lectores.

Ejemplo de reducción de movimiento:

<div style="background:#f6f6f6;padding:8px;border-radius:4px">@media (prefers-reduced-motion: reduce) {
  .stars-overlay::before, .stars-overlay::after { animation: none; transform: none; }
}</div>

## 6. Ajustes y parámetros a tocar
- Densidad: añade o quita `radial-gradient` en la capa `::before`.
- Tamaño: ajusta los valores `0.3px` → `0.5px` según visibilidad.
- Duración: `animation` (ej. 6s = rápido, 16s = suave/relajado).
- Escala: para efecto sutil usa 0.8→1.2; para efecto dramático 0.5→2.5.
- Filtrado/brillo: `filter: drop-shadow(0 0 5px rgba(...))` para halo suave.

## 7. Pruebas rápidas
1. Guardar cambios y abrir `index.html` en tu navegador (Chrome/Edge/Firefox).
2. Inspeccionar el `div.stars-overlay` con herramientas DevTools y desactivar/activar animación para comparar.
3. Ajusta `animation-duration` en tiempo real para encontrar la sensación adecuada.

## 8. Problemas comunes
- "Estrellas parpadean demasiado": elimina animaciones de `opacity` o reduce rango de opacidad.
- "Rendimiento lento": disminuye cantidad de `radial-gradient` o desactiva `filter` / `drop-shadow`.
- "Estrellas se ven muy grandes en pantallas pequeñas": usa media queries para reducir tamaño/densidad en mobile.

## 9. Ejemplo mínimo (referencia final)
Incluye en tu CSS principal (resumen):

<div style="background:#f6f6f6;padding:8px;border-radius:4px">.stars-overlay{ position:absolute; inset:0; pointer-events:none; }
.stars-overlay::before{ content:''; position:absolute; inset:0; background-repeat:no-repeat; background: /* varias radial-gradients */; animation: stars-move 6s linear infinite; }
.stars-overlay::after{ /* estrellas centrales */ animation: stars-move-center 10s linear infinite; }
/* keyframes: stars-move, stars-move-center. */</div>

## Snippet listo para copiar/pegar

Pega este bloque dentro de tu `<style>` o en tu archivo CSS principal (por ejemplo `src/main.css`):

```css
/* --- Overlay de estrellas (copy/paste) --- */
.stars-overlay { z-index: 5; position: absolute; inset: 0; pointer-events: none; }

.stars-overlay::before,
.stars-overlay::after{
  content: '';
  position: absolute;
  inset: 0;
  background-repeat: no-repeat;
  pointer-events: none;
  opacity: 0.9;
  will-change: transform, opacity;
  transform-origin: center;
  filter: drop-shadow(0 0 5px rgba(255, 0, 128, 0.12)); /* ajuste opcional */
}

/* Capa exterior: muchas estrellas pequeñas */
.stars-overlay::before{
  background:
    radial-gradient(circle at 3% 6%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 12% 18%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 22% 30%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 34% 8%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 45% 40%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 55% 25%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 68% 12%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 78% 34%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 88% 6%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 96% 26%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 15% 48%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 28% 52%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 42% 16%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 58% 44%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 72% 28%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 85% 42%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 18% 62%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 38% 76%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 62% 54%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 74% 68%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 6% 82%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 24% 14%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 48% 2%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 64% 86%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 86% 74%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 94% 58%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 16% 36%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 36% 56%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 52% 72%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 76% 46%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 92% 12%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 8% 94%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px);
  transform: translateZ(0);
  animation: stars-move 6s linear infinite;
}

/* Capa central: pocas estrellas con recorrido más largo */
.stars-overlay::after{
  background:
    radial-gradient(circle at 45% 40%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 55% 25%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 42% 16%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 58% 44%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 48% 52%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 52% 38%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 46% 28%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px),
    radial-gradient(circle at 54% 36%, rgba(255,255,255,1) 0.3px, rgba(255,255,255,0.4) 0.6px, transparent 0.9px);
  transform: translateZ(0);
  animation: stars-move-center 10s linear infinite;
}

/* Keyframes: movimiento suave hacia adelante y fade in/out gradual */
@keyframes stars-move{
  0%{ transform: scale(0.8) translateZ(0); opacity: 0; }
  10%{ opacity: 1; }
  90%{ opacity: 1; }
  100%{ transform: scale(1.2) translateZ(0); opacity: 0; }
}

@keyframes stars-move-center{
  0%{ transform: scale(0.5) translateZ(0); opacity: 0; }
  5%{ opacity: 1; }
  95%{ opacity: 1; }
  100%{ transform: scale(2.5) translateZ(0); opacity: 0; }
}

/* Accesibilidad: desactivar animaciones si el usuario prefiere movimiento reducido */
@media (prefers-reduced-motion: reduce) {
  .stars-overlay::before,
  .stars-overlay::after { animation: none; opacity: 0.9; transform: none; }
}

### Snippet: reducir carga en CPU (Canvas recomendado, SVG alternativa)

Cuando la densidad de partículas es alta (muchas `radial-gradient`) el navegador sufre muchos repaints. Recomendado: usar `canvas` (raster) para miles de estrellas; usar `SVG` cuando el número de elementos sea pequeño (<~60).

#### 1) Canvas (recomendado para alta densidad)
- Ventajas: dibujado por píxeles único, menos DOM, mayor control de rendimiento.
- Estrategia: limitar la cantidad de partículas según tamaño del lienzo, pausar cuando la pestaña no está activa, evitar filtros/drop-shadow y usar requestAnimationFrame.

Pega en tu HTML (reemplaza `div.stars-overlay` por este canvas dentro del contenedor):

```html
<canvas id="stars-canvas" class="stars-overlay" aria-hidden="true"></canvas>
```

Código JavaScript mínimo (optimizado):

```js
(function(){
  const canvas = document.getElementById('stars-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let DPR = window.devicePixelRatio || 1;

  function resize(){
    canvas.width = Math.max(1, canvas.clientWidth * DPR);
    canvas.height = Math.max(1, canvas.clientHeight * DPR);
    // No uses ctx.scale cada vez si no es necesario; reinicia transform si lo haces
    ctx.setTransform(1,0,0,1,0,0);
    ctx.scale(DPR, DPR);
  }
  resize();
  window.addEventListener('resize', () => { resize(); rebuildStars(); });

  // Control de cantidad según área (cap para evitar saturar CPU)
  function calcMaxStars(){
    const area = canvas.clientWidth * canvas.clientHeight;
    return Math.min(900, Math.max(40, Math.floor(area / 9000))); // ajusta según pruebas
  }

  let stars = [];
  function rebuildStars(){
    const max = calcMaxStars();
    stars = new Array(max).fill(0).map(()=>{
      return {
        x: (Math.random()-0.5) * canvas.clientWidth,
        y: (Math.random()-0.5) * canvas.clientHeight,
        z: Math.random() * canvas.clientWidth + 0.1,
        speed: 0.6 + Math.random() * 1.4 // velocidad relativa
      };
    });
  }
  rebuildStars();

  let running = true;
  document.addEventListener('visibilitychange', ()=>{ running = !document.hidden; if(running) loop(); });

  function loop(){
    if(!running) return;
    // Clear (en coordenadas CSS, no DPR)
    ctx.clearRect(0,0, canvas.clientWidth, canvas.clientHeight);
    const cx = canvas.clientWidth / 2;
    const cy = canvas.clientHeight / 2;
    const focal = Math.max(canvas.clientWidth, canvas.clientHeight) * 0.6;

    for(let i=0;i<stars.length;i++){
      const s = stars[i];
      // acercamiento por reducción de z
      s.z -= s.speed;
      if(s.z <= 0.1){
        // reinicia detrás
        s.x = (Math.random()-0.5) * canvas.clientWidth;
        s.y = (Math.random()-0.5) * canvas.clientHeight;
        s.z = Math.random() * canvas.clientWidth + focal;
        s.speed = 0.6 + Math.random() * 1.4;
      }

      const px = cx + (s.x / s.z) * focal;
      const py = cy + (s.y / s.z) * focal;
      // tamaño basado en profundidad (mantén pequeño en general)
      const size = Math.max(0.3, (1 / s.z) * 12);

      // dibuja (sin sombras para rendimiento)
      ctx.fillStyle = 'rgba(255,255,255,1)';
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
```

Consejos para rendimiento (canvas):
- Evita `ctx.shadow*` y `filter` en canvas si buscas máxima velocidad.
- Reduce `maxStars` en dispositivos móviles. Puedes usar `navigator.hardwareConcurrency` para ajustes automáticos.
- Pausa la animación cuando `document.hidden` sea true.
- Considera usar un `OffscreenCanvas` o worker si necesitas aún más rendimiento (solo en entornos que lo soporten).

#### 2) SVG (alternativa, para pocas partículas)
- Útil cuando quieres animaciones SVG nativas o interacción sobre elementos concretos.
- No recomendable para cientos de estrellas; mejor limitar a 30–60 elementos.

Ejemplo mínimo (HTML):

```html
<svg class="stars-overlay" aria-hidden="true" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice">
  <g id="stars-svg">
    <circle cx="100" cy="20" r="0.3" fill="#fff" />
    <!-- clona/añade hasta ~50 circles -->
  </g>
</svg>
```

- Animar con CSS: `.stars-overlay circle { transform-origin: 100px 100px; animation: star-zoom 6s linear infinite; }`
- SVG es más costoso por cada nodo; úsalo solo si necesitas accesibilidad por elemento o interactividad.

#### 3) Lógica de detección y cambio automático
Ejemplo simple: si la densidad (nº de `radial-gradient` o tamaño del área) supera un umbral, inserta un canvas y elimina el overlay CSS.

```js
function useCanvasIfNeeded(container){
  const area = container.clientWidth * container.clientHeight;
  const densityEstimate = area / 9000; // mismo criterio que calcMaxStars
  if(densityEstimate > 120){
    // crear canvas y esconder overlay CSS
    // document.querySelector('.stars-overlay') -> replaceWith(canvas)
  }
}
```

---

Estas soluciones permiten mantener el aspecto visual (muchas estrellas pequeñas) sin sobrecargar el renderizador CSS. Puedo añadir este ejemplo al repo como `src/stars-canvas.js` y un pequeño cambio en `index.html` que cargue automáticamente la versión Canvas cuando convenga. ¿Lo agrego?
