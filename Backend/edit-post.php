<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

require_once 'Main/create_post.php';
require_once 'Main/dbc.php';

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    exit();
}

// Required identifiers and editable fields
$donationID   = isset($_POST['donationID']) ? intval($_POST['donationID']) : null;
$userID       = isset($_POST['userID']) ? intval($_POST['userID']) : null;
$title        = $_POST['title'] ?? null;
$description  = $_POST['description'] ?? null;
$location     = $_POST['location'] ?? null;

// Editable fields validation
if (!$donationID || !$userID || !$title || !$description || !$location) {
    echo json_encode(["status" => "error", "message" => "Missing required fields."]);
    exit();
}

try {
    $conn = DBconnector::getInstance()->getConnection();

    // Load existing row to:
    // 1) authorize ownership
    // 2) preserve restricted fields (category, condition, usageDuration, quantity)
    // 3) fetch current images if frontend didn't send them
    $stmt = $conn->prepare("SELECT category, `condition`, usageDuration, quantity, images FROM donation WHERE DonationID = ? AND userID = ?");
    $stmt->bind_param("ii", $donationID, $userID);
    $stmt->execute();
    $current = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$current) {
        echo json_encode(["status" => "error", "message" => "Donation not found or unauthorized."]);
        exit();
    }

    // Preserve restricted fields by taking them from DB
    $category       = $current['category'];
    $condition      = $current['condition'];
    $usageDuration  = $current['usageDuration'];
    $quantity       = (int)$current['quantity'];

    // Existing images management
    $existingImagesJson = $_POST['existingImages'] ?? null;
    $baseImages = [];

    if ($existingImagesJson) {
        $decoded = json_decode($existingImagesJson, true);
        if (is_array($decoded)) {
            $baseImages = $decoded;
        }
    } else {
        // Fallback to DB images if frontend didn't send a base list
        $dbImages = $current['images'];
        if (!empty($dbImages)) {
            $decoded = json_decode($dbImages, true);
            if (is_array($decoded)) {
                $baseImages = $decoded;
            }
        }
    }

    // Handle new uploads
    $newImages = [];
    if (!empty($_FILES['images']) && isset($_FILES['images']['tmp_name']) && is_array($_FILES['images']['tmp_name'])) {
        $uploadDir = __DIR__ . '/uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        foreach ($_FILES['images']['tmp_name'] as $idx => $tmpName) {
            if (!is_uploaded_file($tmpName)) {
                continue;
            }
            $filename = $_FILES['images']['name'][$idx] ?? ('image_' . $idx);
            // Sanitize filename
            $safeName = preg_replace('/[^A-Za-z0-9._-]/', '_', $filename);
            $targetFile = $uploadDir . uniqid('', true) . "_" . $safeName;

            if (move_uploaded_file($tmpName, $targetFile)) {
                // Save relative path for DB
                $newImages[] = 'uploads/' . basename($targetFile);
            }
        }
    }

    // Merge and de-duplicate images
    $finalImages = array_values(array_unique(array_merge($baseImages, $newImages)));
    $imagesJson = json_encode($finalImages);

    // Perform the update (restricted fields are preserved from DB and passed unchanged)
    $createPost = new CreatePost();
    $response = $createPost->editPost(
        $donationID,
        $userID,
        $title,
        $description,
        $category,       // preserved
        $location,
        $condition,      // preserved
        $imagesJson,
        $usageDuration,  // preserved
        $quantity        // preserved
    );

    echo json_encode($response);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}