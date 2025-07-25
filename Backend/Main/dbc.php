<?php
class DBconnector{
    private $host="localhost";
    private $dbuser="root";
    private $dbpass="";
    private $dbname="kindloop";
    private $conn;

    public function connect() {
        $this->conn = new mysqli($this->host, $this->dbuser, $this->dbpass, $this->dbname);
        
        if ($this->conn->connect_error) {
            die(json_encode(["status" => "error", "message" => "Database connection failed: " . $this->conn->connect_error]));
        }
        return $this->conn;
    }
}