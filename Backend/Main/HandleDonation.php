<?php
require_once 'dbc.php';
require_once 'Profile.php';

class HandleDonation extends Profile {
    private $conn;
    protected $donationId;
    protected $userId;
    protected $status;
    protected $donorId;

    public function __construct()
    {
        parent::__construct();
        $db = new DBconnector();
        $this->conn = $db->connect();
    }
    public function checkrequest($donationId, $userId)
    {
        $this->donationId = $donationId;
        $this->userId = $userId;
        $checkStmt = $this->conn->prepare("SELECT requestID FROM donation_requests WHERE donationID = ? AND userID = ?");
        $checkStmt->bind_param("ii", $donationId, $userId);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();

        if ($checkResult->num_rows > 0) {
            return (['success' => false, 'message' => 'You have already requested this donation.']);
        }
    }
    public function requestItem($donationId, $userId)
    {
        $this->donationId = $donationId;
        $this->userId = $userId;

        $stmt = $this->conn->prepare("INSERT INTO donation_requests (donationID, userID, status) VALUES (?, ?, 'pending')");
        $stmt->bind_param("ii", $donationId, $userId);

        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Request submitted successfully'];
        } else {
            return ['success' => false, 'message' => 'Database error', 'error' => $stmt->error];
        }
    }
    public function requestingUser($donationID){
        $this->donationId = $donationID;

        $sql = "SELECT dr.requestID AS request_id, u.userID, u.fullName, u.email, dr.status, dr.request_date
        FROM donation_requests dr
        JOIN user u ON dr.userID = u.userID
        WHERE dr.donationID = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $donationID);
        $stmt->execute();
        $result = $stmt->get_result();


        $requests = [];
        while ($row = $result->fetch_assoc()) {
            $requests[] = $row;
        }
        return $requests;
    }

    // public function fetchDonation($userId){
    //     $sqlDonations = "SELECT DonationID, title, category, date_time, isDonationCompleted AS status,credits
    //              FROM donation
    //              WHERE userID = ?
    //              ORDER BY date_time DESC";
    //     $stmtDon = $this->conn->prepare($sqlDonations);
    //     $stmtDon->bind_param("i", $userId);
    //     $stmtDon->execute();
    //     $resultDon = $stmtDon->get_result();

    //     $donations = [];
    //     while ($row = $resultDon->fetch_assoc()) {
    //         $donations[] = $row;

    //     }
    //     return $donations;
    // }

//     public function getUserDonations($userID) {
//     $sql = "SELECT DonationID, title, category, date_time, credits, isDonationCompleted, isVerified
//             FROM donation
//             WHERE userID = ?
//             ORDER BY date_time DESC";

//     $stmt = $this->conn->prepare($sql);
//     $stmt->bind_param("i", $userID);

//     $donations = [];
//     if ($stmt->execute()) {
//         $donations = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
//     }

//     $stmt->close();
//     return $donations;
// }

    // public function fetchReceived($userId){
    //     $sqlReceived = "SELECT
    //             d.DonationID,
    //             d.title,
    //             d.date_time AS requestDate,
    //             d.category,
    //             d.isDonationCompleted AS status,
    //             u.fullName AS donor,
    //             u.contactNumber AS donorContact,
    //             ri.quantity,
    //             ri.received_date
    //         FROM receive_items ri
    //         JOIN donation d ON ri.donationID = d.DonationID
    //         JOIN user u ON ri.donorID = u.userID
    //         WHERE ri.receiverID = ?
    //           AND d.isDonationCompleted = 1
    //         ORDER BY ri.received_date DESC";
    //     $stmtRec = $this->conn->prepare($sqlReceived);
    //     $stmtRec->bind_param("i", $userId);
    //     $stmtRec->execute();
    //     $resultRec = $stmtRec->get_result();

    //     $received = [];
    //     while ($row = $resultRec->fetch_assoc()) {
    //         $received[] = $row;
    //     }
    //     return $received;
    // }
    public function getcredits($userId){
        $sqlUser = "SELECT credit_points FROM user WHERE userID = ?";
        $stmtUser = $this->conn->prepare($sqlUser);
        $stmtUser->bind_param("i", $userId);
        $stmtUser->execute();
        $resultUser = $stmtUser->get_result();

        $userCredits = 0;
        if ($rowUser = $resultUser->fetch_assoc()) {
            $userCredits = (int)$rowUser['credit_points'];
        }

        return $userCredits;
    }

    public function requestConfirmation($userID,$donationID,$status,$donorId){
        $this->userId = $userID;
        $this->status = $status;
        $this->donationId = $donationID;
        $this->donorId = $donorId;
        $sql="UPDATE donation_requests SET status = ? WHERE userID = ? AND donationID = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("sii", $this->status, $this->userId, $this->donationId);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            $quantity = 1; // Set the quantity to 1 or any other logic you need
           $sql2="INSERT INTO receive_items (donationID, donorID, receiverID, quantity) VALUES (?, ?, ?, ?)";
           $stmt2 = $this->conn->prepare($sql2);
           $stmt2->bind_param("iiii", $this->donationId, $this->donorId, $this->userId, $quantity);
           $stmt2->execute();
           if ($stmt2->affected_rows > 0) {
               return ['success' => true];
           } else {
               return ['success' => false, 'message' => 'Failed to insert into receive_items.'];
           }
        } else {
            return ['success' => false , 'message' => 'Failed to update request status.'];
        }
    }
}