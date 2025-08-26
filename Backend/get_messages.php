<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

require_once 'Main/dbc.php'; // adjust path if needed

$db = new DBconnector();
$conn = $db->connect();

$sender = isset($_GET['sender_id']) ? intval($_GET['sender_id']) : 0;
$receiver = isset($_GET['receiver_id']) ? intval($_GET['receiver_id']) : 0;
$since = isset($_GET['since']) ? $_GET['since'] : null;

if ($sender === 0 || $receiver === 0) {
    echo json_encode(['success' => false, 'message' => 'sender_id and receiver_id are required']);
    exit;
}

if ($since) {
    $sql = "SELECT id, sender_id, receiver_id, content, timestamp FROM messages
            WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
              AND timestamp > ?
            ORDER BY timestamp ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('iiiis', $sender, $receiver, $receiver, $sender, $since);
} else {
    $sql = "SELECT id, sender_id, receiver_id, content, timestamp FROM messages
            WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
            ORDER BY timestamp ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('iiii', $sender, $receiver, $receiver, $sender);
}

if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'DB prepare failed: ' . $conn->error]);
    exit;
}

$stmt->execute();
$res = $stmt->get_result();

$messages = [];
while ($row = $res->fetch_assoc()) {
    $messages[] = $row;
}

echo json_encode(['success' => true, 'messages' => $messages]);