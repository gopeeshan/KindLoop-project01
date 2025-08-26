<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

require_once 'Main/dbc.php'; // adjust path if needed

$db = new DBconnector();
$conn = $db->connect();

$currentUser = isset($_GET['currentUser']) ? intval($_GET['currentUser']) : 0;

$sql = "SELECT userID, fullName, avatar FROM user WHERE userID != ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'DB prepare failed: ' . $conn->error]);
    exit;
}
$stmt->bind_param("i", $currentUser);
$stmt->execute();
$result = $stmt->get_result();

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

echo json_encode(['success' => true, 'users' => $users]);