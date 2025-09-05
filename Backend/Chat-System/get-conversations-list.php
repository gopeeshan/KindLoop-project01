<?php
require_once __DIR__ . '/../Main/dbc.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $db = new DBconnector();
    $conn = $db->connect();

    $userID = intval($_GET['userID']);

    $query = "SELECT m1.*
              FROM messages m1
              INNER JOIN (
                  SELECT 
                      LEAST(senderID, receiverID) as userA,
                      GREATEST(senderID, receiverID) as userB,
                      MAX(timestamp) as maxTime
                  FROM messages
                  WHERE senderID = ? OR receiverID = ?
                  GROUP BY userA, userB
              ) m2
              ON LEAST(m1.senderID, m1.receiverID) = m2.userA
              AND GREATEST(m1.senderID, m1.receiverID) = m2.userB
              AND m1.timestamp = m2.maxTime
              ORDER BY m1.timestamp DESC";

    $stmt = $conn->prepare($query);
    $stmt->bind_param("ii", $userID, $userID);
    $stmt->execute();
    $result = $stmt->get_result();

    $conversations = [];
    while ($row = $result->fetch_assoc()) {
        $conversations[] = $row;
    }

    echo json_encode($conversations);
}
?>
