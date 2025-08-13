<?php
session_start(); // important for reading stored OTP

$frontendOrigin = 'http://localhost:2025'; // your React dev server
header("Access-Control-Allow-Origin: $frontendOrigin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$email = isset($data['email']) ? $data['email'] : null;
$userOtp = isset($data['otp']) ? $data['otp'] : null;

if (!$email || !$userOtp) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Email and OTP are required."]);
    exit();
}

if (!isset($_SESSION['otps'][$email])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "No OTP found for this email."]);
    exit();
}

$storedOtpData = $_SESSION['otps'][$email];
$storedOtp = $storedOtpData['otp'];
$timestamp = $storedOtpData['timestamp'];

// expire OTP after 5 minutes
if (time() - $timestamp > 300) {
    unset($_SESSION['otps'][$email]);
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "OTP expired."]);
    exit();
}

if ($userOtp == $storedOtp) {
    unset($_SESSION['otps'][$email]); // OTP is single-use
    http_response_code(200);
    echo json_encode(["success" => true, "message" => "OTP verified successfully."]);
} else {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid OTP."]);
}
