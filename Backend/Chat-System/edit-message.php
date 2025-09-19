<?php
session_start();

require_once '../Main/dbc.php';
require_once '../Main/ChatSystem.php';

header("Content-Type: application/json");

// CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://localhost:2025',
];
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true");
}
header("Vary: Origin");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$messageID = isset($body['messageID']) ? (int)$body['messageID'] : 0;
$userID    = isset($body['userID']) ? (int)$body['userID'] : 0;
$newText   = isset($body['message']) ? trim((string)$body['message']) : '';

if (!$messageID || !$userID) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Missing messageID or userID"]);
    exit;
}

if ($newText === '') {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Message cannot be empty"]);
    exit;
}

$chat = new ChatSystem();
$ok = $chat->editMessage($messageID, $userID, $newText);

if ($ok) {
    echo json_encode(["success" => true, "message" => "Message updated"]);
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Failed to update message", "error" => $chat->getLastError()]);
}