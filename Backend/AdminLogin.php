<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:2025");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Credentials: true");

require_once 'Main/Admin.php'; 

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


$loginAdmin = new Admin();

$data = json_decode(file_get_contents("php://input"), true);

$email    = isset($data["email"]) ? trim($data["email"]) : null;
$password = $data["password"] ?? null;

if (empty($email) || empty($password)) {
    echo json_encode([
        "status" => "error",
        "message" => "Email and password are required"
    ]);
    exit;
}

$response = $loginAdmin->login($email, $password);

if (is_array($response) && isset($response['status'])) {
    if ($response['status'] === 'success' && isset($response['admin'])) {
        $_SESSION['AdminID'] = $response['admin']['AdminID'];
        $_SESSION['email'] = $response['admin']['email'];
        $_SESSION['role'] = $response['admin']['role'];
    }
    echo json_encode($response);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Login failed. Please try again."
    ]);
}
?>
