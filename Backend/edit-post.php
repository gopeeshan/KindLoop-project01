<?php
header("Access-Control-Allow-Origin: http://localhost:2025");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

require_once 'Main/create_post.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    exit();
}

$donationID = $_POST['donationID'] ?? null;
$userID = $_POST['userID'] ?? null;
$title = $_POST['title'] ?? null;
$description = $_POST['description'] ?? null;
$category = $_POST['category'] ?? null;
$location = $_POST['location'] ?? null;
$condition = $_POST['condition'] ?? null;
$usageDuration = $_POST['usageDuration'] ?? null;
$quantity = $_POST['quantity'] ?? null;
$imagesJson = $_POST['images'] ?? '[]';

if (!$donationID || !$userID) {
    echo json_encode(["status" => "error", "message" => "Missing required fields."]);
    exit;
}

$editPost = new CreatePost();
$response = $editPost->editPost($donationID, $userID, $title, $description, $category, $location, $condition, $imagesJson, $usageDuration, $quantity);
echo json_encode($response);
?>