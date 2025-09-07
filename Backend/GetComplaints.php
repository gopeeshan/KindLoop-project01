<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

require_once 'Main/Complaint.php';

if (!isset($_GET['complainantID']) || !isset($_GET['DonationID'])) {
    echo json_encode([
        "success" => false,
        "message" => "Missing required parameters."
    ]);
    exit;
}

$userID = intval($_GET['complainantID']);      
$donationID = intval($_GET['DonationID']);

$complaints = new Complaint();
$result = $complaints->getComplaints($userID, $donationID);

echo json_encode([
    "success" => true,
    "complaints" => $result['complaints'],
    "count" => $result['count']
]);
