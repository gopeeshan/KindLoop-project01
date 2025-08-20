<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: *");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once "./Main/user.php";
require_once "./Main/get_donations.php";
require_once  "./Main/Complaint.php";


$userObj = new User();
$donationObj = new Donation();
$complaintObj = new Complaint();

function getInput($key) {
    return $_POST[$key] ?? null;
}

function sendJson($data) {
    echo json_encode($data);
    exit;
}

$type   = $_GET['type']   ?? null;
$id     = intval($_GET['id'] ?? 0);
$action = $_GET['action'] ?? null;


if ($type === 'donor' && $id) {
    $donor = $userObj->getDonor($id);
    sendJson($donor ? ["success" => true, "donor" => $donor] : ["success" => false, "message" => "Donor not found"]);
}

if ($type === 'user' && $id) {
    $user = $userObj->getUser($id);
    sendJson($user ? ["success" => true, "user" => $user] : ["success" => false, "message" => "User not found"]);
}


if ($type === 'donation' && $id) {
    $donation = $donationObj->getDonation($id);
    sendJson($donation ? ["success" => true, "donation" => $donation] : ["success" => false, "message" => "Donation not found"]);
}


if ($action && $id) {
    $solution = getInput("solution") ?? "";
    $files    = $_FILES['proof_images'] ?? [];

    if ($action === 'respond') {
        $success = $complaintObj->respond($id, $solution);
        sendJson($success ? ["success" => true, "message" => "Response sent successfully"] 
                          : ["success" => false, "message" => "Failed to send response"]);
    }

    if ($action === 'resolve') {
        $success = $complaintObj->resolve($id, $solution, $files);
        sendJson($success ? ["success" => true, "message" => "Complaint resolved successfully"] 
                          : ["success" => false, "message" => "Failed to resolve complaint"]);
    }
}


$complaints = $complaintObj->getAllComplaint();

$baseUrl = "http://localhost/KindLoop-project01/Backend/";

foreach ($complaints as &$c) {
    foreach (['evidence_images', 'proof_images'] as $key) {
        if (!empty($c[$key])) {
            $c[$key] = array_map(fn($img) => $baseUrl . $img, $c[$key]);
        }
    }
}

sendJson($complaints);