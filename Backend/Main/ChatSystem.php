<?php
class ChatSystem {
    private $conn;

        public function __construct() {
            $db= new DBconnector();
            $this->conn = $db->connect();
        }

    /** ------------------------------
     *  Core Messaging Functions
     *  ------------------------------ */

    // Send a new message
    public function sendMessage($senderID, $receiverID, $message, $donationID = null) {
        $sql = "INSERT INTO messages (senderID, receiverID, donationID, message) 
                VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$senderID, $receiverID, $donationID, $message]);
    }

    // Get all messages between two users (chat history)
    public function getConversation($user1, $user2) {
        $sql = "SELECT * FROM messages 
                WHERE (senderID = ? AND receiverID = ?) 
                   OR (senderID = ? AND receiverID = ?) 
                ORDER BY timestamp ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$user1, $user2, $user2, $user1]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Mark messages as read
    public function markAsRead($receiverID, $senderID) {
        $sql = "UPDATE messages 
                SET is_read = 1 
                WHERE receiverID = ? AND senderID = ? AND is_read = 0";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$receiverID, $senderID]);
    }

    // Get unread messages count for a user
    public function getUnreadCount($userID) {
        $sql = "SELECT senderID, COUNT(*) as unreadCount 
                FROM messages 
                WHERE receiverID = ? AND is_read = 0 
                GROUP BY senderID";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$userID]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** ------------------------------
     *  Conversation Management
     *  ------------------------------ */

    // Get latest chats (like inbox list)
    public function getLatestChats($userID) {
        $sql = "SELECT m.* 
                FROM messages m
                INNER JOIN (
                    SELECT 
                        CASE WHEN senderID = ? THEN receiverID ELSE senderID END as chatUser,
                        MAX(timestamp) as lastMsgTime
                    FROM messages
                    WHERE senderID = ? OR receiverID = ?
                    GROUP BY chatUser
                ) t ON (
                    (m.senderID = ? AND m.receiverID = t.chatUser) 
                    OR (m.senderID = t.chatUser AND m.receiverID = ?)
                ) AND m.timestamp = t.lastMsgTime
                ORDER BY m.timestamp DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$userID, $userID, $userID, $userID, $userID]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Search messages
    public function searchMessages($userID, $keyword) {
        $sql = "SELECT * FROM messages 
                WHERE (senderID = ? OR receiverID = ?)
                AND message LIKE ?
                ORDER BY timestamp DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$userID, $userID, "%$keyword%"]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /** ------------------------------
     *  Message Controls
     *  ------------------------------ */

    // Delete a message
    public function deleteMessage($messageID, $userID) {
        $sql = "DELETE FROM messages 
                WHERE messageID = ? AND senderID = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$messageID, $userID]);
    }

    // Edit a message (optional, within 15 min)
    public function editMessage($messageID, $userID, $newMessage) {
        $sql = "UPDATE messages 
                SET message = ? 
                WHERE messageID = ? AND senderID = ? 
                AND timestamp >= (NOW() - INTERVAL 15 MINUTE)";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$newMessage, $messageID, $userID]);
    }

    /** ------------------------------
     *  Helper Functions
     *  ------------------------------ */

    // Get typing indicator (pseudo-implementation)
    public function setTypingStatus($senderID, $receiverID, $status = true) {
        // This normally requires WebSocket or AJAX
        // You could save it in a separate table or cache (Redis)
        return [
            "senderID" => $senderID,
            "receiverID" => $receiverID,
            "typing" => $status
        ];
    }

}
?>
