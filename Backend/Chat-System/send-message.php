<?php
session_start();

require_once '../Main/dbc.php';
require_once '../Main/ChatSystem.php';

header("Content-Type: application/json");

// Show detailed errors in dev
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function getInput(): array {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
    $contentType = strtolower(trim(explode(';', $contentType)[0] ?? ''));
    if ($contentType === 'application/json') {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw, true);
        return (json_last_error() === JSON_ERROR_NONE && is_array($data)) ? $data : [];
    }
    if (!empty($_POST)) return $_POST;
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return (json_last_error() === JSON_ERROR_NONE && is_array($data)) ? $data : [];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = getInput();

    $senderID   = isset($data['senderID']) ? (int)$data['senderID'] : null;
    $receiverID = isset($data['receiverID']) ? (int)$data['receiverID'] : null;
    $donationID = isset($data['donationID']) && $data['donationID'] !== '' ? (int)$data['donationID'] : null;
    $message    = isset($data['message']) ? trim((string)$data['message']) : '';

    if (!$senderID || !$receiverID) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing senderID or receiverID"]);
        exit;
    }
    if ($message === '') {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Message cannot be empty"]);
        exit;
    }

    // Do not allow sending messages to self
    if ($senderID === $receiverID) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "You cannot message yourself."]);
        exit;
    }

    $chat = new ChatSystem();
    $ok = $chat->sendMessage($senderID, $receiverID, $message, $donationID);

    if ($ok) {
        echo json_encode(["success" => true, "message" => "Message sent"]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to send message",
            "error"   => $chat->getLastError(),
        ]);
    }
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);