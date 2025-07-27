<?php

require_once 'dbc.php';

class Profile{
    private $conn;
    protected $email;
    protected $userID;
    protected $DonationID;

    public function __construct() {
        $db = new DBconnector();
        $this->conn = $db->connect();
    }

    public function getUserDetails($email) {
        $this->email = $email;
        $stmt = $this->conn->prepare("SELECT userID, fullName, email, contactNumber, occupation, address, credit_points FROM user WHERE email = ?");
        $stmt->bind_param("s", $email);
        if (!$stmt->execute()) {
            return ["error" => "Database error while fetching user."];
        }

        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();

        if (!$user) {
            return ["error" => "User not found."];
        }

        return $user;
        
    }

    public function getDonationHistory($userID) {
        $this->userID = $userID;
        $donationHistory = [];
        // $stmt = $this->conn->prepare("SELECT donation.DonationID, donation.title, donation.date_time, donation.category , donation.credits,

        // CASE
        //     WHEN donation.isDonationCompleted = 1 THEN 'Completed'
        //     ELSE 'Pending'
        // END AS status,

        // CASE
        //     WHEN donation.isVerified = 1 THEN 'Verified'
        //     ELSE 'Not Verified'
        // END AS verification
        
        // FROM donation
        // WHERE donation.userID = ?");
        $stmt= $this->conn->prepare("SELECT donation.DonationID, donation.title, donation.date_time, donation.category, donation.credits,donation.isDonationCompleted, donation.isVerified
                                    FROM donation
                                    WHERE donation.userID = ?");
        $stmt->bind_param("i", $userID);
        if ($stmt->execute()) {
            $donationHistory = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        }
        $stmt->close();
        return $donationHistory;
    }
    
    public function getReceivedHistory($userID) {
        $this->userID = $userID;
        $receivedHistory = [];
        $stmt = $this->conn->prepare("SELECT donation.DonationID, donation.title, donation.received_date, user.fullName AS donor
                                      FROM donation
                                      JOIN user ON donation.userID = user.userID
                                      WHERE donation.receiverID = ? AND donation.isDonationCompleted = 1");
        $stmt->bind_param("i", $userID);
        if ($stmt->execute()) {
            $receivedHistory = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        }
        $stmt->close();
        return $receivedHistory;
    }

    public function getToBeReceivedItems($userID) {
        $this->userID = $userID;
        $toBeReceived = [];
        $stmt = $this->conn->prepare("SELECT donation.DonationID, donation.title, donation.date_time AS requestDate, donation.category, user.fullName AS donor, user.contactNumber AS donorContact
                                      FROM donation
                                      JOIN user ON donation.userID = user.userID
                                      WHERE donation.receiverID = ? AND donation.isDonationCompleted = 0");
        $stmt->bind_param("i", $userID);
        if ($stmt->execute()) {
            $toBeReceived = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        }
        $stmt->close();
        return $toBeReceived;
    }
    public function confirmReceived($DonationID) {
        $this->DonationID = $DonationID;
        $stmt = $this->conn->prepare("UPDATE donation SET isDonationCompleted = 1 WHERE DonationID = ?");
        $stmt->bind_param("i", $this->DonationID);
        if ($stmt->execute()) {
            return ["success" => true];
        } else {
            return ["error" => "Failed to confirm receipt."];
        }
    }

    public function updateUserInfo($userID, $fullName, $contactNumber, $occupation, $address) {
        $stmt = $this->conn->prepare("UPDATE user SET fullName = ?, contactNumber = ?, occupation = ?, address = ? WHERE userID = ?");
        $stmt->bind_param("ssssi", $fullName, $contactNumber, $occupation, $address, $userID);

        if ($stmt->execute()) {
            return ["status" => "success", "message" => "User information updated successfully."];
        } else {
            return ["status" => "error", "message" => "Failed to update user information."];
        }
    }

    public function changePassword($email, $currentPassword, $newPassword) {
    $stmt = $this->conn->prepare("SELECT password FROM user WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $stmt->close();

    if ($result->num_rows === 0) {
        return ["status" => "error", "message" => "User not found."];
    }

    $row = $result->fetch_assoc();
    $hashedPassword = $row['password'];

    if (!password_verify($currentPassword, $hashedPassword)) {
        return ["status" => "error", "message" => "Current password is incorrect."];
    }

    $newHashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    $updateStmt = $this->conn->prepare("UPDATE user SET password = ? WHERE email = ?");
    $updateStmt->bind_param("ss", $newHashedPassword, $email);

    if ($updateStmt->execute()) {
        return ["status" => "success", "message" => "Password updated successfully."];
    } else {
        return ["status" => "error", "message" => "Failed to update password."];
    }
}

}
