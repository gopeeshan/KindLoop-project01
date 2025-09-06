<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
require_once './Main/HandleDonation.php';
require_once './Main/profile.php';

$handleDonation = new HandleDonation();

$method = $_SERVER['REQUEST_METHOD'];

$data = json_decode(file_get_contents("php://input"), true);
$action = $data['Action'] ?? '';
$userID = $data['UserID'] ?? null;
$donationID = $data['DonationID'] ?? null;
$status = $data['status'] ?? null;
$donorID = isset($data['DonorID']) ? (int) $data['DonorID'] : null;
$quantity = isset($data['quantity']) ? (int) $data['quantity'] : 0;

if ($method === 'POST' && $action === 'request-item') {
    if ($userID !== $donorID) {
        if ($handleDonation->checkrequest($donationID, $userID)) {
            echo json_encode(['success' => false, 'message' => 'You have already requested this donation.']);
            exit;
        } else {
            $handleDonation->requestItem($donationID, $userID);
            echo json_encode(['success' => true]);
            exit;
        }
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
        echo json_encode(['success' => true, 'data' => $requests]);

    } else if ($action === 'get_donation_quantity') {
        $quantity = $handleDonation->getDonationQuantity($donationID);
        echo json_encode(['success' => true, 'data' => $quantity]);

    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid action in get'
    ]);
    }
} else {
    
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
}
