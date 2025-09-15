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

// Required fields (keep validation as before)
$donationID     = isset($_POST['donationID']) ? intval($_POST['donationID']) : null;
$userID         = isset($_POST['userID']) ? intval($_POST['userID']) : null;
$title          = $_POST['title'] ?? null;
$description    = $_POST['description'] ?? null;
$category       = $_POST['category'] ?? null;
$location       = $_POST['location'] ?? null;
$condition      = $_POST['condition'] ?? null;
$usageDuration  = $_POST['usageDuration'] ?? null;
$quantity       = isset($_POST['quantity']) ? intval($_POST['quantity']) : null;

// Optional image management params
// existingImages: JSON array of paths you want to keep (from frontend)
// removeImages: JSON array of paths you want to remove (optional)
// replaceImages: "1" or "true" to replace all existing with only newly uploaded
$existingImagesJson = $_POST['existingImages'] ?? null;
$removeImagesJson   = $_POST['removeImages'] ?? null;
$replaceImagesFlag  = isset($_POST['replaceImages']) ? $_POST['replaceImages'] : "0";
$replaceImages      = in_array(strtolower((string)$replaceImagesFlag), ["1", "true"], true);

if (!$donationID || !$userID) {
    echo json_encode(["status" => "error", "message" => "Missing required fields."]);
    exit;
}

try {
    // Load current images from DB if frontend didn't provide a base list
    $db = new DBconnector();
    $conn = $db->connect();

    $stmt = $conn->prepare("SELECT images FROM donation WHERE DonationID = ? AND userID = ?");
    $stmt->bind_param("ii", $donationID, $userID);
    $stmt->execute();
    $res = $stmt->get_result();
    $currentImages = [];
    if ($row = $res->fetch_assoc()) {
        if (!empty($row['images'])) {
            $decoded = json_decode($row['images'], true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $currentImages = $decoded;
            }
        }
    }
    $stmt->close();

    // Determine base images to start with
    $baseImages = $currentImages;
    if (!is_null($existingImagesJson)) {
        $tmp = json_decode($existingImagesJson, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($tmp)) {
            $baseImages = $tmp;
        }
    }

    // Apply remove list if provided
    if (!is_null($removeImagesJson)) {
        $toRemove = json_decode($removeImagesJson, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($toRemove) && !$replaceImages) {
            $baseImages = array_values(array_diff($baseImages, $toRemove));
        }
    }

    // If replace flag is set, ignore base (we will only keep newly uploaded)
    if ($replaceImages) {
        $baseImages = [];
    }

    // Handle new uploads (append to base)
    $newImages = [];
    if (!empty($_FILES['images']) && is_array($_FILES['images']['tmp_name'])) {
        $uploadDir = __DIR__ . '/uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        foreach ($_FILES['images']['tmp_name'] as $key => $tmpName) {
            if (!is_uploaded_file($tmpName)) {
                continue;
            }
            $filename = basename($_FILES['images']['name'][$key]);
            // Very basic sanitization and unique prefix
            $safeName = preg_replace('/[^A-Za-z0-9._-]/', '_', $filename);
            $targetFile = $uploadDir . uniqid('', true) . "_" . $safeName;

            if (move_uploaded_file($tmpName, $targetFile)) {
                // Save relative path (same convention as create-post.php)
                $newImages[] = 'uploads/' . basename($targetFile);
            }
        }
    }

    // Merge and de-duplicate
    $finalImages = array_values(array_unique(array_merge($baseImages, $newImages)));

    // Build images JSON for DB
    $imagesJson = json_encode($finalImages);

    // Perform the update
    $editPost = new CreatePost();
    $response = $editPost->editPost(
        $donationID,
        $userID,
        $title,
        $description,
        $category,
        $location,
        $condition,
        $imagesJson,
        $usageDuration,
        $quantity
    );

    echo json_encode($response);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Server error: " . $e->getMessage()]);
}