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
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

$body = json_decode(file_get_contents("php://input"), true) ?? [];

// Accept either {receiverID, senderID} or {viewerID, peerID}
$receiverID = isset($body['receiverID']) ? (int)$body['receiverID'] : (isset($body['viewerID']) ? (int)$body['viewerID'] : null);
$senderID   = isset($body['senderID']) ? (int)$body['senderID']   : (isset($body['peerID']) ? (int)$body['peerID'] : null);

if (!$receiverID || !$senderID) {
    echo json_encode(["success" => false, "message" => "Missing receiverID or senderID"]);
    exit;
}

$chat = new ChatSystem();
$updated = $chat->markAsRead($receiverID, $senderID);

echo json_encode([
    "success" => true,
    "updated" => $updated
]);