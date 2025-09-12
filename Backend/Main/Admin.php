<?php
require_once 'dbc.php';

class Admin {
   private $conn;
    protected $email;
    protected $password;
    protected $AdminID;
    protected $userID;
    protected $active_state;
    protected $AdminActive_state;
    protected $DonationID;
    protected $isVerified;
    protected $setVisible;
   

    public function __construct() {
        $db = new DBconnector();
        $this->conn = $db->connect();
    }

  public function login($email, $password) {

        $this->email  = $email;
        $this->password = $password;
        
        $sql = "SELECT * FROM admin WHERE email = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $admin = $result->fetch_assoc();

if (!$admin) {
        return [
            "status" => "error",
            "message" => "Invalid email or password"
        ];
    }

    if ($admin["active_state"] !== "active") {
        return [
            "status" => "error",
            "message" => "Your account is suspended. Contact super admin."
        ];
    }
    
 if (password_verify($password, $admin["password"])) {
        return [
            "status" => "success",
            "message" => "Admin login successful",
            "admin" => [
                "AdminID"    => $admin["AdminID"],
                "email" => $admin["email"],
                "role"  => $admin["role"]
            ]
        ];
    } else {
        return [
            "status" => "error",
            "message" => "Invalid email or password"
        ];
    }
}

public function checkcredentials($email, $nic) {
        $this->email = $email;
        $this->nic = $nic;

        $checkSql = "SELECT AdminID FROM admin WHERE email = ? OR nic = ?";
        $stmtCheck = $this->conn->prepare($checkSql);
        $stmtCheck->bind_param("ss", $email, $nic);
        $stmtCheck->execute();
        $stmtCheck->store_result();

        if ($stmtCheck->num_rows > 0) {
            return ["status" => "error", "message" => "Email or NIC already registered."];
        }
        $stmtCheck->close();
        return ["status" => "success"];
    }

    public function signup($fullName, $email, $nic, $contactNumber, $address, $password) {
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $sql = "INSERT INTO admin (fullName, email, nic, contactNumber, address, password)
            VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $this->conn->prepare($sql);
    $stmt->bind_param("ssssss", $fullName, $email, $nic, $contactNumber, $address, $passwordHash);

    if ($stmt->execute()) {
        return ["status" => "success", "message" => "Admin registered successfully!"];
    } else {
        return ["status" => "error", "message" => "Registration failed: " . $stmt->error];
    }
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
                donation.credits,donation.location,donation.setVisible,donation.usageDuration
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

    public function verifyDonation($DonationID, $isVerified, $setVisible, $AdminID) {
        $this->DonationID = $DonationID;
        $this->isVerified = $isVerified;
        $this->setVisible = $setVisible;
        $this->AdminID = $AdminID;

        $stmt = $this->conn->prepare("UPDATE donation SET isVerified = ?, setVisible = ?, approvedBy = ? WHERE DonationID = ?");
        $stmt->bind_param("iiii", $isVerified, $setVisible, $AdminID, $DonationID);
        return $stmt->execute();
    }

    public function logRejectedDonation($DonationID,$AdminID) {
        $this->DonationID = $DonationID;
        // $this->adminEmail = $adminEmail;
        $this->AdminID=$AdminID;

        $logStmt = $this->conn->prepare("INSERT INTO rejecteditems (DonationID, rejectedBy) VALUES (?, ?)");
        $logStmt->bind_param("ii", $DonationID, $AdminID);
       if ($logStmt->execute()) {
    $stmt = $this->conn->prepare("UPDATE `donation` SET `isVerified` = 0, `setVisible` = 0, `approvedBy` = ? WHERE `DonationID` = ?");
    $stmt->bind_param("ii", $AdminID, $DonationID);

    $success = $stmt->execute();
    $stmt->close();
    $logStmt->close();

    if ($success) {
        return ["status" => "success", "message" => "Donation rejected"];
    } else {
        return ["status" => "error", "message" => "Failed to update donation"];
    }
} else {
    $logStmt->close();
    return ["status" => "error", "message" => "Failed to log rejected donation"];
}

    }

    public function updateUserStatus($userID, $active_state) {
        $stmt = $this->conn->prepare("UPDATE user SET active_state = ? WHERE userID = ?");
        $stmt->bind_param("si", $active_state, $userID);
        return $stmt->execute();
    }

    public function getAdmins() {
    $sql = "SELECT AdminID, fullName, email, nic, contactNumber, address,joined_at AS joined_date, active_state AS Admin_status
            FROM admin where role='subadmin' ORDER BY joined_at ";
    $adminResult = $this->conn->query($sql);

    $admins = [];
    if ($adminResult->num_rows > 0) {
        while ($row = $adminResult->fetch_assoc()) {
            $admins[] = $row;
        }
    }
    return $admins;
}


    public function updateAdminStatus($AdminID, $AdminActive_state) {
        $stmt = $this->conn->prepare("UPDATE admin SET active_state = ? WHERE AdminID = ?");
        $stmt->bind_param("si", $AdminActive_state, $AdminID);
        return $stmt->execute();
    }

    public function updateAdminDetails($AdminID, $fullName, $email, $contactNumber, $address) {
        
    $stmt = $this->conn->prepare("UPDATE admin SET fullName = ?, email = ?, contactNumber = ?, address = ? WHERE AdminID = ?");
    $stmt->bind_param("ssssi", $fullName, $email, $contactNumber, $address, $AdminID);

    if ($stmt->execute()) {
        return true;
    } else {
        return false;
    }
}


   
}
?>