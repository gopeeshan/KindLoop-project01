<?php
session_start();
require_once 'Message.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:2025");
header("Access-Control-Allow-Credentials: true");

if (!isset($_SESSION['AdminID'])) {
    echo json_encode(["success" => false, "error" => "Unauthorized"]);
    exit;
}

$userA = isset($_GET['userA']) ? intval($_GET['userA']) : 0;
$userB = isset($_GET['userB']) ? intval($_GET['userB']) : 0;

$response = [];

if ($userA && $userB) {
    $msg = new Message();
    $conversation = $msg->getConversation($userA, $userB);
    $response = ["success" => true, "messages" => $conversation];
} else {
    $response = ["success" => false, "error" => "Missing user IDs"];
}

echo json_encode($response);
