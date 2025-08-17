<?php
// api/gemini-proxy.php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Solo acepta POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Lee el prompt del body
$input = json_decode(file_get_contents('php://input'), true);
$prompt = isset($input['prompt']) ? $input['prompt'] : '';
if (!$prompt) {
    http_response_code(400);
    echo json_encode(['error' => 'Falta el prompt']);
    exit;
}

// Tu API Key de Gemini (mejor usar variable de entorno en producción)
$apiKey = 'AIzaSyDAyKkByyQ7-P8XsujybYk3rfzN9yJR7-U';
$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$apiKey";

$body = json_encode([
    'contents' => [[ 'parts' => [[ 'text' => $prompt ]] ]],
    'generationConfig' => [
        'temperature' => 0.8,
        'topK' => 40,
        'topP' => 0.95,
        'maxOutputTokens' => 6144 // Aumentado de 2048 a 6144
    ]
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($httpcode !== 200) {
    http_response_code($httpcode);
    echo json_encode(['error' => 'Error en la API Gemini', 'detalle' => $response, 'curl_error' => $error]);
    exit;
}

// Decodifica la respuesta para verificar su estructura
$responseData = json_decode($response, true);

// Si hay error en la decodificación JSON o estructura inesperada, devolver info de debug
if (!$responseData) {
    echo json_encode(['error' => 'Respuesta JSON inválida de Gemini', 'raw_response' => substr($response, 0, 500)]);
    exit;
}

// Si no hay candidates, devolver la estructura completa para debug
if (!isset($responseData['candidates']) || empty($responseData['candidates'])) {
    echo json_encode(['error' => 'No hay candidates en la respuesta', 'gemini_response' => $responseData]);
    exit;
}

echo $response;
