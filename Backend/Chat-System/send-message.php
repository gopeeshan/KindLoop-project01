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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $chat = new ChatSystem();
    $result = $chat->sendMessage(
        $data['senderID'],
        $data['receiverID'],
        $data['message'],
        $data['donationID'] ?? null
    );

    if ($result) {
        echo json_encode(["success" => true, "message" => "Message sent"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to send message"]);
    }
}
