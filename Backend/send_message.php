<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once 'Main/dbc.php';

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['sender_id'], $input['receiver_id'], $input['content'])) {
    echo json_encode(['success' => false, 'message' => 'Missing fields']);
    exit;
}

$sender = intval($input['sender_id']);
$receiver = intval($input['receiver_id']);
$content = $input['content'];

$db = new DBconnector();
$conn = $db->connect();

$sql = "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iis", $sender, $receiver, $content);

if ($stmt->execute()) {
    $insertedId = $stmt->insert_id;
    // fetch created row (to return timestamp etc.)
    $sel = $conn->prepare("SELECT id, sender_id, receiver_id, content, timestamp FROM messages WHERE id = ?");
    $sel->bind_param("i", $insertedId);
    $sel->execute();
    $res = $sel->get_result();
    $message = $res->fetch_assoc();

    echo json_encode(['success' => true, 'message' => $message]);
} else {
    echo json_encode(['success' => false, 'message' => 'Insert failed']);
}