<?php
session_start();

$frontendOrigin = 'http://localhost:2025';
header("Access-Control-Allow-Origin: $frontendOrigin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require_once '../Main/dbc.php';
require_once '../Main/ChatSystem.php';

header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user1 = $_GET['user1'] ?? null;
    $user2 = $_GET['user2'] ?? null;
    $donationID = $_GET['donationID'] ?? null;

    if (!$user1 || !$user2) {
        echo json_encode(["success" => false, "message" => "Missing user IDs"]);
        exit;
    }

    $chat = new ChatSystem();
    $messages = $chat->getConversation($user1, $user2);

    echo json_encode([
        "success" => true,
        "messages" => $messages,
        "donationID" => $donationID
    ]);
}
?>