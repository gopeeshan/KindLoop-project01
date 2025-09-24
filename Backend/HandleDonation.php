<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:2025");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT,OPTIONS");

require_once './Main/HandleDonation.php';
require_once './Main/profile.php';
require_once './Main/Complaint.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


$handleDonation = new HandleDonation();

$method = $_SERVER['REQUEST_METHOD'];

$data = json_decode(file_get_contents("php://input"), true);
$action = $data['Action'] ?? '';
$userID = $data['UserID'] ?? null;
$donationID = $data['DonationID'] ?? null;
$status = $data['status'] ?? null;
$donorID = isset($data['DonorID']) ? (int) $data['DonorID'] : null;
$quantity = isset($data['quantity']) ? (int) $data['quantity'] : 0;

// if( !isset($_SESSION['UserID']) ) {
//     echo json_encode([
//         'success' => false,
//         'message' => 'You need to login to perform this action.'
//     ]);
//     exit;
// }

if ($method === 'POST' && $action === 'request-item') {

 if (!$userID) {
        echo json_encode([
            'success' => false,
                'message' => 'You need to login to request an item.'
            ]);
            exit;
        }

    if ($userID !== $donorID) {
        $response = $handleDonation->requestItem($donationID, $userID);
        echo json_encode($response);
        exit;
    } else {
        echo json_encode(['success' => false, 'message' => 'You cannot request your own donation.']);
        exit;
    }

    
} else if ($method === 'POST' && $action === 'accept_or_reject') {
    if ($status === 'selected') {
        if ($handleDonation->requestConfirmation($userID, $donationID, $status, $donorID, $quantity)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update request status']);
        }
    } else if ($status === 'rejected') {
        if ($handleDonation->requestConfirmation($userID, $donationID, $status, $donorID, $quantity)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update request status']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid status or quantity']);

    }
} else if (isset($_GET['userId']) && !empty($_GET['userId'])) {
    $userId = intval($_GET['userId']);

    // ---------------- Fetch Donations ----------------
    $donations = $handleDonation->getUserDonations($userId);

    // ---------------- Fetch Received Items ----------------
    $received = $handleDonation->getReceivedHistory($userId);

    $user_credits = $handleDonation->getcredits($userId);

    echo json_encode([
        "donations" => $donations,
        "received" => $received,
        "credits" => $user_credits
    ]);
    
} else if ($method == 'GET' && isset($_GET['donationID'])) {
    $action = $_GET['Action'] ?? '';
    $donationID = intval($_GET['donationID']);

    if ($action === 'get_requests') {
        $requests = $handleDonation->requestingUser($donationID);

        $complaintObj = new Complaint();
        foreach ($requests as &$user) {
            $user['complaintCount'] = $complaintObj->getComplaints($user['userID'], $donationID)['count'] ?? 0;
        }

        echo json_encode(['success' => true, 'data' => $requests]);
        exit;

    } else if ($action === 'get_donation_quantity') {
        $quantityData = $handleDonation->getDonationQuantity($donationID);
        echo json_encode(['success' => true, 'data' => $quantityData]);
        exit;

    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
        exit;
    }
}

