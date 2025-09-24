<?php
session_start();

$timeout = 1800;

// ----- CORS: dynamic allowed origins + preflight -----
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost:2025',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
];

if ($origin && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Credentials: true"); // required for cookies/sessions
}
header("Vary: Origin");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=utf-8");

// if( !isset($_SESSION['UserID']) ) {
//     echo json_encode([
//         'success' => false,
//         'message' => 'You need to login to perform this action.'
//     ]);
//     exit;
// }

// Handle preflight cleanly
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ----- Session timeout guard -----
if (isset($_SESSION['LAST_ACTIVITY']) && (time() - $_SESSION['LAST_ACTIVITY'] > $timeout)) {
    session_unset();
    session_destroy();
    echo json_encode(["error" => "Session expired. Please log in again."]);
    exit;
}
$_SESSION['LAST_ACTIVITY'] = time();

// Use absolute paths for reliability
require_once __DIR__ . '/Main/profile.php';
require_once __DIR__ . '/Main/user.php';

$profile = new Profile();
$userObj = new User();

$method = $_SERVER['REQUEST_METHOD'];

// -------------------- GET: Fetch donorID, user info, donations -------------------- //
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
        echo json_encode(["error" => "Session expired. Please log in again."]);
        exit;
    }
    $email = $_SESSION['email'];

    $user = $profile->getUserDetails($email);
    if (!$user) {
        echo json_encode(["error" => "User not found."]);
        exit;
    }

    $credits = $userObj->getCredits($user['userID']);
    if ($credits['status'] === 'success') {
        $user = array_merge($user, $credits['data']);
    }

    $donationHistory = $profile->getUserDonations($user['userID']);
    $receivedHistory = $profile->getReceivedHistory($user['userID']);
    $toBeReceived = $profile->getToBeReceivedItems($user['userID']);

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

// -------------------- POST: Actions (confirm_received, changePassword, update_visibility) -------------------- //
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $action = $input['action'] ?? '';
    $DonationID = $input['DonationID'] ?? null;
    $credits = $input['credits'] ?? null;
    $receiverID = $input['receiverID'] ?? null;

    // Case: Confirm received
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

        if (!$email || !$currentPassword || !$newPassword || !$confirmPassword) {
            echo json_encode(["status" => "error", "message" => "Missing required fields."]);
            exit;
        }

        if ($newPassword !== $confirmPassword) {
            echo json_encode(["status" => "error", "message" => "New passwords do not match."]);
            exit;
        }

        $result = $profile->changePassword($email, $currentPassword, $newPassword);
        echo json_encode($result);
        exit;
    }

    // Case: Update visibility (soft delete)
    if ($action === 'update_visibility') {
        $donationID = $input['DonationID'] ?? null;
        $userID = $input['userID'] ?? null;
        $setVisible = $input['setVisible'] ?? null;

        if ($donationID && $userID !== null && $setVisible !== null) {
            $result = $profile->updateDonationVisibility($donationID, $userID, $setVisible);
            echo json_encode($result);
        } else {
            echo json_encode(["success" => false, "message" => "Missing required fields for visibility update."]);
        }
        exit;
    }
}

// -------------------- PUT: Update user info -------------------- //
elseif ($method === "PUT") {
    $input = json_decode(file_get_contents("php://input"), true) ?? [];

    if (
        empty($input["userID"]) || empty($input["fullName"]) ||
        empty($input["contactNumber"]) || empty($input["occupation"]) || empty($input["address"])
    ) {
        echo json_encode(["error" => "Missing required fields."]);
        exit;
    }

    $result = $profile->updateUserInfo(
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

// -------------------- Default: Method not allowed -------------------- //
else {
    echo json_encode(["error" => "Method not allowed"]);
}