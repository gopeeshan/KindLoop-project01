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
$status=$data['status'] ?? null;
$donorID = isset($data['DonorID']) ? (int) $data['DonorID'] : null;

if ($method === 'POST' && $action === 'request-item') {

    if ($handleDonation->checkrequest($donationID, $userID)) {
        echo json_encode(['success' => false, 'message' => 'You have already requested this donation.']);
        exit;
    } else {
        $handleDonation->requestItem($donationID, $userID);
        echo json_encode(['success' => true]);
        exit;
    }
}
else if ($method ==='POST' && $action === 'accept_or_reject' ){
    if($handleDonation->requestConfirmation($userID,$donationID,$status,$donorID)){
        echo json_encode(['success' => true]);
    }else{
        echo json_encode(['success' => false, 'message' => 'Failed to update request status']);
    }
}

else if (isset($_GET['userId']) && !empty($_GET['userId'])) {
    $userId = intval($_GET['userId']);

// ---------------- Fetch Donations ----------------
$donations = $handleDonation->getUserDonations($userId);

// ---------------- Fetch Received Items ----------------
$received = $handleDonation->fetchReceived($userId);

$user_credits=$handleDonation->getcredits($userId);

echo json_encode([
    "donations" => $donations,
    "received" => $received,
    "credits" => $user_credits
]);
}

else if ($method == 'GET' && isset($_GET['donationID'])) {
    $donationID = intval($_GET['donationID']);
    $requests = $handleDonation->requestingUser($donationID);
    echo json_encode(['success' => true, 'data' => $requests]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
}





