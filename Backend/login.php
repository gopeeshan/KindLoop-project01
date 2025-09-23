<?php

session_start();
header("Access-Control-Allow-Origin: http://localhost:2025");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Credentials: true");

require_once 'Main/user.php';

$loginUser = new User();

$data = json_decode(file_get_contents("php://input"), true);
$email = $data["email"] ?? null;
$password = $data["password"] ?? null;

if (!$email || !$password) {
    echo json_encode(["status" => "error", "message" => "Email and password are required"]);
    exit();
}
else{
    $response = $loginUser->login($email, $password);
    if ($response['status'] === 'success' && isset($response['user'])) {
        $_SESSION['userID'] = $response['user']['id'];
        $_SESSION['email'] = $response['user']['email'];
        $_SESSION['donorID'] = $response['user']['id'];
    }
    echo json_encode($response);
}
?>