<?php

session_start();
header("Access-Control-Allow-Origin: http://localhost:2025");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
header("Access-Control-Allow-Credentials: true");

require_once 'Main/user.php';


$data = json_decode(file_get_contents("php://input"), true);

$requiredFields = ['fullName', 'email', 'nic', 'contactNumber', 'occupation', 'address', 'district', 'password'];
foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        echo json_encode(["status" => "error", "message" => "Please fill all required fields."]);
        exit;
    }
}
$fullName = $data['fullName'];
$email = $data['email'];
$nic = $data['nic'];
$contactNumber = $data['contactNumber'];
$occupation = $data['occupation'];
$address = $data['address'];
$district = $data['district'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);
$role = 'user';

// Check if email or NIC already exists
$user = new User();
$checkResult = $user->checkcredentials($email, $nic);
if ($checkResult) {
    echo json_encode($checkResult);
    exit;
}

// Insert into database
$signupResult = $user->signup($fullName, $email, $nic, $contactNumber, $occupation, $address, $district, $password, $role);
if ($signupResult['status'] === 'success') {
    $userId = $user->checkEmail($email); 
    if ($userId) {
        $_SESSION['userID'] = $userId;
        $_SESSION['email'] = $email;
    }
    echo json_encode($signupResult);
} else {
    echo json_encode(["status" => "error", "message" => "Signup failed. Please try again."]);
}
?>
