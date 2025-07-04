<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$conn = new mysqli("localhost","root","","kindloop");

if($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error]));
}
$sql_01="SELECT fullName,email,occupation,district,credit_points FROM user";
$userResult=$conn->query($sql_01);

$users=[];
if($userResult->num_rows > 0) {
    while($row = $userResult->fetch_assoc()) {
        $users[] = $row;
    }
}
$sql_02="SELECT title,userID,category,date_time,isDonationCompleted  FROM donation";
$donationResult = $conn->query($sql_02);

$donations = [];
if ($donationResult->num_rows > 0) {
    while ($row = $donationResult->fetch_assoc()) {
        $donations[] = $row;
    }
}

$pendingVerifications = [];
$verificationResult = $conn->query("SELECT title,userID,category,`condition`,images FROM donation WHERE isVerified = 0");
if ($verificationResult->num_rows > 0) {
    while ($row = $verificationResult->fetch_assoc()) {
        $pendingVerifications[] = $row;
    }
}

echo json_encode([
    "status" => "success",
    "user" => $users,
    "donation" => $donations,
    "pendingVerification" => $pendingVerifications
]);

$conn->close();