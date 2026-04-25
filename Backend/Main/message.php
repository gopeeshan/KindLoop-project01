<?php
require_once 'dbc.php';

class Message {
    private $conn;

    public function __construct() {
        $this->conn = DBconnector::getInstance()->getConnection();
    }

    public function getConversation($userA, $userB) {
        $sql = "SELECT m.*, u.username AS senderName 
                FROM messages m
                JOIN user u ON m.senderID = u.userID
                WHERE (m.senderID = ? AND m.receiverID = ?)
                   OR (m.senderID = ? AND m.receiverID = ?)
                ORDER BY m.timestamp ASC";

        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("iiii", $userA, $userB, $userB, $userA);
        $stmt->execute();
        $result = $stmt->get_result();

        $messages = [];
        while ($row = $result->fetch_assoc()) {
            $messages[] = $row;
        }
        return $messages;
    }
}
