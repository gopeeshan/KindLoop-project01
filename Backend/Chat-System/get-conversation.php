<?php
session_start();

require_once '../Main/dbc.php';
require_once '../Main/ChatSystem.php';

header("Content-Type: application/json");

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
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user1 = $_GET['user1'] ?? null;
    $user2 = $_GET['user2'] ?? null;
    $donationID = $_GET['donationID'] ?? null;

    if (!$user1 || !$user2) {
        echo json_encode(["success" => false, "message" => "Missing user IDs"]);
        exit;
    }

    $chat = new ChatSystem();
    // Existing ChatSystem::getConversation likely ignores donationID; leaving call as-is to avoid breaking
    $messages = $chat->getConversation($user1, $user2);

    echo json_encode([
        "success" => true,
        "messages" => $messages,
        "donationID" => $donationID
    ]);
    exit;
}

echo json_encode(["success" => false, "message" => "Method not allowed"]);