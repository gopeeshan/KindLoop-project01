<?php
require_once 'dbc.php';

class Admin {
    private $conn;
    protected $email;
    protected $isVerified;
    protected $setVisible;
    protected $adminID;
    protected $userID;
    protected $active_state;
    protected $DonationID;
    protected $adminEmail;

    public function __construct() {
        $db = new DBconnector();
        $this->conn = $db->connect();
    }

    public function getUsers() {
        $sql = "SELECT u.userID, u.fullName, u.email, u.occupation, u.district, u.credit_points, u.active_state, COUNT(d.DonationID) AS donation_count
                FROM user u LEFT JOIN donation d ON u.userID = d.userID GROUP BY u.userID, u.fullName, u.email ORDER BY donation_count DESC";
        $userResult = $this->conn->query($sql);

        $users = [];
        if ($userResult->num_rows > 0) {
            while ($row = $userResult->fetch_assoc()) {
                $users[] = $row;
            }
        }
        return $users;
    }

    public function getDonations() {
        // $sql = "SELECT DonationID, title, userID, category, date_time, isVerified, isDonationCompleted FROM donation";
        $sql="SELECT donation.DonationID, donation.title, donation.userID, user.fullName AS userName,donation.description, donation.`condition`, 
                donation.category, donation.images, donation.date_time, donation.isVerified,donation.isDonationCompleted, donation.approvedBy ,
                donation.credits,donation.receiverID,donation.location,donation.setVisible
                FROM donation JOIN user ON donation.userID = user.userID";
        $donationResult = $this->conn->query($sql);
        $donations = [];
        if ($donationResult->num_rows > 0) {
            while ($row = $donationResult->fetch_assoc()) {
                $row['images'] = json_decode($row['images'] ?? '[]', true);
                if (!is_array($row['images'])) {
                    $row['images'] = [];
                }
                $donations[] = $row;
            }
        }
        return $donations;
    }

    public function showToBeVerified() {
        $sql = "SELECT donation.DonationID, donation.title, donation.userID, user.fullName AS userName, donation.`condition`, donation.category, donation.images, donation.date_time, donation.isVerified, donation.approvedBy 
                FROM donation JOIN user ON donation.userID = user.userID 
                WHERE donation.isVerified = 0 AND donation.setVisible = 1 ORDER BY date_time";
        $verificationResult = $this->conn->query($sql);

        $pendingVerifications = [];
        if ($verificationResult->num_rows > 0) {
            while ($row = $verificationResult->fetch_assoc()) {
                $row['images'] = json_decode($row['images'] ?? '[]', true);
                if (!is_array($row['images'])) {
                    $row['images'] = [];
                }
                $pendingVerifications[] = $row;
            }
        }
        return $pendingVerifications;
    }

    public function getAdminIDByEmail($email) {
        $this->email = $email;
        $stmt = $this->conn->prepare("SELECT AdminID FROM admin WHERE email = ?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            return $row['AdminID'];
        }
        return null;
    }

    public function verifyDonation($DonationID, $isVerified, $setVisible, $adminID) {
        $this->$DonationID = $DonationID;
        $this->isVerified = $isVerified;
        $this->setVisible = $setVisible;
        $this->adminID = $adminID;

        $stmt = $this->conn->prepare("UPDATE donation SET isVerified = ?, setVisible = ?, approvedBy = ? WHERE DonationID = ?");
        $stmt->bind_param("iiii", $isVerified, $setVisible, $adminID, $DonationID);
        return $stmt->execute();
    }

    public function logRejectedDonation($DonationID, $adminEmail,$adminID) {
        $this->DonationID = $DonationID;
        $this->adminEmail = $adminEmail;
        $this->adminID=$adminID;

        $logStmt = $this->conn->prepare("INSERT INTO rejecteditems (DonationID, rejectedBy) VALUES (?, ?)");
        $logStmt->bind_param("is", $DonationID, $adminEmail);
        
        if ($logStmt->execute()) {
                $stmt = $this->conn->prepare("UPDATE `donation` SET `isVerified` = 0, `setVisible` = 0, `approvedBy` = ? WHERE `DonationID` = ?");
                $stmt->bind_param("ii", $adminID, $DonationID);

                if ($stmt->execute()) {
                    return (["status" => "success", "message" => "Donation rejected"]);
                } else {
                    return (["status" => "error", "message" => "Failed to update donation"]);
                }
                $stmt->close();
            } else {
                $logStmt->close();
            }
    }

    public function updateUserStatus($userID, $active_state) {
        $this->userID = $userID;
        $this->active_state = $active_state;

        $stmt = $this->conn->prepare("UPDATE user SET active_state = ? WHERE userID = ?");
        $stmt->bind_param("si", $active_state, $userID);
        return $stmt->execute();
    }

    // public function removeDonation($DonationID) {
    //     $this->DonationID = $DonationID;
        
    //     $stmt = $this->conn->prepare("DELETE FROM donation WHERE DonationID = ?");
    //     $stmt->bind_param("i", $DonationID);
    //     return $stmt->execute();
    // }
}
?>