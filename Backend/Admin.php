<?php
session_start();

$timeout_duration = 1800;

if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY']) > $timeout_duration) {
    session_unset();
    session_destroy();
    echo json_encode(["status" => "error", "message" => "Session expired. Please login again."]);
    exit;
}

$_SESSION['LAST_ACTIVITY'] = time();

header("Access-Control-Allow-Origin: http://localhost:2025");
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

require_once 'Main/Admin.php';

$admin = new Admin();

$users = $admin->getUsers();
$admins = $admin->getAdmins();
$donations = $admin->getDonations();
$pendingVerifications = $admin->showToBeVerified();



if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $action = $input['action'] ?? '';

    if ($action === 'login') {
        $email = $input['email'] ?? '';
        $password = $input['password'] ?? '';

        $result = $admin->login($email, $password);

        if ($result['status'] === 'success') {
            $_SESSION['AdminID'] = $result['admin']['AdminID'];
            $_SESSION['email']   = $result['admin']['email'];
            $_SESSION['role']    = $result['admin']['role'];
            $_SESSION['LAST_ACTIVITY'] = time();
        }

        echo json_encode($result);
        exit;
    }

    if (!isset($_SESSION['AdminID'])) {
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit;
    }

    $DonationID = $input['DonationID'] ?? null;
    $isVerified = $input['isVerified'] ?? null;
    $setVisible = $input['setVisible'] ?? null;
    $userID = $input['userID'] ?? null;
    $AdminID = $_SESSION['AdminID'];
    $active_state = $input['active_state'] ?? null;
    $AdminActive_state = $input['AdminActive_state'] ?? null;

    if ($action === 'verify_donation' && $DonationID !== null && $isVerified !== null && $setVisible !== null) {
        if ($isVerified == 1) {
            $verified = $admin->verifyDonation($DonationID, $isVerified, $setVisible, $AdminID);
            echo json_encode(
                $verified
                    ? ["status" => "success", "message" => "Donation approved"]
                    : ["status" => "error", "message" => "Failed to verify donation"]
            );
        } elseif ($isVerified == 0) {
            $result = $admin->logRejectedDonation($DonationID, $AdminID);
            echo json_encode($result);
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid isVerified value"]);
        }
        exit;
    }

    if ($action === 'user_action' && $userID !== null && $active_state !== null) {
        $user_action = $admin->updateUserStatus($userID, $active_state);
        echo json_encode(
            $user_action
                ? ["status" => "success", "message" => "User status updated"]
                : ["status" => "error", "message" => "Failed to update user status"]
        );
        exit;
    }

    if ($action === 'admin_action' && $input['AdminID'] !== null && $AdminActive_state !== null) {
        $admin_action = $admin->updateAdminStatus($input['AdminID'], $AdminActive_state);
        echo json_encode(
            $admin_action
                ? ["status" => "success", "message" => "Admin status updated"]
                : ["status" => "error", "message" => "Failed to update admin status"]
        );
        exit;
    }

    if ($action === 'update_admin' && $input['AdminID'] !== null) {
        $fullName = $input['fullName'] ?? '';
        $email = $input['email'] ?? '';
        $contactNumber = $input['contactNumber'] ?? '';
        $address = $input['address'] ?? '';

        $updated = $admin->updateAdminDetails($input['AdminID'], $fullName, $email, $contactNumber, $address);
        echo json_encode(
            $updated
                ? ["status" => "success", "message" => "Admin updated successfully"]
                : ["status" => "error", "message" => "Failed to update admin"]
        );
        exit;
    }

    if ($action === 'update_visibility' && $DonationID !== null && $setVisible !== null) {
        $updated = $admin->updateDonationVisibleStatus($DonationID, $setVisible);
        echo json_encode(
            $updated
                ? ["status" => "success", "message" => "Visibility updated"]
                : ["status" => "error", "message" => "Failed to update visibility"]
        );
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_SESSION['AdminID'])) {
        echo json_encode(["status" => "error", "message" => "Unauthorized"]);
        exit;
    }

    echo json_encode([
        "status" => "success",
        "adminID" => $_SESSION['AdminID'],
        "adminRole" => $_SESSION['role'] ?? null,
        "users" => $admin->getUsers(),
        "donations" => $admin->getDonations(),
        "admins" => $admin->getAdmins(),
        "pendingVerifications" => $admin->showToBeVerified()
    ]);
    exit;
}

echo json_encode(["status" => "error", "message" => "Invalid request"]);
