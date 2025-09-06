<?php
session_start(); // important for reading stored OTP

$frontendOrigin = 'http://localhost:2025'; // your React dev server
header("Access-Control-Allow-Origin: $frontendOrigin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
require_once '../Main/dbc.php';
require_once '../Main/ChatSystem.php';

header("Content-Type: application/json");

$userID = $_GET['userID'] ?? null;

if (!$userID) {
    echo json_encode([
        "success" => false,
        "message" => "Missing userID"
    ]);
    exit;
}

$chat = new ChatSystem();
$conversations = $chat->getLatestChats($userID);

echo json_encode([
    "success" => true,
    "conversations" => $conversations
]);
