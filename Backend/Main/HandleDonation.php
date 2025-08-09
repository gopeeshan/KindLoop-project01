<?php
require_once 'dbc.php';

class HandleDonation
{
    private $conn;
    protected $donationId;
    protected $userId;

    public function __construct()
    {
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
            return (['success' => true, 'message' => 'Request submitted successfully']);
        } else {
            return (['success' => false, 'message' => 'Database error', 'error' => $stmt->error]);
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
}
