<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type");

require_once 'Main/Admin.php';

$admin = new Admin();

$users = $admin->getUsers();
$admins = $admin->getAdmins();
$donations = $admin->getDonations();
$pendingVerifications = $admin->showToBeVerified();



if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $action = $input['action'] ?? '';
    $DonationID = $input['DonationID'] ?? null;
    $isVerified = $input['isVerified'] ?? null;
    $setVisible = $input['setVisible'] ?? null;
    $email = $input['email'] ?? 'unknown';
    $userID = $input['userID'] ?? null;
    $AdminID = $input['AdminID'] ?? null;
    $active_state = $input['active_state'] ?? null;
    $AdminActive_state = $input['AdminActive_state'] ?? null;



    if ($action === 'verify_donation' && $DonationID !== null && $isVerified !== null && $setVisible !== null) {

        // $AdminID = $admin->getAdminIDByEmail($email);
        if ($AdminID === null) {
            echo json_encode(["status" => "error", "message" => "Admin email not found"]);
            exit;
        }

         if ($isVerified == 1) {
        $verified = $admin->verifyDonation($DonationID, $isVerified, $setVisible, $AdminID);
        if (!$verified) {
            echo json_encode(["status" => "error", "message" => "Failed to verify donation"]);
            exit;
        }
        echo json_encode(["status" => "success", "message" => "Donation approved"]);
        exit;


    } elseif ($isVerified == 0) {
           $result = $admin->logRejectedDonation($DonationID, $AdminID);
        echo json_encode($result); // directly return array from function
        exit;
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid isVerified value"]);
        exit;
    }
}


   if ($action === 'user_action' && $userID !== null && $active_state !== null) {
        $user_action = $admin->updateUserStatus($userID, $active_state);
        if (!$user_action) {
            echo json_encode(["status" => "error", "message" => "Failed to update user status"]);
            exit;
        }
        echo json_encode(["status" => "success", "message" => "User status updated"]);
        exit;
    }

  if ($action === 'admin_action' && $AdminID !== null && $AdminActive_state !== null) {

        $admin_action = $admin->updateAdminStatus($AdminID, $AdminActive_state);
        if (!$admin_action) {
            echo json_encode(["status" => "error", "message" => "Failed to update admin status"]);
            exit;
        }
        echo json_encode(["status" => "success", "message" => "Admin status updated"]);
        exit;
    }


if ($action === 'update_admin' && $AdminID !== null) {
    $fullName = $input['fullName'] ?? '';
    $email = $input['email'] ?? '';
    $contactNumber = $input['contactNumber'] ?? '';
    $address = $input['address'] ?? '';

    $updated = $admin->updateAdminDetails($AdminID, $fullName, $email, $contactNumber, $address);

    if ($updated) {
        echo json_encode(["status" => "success", "message" => "Admin updated successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update admin"]);
    }
    exit;
}

}

echo json_encode([
    "status" => "success",
    "users" => $users,
    "donations" => $donations,
    "admins" => $admins,
    "pendingVerifications" => $pendingVerifications
]);
