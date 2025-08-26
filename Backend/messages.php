<?php
session_start();

$frontendOrigin = 'http://localhost:2025'; // Adjust if your dev/production origin differs
header("Access-Control-Allow-Origin: $frontendOrigin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/Main/dbc.php';

function json_response($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

function require_auth() {
    if (!isset($_SESSION['userID'])) {
        json_response(["success" => false, "message" => "Unauthorized. Please log in."], 401);
    }
    return intval($_SESSION['userID']);
}

$conn = (new DBconnector())->connect();
if ($conn->connect_error) {
    json_response(["success" => false, "message" => "DB connection error"], 500);
}

$action = isset($_GET['action']) ? $_GET['action'] : null;

if ($action === 'send' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $me = require_auth();

    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?? [];

    $receiverID = isset($data['receiverID']) ? intval($data['receiverID']) : 0;
    $donationID = isset($data['donationID']) ? intval($data['donationID']) : null;
    $message = isset($data['message']) ? trim($data['message']) : '';

    if ($receiverID <= 0 || $message === '') {
        json_response(["success" => false, "message" => "receiverID and message are required."], 400);
    }
    if ($receiverID === $me) {
        json_response(["success" => false, "message" => "Cannot message yourself."], 400);
    }

    $sql = "INSERT INTO messages (senderID, receiverID, donationID, message) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    // For nullable donationID, use null in bind
    if ($donationID === null) {
        $stmt->bind_param('iiis', $me, $receiverID, $donationID, $message);
    } else {
        $stmt->bind_param('iiis', $me, $receiverID, $donationID, $message);
    }

    if (!$stmt->execute()) {
        json_response(["success" => false, "message" => "Failed to send message."], 500);
    }

    $insertId = $stmt->insert_id;
    $stmt->close();

    // Return inserted row
    $q = "SELECT m.*, s.fullName AS senderName, r.fullName AS receiverName
          FROM messages m
          JOIN user s ON s.userID = m.senderID
          JOIN user r ON r.userID = m.receiverID
          WHERE m.messageID = ?";
    $s2 = $conn->prepare($q);
    $s2->bind_param('i', $insertId);
    $s2->execute();
    $res = $s2->get_result();
    $row = $res->fetch_assoc();
    $s2->close();

    json_response(["success" => true, "message" => "Message sent.", "data" => $row]);
}

if ($action === 'history' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $me = require_auth();

    $peerId = isset($_GET['peerId']) ? intval($_GET['peerId']) : 0;
    $donationId = isset($_GET['donationId']) ? intval($_GET['donationId']) : null;

    if ($peerId <= 0) {
        json_response(["success" => false, "message" => "peerId is required."], 400);
    }

    // Conditionally filter by donationId when provided
    if ($donationId !== null) {
        $sql = "SELECT m.*, s.fullName AS senderName, r.fullName AS receiverName
                FROM messages m
                JOIN user s ON s.userID = m.senderID
                JOIN user r ON r.userID = m.receiverID
                WHERE ((m.senderID = ? AND m.receiverID = ?) OR (m.senderID = ? AND m.receiverID = ?))
                  AND m.donationID = ?
                ORDER BY m.timestamp ASC, m.messageID ASC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('iiiii', $me, $peerId, $peerId, $me, $donationId);
    } else {
        $sql = "SELECT m.*, s.fullName AS senderName, r.fullName AS receiverName
                FROM messages m
                JOIN user s ON s.userID = m.senderID
                JOIN user r ON r.userID = m.receiverID
                WHERE ((m.senderID = ? AND m.receiverID = ?) OR (m.senderID = ? AND m.receiverID = ?))
                ORDER BY m.timestamp ASC, m.messageID ASC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('iiii', $me, $peerId, $peerId, $me);
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $messages = [];
    $unreadCount = 0;
    while ($row = $result->fetch_assoc()) {
        if (intval($row['receiverID']) === $me && intval($row['is_read']) === 0) {
            $unreadCount++;
        }
        $messages[] = $row;
    }
    $stmt->close();

    // Participant names for header
    $userSql = "SELECT userID, fullName FROM user WHERE userID IN (?, ?)";
    $us = $conn->prepare($userSql);
    $us->bind_param('ii', $me, $peerId);
    $us->execute();
    $r2 = $us->get_result();
    $participants = [];
    while ($u = $r2->fetch_assoc()) {
        $participants[] = $u;
    }
    $us->close();

    json_response([
        "success" => true,
        "data" => [
            "messages" => $messages,
            "participants" => $participants,
            "viewerID" => $me,
            "unread" => $unreadCount
        ]
    ]);
}

if ($action === 'mark-read' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $me = require_auth();

    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?? [];

    $peerId = isset($data['peerId']) ? intval($data['peerId']) : 0;
    $donationId = isset($data['donationId']) ? intval($data['donationId']) : null;

    if ($peerId <= 0) {
        json_response(["success" => false, "message" => "peerId is required."], 400);
    }

    if ($donationId !== null) {
        $sql = "UPDATE messages
                SET is_read = 1
                WHERE receiverID = ? AND senderID = ? AND donationID = ? AND is_read = 0";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('iii', $me, $peerId, $donationId);
    } else {
        $sql = "UPDATE messages
                SET is_read = 1
                WHERE receiverID = ? AND senderID = ? AND is_read = 0";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $me, $peerId);
    }

    if (!$stmt->execute()) {
        json_response(["success" => false, "message" => "Failed to mark as read."], 500);
    }
    $affected = $stmt->affected_rows;
    $stmt->close();

    json_response(["success" => true, "message" => "Messages marked as read.", "updated" => $affected]);
}

if ($action === 'conversations' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $me = require_auth();

    // Pull all messages involving the current user, then aggregate in PHP for simplicity.
    $sql = "SELECT m.*, 
                   CASE WHEN m.senderID = ? THEN m.receiverID ELSE m.senderID END AS otherUserID,
                   u.fullName AS otherUserName
            FROM messages m
            JOIN user u ON u.userID = CASE WHEN m.senderID = ? THEN m.receiverID ELSE m.senderID END
            WHERE m.senderID = ? OR m.receiverID = ?
            ORDER BY m.timestamp DESC, m.messageID DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('iiii', $me, $me, $me, $me);
    $stmt->execute();
    $result = $stmt->get_result();

    // Aggregate by otherUserID and donationID (so a conversation per user per donation thread)
    $conversations = []; // key: otherUserID|donationID
    while ($row = $result->fetch_assoc()) {
        $key = $row['otherUserID'] . '|' . ($row['donationID'] ?? 'null');
        if (!isset($conversations[$key])) {
            $conversations[$key] = [
                "otherUserID" => intval($row['otherUserID']),
                "otherUserName" => $row['otherUserName'],
                "donationID" => $row['donationID'],
                "last_message" => $row['message'],
                "last_timestamp" => $row['timestamp'],
                "unread" => 0
            ];
        }
        if (intval($row['receiverID']) === $me && intval($row['is_read']) === 0) {
            $conversations[$key]['unread'] += 1;
        }
    }
    $stmt->close();

    // Reindex
    $list = array_values($conversations);
    json_response(["success" => true, "data" => $list]);
}

// Fallback
json_response(["success" => false, "message" => "Invalid action or method."], 400);