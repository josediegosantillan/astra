# Guía para Subir Chatbot a Hostinger

## Requisitos Previos

- Cuenta activa en Hostinger
- Proyecto de chatbot funcionando localmente
- Acceso al panel de control de Hostinger

## Paso 1: Preparar los Archivos

### 1.1 Modificar la URL de la API

Edita el archivo `boton.html` y cambia la línea de la API URL:

```javascript
// Cambiar de:
this.API_URL = '/Prueba/api/chat-endpoint.php';

// A:
this.API_URL = './api/chat-endpoint.php';
```

### 1.2 Comentar el Service Worker

En `boton.html`, comenta o elimina el código del Service Worker:

```javascript
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}
*/
```

### 1.3 Verificar el archivo .env

Asegúrate de que contenga tu API key:

```env
API_KEY=tu_api_key_aqui
```

### 1.4 Crear archivo .htaccess

Crea un archivo `.htaccess` en la raíz del proyecto:

```apache
# Proteger archivo .env
<Files ".env">
    Order allow,deny
    Deny from all
</Files>

# Habilitar CORS
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type"
```

### 1.5 Comprimir el proyecto

Crea un archivo ZIP que incluya:
proyecto.zip
├── .env
├── .htaccess
├── api/
│   └── chat-endpoint.php
├── boton.html
├── composer.json
├── composer.lock
└── vendor/
└── (todas las dependencias)


## Paso 2: Acceder al Panel de Hostinger

### 2.1 Iniciar sesión

1. Ve a [hostinger.com](https://hostinger.com)
2. Haz clic en **"Iniciar sesión"**
3. Ingresa tus credenciales

### 2.2 Acceder al hosting

1. En el dashboard, busca **"Hosting"**
2. Haz clic en **"Administrar"** junto a tu dominio
3. Busca **"Administrador de archivos"** o **"File Manager"**

## Paso 3: Subir los Archivos

### 3.1 Navegar a public_html

1. En el File Manager, navega a la carpeta **`public_html`**
2. Esta es la carpeta raíz de tu sitio web

### 3.2 Subir el archivo ZIP

1. Haz clic en **"Upload"** o **"Subir"**
2. Selecciona tu archivo `proyecto.zip`
3. Espera a que se complete la subida

### 3.3 Extraer archivos

1. Haz clic derecho en `proyecto.zip`
2. Selecciona **"Extract"** o **"Extraer"**
3. Extrae directamente en `public_html/`
4. Elimina el archivo ZIP después de extraer

### 3.4 Verificar estructura

La estructura final debe ser:

public_html/
├── .env
├── .htaccess
├── api/
│   └── chat-endpoint.php
├── boton.html
├── composer.json
├── composer.lock
└── vendor/
└── (dependencias)


## Paso 4: Configurar Composer

### 4.1 Opción A: Terminal SSH (si está disponible)

```bash
cd public_html
composer install
```

### 4.2 Opción B: Subir vendor manualmente

Si no tienes acceso SSH, asegúrate de haber subido la carpeta `vendor/` completa desde tu proyecto local.

## Paso 5: Configurar Permisos

### 5.1 Permisos de archivos

1. **Archivo .env**: 644
2. **Archivo .htaccess**: 644
3. **Archivo boton.html**: 644
4. **Archivo chat-endpoint.php**: 644

### 5.2 Permisos de carpetas

1. **Carpeta api/**: 755
2. **Carpeta vendor/**: 755

### 5.3 Cambiar permisos

1. Haz clic derecho en el archivo/carpeta
2. Selecciona **"Permissions"** o **"Permisos"**
3. Establece los permisos correspondientes

## Paso 6: Verificar Configuración PHP

### 6.1 Versión de PHP

1. En el panel de Hostinger, busca **"PHP Configuration"**
2. Asegúrate de tener **PHP 7.4 o superior**
3. Verifica que **cURL** esté habilitado

### 6.2 Variables de entorno

Verifica que PHP pueda leer el archivo `.env`:

1. Crea un archivo temporal `test.php`:

```php
<?php
require_once 'vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();
echo "API Key: " . ($_ENV['API_KEY'] ?? 'No encontrada');
?>
```

2. Accede a `tudominio.com/test.php`
3. Elimina el archivo después de verificar

## Paso 7: Probar el Sitio

### 7.1 Probar la página principal

1. Ve a `https://tudominio.com/boton.html`
2. Verifica que la página cargue correctamente
3. Comprueba que no haya errores en la consola del navegador

### 7.2 Probar la API

1. Abre las herramientas de desarrollador (F12)
2. Intenta enviar un mensaje en el chatbot
3. Verifica que la petición a `/api/chat-endpoint.php` sea exitosa

### 7.3 Verificar logs de error

1. En el panel de Hostinger, busca **"Error Logs"**
2. Revisa si hay errores relacionados con tu aplicación

## Paso 8: Configuración Final

### 8.1 Configurar dominio principal

Si quieres que `boton.html` sea la página principal:

1. Renombra `boton.html` a `index.html`
2. Actualiza las referencias en el código si es necesario

### 8.2 Configurar SSL

1. En el panel de Hostinger, busca **"SSL"**
2. Activa el certificado SSL gratuito
3. Fuerza HTTPS si es necesario

## Solución de Problemas

### Error 500 - Internal Server Error

- Verifica permisos de archivos
- Revisa el archivo `.htaccess`
- Comprueba los logs de error

### API no responde

- Verifica que el archivo `.env` esté presente
- Comprueba que la API key sea válida
- Revisa la configuración de PHP

### Errores de CORS

- Verifica el archivo `.htaccess`
- Asegúrate de que las cabeceras CORS estén configuradas

### Composer no funciona

- Sube la carpeta `vendor/` manualmente
- Verifica que todas las dependencias estén presentes

## Mantenimiento

### Actualizar dependencias

```bash
composer update
```

### Backup regular

1. Descarga regularmente una copia de tu sitio
2. Guarda una copia del archivo `.env`
3. Mantén un backup de la base de datos si la usas

### Monitoreo

1. Revisa regularmente los logs de error
2. Monitorea el uso de recursos
3. Verifica que la API key siga siendo válida

---

**¡Listo!** Tu chatbot debería estar funcionando correctamente en Hostinger. Si encuentras algún problema, revisa los logs de error y verifica cada paso de esta guía.

## Notas Adicionales

- **Fecha de creación**: $(date)
- **Versión**: 1.0
- **Proyecto**: Chatbot AstraLumina
- **Hosting**: Hostinger

## Contacto y Soporte

Si necesitas ayuda adicional:
- Revisa la documentación de Hostinger
- Consulta los logs de error del servidor
- Verifica la configuración de PHP y las extensiones requeridas
