<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

$conn = new mysqli("localhost", "root", "", "kindloop");
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit();
}

$sql = "SELECT DonationID, userID, title, description, category, location, `condition`, images, date_time FROM donation ORDER BY date_time DESC";

$result = $conn->query($sql);

$donations = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        // Decode images JSON stored as text if exists
        $row['images'] = $row['images'] ? json_decode($row['images'], true) : [];
        $donations[] = $row;
    }
    echo json_encode(["status" => "success", "data" => $donations]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to fetch donations"]);
}

$conn->close();
?>
