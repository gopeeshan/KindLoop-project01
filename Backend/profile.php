<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$database = "kindloop";

$conn = new mysqli($servername, $username, $password, $database);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $conn->connect_error]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// Handle preflight OPTIONS request
if ($method === "OPTIONS") {
    http_response_code(200);
    exit;
}

// GET request to fetch user by email
if ($method === "GET") {
    if (isset($_GET['email'])) {
        $email = $_GET['email'];
    }

   // Step 1: Fetch user info
   $stmt = $conn->prepare("SELECT userID, fullName, email, contactNumber, occupation, address, credit_points FROM user WHERE email = ?");
   $stmt->bind_param("s", $email);
   if (!$stmt->execute()) {
       http_response_code(500);
       echo json_encode(["error" => "Database error while fetching user."]);
       exit;
   }

   $result = $stmt->get_result();
   $user = $result->fetch_assoc();
   $stmt->close();

   if (!$user) {
       echo json_encode(["error" => "User not found."]);
       exit;
   }

   $userID = $user['userID'];

   // Step 2: Fetch Donation History (items donated by the user)
   $donationHistory = [];
   $stmt = $conn->prepare("SELECT donation.DonationID, donation.title, donation.date_time, donation.category , donation.credits,
   
   CASE
    WHEN donation.isDonationCompleted = 1 THEN 'Completed'
    ELSE 'Pending'
  END AS status,

  CASE
    WHEN donation.isVerified = 1 THEN 'Verified'
    ELSE 'Not Verified'
  END AS verification
 
 FROM donation
WHERE donation.userID = ?");  
   
   $stmt->bind_param("i", $userID);
   if ($stmt->execute()) {
       $donationHistory = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
   }
   $stmt->close();

   // Step 3: Fetch Received History (items received by the user)
   $receivedHistory = [];
   $stmt = $conn->prepare("SELECT d.DonationID AS id, d.title, d.received_date AS date, u.fullName AS donor
                           FROM donation d
                           JOIN user u ON d.userID = u.userID

                           WHERE d.receiverID = ? AND isDonationCompleted = 1 ");
   $stmt->bind_param("i", $userID);
   if ($stmt->execute()) {
       $receivedHistory = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
   }
   $stmt->close();

   // Step 4: Fetch To-Be-Received Items (items accepted but not yet received)
   $toBeReceived = [];
   $stmt = $conn->prepare("SELECT DonationID AS id, d.title, d.date_time AS requestDate,d.category ,u.fullName AS donor ,u.contactNumber AS donorContact
                           FROM donation d
                           JOIN user u ON d.userID = u.userID
                           
                           WHERE d.receiverID = ? AND isDonationCompleted = 0 ");
   $stmt->bind_param("i", $userID);
   if ($stmt->execute()) {
       $toBeReceived = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
   }
   $stmt->close();

  // Merge donation data into user array directly
  $user['donationHistory'] = $donationHistory;
  $user['receivedHistory'] = $receivedHistory;
  $user['toBeReceived'] = $toBeReceived;

  echo json_encode($user);
  exit;
}



// PUT request to update user info
elseif ($method === "PUT") {
    // Read input JSON body
    $input = json_decode(file_get_contents("php://input"), true);

    if (
        !isset($input["userID"]) || !isset($input["fullName"]) || !isset($input["email"]) ||
        !isset($input["contactNumber"]) || !isset($input["occupation"]) || !isset($input["address"])
    ) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields."]);
        exit;
    }

    $stmt = $conn->prepare("UPDATE user SET fullName = ?, email = ?, contactNumber = ?, occupation = ?, address = ? WHERE userID = ?");
    $stmt->bind_param(
        "sssssi",
        $input["fullName"],
        $input["email"],
        $input["contactNumber"],
        $input["occupation"],
        $input["address"],
        $input["userID"]
    );

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "User updated successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "error" => "Failed to update user: " . $stmt->error]);
    }

    $stmt->close();
}

else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}

$conn->close();
?>
