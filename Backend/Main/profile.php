<?php

require_once 'dbc.php';

class Profile
{
    private $conn;
    protected $email;
    protected $userID;
    protected $DonationID;

    public function __construct()
    {
        $db = new DBconnector();
        $this->conn = $db->connect();
    }

    public function getUserDetails($email)
    {
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

    // public function getDonationHistory($userID) {
    //     $this->userID = $userID;
    //     $donationHistory = [];

    //     $stmt= $this->conn->prepare("SELECT donation.DonationID, donation.title, donation.date_time, donation.category, donation.credits,donation.isDonationCompleted, donation.isVerified
    //                                 FROM donation
    //                                 WHERE donation.userID = ?");
    //     $stmt->bind_param("i", $userID);
    //     if ($stmt->execute()) {
    //         $donationHistory = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    //     }
    //     $stmt->close();
    //     return $donationHistory;
    // }
    public function getUserDonations($userID)
    {
        $sql = "SELECT DonationID, title, category, date_time, credits, isDonationCompleted, isVerified
            FROM donation
            WHERE userID = ?
            ORDER BY date_time DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $userID);

        $donations = [];
        if ($stmt->execute()) {
            $donations = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        }

        $stmt->close();
        return $donations;
    }


    public function getReceivedHistory($userID)
    {
        $this->userID = $userID;
        $receivedHistory = [];
        $stmt = $this->conn->prepare("SELECT 
                d.DonationID, 
                d.title, 
                d.date_time AS requestDate, 
                d.category, 
                u.fullName AS donor, 
                u.contactNumber AS donorContact,
                ri.quantity,
                ri.received_date
            FROM receive_items ri
            JOIN donation d ON ri.donationID = d.DonationID
            JOIN user u ON ri.donorID = u.userID
            WHERE ri.receiverID = ? 
              AND d.isDonationCompleted = 1
            ORDER BY ri.received_date DESC");
        $stmt->bind_param("i", $userID);
        if ($stmt->execute()) {
            $receivedHistory = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        }
        $stmt->close();
        return $receivedHistory;
    }

    public function getToBeReceivedItems($userID)
    {
        $this->userID = $userID;
        $toBeReceived = [];

        $query = "SELECT 
                d.DonationID,
                d.title,
                d.category,
                d.credits,
                u.userID AS donorID,
                u.fullName AS donor,
                u.contactNumber AS donorContact,
                ri.quantity,
                ri.received_date,
                dr.status AS request_status
              FROM receive_items ri
              JOIN donation d ON ri.donationID = d.DonationID
              JOIN user u ON ri.donorID = u.userID
              JOIN donation_requests dr 
                   ON dr.donationID = d.DonationID
                  AND dr.userID = ri.receiverID
              WHERE ri.receiverID = ?
                AND ri.status = 'pending' 
                AND dr.status = 'selected'
              ORDER BY ri.received_date DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $userID);

        if ($stmt->execute()) {
            $toBeReceived = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        }

        $stmt->close();
        return $toBeReceived;
    }

    public function confirmReceived($DonationID, $receiverID)
    {
        $this->DonationID = $DonationID;
        $stmt = $this->conn->prepare("UPDATE donation SET isDonationCompleted = 1 WHERE DonationID = ?");
        $stmt->bind_param("i", $this->DonationID);
        if ($stmt->execute()) {
            if ($this->credits_update($this->DonationID, $receiverID)['success']) {
                return ["success" => true];
            }
            
        } else {
            return ["error" => "Failed to confirm receipt."];
        }
    }
    public function credits_update($DonationID, $receiverID)
{
    $sql = "UPDATE user u
            JOIN receive_items ri ON u.userID = ri.donorID
            JOIN donation d ON d.DonationID = ri.donationID AND ri.receiverID = ?
            SET u.credit_points = u.credit_points + (ri.quantity * d.credits)
            WHERE d.DonationID = ?";

    $stmt = $this->conn->prepare($sql);
    $stmt->bind_param("ii", $receiverID, $DonationID);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            return ['success' => true, 'message' => 'Credits updated successfully'];
        } else {
            return ['success' => false, 'message' => 'No rows updated (maybe not received yet)'];
        }
    } else {
        return ['success' => false, 'message' => 'Database error', 'error' => $stmt->error];
    }
}





    public function updateUserInfo($userID, $fullName, $contactNumber, $occupation, $address)
    {
        $stmt = $this->conn->prepare("UPDATE user SET fullName = ?, contactNumber = ?, occupation = ?, address = ? WHERE userID = ?");
        $stmt->bind_param("ssssi", $fullName, $contactNumber, $occupation, $address, $userID);

        if ($stmt->execute()) {
            return ["status" => "success", "message" => "User information updated successfully."];
        } else {
            return ["status" => "error", "message" => "Failed to update user information."];
        }
    }

    public function changePassword($email, $currentPassword, $newPassword)
    {
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

    public function viewDonationDetails($donationId)
    {
        $stmt = $this->conn->prepare("SELECT d.*, u.fullName as donor 
                                        FROM donation d 
                                        JOIN user u ON d.userID = u.userID 
                                        WHERE d.DonationID = ?");
        $stmt->bind_param("i", $donationId);
        $stmt->execute();

        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $donation = $result->fetch_assoc();
            $donation['images'] = json_decode($donation['images'] ?? '[]');
            return $donation;
        } else {
            $stmt->close();
            return ["error" => "Donation not found"];
        }
    }
}
