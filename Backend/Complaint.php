<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:2025");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");


header('Content-Type: application/json');

require_once 'Main/Complaint.php';

$complaintObj = new Complaint();
$method = $_SERVER['REQUEST_METHOD'];



if ($method === 'POST') {

    if (!isset($_SESSION['userID'])) {
        echo json_encode(["success" => false, "message" => "Unauthorized"]);
        exit;
    }
    $action = $_POST['action'] ?? '';
    $donationID  = $_POST['DonationID'] ?? null;
    $complainantID = $_SESSION['userID'];
    $reason = $_POST['reason'] ?? "General Complaint";
    $description = $_POST['description'] ?? "";
    $files       = $_FILES;

    if (empty($description) || empty($files)) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }
    $result = $complaintObj->submitComplaint($donationID, $complainantID, $reason, $description, $files);
    echo json_encode($result);

    if ($action === 'submit_complaint') {
        $donationID  = $_POST['DonationID'] ?? null;
        $reason      = $_POST['reason'] ?? '';
        $userID      = $_POST['userID'] ?? null;
        $description = $_POST['description'] ?? '';
        
        if (!$donationID || !$reason || !$description || !$userID) {
            echo json_encode(["status" => "error", "message" => "Missing required fields."]);
            exit;
        }

        $result = $complaintObj->submitComplaint($donationID, $userID, $reason, $description, $files);
        echo json_encode($result);
        exit;
    }
}


if ($method === 'GET' && isset($_GET['all'])) {
    echo json_encode($complaintObj->getAllComplaints());
    exit;
}

// echo json_encode(["status" => "error", "message" => "Invalid request."]);

// $result = $conn->query("SELECT * FROM user WHERE userID = $userID");
// if ($result->num_rows === 0) {
//     echo json_encode(["status" => "error", "message" => "Invalid userID"]);
//     exit;
// }
