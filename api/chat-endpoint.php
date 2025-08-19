<?php
header('Content-Type: application/json');

// --- CORS y orígenes permitidos (reemplazar con tu(s) dominio(s) de producción) ---
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'http://localhost',
    'http://localhost:8000',
    'https://tu-dominio.com' // <-- REEMPLAZAR por tu dominio real
];

if (in_array($origin, $allowed_origins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    // Si hay Origin pero no está en la whitelist, rechazar para evitar uso desde orígenes no autorizados
    if (!empty($origin)) {
        http_response_code(403);
        echo json_encode(['error' => 'Origen no permitido']);
        exit;
    }
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Responder preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../vendor/autoload.php';

// --- Cargar .env preferiblemente fuera del public webroot ---
$envPaths = [
    // ubicaciones comunes seguras (fuera de htdocs)
    __DIR__ . '/../../.env',                           // un nivel por encima de htdocs
    __DIR__ . '/../../Prueba_private',                 // Desarrollo local (si aplica)
    '/home/' . (isset($_SERVER['USER']) ? $_SERVER['USER'] : 'usuario') . '/private_config',
    __DIR__ . '/../..'                                 // Fallback legacy (no recomendado)
];

$dotenv = null;
foreach ($envPaths as $path) {
    if (file_exists($path . '/.env')) {
        $dotenv = Dotenv\Dotenv::createImmutable($path);
        error_log("Cargando .env desde: $path");
        break;
    }
}

if ($dotenv) {
    $dotenv->load();
} else {
    error_log('ADVERTENCIA: No se encontró archivo .env en ninguna ruta esperada');
}

// --- Validaciones básicas de request ---
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Limitar tamaño de request (ej: 100 KB)
$contentLength = isset($_SERVER['CONTENT_LENGTH']) ? (int) $_SERVER['CONTENT_LENGTH'] : 0;
if ($contentLength > 100 * 1024) {
    http_response_code(413);
    echo json_encode(['error' => 'Request demasiado grande']);
    exit;
}

$raw = file_get_contents('php://input');
if (strlen($raw) > 200 * 1024) { // protección adicional
    http_response_code(413);
    echo json_encode(['error' => 'Request demasiado grande']);
    exit;
}

$input = json_decode($raw, true);
if (json_last_error() !== JSON_ERROR_NONE || !isset($input['contents'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos inválidos']);
    exit;
}

// --- Rate limiting simple por IP (p. ej. 10 requests/min) ---
function check_rate_limit(string $ip, int $limit = 10, int $windowSec = 60): bool
{
    $dir = sys_get_temp_dir() . '/astralumina_rate';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    $file = $dir . '/' . md5($ip) . '.json';
    $data = [];
    $now = time();

    $fh = @fopen($file, 'c+');
    if ($fh === false) {
        // Si no puede crear archivo, fallar cerrado (no permitir)
        error_log("RateLimit: no se puede abrir archivo $file");
        return false;
    }
    flock($fh, LOCK_EX);
    $contents = stream_get_contents($fh);
    if ($contents) {
        $data = json_decode($contents, true) ?: [];
    }
    // limpiar timestamps fuera de ventana
    $data = array_filter($data, function ($ts) use ($now, $windowSec) {
        return ($ts >= $now - $windowSec);
    });
    if (count($data) >= $limit) {
        // demasiadas peticiones
        ftruncate($fh, 0);
        rewind($fh);
        fwrite($fh, json_encode($data));
        fflush($fh);
        flock($fh, LOCK_UN);
        fclose($fh);
        return false;
    }
    $data[] = $now;
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($data));
    fflush($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
    return true;
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
if (!check_rate_limit($ip)) {
    http_response_code(429);
    echo json_encode(['error' => 'Demasiadas peticiones']);
    exit;
}

// --- API Key (leer desde .env fuera del webroot) ---
$apiKey = $_ENV['API_KEY'] ?? null;
if (empty($apiKey)) {
    error_log('API Key no configurada en el servidor');
    http_response_code(500);
    echo json_encode(['error' => 'Servidor no configurado correctamente']);
    exit;
}

// Construir URL sin exponer la API key en la query string (usar header)
$apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($input));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-goog-api-key: ' . $apiKey
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
$curlErr = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($curlErr) {
    error_log('Curl error: ' . $curlErr);
    http_response_code(502);
    echo json_encode(['error' => 'Error de conexión con el servicio externo']);
    exit;
}

if ($httpCode >= 400) {
    error_log("API externa HTTP $httpCode - Response: $response");
    http_response_code($httpCode);
    // No exponer detalles internos al cliente
    echo json_encode(['error' => 'Error en el servicio externo']);
    exit;
}

// Responder al cliente con el body de la API (éxito)
http_response_code(200);
echo $response;
?>