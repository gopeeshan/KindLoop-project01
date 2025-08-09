<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type");
require_once './Main/HandleDonation.php';

$handleDonation = new HandleDonation();

$method = $_SERVER['REQUEST_METHOD'];

$data = json_decode(file_get_contents("php://input"), true);
$action = $data['Action'] ?? '';
$userID = $data['UserID'] ?? null;
$donationID = $data['DonationID'] ?? null;

if ($method === 'POST' && $data['Action'] === 'request-item') {

    if ($handleDonation->checkrequest($donationID, $userID)) {
        echo json_encode(['success' => false, 'message' => 'You have already requested this donation.']);
        exit;
    } else {
        $handleDonation->requestItem($donationID, $userID);
        echo json_encode(['success' => true]);
        exit;
    }
}

if (!isset($_GET['donationID'])) {
    echo json_encode(['success' => false, 'message' => 'Donation ID required']);
    exit;
} else {
    $donationID = intval($_GET['donationID']);
    $requests = $handleDonation->requestingUser($donationID);
    echo json_encode(['success' => true, 'data' => $requests]);
}
