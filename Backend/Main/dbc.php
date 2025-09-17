<?php
class DBconnector
{
    private static $instance = null;
    private $conn;

    private $host = "localhost";
    private $dbuser = "root";
    private $dbpass = "";
    private $dbname = "kindloop";

    private function __construct() {
        try {
            $this->conn = new mysqli($this->host, $this->dbuser, $this->dbpass, $this->dbname);

            if ($this->conn->connect_error) {
                throw new Exception("Connection failed: " . $this->conn->connect_error);
            }
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }

    private function __clone() {}
    
    public function __wakeup() {
    throw new Exception("Cannot unserialize a singleton.");
}

     public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new DBconnector();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->conn;
    }
}
