<?php
require_once 'dbc.php';

class CheckEmailExists {
    private $conn;
    protected $email;

    public function __construct() {
        $db = new DBconnector();
        $this->conn = $db->connect();
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
}
