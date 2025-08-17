# 🎨 Nueva Paleta Magenta - AstraLumina

## Color Base
El color base de la paleta está definido como: `oklch(59.017% 0.24113 330.465)`

## Paleta Completa

### Paleta Principal (50-950)
```css
--color-magenta-50: oklch(0.97 0.03 330);
--color-magenta-100: oklch(0.95 0.06 330);
--color-magenta-200: oklch(0.90 0.12 330);
--color-magenta-300: oklch(0.83 0.18 330);
--color-magenta-400: oklch(0.73 0.22 330);
--color-magenta-500: oklch(0.59017 0.24113 330.465); /* Color base */
--color-magenta-600: oklch(0.52 0.26 330);
--color-magenta-700: oklch(0.44 0.24 330);
--color-magenta-800: oklch(0.37 0.22 330);
--color-magenta-900: oklch(0.30 0.18 330);
--color-magenta-950: oklch(0.23 0.14 330);
```

### Variaciones Complementarias
```css
--color-magenta-light: oklch(0.75 0.20 330);
--color-magenta-bright: oklch(0.65 0.28 330);
--color-magenta-deep: oklch(0.45 0.26 330);
--color-magenta-dark: oklch(0.35 0.20 330);
```

### Variaciones Temáticas
```css
--color-magenta-soft: oklch(0.82 0.15 330);      /* Magenta suave */
--color-magenta-vivid: oklch(0.60 0.30 330);     /* Magenta vibrante */
--color-magenta-muted: oklch(0.55 0.18 330);     /* Magenta apagado */
--color-magenta-electric: oklch(0.70 0.32 330);  /* Magenta eléctrico */
```

### Gradaciones Tonales
```css
--color-magenta-pink: oklch(0.75 0.22 340);      /* Magenta rosado */
--color-magenta-purple: oklch(0.58 0.24 320);    /* Magenta violáceo */
--color-magenta-coral: oklch(0.68 0.26 345);     /* Magenta coral */
```

## Clases Tailwind Disponibles

### Colores de Fondo
- `bg-magenta-50` hasta `bg-magenta-950`
- `bg-magenta-light`, `bg-magenta-bright`, `bg-magenta-deep`, `bg-magenta-dark`
- `bg-magenta-soft`, `bg-magenta-vivid`, `bg-magenta-muted`, `bg-magenta-electric`
- `bg-magenta-pink`, `bg-magenta-purple`, `bg-magenta-coral`

### Colores de Texto
- `text-magenta-50` hasta `text-magenta-950`
- `text-magenta-light`, `text-magenta-bright`, etc.

### Colores de Borde
- `border-magenta-50` hasta `border-magenta-950`
- `border-magenta-light`, `border-magenta-bright`, etc.

## Ejemplos de Uso

### 1. Botón Primario
```html
<button class="bg-magenta-500 hover:bg-magenta-600 text-white font-bold py-2 px-4 rounded">
    Botón Magenta
</button>
```

### 2. Botón Secundario
```html
<button class="border-2 border-magenta-500 text-magenta-500 hover:bg-magenta-500 hover:text-white font-bold py-2 px-4 rounded transition-all">
    Botón Outline
</button>
```

### 3. Gradiente
```html
<div class="bg-gradient-to-r from-magenta-400 to-magenta-600 p-6 rounded-lg">
    Contenido con gradiente
</div>
```

### 4. Tarjeta con Glassmorphism
```html
<div class="bg-magenta-500/20 backdrop-blur-md border border-magenta-300/30 rounded-xl p-6">
    Tarjeta translúcida
</div>
```

### 5. Texto con Brillos
```html
<h1 class="text-magenta-400 text-4xl font-bold" style="text-shadow: 0 0 10px rgba(168, 85, 247, 0.5);">
    Título con Brillo Magenta
</h1>
```

## Combinaciones Recomendadas

### 1. Fondo Oscuro + Magenta
```html
<div class="bg-gray-900 text-magenta-300">
    Texto magenta en fondo oscuro
</div>
```

### 2. Combinación con Blancos
```html
<div class="bg-magenta-600 text-white">
    Texto blanco en magenta
</div>
```

### 3. Variación Tonal
```html
<div class="bg-magenta-soft text-magenta-deep">
    Contraste tonal magenta
</div>
```

## Notas de Implementación

- **OKLCH**: Utiliza el espacio de color OKLCH para mejor precisión y uniformidad
- **Hue Base**: 330° (magenta intenso)
- **Saturación**: Variable entre 0.03 y 0.32
- **Luminosidad**: De 0.23 (muy oscuro) a 0.97 (muy claro)
- **Compatibilidad**: Funciona en navegadores modernos que soportan OKLCH

## Compilación

Para usar estas clases, asegúrate de compilar Tailwind CSS:

```bash
npx tailwindcss -i ./src/input.css -o ./src/output.css --watch
```

---

**Creado para AstraLumina** 🌟 - Consultas holísticas con diseño moderno
