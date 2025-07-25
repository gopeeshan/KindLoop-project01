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
}
?>