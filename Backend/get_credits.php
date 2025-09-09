<?php

require_once 'Main/user.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$userID = isset($_GET['userID']) ? intval($_GET['userID']) : 0;

if (!$userID) {
    echo json_encode(["status" => "error", "message" => "User ID is required"]);
    exit;
}

$user = new User();
$response = $user->getCredits($userID);

echo json_encode($response);
?>
