# 🔒 CONFIGURACIÓN SEGURA PARA HOSTINGER

## ⚠️ PROBLEMA DE SEGURIDAD
El archivo `.env` en el directorio público (`public_html`) NO es seguro, aunque esté protegido por `.htaccess`.

## ✅ SOLUCIÓN SEGURA

### 1. Estructura de directorios en Hostinger:
```
/home/usuario/
├── public_html/           # Directorio público (web)
│   └── tu-proyecto/
└── private_env/           # Directorio PRIVADO (crearlo)
    └── .env              # Archivo .env AQUÍ
```

### 2. Pasos para configurar:

1. **Accede por cPanel File Manager o SSH**
2. **Ve al directorio padre de `public_html`**
3. **Crea directorio privado:**
   ```bash
   mkdir private_env
   ```
4. **Mueve/crea el .env:**
   ```bash
   # Desde public_html/tu-proyecto/
   mv .env ../../private_env/.env
   ```
5. **Copia el contenido de `.env.example` al nuevo .env**

### 3. Actualizar código PHP:
El código ya está actualizado para buscar en `../../Prueba_private/.env`

### 4. En Hostinger, ajustar la ruta:
```php
// En api/chat-endpoint.php cambiar a:
$dotenv = Dotenv\Dotenv::createImmutable('/home/tu_usuario/private_env');
```

## 🛡️ Medidas adicionales de seguridad:

### Permisos del archivo:
```bash
chmod 600 /home/usuario/private_env/.env  # Solo owner puede leer/escribir
```

### Variables de sistema (alternativa):
En cPanel > Software > Select PHP Version > Switch to PHP Options
Agregar: `API_KEY=tu_clave_aqui`

## ✅ Verificación
- [ ] `.env` fuera de `public_html`
- [ ] Código actualizado con ruta correcta
- [ ] Permisos 600 en el archivo
- [ ] `.env` en `.gitignore`
- [ ] Probar API funcionando

## ❌ NUNCA hagas esto:
- ❌ `.env` en `public_html` o subdirectorios
- ❌ API keys en código fuente
- ❌ Commitear `.env` al repositorio
- ❌ Confiar solo en `.htaccess` para seguridad
