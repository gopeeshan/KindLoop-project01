<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

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

    echo json_encode($response);
}
?>