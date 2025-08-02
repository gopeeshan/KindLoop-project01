<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once './Main/get_donations.php';

$donation = new Donation();

if (!isset($_GET['DonationID'])) {
    echo json_encode([
        "status" => "error",
        "message" => "DonationID parameter is required."
    ]);
    exit;
}

$donationID = intval($_GET['DonationID']);

$response = $donation->getDonationById($donationID);
echo json_encode($response);