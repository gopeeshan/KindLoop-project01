<?php
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: http://localhost:2025");
    header("Access-Control-Allow-Credentials: true");
}
header("Content-Type: application/json");

require_once './Main/get_donations.php';

$donation = new Donation();

// if (!isset($_SESSION['userID'])) {
//         echo json_encode(["success" => false, "message" => "Unauthorized"]);
//         exit;
//     }

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