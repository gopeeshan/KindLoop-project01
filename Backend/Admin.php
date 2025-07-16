<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type");


$conn = new mysqli("localhost", "root", "", "kindloop");

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error]));
}
$sql_01 = "SELECT userID,fullName,email,occupation,district,credit_points,active_state FROM user";
$userResult = $conn->query($sql_01);

$users = [];
if ($userResult->num_rows > 0) {
    while ($row = $userResult->fetch_assoc()) {
        $users[] = $row;
    }
}
$sql_02 = "SELECT DonationID,title,userID,category,date_time,isVerified,isDonationCompleted  FROM donation";
$donationResult = $conn->query($sql_02);

$donations = [];
if ($donationResult->num_rows > 0) {
    while ($row = $donationResult->fetch_assoc()) {
        $donations[] = $row;
    }
}

$pendingVerifications = [];
$verificationResult = $conn->query("SELECT DonationID,title,userID,category,`condition`,images,date_time,isVerified,approvedBy FROM donation WHERE isVerified = 0");
if ($verificationResult->num_rows > 0) {
    while ($row = $verificationResult->fetch_assoc()) {
        $row['images'] = json_decode($row['images'] ?? '[]', true);
        if (!is_array($row['images'])) {
            $row['images'] = [];
        }
        $pendingVerifications[] = $row;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $action = $input['action'] ?? '';
    $DonationID = $input['DonationID'] ?? null;
    $isVerified = $input['isVerified'] ?? null;
    $adminEmail = $input['adminEmail'] ?? 'unknown';

    if ($action === 'verify_donation' && $DonationID !== null && $isVerified !== null) {
        if ($isVerified == 1) {
        
            $stmt = $conn->prepare("UPDATE donation SET isVerified = 1, approvedBy = ? WHERE DonationID = ?");
            $stmt->bind_param("si", $adminEmail, $DonationID);
            $stmt->execute();
            echo json_encode(["status" => "success", "message" => "Donation approved"]);
            exit;
        } else {
            
            $deleteStmt = $conn->prepare("DELETE FROM donation WHERE DonationID = ?");
            $deleteStmt->bind_param("i", $DonationID);
            $deleteStmt->execute();

            $deletedAt = date("Y-m-d H:i:s");
            $logStmt = $conn->prepare("INSERT INTO DeletedItems (DonationID, deletedBy, deleted_at) VALUES (?, ?, ?)");
            $logStmt->bind_param("iss", $DonationID, $adminEmail, $deletedAt);
            $logStmt->execute();

            echo json_encode(["status" => "success", "message" => "Donation rejected and logged"]);
            exit;
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid request"]);
        exit;
    }
}


echo json_encode([
    "status" => "success",
    "users" => $users,
    "donations" => $donations,
    "pendingVerifications" => $pendingVerifications
]);

$conn->close();
