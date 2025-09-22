<?php
session_start(); // important for saving OTP

$frontendOrigin = 'http://localhost:2025'; // your React dev server
header("Access-Control-Allow-Origin: $frontendOrigin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'Main/Mailer.php';
require_once 'Main/user.php';

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$email = isset($data['email']) ? $data['email'] : null;

if (!$email) {
    http_response_code(400);
    echo json_encode(["message" => "Email is required"]);
    exit();
}

$userChecker = new user();
$result = $userChecker->checkEmail($email);

if ($result['status'] === 'error') {
    http_response_code(400);
    echo json_encode($result);
    exit();
}

// Proceed with OTP logic...


$otp = rand(100000, 999999);

// store OTP in session
if (!isset($_SESSION['otps'])) {
    $_SESSION['otps'] = [];
}
$_SESSION['otps'][$email] = [
    'otp' => $otp,
    'timestamp' => time(),
];

$mailer = new Mailer();
$msg = '    Dear User,<br>
        Your verification code for signing up to <b>KindLoop</b> is:<br>
        <div style="font-size:20px; font-weight:bold; color:#2c3e50;
         background:#f4f4f4; padding:10px 15px; 
         display:inline-block; border-radius:6px; 
         border:1px solid #ddd; margin:10px 0;">
        ' . $otp . '
        </div><br>
        This OTP is valid for 5 minutes.<br>
        If you did not request this code, please ignore this email.<br><br>
        Best regards,<br>
        The KindLoop Team<br><br>';
$mailer->setInfo($email, 'OTP Verification', $msg);

if ($mailer->send()) {
    http_response_code(200);
    echo json_encode(["success" => true, "message" => "OTP sent to your email."]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error while sending OTP to your email."]);
}
