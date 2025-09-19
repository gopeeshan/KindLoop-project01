<?php
session_start();

require_once '../Main/dbc.php';
require_once '../Main/ChatSystem.php';

header("Content-Type: application/json; charset=utf-8");

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
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user1 = isset($_GET['user1']) ? (int)$_GET['user1'] : null;
    $user2 = isset($_GET['user2']) ? (int)$_GET['user2'] : null;

    if (!$user1 || !$user2) {
        echo json_encode(["success" => false, "message" => "Missing user IDs"]);
        exit;
    }

    $chat = new ChatSystem();
    $messages = $chat->getConversation($user1, $user2);

    echo json_encode([
        "success" => true,
        "messages" => $messages
    ]);
    exit;
}

echo json_encode(["success" => false, "message" => "Method not allowed"]);