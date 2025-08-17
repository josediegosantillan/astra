# 📁 ESTRUCTURA DE DIRECTORIOS SEGURA

## 🏠 DESARROLLO LOCAL (XAMPP)

```
C:\xampp\htdocs\
├── Prueba\                          # Tu proyecto (directorio público)
│   ├── .env.example                 # ✅ Plantilla segura (sin datos reales)
│   ├── .gitignore                   # ✅ Excluye .env
│   ├── .htaccess                    # 🛡️ Protecciones adicionales
│   ├── index.html                   # Página principal
│   ├── composer.json                # Dependencias PHP
│   ├── composer.lock
│   ├── SEGURIDAD.md                 # Documentación de seguridad
│   ├── api\
│   │   └── chat-endpoint.php        # ✅ Actualizado para ruta privada
│   └── vendor\                      # Dependencias de Composer
│       └── ...
│
└── Prueba_private\                  # 🔒 DIRECTORIO PRIVADO
    └── .env                         # ✅ Variables sensibles AQUÍ
```

## 🌐 PRODUCCIÓN EN HOSTINGER

```
/home/tu_usuario/                    # Directorio raíz de tu cuenta
│
├── public_html/                     # 🌍 DIRECTORIO PÚBLICO (web accesible)
│   └── tu-proyecto/                 # Tu aplicación
│       ├── .env.example             # ✅ Solo ejemplo
│       ├── .gitignore
│       ├── .htaccess
│       ├── index.html
│       ├── composer.json
│       ├── composer.lock
│       ├── SEGURIDAD.md
│       ├── api/
│       │   └── chat-endpoint.php
│       └── vendor/
│
├── private_config/                  # 🔒 DIRECTORIO PRIVADO (crear este)
│   └── .env                         # ✅ Variables sensibles AQUÍ
│
├── logs/                           # Logs del sistema
├── tmp/                            # Archivos temporales
└── mail/                           # Configuración email
```

## 📂 CONTENIDO DE ARCHIVOS CLAVE

### `.env` (en directorio privado)
```env
# API Configuration
API_KEY=tu_clave_real_de_gemini_aqui
MODEL_NAME=gemini-2.5-flash
DEBUG=false

# Database (si lo necesitas en futuro)
# DB_HOST=localhost
# DB_NAME=tu_base_datos
# DB_USER=tu_usuario
# DB_PASS=tu_password
```

### `.env.example` (en directorio público - seguro)
```env
# Archivo de ejemplo - NO contiene datos sensibles
API_KEY=your_google_gemini_api_key_here
MODEL_NAME=gemini-2.5-flash
DEBUG=false
```

### `api/chat-endpoint.php` - Rutas actualizadas:
```php
// DESARROLLO LOCAL
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../Prueba_private');

// PRODUCCIÓN HOSTINGER (ajustar según tu usuario)
$dotenv = Dotenv\Dotenv::createImmutable('/home/tu_usuario/private_config');
```

## 🚀 COMANDOS PARA HOSTINGER

### Via cPanel File Manager:
1. **Crear directorio privado:**
   - Navegar a `/home/tu_usuario/`
   - Crear carpeta `private_config`
   - Permisos: 755

2. **Crear archivo .env:**
   - Dentro de `private_config`
   - Crear `.env` 
   - Permisos: 600 (solo owner lee/escribe)

### Via SSH (si tienes acceso):
```bash
# Crear directorio privado
mkdir ~/private_config
chmod 755 ~/private_config

# Crear y configurar .env
nano ~/private_config/.env
# (pegar contenido del .env)
chmod 600 ~/private_config/.env

# Verificar estructura
ls -la ~/
ls -la ~/private_config/
ls -la ~/public_html/tu-proyecto/
```

## 🔧 CÓDIGO PARA DETECCIÓN AUTOMÁTICA

```php
// En chat-endpoint.php - detección automática de entorno
$envPaths = [
    __DIR__ . '/../../Prueba_private',           // Desarrollo local
    '/home/' . get_current_user() . '/private_config',  // Hostinger
    __DIR__ . '/../..',                          // Fallback
];

$dotenv = null;
foreach ($envPaths as $path) {
    if (file_exists($path . '/.env')) {
        $dotenv = Dotenv\Dotenv::createImmutable($path);
        break;
    }
}

if ($dotenv) {
    $dotenv->load();
} else {
    error_log('No se encontró archivo .env en las rutas esperadas');
}
```

## ✅ VERIFICACIÓN DE SEGURIDAD

### URLs que NO deben ser accesibles:
- ❌ `https://tudominio.com/.env`
- ❌ `https://tudominio.com/composer.json`
- ❌ `https://tudominio.com/vendor/`

### URLs que SÍ deben funcionar:
- ✅ `https://tudominio.com/` (index.html)
- ✅ `https://tudominio.com/api/chat-endpoint.php`

¿Quieres que prepare el código con detección automática o prefieres una versión específica para Hostinger?
