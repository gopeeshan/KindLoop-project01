<?php
require_once __DIR__ . '/../Main/dbc.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $db = new DBconnector();
    $conn = $db->connect();

    $senderID   = intval($_POST['senderID']);
    $receiverID = intval($_POST['receiverID']);
    $donationID = isset($_POST['donationID']) ? intval($_POST['donationID']) : null;
    $message    = trim($_POST['message']);

    if (!empty($message)) {
        $stmt = $conn->prepare("INSERT INTO messages (senderID, receiverID, donationID, message) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("iiis", $senderID, $receiverID, $donationID, $message);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "messageID" => $stmt->insert_id]);
        } else {
            echo json_encode(["status" => "error", "error" => $stmt->error]);
        }
        $stmt->close();
    } else {
        echo json_encode(["status" => "error", "error" => "Message cannot be empty"]);
    }
}
?>
