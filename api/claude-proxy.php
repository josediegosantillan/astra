<?php
// api/claude-proxy.php
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

// Cargar variables de entorno si existe .env
if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && !str_starts_with(trim($line), '#')) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

// Obtener API key de Claude
$apiKey = $_ENV['CLAUDE_API_KEY'] ?? '';
if (empty($apiKey)) {
    echo json_encode(['error' => 'API Key de Claude no configurada']);
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

// Preparar mensajes para Claude
$messages = [];

// Agregar contexto del sistema
if (!empty($context)) {
    $messages[] = [
        'role' => 'user',
        'content' => $context
    ];
    $messages[] = [
        'role' => 'assistant',
        'content' => 'Entendido. Soy el asistente virtual de AstraLumina y responderé según el contexto proporcionado.'
    ];
}

// Agregar historial previo
foreach ($history as $msg) {
    $messages[] = [
        'role' => $msg['role'] === 'user' ? 'user' : 'assistant',
        'content' => $msg['content']
    ];
}

// Agregar mensaje actual
$messages[] = [
    'role' => 'user',
    'content' => $message
];

// Preparar payload para Claude API
$payload = [
    'model' => 'claude-3-sonnet-20240229',
    'max_tokens' => 1000,
    'messages' => $messages
];

// Realizar petición a Claude API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://api.anthropic.com/v1/messages');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-api-key: ' . $apiKey,
    'anthropic-version: 2023-06-01'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo json_encode(['error' => 'Error de conexión: ' . $error]);
    exit;
}

if ($httpCode !== 200) {
    echo json_encode(['error' => 'Error de la API de Claude. Código: ' . $httpCode]);
    exit;
}

$data = json_decode($response, true);

if (isset($data['content'][0]['text'])) {
    echo json_encode([
        'success' => true,
        'response' => $data['content'][0]['text']
    ]);
} else {
    echo json_encode(['error' => 'Respuesta inválida de la API']);
}
?>
