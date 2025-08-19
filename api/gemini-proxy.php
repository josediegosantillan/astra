<?php
// api/gemini-proxy.php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Solo acepta POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

$envFile = realpath(__DIR__ . '/../../Prueba_private/.env');

// Cargar variables de entorno desde ubicación segura (htdocs\Prueba_private\.env)
error_log('Intentando cargar archivo .env...');
$envFile = realpath(__DIR__ . '/../../Prueba_private/.env');
if ($envFile && file_exists($envFile)) {
    error_log('Archivo .env encontrado, procesando...');
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) {
            continue;
        }
        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        if ((str_starts_with($value, '"') && str_ends_with($value, '"')) ||
            (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
            $value = substr($value, 1, -1);
        }
        $_ENV[$key] = $value;
        putenv("$key=$value");
    }
    error_log('Archivo .env cargado correctamente y variables de entorno establecidas.');
} else {
    error_log('ERROR: Archivo .env no encontrado en la ruta esperada: ' . __DIR__ . '/../../Prueba_private/.env');
    http_response_code(500);
    echo json_encode(['error' => 'Configuración del servidor no disponible']);
    exit;
}

// Leer datos de entrada
$input = json_decode(file_get_contents('php://input'), true);
$message = isset($input['message']) ? $input['message'] : '';
$context = isset($input['context']) ? $input['context'] : '';
$history = isset($input['history']) ? $input['history'] : [];

if (empty($message)) {
    echo json_encode(['error' => 'Mensaje vacío']);
    exit;
}

// Obtener API key de Gemini desde .env
$apiKey = $_ENV['GEMINI_API_KEY'] ?? null;

if (empty($apiKey)) {
    error_log('GEMINI_API_KEY no configurada en el archivo .env');
    error_log('Variables disponibles en $_ENV: ' . print_r(array_keys($_ENV), true));
    http_response_code(500);
    echo json_encode(['error' => 'Servidor no configurado correctamente']);
    exit;
}

// No loggear información sensible de la API key
error_log('API Key cargada correctamente');
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$apiKey";

// Construir prompt completo
$fullPrompt = $context . "\n\n";

// Agregar historial
foreach ($history as $msg) {
    $role = $msg['role'] === 'user' ? 'Usuario' : 'Asistente';
    $fullPrompt .= "$role: " . $msg['content'] . "\n";
}

$fullPrompt .= "Usuario: " . $message . "\nAsistente:";

$body = json_encode([
    'contents' => [[ 'parts' => [[ 'text' => $fullPrompt ]] ]],
    'generationConfig' => [
        'temperature' => 0.8,
        'topK' => 40,
        'topP' => 0.95,
        'maxOutputTokens' => 1000
    ]
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo json_encode(['error' => 'Error de conexión: ' . $error]);
    exit;
}

if ($httpcode !== 200) {
    echo json_encode(['error' => 'Error de la API de Gemini. Código: ' . $httpcode]);
    exit;
}

$responseData = json_decode($response, true);
error_log('Respuesta de la API de Gemini: ' . print_r($responseData, true));

if (isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
    echo json_encode([
        'success' => true,
        'response' => $responseData['candidates'][0]['content']['parts'][0]['text']
    ]);
} else {
    echo json_encode(['error' => 'Respuesta inválida de la API']);
}
