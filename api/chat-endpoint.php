<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../vendor/autoload.php';

// Detectar automáticamente la ubicación del .env (desarrollo vs producción)
$envPaths = [
    __DIR__ . '/../../Prueba_private',                    // Desarrollo local (XAMPP)
    '/home/' . (isset($_SERVER['USER']) ? $_SERVER['USER'] : 'usuario') . '/private_config',  // Hostinger
    __DIR__ . '/../..'                                    // Fallback legacy
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['contents'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos inválidos']);
    exit;
}

// Verificar que la API key existe y no está vacía
$apiKey = $_ENV['API_KEY'] ?? null;
if (empty($apiKey)) {
    http_response_code(500);
    echo json_encode([
        'error' => 'API Key no configurada',
        'debug' => [
            'env_loaded' => isset($_ENV['API_KEY']),
            'env_file_exists' => file_exists(__DIR__ . '/../.env'),
            'env_readable' => is_readable(__DIR__ . '/../.env')
        ]
    ]);
    exit;
}

$apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $apiKey;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($input));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_error($ch)) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión: ' . curl_error($ch)]);
    curl_close($ch);
    exit;
}

curl_close($ch);

// Agregar logging para debugging
if ($httpCode !== 200) {
    error_log("API Error - HTTP Code: $httpCode, Response: $response");
}

http_response_code($httpCode);
echo $response;
?>