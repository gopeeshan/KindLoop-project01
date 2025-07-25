<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

require_once 'Main/create_post.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    exit();
}
$userID = $_POST['userID'] ?? null;
$title = $_POST['title'] ?? null;
$description = $_POST['description'] ?? null;
$category = $_POST['category'] ?? null;
$location = $_POST['location'] ?? null;
$condition = $_POST['condition'] ?? null;

// Validate required fields
if (!$userID || !$title || !$description || !$category || !$location || !$condition) {
    echo json_encode(["status" => "error", "message" => "Missing required fields."]);
    exit;
}

$imagePaths = [];
if (!empty($_FILES['images'])) {
    $uploadDir = __DIR__ . '/uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    foreach ($_FILES['images']['tmp_name'] as $key => $tmpName) {
        $filename = basename($_FILES['images']['name'][$key]);
        $targetFile = $uploadDir . uniqid() . "_" . $filename;

        if (move_uploaded_file($tmpName, $targetFile)) {
            // Save relative path for DB (change if needed)
            $imagePaths[] = 'uploads/' . basename($targetFile);
        }
    }
}

$imagesJson = json_encode($imagePaths);

$createPost = new CreatePost();
$response = $createPost->createNewPost($userID, $title, $description, $category, $location, $condition, $imagesJson);
echo json_encode($response);
