<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Connect to database
$conn = new mysqli("localhost", "root", "", "kindloop");
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "DB connection failed: " . $conn->connect_error]));
}

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
$requiredFields = ['fullName', 'email', 'nic', 'contactNumber', 'occupation', 'address', 'district', 'password'];
foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        echo json_encode(["status" => "error", "message" => "Please fill all required fields."]);
        exit;
    }
}

// Extract & sanitize input
$fullName = $data['fullName'];
$email = $data['email'];
$nic = $data['nic'];
$contactNumber = $data['contactNumber'];
$occupation = $data['occupation'];
$address = $data['address'];
$district = $data['district'];
$password = password_hash($data['password'], PASSWORD_DEFAULT); // Secure hash

// Check if email or NIC already exists
$checkSql = "SELECT id FROM user WHERE email = ? OR nic = ?";
$stmtCheck = $conn->prepare($checkSql);
$stmtCheck->bind_param("ss", $email, $nic);
$stmtCheck->execute();
$stmtCheck->store_result();

if ($stmtCheck->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Email or NIC already registered."]);
    $stmtCheck->close();
    $conn->close();
    exit;
}
$stmtCheck->close();

// Insert into database
$sql = "INSERT INTO user (fullName, email, nic, contactNumber, occupation, address, district, password)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssssss", $fullName, $email, $nic, $contactNumber, $occupation, $address, $district, $password);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "User registered successfully!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Registration failed: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
