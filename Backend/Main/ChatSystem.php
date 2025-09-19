<?php
require_once 'dbc.php';

class ChatSystem {
    private $conn;
    private $lastError = '';
    private $columnCache = [];

    public function __construct() {
        $this->conn = DBconnector::getInstance()->getConnection();
    }

    public function getLastError(): string {
        return $this->lastError;
    }

    private function setError(string $msg) {
        $this->lastError = $msg;
    }

    private function columnExists(string $table, string $column): bool {
        $key = $table . '.' . $column;
        if (array_key_exists($key, $this->columnCache)) {
            return $this->columnCache[$key];
        }
        $sql = "SELECT 1
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = ?
                  AND COLUMN_NAME = ?
                LIMIT 1";
        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            // Assume non-existence on error
            $this->columnCache[$key] = false;
            return false;
        }
        $stmt->bind_param("ss", $table, $column);
        if (!$stmt->execute()) {
            $this->columnCache[$key] = false;
            return false;
        }
        $res = $stmt->get_result();
        $exists = $res && $res->num_rows > 0;
        $this->columnCache[$key] = $exists;
        return $exists;
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
        $donationID = ($donationID === '' || $donationID === null) ? null : (int)$donationID;
        $message    = (string)$message;

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

    // Get all messages between two users (chat history), optionally scoped to a donation
    public function getConversation($user1, $user2, $donationID = null) {
        $hasIsDeleted = $this->columnExists('messages', 'is_deleted');

        $sql = "SELECT * FROM `messages`
                WHERE (
                    (`senderID` = ? AND `receiverID` = ?)
                    OR (`senderID` = ? AND `receiverID` = ?)
                )";

        if ($donationID !== null) {
            $sql .= " AND `donationID` = ?";
        }

        if ($hasIsDeleted) {
            $sql .= " AND `is_deleted` = 0";
        }

        $sql .= " ORDER BY `timestamp` ASC";

        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            $this->setError("Prepare failed: " . $this->conn->error);
            return [];
        }

        $u1 = (int)$user1;
        $u2 = (int)$user2;

        if ($donationID !== null) {
            if (!$stmt->bind_param("iiiii", $u1, $u2, $u2, $u1, $donationID)) {
                $this->setError("Bind failed: " . $stmt->error);
                return [];
            }
        } else {
            if (!$stmt->bind_param("iiii", $u1, $u2, $u2, $u1)) {
                $this->setError("Bind failed: " . $stmt->error);
                return [];
            }
        }

        if (!$stmt->execute()) {
            $this->setError("Execute failed: " . $stmt->error);
            return [];
        }

