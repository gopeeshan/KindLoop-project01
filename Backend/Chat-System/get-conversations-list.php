<?php
session_start();

require_once '../Main/dbc.php';
require_once '../Main/ChatSystem.php';

header("Content-Type: application/json; charset=utf-8");

// CORS: allow common local dev origins and handle preflight
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
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$userID = $_GET['userID'] ?? null;

if (!$userID) {
    echo json_encode([
        "success" => false,
        "message" => "Missing userID"
    ]);
    exit;
}

$chat = new ChatSystem();
$conversations = $chat->getLatestChats((int)$userID);

echo json_encode([
    "success" => true,
    "conversations" => $conversations
]);