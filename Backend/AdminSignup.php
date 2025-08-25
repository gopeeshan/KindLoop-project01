<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

require_once 'Main/Admin.php';


$data = json_decode(file_get_contents("php://input"), true);

$requiredFields = ['fullName', 'email', 'nic', 'contactNumber', 'address', 'password'];

foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        echo json_encode(["status" => "error", "message" => "Please fill all required fields."]);
        exit;
    }
}

$fullName = trim($data['fullName']);
$email = trim($data['email']);
$nic = trim($data['nic']);
$contactNumber = trim($data['contactNumber']);
$address = trim($data['address']);
$password = $data['password'];

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid email format."
    ]);
    exit;
}


$admin = new Admin();

$checkResult = $admin->checkcredentials($email, $nic);

if ($checkResult && isset($checkResult['status']) && $checkResult['status'] === 'error') {
    echo json_encode($checkResult);
    exit;
}

$signupResult = $admin->signup($fullName, $email, $nic, $contactNumber, $address, $password);

if (is_array($signupResult) && isset($signupResult['status'])) {
    echo json_encode($signupResult);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Signup failed. Please try again."
    ]);
}
?>