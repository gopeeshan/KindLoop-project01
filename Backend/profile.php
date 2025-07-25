<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once 'Main/profile.php';

$profile = new Profile();

$method = $_SERVER['REQUEST_METHOD'];


// GET request to fetch user by email
if ($method === "GET") {
    if (isset($_GET['email'])) {
        $email = $_GET['email'];
    }

   // Step 1: Fetch user info
   $user = $profile->getUserDetails($email);
    if (!$user) {
         echo json_encode(["error" => "User not found."]);
         exit;
    }

   // Step 2: Fetch Donation History (items donated by the user)
   $donationHistory = $profile->getDonationHistory($user['userID']);

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
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $action = $input['action'] ?? '';
    $DonationID = $input['DonationID'] ?? null;

   if ($action === 'confirm_received' && $DonationID !== null) {
       $profile->confirmReceived($DonationID);
       echo json_encode(["success" => true]);
       exit;
   }
}

elseif ($method === "PUT") {
 
    $input = json_decode(file_get_contents("php://input"), true);

    $action = $input['action'] ?? '';
    $userID = $input['userID'] ?? null;

    if (
        !isset($input["userID"]) || !isset($input["fullName"]) ||
        !isset($input["contactNumber"]) || !isset($input["occupation"]) || !isset($input["address"])
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

?>
