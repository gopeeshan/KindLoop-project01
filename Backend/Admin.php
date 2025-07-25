<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type");

require_once 'Main/Admin.php';

$admin = new Admin();

$users = $admin->getUsers();

$donations = $admin->getDonations();

$pendingVerifications = $admin->showToBeVerified();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $action = $input['action'] ?? '';
    $DonationID = $input['DonationID'] ?? null;
    $isVerified = $input['isVerified'] ?? null;
    $setVisible = $input['setVisible'] ?? null;
    $adminEmail = $input['adminEmail'] ?? 'unknown';
    $userID = $input['userID'] ?? null;
    $active_state = $input['active_state'] ?? null;



    if ($action === 'verify_donation' && $DonationID !== null && $isVerified !== null && $setVisible !== null) {

        $adminID = $admin->getAdminIDByEmail($adminEmail);
        if ($adminID === null) {
            echo json_encode(["status" => "error", "message" => "Admin email not found"]);
            exit;
        }

        if ($isVerified == 1) {
            $verified = $admin->verifyDonation($DonationID, $isVerified, $setVisible, $adminID);
            if (!$verified) {
                echo json_encode(["status" => "error", "message" => "Failed to verify donation"]);
                exit;
            }
        }
        if ($isVerified == 0) {
            $rejected = $admin->logRejectedDonation($DonationID, $adminEmail,$adminID);
            if (!$rejected) {
                echo json_encode(["status" => "error", "message" => "Failed to log rejected donation"]);
                exit;
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid isVerified value"]);
        }
    } elseif ($action === 'user_action' && $userID !== null && $active_state !== null) {

        $user_action = $admin->updateUserStatus($userID, $active_state);
        if (!$user_action) {
            echo json_encode(["status" => "error", "message" => "Failed to update user status"]);
            exit;
        }
    // } elseif ($action === 'remove_donation' && $DonationID !== null) {
    //     $deletionResult = $admin->removeDonation($DonationID);
    //     if (!$deletionResult) {
    //         echo json_encode(["status" => "error", "message" => "Failed to delete donation"]);
    //         exit;
    //     }
    // } else {
        echo json_encode(["status" => "error", "message" => "Invalid request"]);
        exit;
    }
}



echo json_encode([
    "status" => "success",
    "users" => $users,
    "donations" => $donations,
    "pendingVerifications" => $pendingVerifications
]);
