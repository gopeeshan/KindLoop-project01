
<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:2025");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

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

$signupResult = $admin->admin_signup($fullName, $email, $nic, $contactNumber, $address, $password);

if (is_array($signupResult) && isset($signupResult['status']) && $signupResult['status'] === 'success') {
    $_SESSION['AdminID'] = $signupResult['admin']['AdminID'] ?? null;
    $_SESSION['email']   = $signupResult['admin']['email'] ?? $email;
    $_SESSION['role']    = $signupResult['admin']['role'] ?? 'admin';
    $_SESSION['LAST_ACTIVITY'] = time();
    echo json_encode($signupResult);
} else if (is_array($signupResult) && isset($signupResult['status'])) {
    echo json_encode($signupResult);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Signup failed. Please try again."
    ]);
}
?>