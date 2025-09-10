<?php
require_once 'dbc.php';


class User {
    private $conn;
    protected $email;
    protected $password;
    protected $nic;

    public function __construct() {
        $db = new DBconnector();
        $this->conn = $db->connect();
    }

    public function login($email, $password) {

        $this->email = $email;
        $this->password = $password;
        
        $sql = "SELECT * FROM user WHERE email = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        if ($user && password_verify($password, $user["password"])) {
            if($user["active_state"]=== "suspend"){
                return [
                    "status" => "error",
                    "message" => "Your account has been blocked due to inappropriate activities."
                ];
            } elseif ($user["active_state"] === "active") {
                return [
                    "status" => "success",
                    "message" => "Login successful",
                    "user" => [
                        "id" => $user["userID"],
                        "email" => $user["email"]
                    ]
                ];
            } else {
                return ["status" => "error", "message" => "Unknown account status."];
            }
        } else {
            return ["status" => "error", "message" => "Invalid email or password"];
        }
    }

     public function checkEmail($email) {
        $this->email = $email;

        $checkSql = "SELECT userID FROM user WHERE email = ?";
        $stmtCheck = $this->conn->prepare($checkSql);

        if (!$stmtCheck) {
            return ["status" => "error", "message" => "Database prepare failed: " . $this->conn->error];
        }

        $stmtCheck->bind_param("s", $email);
        $stmtCheck->execute();
        $stmtCheck->store_result();

        if ($stmtCheck->num_rows > 0) {
            $stmtCheck->close();
            return ["status" => "error", "message" => "Email is already registered."];
        }

        $stmtCheck->close();
        return ["status" => "success", "message" => "Email is available."];
    }
    
    public function checkcredentials($email, $nic) {
        $this->email = $email;
        $this->nic = $nic;

        $checkSql = "SELECT userID FROM user WHERE email = ? OR nic = ?";
        $stmtCheck = $this->conn->prepare($checkSql);
        $stmtCheck->bind_param("ss", $email, $nic);
        $stmtCheck->execute();
        $stmtCheck->store_result();

        if ($stmtCheck->num_rows > 0) {
            return ["status" => "error", "message" => "Email or NIC already registered."];
        }
        $stmtCheck->close();
        // return ["status" => "success", "message" => "Credentials are available."];
    }

    public function signup($fullName, $email, $nic, $contactNumber, $occupation, $address, $district, $password) {

        $sql = "INSERT INTO user (fullName, email, nic, contactNumber, occupation, address, district, password)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ssssssss", $fullName, $email, $nic, $contactNumber, $occupation, $address, $district, $password);

        if ($stmt->execute()) {
            return ["status" => "success", "message" => "User registered successfully!"];
        } else {
            return ["status" => "error", "message" => "Registration failed: " . $stmt->error];
        }
        
    }

public function getUser($id) {
        $stmt = $this->conn->prepare("SELECT userID AS id, fullName AS name, email, contactNumber, credit_points, occupation FROM user WHERE userID=?");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc() ?? null;
    }

     public function getDonor($id) {
        $stmt = $this->conn->prepare(
            "SELECT u.userID AS id, u.fullName AS name, u.email, u.occupation, u.contactNumber AS phone, u.credit_points,
            COUNT(d.DonationID) AS total_donations
            FROM user u
            LEFT JOIN donation d ON u.userID = d.userID
            WHERE u.userID = ?
            GROUP BY u.userID"
        );
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc() ?? null;
    }

    public function getCredits($userID) {
    $stmt = $this->conn->prepare("
        SELECT
            credit_points,
            year_points,
            current_year_requests,
            current_year_request_limit,
            registered_date,
            last_year_reset
        FROM user
        WHERE userID = ?
    ");
    $stmt->bind_param("i", $userID);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();

    if (!$user) {
        return ["status" => "error", "message" => "User not found"];
    }

    $today = new DateTime();

    if (!empty($user['last_year_reset'])) {
        $lastReset = new DateTime($user['last_year_reset']);
    } else {
        $lastReset = new DateTime($user['registered_date']);
    }

    $nextReset = clone $lastReset;
    $nextReset->modify('+1 year');
 
    $todayDate = $today->format('Y-m-d');
$nextResetDate = $nextReset->format('Y-m-d');

if ($todayDate >= $nextResetDate) {
        $prevYearPoints = (int)$user['year_points'];
        $newLimit =  floor($prevYearPoints / 100);

        $stmtUpdate = $this->conn->prepare("
            UPDATE user 
            SET year_points = 0, 
                current_year_requests = 0, 
                current_year_request_limit = ?, 
                last_year_reset = NOW()
            WHERE userID = ?
        ");
        $stmtUpdate->bind_param("ii", $newLimit, $userID);
        $stmtUpdate->execute();

        $user['year_points'] = 0;
        $user['current_year_requests'] = 0;
        $user['current_year_request_limit'] = $newLimit;
    }

    return [
        "status" => "success",
        "data" => [
            "credit_points" => (int)$user['credit_points'],
            "year_points" => (int)$user['year_points'],
            "current_year_requests" => (int)$user['current_year_requests'],
            "current_year_limit" => (int)$user['current_year_request_limit'] 
        ]
    ];
}


}
?>