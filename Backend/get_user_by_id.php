<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

require_once 'Main/dbc.php'; // adjust path if needed

$db = new DBconnector();
$conn = $db->connect();

$userID = isset($_GET['userID']) ? intval($_GET['userID']) : 0;

if ($userID <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid userID']);
    exit;
}

$sql = "SELECT userID, fullName, avatar, email FROM user WHERE userID = ? LIMIT 1";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'DB prepare failed: ' . $conn->error]);
    exit;
}
$stmt->bind_param("i", $userID);
$stmt->execute();
$res = $stmt->get_result();
$user = $res->fetch_assoc();

if ($user) {
    echo json_encode(['success' => true, 'user' => $user]);
} else {
    echo json_encode(['success' => false, 'message' => 'User not found']);
}