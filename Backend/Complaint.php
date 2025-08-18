<?php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json');

require_once 'Main/complaint.php';

$complaintObj = new Complaint();
$method = $_SERVER['REQUEST_METHOD'];


if ($method === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'submit_complaint') {
        $donationID  = $_POST['DonationID'] ?? null;
        $reason      = $_POST['reason'] ?? '';
        $userID      = $_POST['userID'] ?? null; 
        $description = $_POST['description'] ?? '';
        $files       = $_FILES; 

       

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

echo json_encode(["status" => "error", "message" => "Invalid request."]);

$result = $conn->query("SELECT * FROM user WHERE userID = $userID");
if ($result->num_rows === 0) {
    echo json_encode(["status"=>"error","message"=>"Invalid userID"]);
    exit;
}
?>
