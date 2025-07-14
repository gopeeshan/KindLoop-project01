<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    exit();
}

$conn = new mysqli("localhost", "root", "", "kindloop");

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error]));
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

$sql = "INSERT INTO donation (userID, title, description, category, location, `condition`, images)
        VALUES (?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "issssss",
    $userID,
    $title,
    $description,
    $category,
    $location,
    $condition,
    $imagesJson
);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Your post is posted successfully!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Posting failed: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
