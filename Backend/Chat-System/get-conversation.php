<?php
require_once __DIR__ . '/../Main/dbc.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $db = new DBconnector();
    $conn = $db->connect();

    $userID    = intval($_GET['userID']);     // current user
    $otherID   = intval($_GET['otherUserID']); // chatting with
    $donationID = isset($_GET['donationID']) ? intval($_GET['donationID']) : null;

    $query = "SELECT * FROM messages 
              WHERE ((senderID = ? AND receiverID = ?) 
                 OR (senderID = ? AND receiverID = ?))";

    $params = [$userID, $otherID, $otherID, $userID];
    $types = "iiii";

    if ($donationID) {
        $query .= " AND donationID = ?";
        $params[] = $donationID;
        $types .= "i";
    }

    $query .= " ORDER BY timestamp ASC";

    $stmt = $conn->prepare($query);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();

    $messages = [];
    while ($row = $result->fetch_assoc()) {
        $messages[] = $row;
    }

    echo json_encode($messages);
}
?>
