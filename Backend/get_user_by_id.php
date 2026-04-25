<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

require_once 'Main/user.php'; // adjust path if needed

$user = new User();
$userID = isset($_GET['userID']) ? intval($_GET['userID']) : 0;

if ($userID <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid userID']);
    exit;
}
$res = $user->getUserById($userID);

if ($res) {
    echo json_encode(['success' => true, 'user' => $res]);
} else {
    echo json_encode(['success' => false, 'message' => 'User not found']);
}