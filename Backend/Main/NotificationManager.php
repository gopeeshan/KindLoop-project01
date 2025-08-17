<?php
require_once 'dbc.php';

class NotificationManager {
    private $conn;

    public function __construct() {
        $db = new DBconnector();
        $this->conn = $db->connect();
    }

    public function send($userId, $fromUserId, $type, $donationId = null, $complaintId = null) {
        $sql = "INSERT INTO notifications 
                (userID, from_userID, type, donationID, complaintID) 
                VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("iisii", $userId, $fromUserId, $type, $donationId, $complaintId);
        return $stmt->execute();
    }

    public function getUserNotifications($userId) {
        $sql = "SELECT
                    n.notificationID,
                    n.type,
                    n.created_at,
                    n.is_read,
                    d.Title AS donation_title,
                    u.fullName AS requester_name
                FROM notifications n
                LEFT JOIN donation d ON n.donationID = d.DonationID
                LEFT JOIN user u ON n.from_userID = u.userID
                WHERE n.userID = ? && n.is_read = 0
                ORDER BY n.created_at DESC";

        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
    }

    public function markAsRead($notificationId) {
        $sql = "UPDATE notifications SET is_read = 1 WHERE notificationID = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $notificationId);
        return $stmt->execute();
    }
}
