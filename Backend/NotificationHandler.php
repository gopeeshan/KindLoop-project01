<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST,GET, OPTIONS");

require_once './Main/NotificationManager.php';

$data = json_decode(file_get_contents("php://input"), true);

$action = $data['action'] ?? '';
$donationID = $data['donationID'] ?? null;
$msg_sender_ID = $data['msg_sender_ID'] ?? null;
$msg_receiver_ID = $data['msg_receiver_ID'] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

$notificationManager = new NotificationManager();

if ($method === 'POST' && $action === 'notify_request') {
    if($msg_receiver_ID !== $msg_sender_ID) {
        $type = 'request_received';
        $success = $notificationManager->send($msg_receiver_ID, $msg_sender_ID, $type, $donationID);
        echo json_encode(['success' => $success]);
        exit;
    }
}
else if ($method === 'POST' && $action === 'notify_request_acceptance') {
    
        $type = 'request_accepted';
        $success = $notificationManager->send($msg_receiver_ID, $msg_sender_ID, $type, $donationID);
        echo json_encode(['success' => $success]);
        exit;
    
}
// else if ($method === 'POST' && $action === 'notify_request_decline') {
//     $type = 'request_declined';
//     $success = $notificationManager->send($msg_receiver_ID, $msg_sender_ID, $type, $donationID);
//     echo json_encode(['success' => $success]);
//     exit;
// }
else if ($method === 'POST' && $action === 'Donation_received_Confirmation') {
    $success = $notificationManager->send($msg_receiver_ID, $msg_sender_ID, 'donation_received', $donationID);
    echo json_encode(['success' => $success]);
    exit;
}
else if ($method === 'GET') {
    $msg_receiver_ID = $_GET['msg_receiver_ID'] ?? null;

    $notifications = $notificationManager->getUserNotifications($msg_receiver_ID);
    echo json_encode(['success' => true, 'data' => $notifications]);
    exit;
}
else if ($method === 'POST' && $action === 'mark_as_read') {
    $notificationId = $data['notificationID'] ?? null;
    if ($notificationId) {
        $success = $notificationManager->markAsRead($notificationId);
        echo json_encode(['success' => $success]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No notification ID provided']);
    }
    exit;
}
