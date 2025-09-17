<?php

session_start();
// Session timeout: 30 minutes
$timeout = 1800; // seconds
if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > $timeout)) {
    session_unset();
    session_destroy();
    echo json_encode(["error" => "Session expired. Please log in again."]);
    exit;
}
$_SESSION['LAST_ACTIVITY'] = time();

header("Access-Control-Allow-Origin: http://localhost:2025");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
header("Access-Control-Allow-Credentials: true");

require_once 'Main/profile.php';
require_once 'Main/user.php';

$profile = new Profile();
$userObj = new User();

$method = $_SERVER['REQUEST_METHOD'];

    // if (isset($_SESSION['donorID'])) {
    //     echo json_encode([
    //         "success" => true,
    //         "donorID" => $_SESSION['donorID']
    //     ]);
    // } else {
    //     echo json_encode([
    //         "success" => false,
    //         "message" => "No active session found."
    //     ]);
    // }
    // exit;
    if ($method === "GET" && isset($_GET['action']) && $_GET['action'] === "get_donor_id") {
    if (isset($_SESSION['userID'])) {
        echo json_encode([
            "success" => true,
            "DonorID" => $_SESSION['userID']
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "No active session found."
        ]);
    }
    exit;
}

if ($method === "GET" && !isset($_GET['donationId'])) {
    if (!isset($_SESSION['userID']) || !isset($_SESSION['email'])) {
        echo json_encode(["error" => "Unauthorized. No session."]);
        exit;
    }
    $email = $_SESSION['email'];

    // Step 1: Fetch user info
    $user = $profile->getUserDetails($email);
    if (!$user) {
        echo json_encode(["error" => "User not found."]);
        exit;
    }

    $credits = $userObj->getCredits($user['userID']);
    if ($credits['status'] === 'success') {
        // Merge credits data into user array
        $user = array_merge($user, $credits['data']);
    }

    // Step 2: Fetch Donation History (items donated by the user)
    $donationHistory = $profile->getUserDonations($user['userID']);

    // Step 3: Fetch Received History (items received by the user)
    $receivedHistory = $profile->getReceivedHistory($user['userID']);

    // Step 4: Fetch To-Be-Received Items (items accepted but not yet received)
    $toBeReceived = $profile->getToBeReceivedItems($user['userID']);

    // Step 5: Merge all data into user array
    $user['donationHistory'] = $donationHistory;
    $user['receivedHistory'] = $receivedHistory;
    $user['toBeReceived'] = $toBeReceived;

    echo json_encode($user);
    exit;
}
if ($method === 'GET' && isset($_GET['donationId'])) {
    $donationId = intval($_GET['donationId']);
    $result = $profile->viewDonationDetails($donationId);
    if ($result && isset($result['DonorID'])) {
        $_SESSION['DonorID'] = $result['userID'];
    }
    echo json_encode($result);
    exit;
}
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $action = $input['action'] ?? '';
    $DonationID = $input['DonationID'] ?? null;
    $credits = $input['credits'] ?? null;
    $receiverID = $input['receiverID'] ?? null;

   if ($action === 'confirm_received' && $DonationID !== null) {
       $profile->confirmReceived($DonationID, $receiverID);
       echo json_encode(["success" => true]);
       exit;
   }

// Case: Change password
    if ($action === 'changePassword') {
        $email = $input['email'] ?? '';
        $currentPassword = $input['currentPassword'] ?? '';
        $newPassword = $input['newPassword'] ?? '';
        $confirmPassword = $input['confirmPassword'] ?? '';

        // Validate required fields
        if (!$email || !$currentPassword || !$newPassword || !$confirmPassword) {
            echo json_encode(["status" => "error", "message" => "Missing required fields."]);
            exit;
        }

        // Check if new passwords match
        if ($newPassword !== $confirmPassword) {
            echo json_encode(["status" => "error", "message" => "New passwords do not match."]);
            exit;
        }

        // Attempt password change
        $result = $profile->changePassword($email, $currentPassword, $newPassword);
        echo json_encode($result);
        exit;
    }

}

elseif ($method === "PUT") {
 
    $input = json_decode(file_get_contents("php://input"), true);

    $action = $input['action'] ?? '';
    $userID = $input['userID'] ?? null;

    if (
        empty($input["userID"]) || empty($input["fullName"]) ||
        empty($input["contactNumber"]) || empty($input["occupation"]) || empty($input["address"])
    ) {
        echo json_encode(["error" => "Missing required fields."]);
        exit;
    }

    $profile->updateUserInfo(
        $input["userID"],
        $input["fullName"],
        $input["contactNumber"],
        $input["occupation"],
        $input["address"]
    );
     if ($result["status"] === "success") {
        echo json_encode([
            "success" => true,
            "message" => $result["message"]
        ]);
    } else {
        echo json_encode([
            "error" => $result["message"]
        ]);
    }

    exit;
}


else {
    echo json_encode(["error" => "Method not allowed"]);
}

if ($action === 'update_visibility') {
    $donationID = $input['DonationID'] ?? null;
    $userID = $input['userID'] ?? null;
    $setVisible = $input['setVisible'] ?? null;

    $result = $profile->updateDonationVisibility($donationID, $userID, $setVisible);
    echo json_encode($result);
    exit;
}

?>
