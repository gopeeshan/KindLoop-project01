<?php
require_once 'dbc.php';

class ChatSystem {
    private $conn;
    private $lastError = '';

    public function __construct() {
        $db = new DBconnector();
        $this->conn = $db->connect(); // mysqli connection
    }

    public function getLastError(): string {
        return $this->lastError;
    }

    private function setError(string $msg) {
        $this->lastError = $msg;
    }

    // Send a new message
    public function sendMessage($senderID, $receiverID, $message, $donationID = null) {
        $sql = "INSERT INTO `messages` (`senderID`, `receiverID`, `donationID`, `message`)
                VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            $this->setError("Prepare failed: " . $this->conn->error);
            return false;
        }

        $senderID   = (int)$senderID;
        $receiverID = (int)$receiverID;
        if ($donationID === '' || $donationID === null) {
            $donationID = null;
        } else {
            $donationID = (int)$donationID;
        }
        $message = (string)$message;

        if (!$stmt->bind_param("iiis", $senderID, $receiverID, $donationID, $message)) {
            $this->setError("Bind failed: " . $stmt->error);
            return false;
        }
        if (!$stmt->execute()) {
            $this->setError("Execute failed: " . $stmt->error);
            return false;
        }
        return $stmt->affected_rows > 0;
    }

    // Get all messages between two users (chat history)
    public function getConversation($user1, $user2) {
        $sql = "SELECT * FROM `messages`
                WHERE (`senderID` = ? AND `receiverID` = ?)
                   OR (`senderID` = ? AND `receiverID` = ?)
                ORDER BY `timestamp` ASC";
        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            $this->setError("Prepare failed: " . $this->conn->error);
            return [];
        }
        $u1 = (int)$user1;
        $u2 = (int)$user2;
        if (!$stmt->bind_param("iiii", $u1, $u2, $u2, $u1)) {
            $this->setError("Bind failed: " . $stmt->error);
            return [];
        }
        if (!$stmt->execute()) {
            $this->setError("Execute failed: " . $stmt->error);
            return [];
        }
        $res = $stmt->get_result();
        return $res ? $res->fetch_all(MYSQLI_ASSOC) : [];
    }

    // Mark messages as read
    public function markAsRead($receiverID, $senderID) {
        $sql = "UPDATE `messages`
                SET `is_read` = 1
                WHERE `receiverID` = ? AND `senderID` = ? AND `is_read` = 0";
        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            $this->setError("Prepare failed: " . $this->conn->error);
            return false;
        }
        $r = (int)$receiverID;
        $s = (int)$senderID;
        if (!$stmt->bind_param("ii", $r, $s)) {
            $this->setError("Bind failed: " . $stmt->error);
            return false;
        }
        if (!$stmt->execute()) {
            $this->setError("Execute failed: " . $stmt->error);
            return false;
        }
        return true;
    }

    // Get unread messages count for a user
    public function getUnreadCount($userID) {
        $sql = "SELECT `senderID`, COUNT(*) as `unreadCount`
                FROM `messages`
                WHERE `receiverID` = ? AND `is_read` = 0 
                GROUP BY `senderID`";
        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            $this->setError("Prepare failed: " . $this->conn->error);
            return [];
        }
        $uid = (int)$userID;
        if (!$stmt->bind_param("i", $uid)) {
            $this->setError("Bind failed: " . $stmt->error);
            return [];
        }
        if (!$stmt->execute()) {
            $this->setError("Execute failed: " . $stmt->error);
            return [];
        }
        $res = $stmt->get_result();
        return $res ? $res->fetch_all(MYSQLI_ASSOC) : [];
    }

    // Get latest chats (inbox list)
    public function getLatestChats($userID) {
        $sql = "SELECT m.*
                FROM `messages` m
                INNER JOIN (
                    SELECT 
                        CASE WHEN `senderID` = ? THEN `receiverID` ELSE `senderID` END as chatUser,
                        MAX(`timestamp`) as lastMsgTime
                    FROM `messages`
                    WHERE `senderID` = ? OR `receiverID` = ?
                    GROUP BY chatUser
                ) t ON (
                    (m.`senderID` = ? AND m.`receiverID` = t.chatUser) 
                    OR (m.`senderID` = t.chatUser AND m.`receiverID` = ?)
                ) AND m.`timestamp` = t.lastMsgTime
                ORDER BY m.`timestamp` DESC";
        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            $this->setError("Prepare failed: " . $this->conn->error);
            return [];
        }
        $uid = (int)$userID;
        if (!$stmt->bind_param("iiiii", $uid, $uid, $uid, $uid, $uid)) {
            $this->setError("Bind failed: " . $stmt->error);
            return [];
        }
        if (!$stmt->execute()) {
            $this->setError("Execute failed: " . $stmt->error);
            return [];
        }
        $res = $stmt->get_result();
        return $res ? $res->fetch_all(MYSQLI_ASSOC) : [];
    }

    // Search messages
    public function searchMessages($userID, $keyword) {
        $sql = "SELECT * FROM `messages`
                WHERE (`senderID` = ? OR `receiverID` = ?)
                  AND `message` LIKE ?
                ORDER BY `timestamp` DESC";
        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            $this->setError("Prepare failed: " . $this->conn->error);
            return [];
        }
        $uid = (int)$userID;
        $like = '%' . $keyword . '%';
        if (!$stmt->bind_param("iis", $uid, $uid, $like)) {
            $this->setError("Bind failed: " . $stmt->error);
            return [];
        }
        if (!$stmt->execute()) {
            $this->setError("Execute failed: " . $stmt->error);
            return [];
        }
        $res = $stmt->get_result();
        return $res ? $res->fetch_all(MYSQLI_ASSOC) : [];
    }

    // Delete a message
    public function deleteMessage($messageID, $userID) {
        $sql = "DELETE FROM `messages` WHERE `messageID` = ? AND `senderID` = ?";
        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            $this->setError("Prepare failed: " . $this->conn->error);
            return false;
        }
        $mid = (int)$messageID;
        $uid = (int)$userID;
        if (!$stmt->bind_param("ii", $mid, $uid)) {
            $this->setError("Bind failed: " . $stmt->error);
            return false;
        }
        if (!$stmt->execute()) {
            $this->setError("Execute failed: " . $stmt->error);
            return false;
        }
        return true;
    }

    // Edit a message (within 15 min)
    public function editMessage($messageID, $userID, $newMessage) {
        $sql = "UPDATE `messages`
                SET `message` = ?
                WHERE `messageID` = ? AND `senderID` = ?
                  AND `timestamp` >= (NOW() - INTERVAL 15 MINUTE)";
        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            $this->setError("Prepare failed: " . $this->conn->error);
            return false;
        }
        $mid = (int)$messageID;
        $uid = (int)$userID;
        $msg = (string)$newMessage;
        if (!$stmt->bind_param("sii", $msg, $mid, $uid)) {
            $this->setError("Bind failed: " . $stmt->error);
            return false;
        }
        if (!$stmt->execute()) {
            $this->setError("Execute failed: " . $stmt->error);
            return false;
        }
        return true;
    }
}