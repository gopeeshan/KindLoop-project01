<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

// Allow OPTIONS preflight if needed
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'Main/dbc.php'; // adjust path if needed

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON body']);
    exit;
}

$sender = isset($input['sender_id']) ? intval($input['sender_id']) : null;
$receiver = isset($input['receiver_id']) ? intval($input['receiver_id']) : null;
$content = isset($input['content']) ? trim($input['content']) : '';

if ($sender === null || $receiver === null || $content === '') {
    echo json_encode(['success' => false, 'message' => 'sender_id, receiver_id and non-empty content are required']);
    exit;
}

if (mb_strlen($content) > 2000) {
    echo json_encode(['success' => false, 'message' => 'Message too long']);
    exit;
}

$db = new DBconnector();
$conn = $db->connect();

$sql = "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'DB prepare failed: ' . $conn->error]);
    exit;
}
$stmt->bind_param('iis', $sender, $receiver, $content);

if ($stmt->execute()) {
    $insertedId = $stmt->insert_id;
    $sel = $conn->prepare("SELECT id, sender_id, receiver_id, content, timestamp FROM messages WHERE id = ?");
    $sel->bind_param('i', $insertedId);
    $sel->execute();
    $result = $sel->get_result();
    $message = $result->fetch_assoc();

    echo json_encode(['success' => true, 'message' => $message]);
    exit;
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to save message: ' . $stmt->error]);
    exit;
}