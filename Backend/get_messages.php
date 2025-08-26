<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once 'Main/dbc.php';

$db = new DBconnector();
$conn = $db->connect();

$sender = isset($_GET['sender_id']) ? intval($_GET['sender_id']) : 0;
$receiver = isset($_GET['receiver_id']) ? intval($_GET['receiver_id']) : 0;

// fetch messages in both directions
$sql = "SELECT id, sender_id, receiver_id, content, timestamp FROM messages
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
        ORDER BY timestamp ASC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iiii", $sender, $receiver, $receiver, $sender);
$stmt->execute();
$result = $stmt->get_result();

$messages = [];
while ($row = $result->fetch_assoc()) {
    $messages[] = $row;
}

echo json_encode(['messages' => $messages]);