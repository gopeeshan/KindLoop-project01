<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type");


$conn = new mysqli("localhost", "root", "", "kindloop");

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error]));
}
$sql_01 = "SELECT u.userID, u.fullName, u.email, u.occupation, u.district, u.credit_points, u.active_state, COUNT(d.DonationID) AS donation_count
FROM user u LEFT JOIN donation d ON u.userID = d.userID GROUP BY u.userID, u.fullName, u.email ORDER BY donation_count DESC";
$userResult = $conn->query($sql_01);

$users = [];
if ($userResult->num_rows > 0) {
    while ($row = $userResult->fetch_assoc()) {
        $users[] = $row;
    }
}
$sql_02 = "SELECT DonationID,title,userID,category,date_time,isVerified,isDonationCompleted  FROM donation";
$donationResult = $conn->query($sql_02);

$donations = [];
if ($donationResult->num_rows > 0) {
    while ($row = $donationResult->fetch_assoc()) {
        $donations[] = $row;
    }
}

$pendingVerifications = [];
$verificationResult = $conn->query("SELECT donation.DonationID,donation.title,donation.userID,user.fullName AS userName,donation.`condition`,donation.category,donation.images,donation.date_time,donation.isVerified,donation.approvedBy FROM donation JOIN user ON donation.userID = user.userID WHERE donation.isVerified = 0 && donation.setVisible = 1 ORDER BY date_time");
if ($verificationResult->num_rows > 0) {
    while ($row = $verificationResult->fetch_assoc()) {
        $row['images'] = json_decode($row['images'] ?? '[]', true);
        if (!is_array($row['images'])) {
            $row['images'] = [];
        }
        $pendingVerifications[] = $row;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $action = $input['action'] ?? '';
    $DonationID = $input['DonationID'] ?? null;
    $isVerified = $input['isVerified'] ?? null;
    $setVisible = $input['setVisible'] ?? null;
    $adminEmail = $input['adminEmail'] ?? 'unknown';
    $userID = $input['userID'] ?? null;
    $active_state = $input['active_state'] ?? null;



    if ($action === 'verify_donation' && $DonationID !== null && $isVerified !== null && $setVisible !== null) {
    
    $adminStmt = $conn->prepare("SELECT AdminID FROM admin WHERE email = ?");
    $adminStmt->bind_param("s", $adminEmail);
    $adminStmt->execute();
    $adminResult = $adminStmt->get_result();

    if ($adminRow = $adminResult->fetch_assoc()) {
        $adminID = $adminRow['AdminID'];

        if ($isVerified == 1) {
            $stmt = $conn->prepare("UPDATE `donation` SET `isVerified` = 1, `setVisible` = 1, `approvedBy` = ? WHERE `DonationID` = ?");
            $stmt->bind_param("ii", $adminID, $DonationID);

            if ($stmt->execute()) {
                echo json_encode(["status" => "success", "message" => "Donation approved"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to update donation", "error" => $stmt->error]);
            }
            $stmt->close();
        } if ($isVerified == 0) {
            $logStmt = $conn->prepare("INSERT INTO `rejecteditems`(`DonationID`, `rejectedBy`) VALUES (?, ?)");
            $logStmt->bind_param("is", $DonationID, $adminEmail);

            if ($logStmt->execute()) {
                $stmt = $conn->prepare("UPDATE `donation` SET `isVerified` = 0, `setVisible` = 0, `approvedBy` = ? WHERE `DonationID` = ?");
                $stmt->bind_param("ii", $adminID, $DonationID);

                if ($stmt->execute()) {
                    echo json_encode(["status" => "success", "message" => "Donation rejected"]);
                } else {
                    echo json_encode(["status" => "error", "message" => "Failed to update donation"]);
                }
                $stmt->close();
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to log rejected donation"]);
            }
            $logStmt->close();
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid isVerified value"]);
        }

    } else {
        echo json_encode(["status" => "error", "message" => "Admin email not found"]);
    }

    $adminStmt->close();
    exit;
} elseif($action === 'user_action' && $userID !== null && $active_state !== null) {
    $stmt = $conn->prepare("UPDATE `user` SET `active_state` = ? WHERE `userID` = ?");
    $stmt->bind_param("si", $active_state, $userID);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "User status updated"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to update user status", "error" => $stmt->error]);
            
        }

        $stmt->close();
        exit;
} elseif ($action === 'remove_donation' && $DonationID !== null) {
    $stmt = $conn->prepare("DELETE FROM `donation` WHERE `DonationID` = ?");
    $stmt->bind_param("i", $DonationID);
    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Donation deleted"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to delete donation", "error" => $stmt->error]);
    }
    $stmt->close();
    exit;
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request"]);
    exit;
}
}



echo json_encode([
    "status" => "success",
    "users" => $users,
    "donations" => $donations,
    "pendingVerifications" => $pendingVerifications
]);

$conn->close();
