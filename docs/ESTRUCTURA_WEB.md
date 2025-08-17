# 🌐 ESTRUCTURA WEB COMPLETA

## 📂 **UBICACIÓN DEL INDEX Y ARCHIVOS WEB**

### 🏠 **DESARROLLO LOCAL (XAMPP)**
```
C:\xampp\htdocs\Prueba\              # ← Directorio accesible vía web
├── index.html                       # ✅ PÁGINA PRINCIPAL
├── api/
│   └── chat-endpoint.php           # ✅ API del chatbot
├── assets/ (opcional)
│   ├── css/
│   ├── js/
│   └── images/
├── .htaccess                       # Protecciones de seguridad
└── ...otros archivos

# URLs de acceso local:
# http://localhost/Prueba/           → index.html (página principal)
# http://localhost/Prueba/api/chat-endpoint.php → API del chatbot
```

### 🌐 **PRODUCCIÓN EN HOSTINGER**
```
/home/tu_usuario/
├── public_html/                     # ← Directorio PÚBLICO (accesible vía web)
│   ├── index.html                   # ✅ PÁGINA PRINCIPAL (dominio.com)
│   ├── api/
│   │   └── chat-endpoint.php       # ✅ API (dominio.com/api/chat-endpoint.php)
│   ├── assets/ (si los tienes)
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   ├── .htaccess
│   └── ...otros archivos web
│
└── private_config/                  # 🔒 PRIVADO (NO accesible vía web)
    └── .env                        # Variables sensibles

# URLs de acceso en producción:
# https://tudominio.com/             → index.html
# https://tudominio.com/api/chat-endpoint.php → API
```

## 🎯 **OPCIÓN 1: INDEX EN LA RAÍZ (Recomendado)**

### **Hostinger - Estructura raíz:**
```
public_html/
├── index.html                      # ✅ Página principal del dominio
├── api/
│   └── chat-endpoint.php
├── .htaccess
└── ...

# Acceso: https://tudominio.com/ → Muestra directamente el chatbot
```

### **Comandos para subir a Hostinger:**
```bash
# Via cPanel File Manager o FTP:
# 1. Subir index.html directamente a public_html/
# 2. Subir carpeta api/ a public_html/api/
# 3. Subir .htaccess a public_html/
```

## 🎯 **OPCIÓN 2: INDEX EN SUBCARPETA**

### **Hostinger - Estructura con subcarpeta:**
```
public_html/
├── index.html                      # Página por defecto (opcional)
├── chatbot/                        # Subcarpeta del proyecto
│   ├── index.html                  # ✅ Tu chatbot
│   ├── api/
│   │   └── chat-endpoint.php
│   └── .htaccess
└── ...otros proyectos

# Acceso: https://tudominio.com/chatbot/ → Tu chatbot
```

## 🚀 **CONFIGURACIÓN ACTUAL DE TU PROJECT**

### **Tu `index.html` actual:**
- ✅ Página completa con chatbot integrado
- ✅ Interfaz de usuario estilo AstraLumina  
- ✅ Conectado al endpoint API
- ✅ Diseño responsive y moderno

### **Recomendación:**
**Poner el `index.html` directamente en la raíz de `public_html/` para que sea la página principal de tu dominio.**

## 📋 **PASOS ESPECÍFICOS PARA HOSTINGER**

### **Via cPanel File Manager:**

1. **Acceder a File Manager**
2. **Navegar a `public_html/`**
3. **Subir archivos:**
   ```
   Desde: C:\xampp\htdocs\Prueba\index.html
   Hasta: /home/tu_usuario/public_html/index.html
   
   Desde: C:\xampp\htdocs\Prueba\api\
   Hasta: /home/tu_usuario/public_html/api\
   
   Desde: C:\xampp\htdocs\Prueba\.htaccess
   Hasta: /home/tu_usuario/public_html\.htaccess
   ```

### **Via FTP/SFTP:**
```bash
# Conexión FTP a tu hosting
# Navegar a public_html/
# Subir: index.html, api/, .htaccess, otros archivos web
```

## 🔍 **VERIFICACIÓN POST-DESPLIEGUE**

### **URLs que deben funcionar:**
- ✅ `https://tudominio.com/` → Página principal (chatbot)
- ✅ `https://tudominio.com/api/chat-endpoint.php` → API (debe devolver error 405 - método no permitido)

### **URLs que NO deben ser accesibles:**
- ❌ `https://tudominio.com/.env` → 403 Forbidden
- ❌ `https://tudominio.com/composer.json` → 403 Forbidden

## 🎨 **ESTRUCTURA FINAL RECOMENDADA**

```
public_html/
├── index.html                      # 🏠 PÁGINA PRINCIPAL
├── api/
│   └── chat-endpoint.php          # 🔌 API REST
├── assets/ (opcional)
│   ├── style.css                   # CSS adicional
│   ├── script.js                   # JS adicional  
│   └── images/
│       └── logo.png               # Logo de AstraLumina
├── .htaccess                      # 🛡️ Seguridad
├── robots.txt                     # 🤖 SEO
└── favicon.ico                    # 🎨 Icono

# private_config/ (fuera de public_html)
└── .env                          # 🔒 Variables sensibles
```

**¿Quieres que prepare algún archivo adicional como robots.txt, favicon, o CSS separado para mejor organización?**