        $res = $stmt->get_result();
        return $res ? $res->fetch_all(MYSQLI_ASSOC) : [];
    }

    // Mark messages as read (for a specific donation or all donations between users)
    public function markAsRead($receiverID, $senderID, $donationID = null) {
        $sql = "UPDATE `messages`
                SET `is_read` = 1
                WHERE `receiverID` = ? AND `senderID` = ? AND `is_read` = 0";

        if ($donationID !== null) {
            $sql .= " AND `donationID` = ?";
        }

        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            $this->setError("Prepare failed: " . $this->conn->error);
            return false;
        }

        $r = (int)$receiverID;
        $s = (int)$senderID;

        if ($donationID !== null) {
            $d = (int)$donationID;
            if (!$stmt->bind_param("iii", $r, $s, $d)) {
                $this->setError("Bind failed: " . $stmt->error);
                return false;
            }
        } else {
            if (!$stmt->bind_param("ii", $r, $s)) {
                $this->setError("Bind failed: " . $stmt->error);
                return false;
            }
        }

        if (!$stmt->execute()) {
            $this->setError("Execute failed: " . $stmt->error);
            return false;
        }

        return true;
    }

    // Get unread messages count for a user (grouped by sender)
    public function getUnreadCount($userID) {
        $hasIsDeleted = $this->columnExists('messages', 'is_deleted');

        $sql = "SELECT `senderID`, COUNT(*) as `unreadCount`
                FROM `messages`
                WHERE `receiverID` = ? AND `is_read` = 0";

        if ($hasIsDeleted) {
            $sql .= " AND `is_deleted` = 0";
        }

        $sql .= " GROUP BY `senderID`";

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

    // Get latest chats (one chat per user pair, ignoring multiple donations)
    public function getLatestChats($userID) {
        $hasIsDeleted = $this->columnExists('messages', 'is_deleted');

        // We want "last non-deleted" message per peer
        $whereVisible = $hasIsDeleted ? " AND is_deleted = 0 " : " ";

        $sql = "SELECT
                    m.*,
                    CASE WHEN m.senderID = ? THEN m.receiverID ELSE m.senderID END AS otherUserID,
                    u.fullName AS otherUserName,
                    COALESCE(uc.unread, 0) AS unread
                FROM messages m
                INNER JOIN (
                    SELECT 
                        CASE WHEN senderID = ? THEN receiverID ELSE senderID END AS chatUser,
                        MAX(timestamp) AS lastMsgTime
                    FROM messages
                    WHERE (senderID = ? OR receiverID = ?)"
                    . $whereVisible .
                    "GROUP BY chatUser
                ) t ON (
                        (m.senderID = ? AND m.receiverID = t.chatUser)
                        OR
                        (m.senderID = t.chatUser AND m.receiverID = ?)
                    )
                    AND m.timestamp = t.lastMsgTime
                LEFT JOIN (
                    SELECT 
                        CASE WHEN senderID = ? THEN receiverID ELSE senderID END AS chatUser,
                        COUNT(*) AS unread
                    FROM messages
                    WHERE receiverID = ? AND is_read = 0"
                    . $whereVisible .
                    "GROUP BY chatUser
                ) uc ON uc.chatUser = CASE WHEN m.senderID = ? THEN m.receiverID ELSE m.senderID END
                LEFT JOIN user u ON u.userID = CASE WHEN m.senderID = ? THEN m.receiverID ELSE m.senderID END
                ORDER BY m.timestamp DESC";

        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            $this->setError("Prepare failed: " . $this->conn->error);
            return [];
        }

        $u = (int)$userID;
        if (!$stmt->bind_param("iiiiiiiiii", $u, $u, $u, $u, $u, $u, $u, $u, $u, $u)) {
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

    // Search messages (own inbox/outbox)
    public function searchMessages($userID, $keyword) {
        $hasIsDeleted = $this->columnExists('messages', 'is_deleted');

        $sql = "SELECT * FROM `messages`
                WHERE (`senderID` = ? OR `receiverID` = ?)";

        if ($hasIsDeleted) {
            $sql .= " AND `is_deleted` = 0";
        }

        $sql .= " AND `message` LIKE ?
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

    // Soft-delete a message (hide it), do not remove from DB
    public function softDeleteMessage($messageID, $userID) {
        $mid = (int)$messageID;
        $uid = (int)$userID;

        if ($this->columnExists('messages', 'is_deleted')) {
            $sql = "UPDATE `messages`
                    SET `is_deleted` = 1,
                        `deleted_at` = NOW(),
                        `message` = CASE WHEN `message` IS NULL OR `message` = '' THEN `message` ELSE '[deleted]' END
                    WHERE `messageID` = ? AND `senderID` = ? AND `is_deleted` = 0";
            $stmt = $this->conn->prepare($sql);
            if (!$stmt) {
                $this->setError("Prepare failed: " . $this->conn->error);
                return false;
            }
            if (!$stmt->bind_param("ii", $mid, $uid)) {
                $this->setError("Bind failed: " . $stmt->error);
                return false;
            }
            if (!$stmt->execute()) {
                $this->setError("Execute failed: " . $stmt->error);
                return false;
            }
            return $stmt->affected_rows > 0;
        } else {
            // Fallback: overwrite message with a placeholder
            $placeholder = "[deleted]";
            $sql = "UPDATE `messages` SET `message` = ? WHERE `messageID` = ? AND `senderID` = ?";
            $stmt = $this->conn->prepare($sql);
            if (!$stmt) {
                $this->setError("Prepare failed: " . $this->conn->error);
                return false;
            }
            if (!$stmt->bind_param("sii", $placeholder, $mid, $uid)) {
                $this->setError("Bind failed: " . $stmt->error);
                return false;
            }
            if (!$stmt->execute()) {
                $this->setError("Execute failed: " . $stmt->error);
                return false;
            }
            return $stmt->affected_rows > 0;
        }
    }

    // Backward-compat: redirect hard delete to soft delete
    public function deleteMessage($messageID, $userID) {
        return $this->softDeleteMessage($messageID, $userID);
    }

    // Edit a message (within 15 min)
    public function editMessage($messageID, $userID, $newMessage) {
        $mid = (int)$messageID;
        $uid = (int)$userID;
        $msg = (string)$newMessage;

        $hasEdited = $this->columnExists('messages', 'is_edited');
        if ($hasEdited) {
            $sql = "UPDATE `messages`
                    SET `message` = ?, `is_edited` = 1, `edited_at` = NOW()
                    WHERE `messageID` = ? AND `senderID` = ?
                      AND `timestamp` >= (NOW() - INTERVAL 15 MINUTE)";
        } else {
            $sql = "UPDATE `messages`
                    SET `message` = ?
                    WHERE `messageID` = ? AND `senderID` = ?
                      AND `timestamp` >= (NOW() - INTERVAL 15 MINUTE)";
        }

        $stmt = $this->conn->prepare($sql);
        if (!$stmt) {
            $this->setError("Prepare failed: " . $this->conn->error);
            return false;
        }
        if (!$stmt->bind_param("sii", $msg, $mid, $uid)) {
            $this->setError("Bind failed: " . $stmt->error);
            return false;
        }
        if (!$stmt->execute()) {
            $this->setError("Execute failed: " . $stmt->error);
            return false;
        }
        return $stmt->affected_rows > 0;
    }
}