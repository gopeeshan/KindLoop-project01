<?php
require_once 'dbc.php';
require_once 'Profile.php';

class HandleDonation extends Profile
{
    private $conn;
    protected $donationID;
    protected $userId;
    protected $status;
    protected $donorId;

    public function __construct()
    {
        parent::__construct();
        $db = new DBconnector();
        $this->conn = $db->connect();
    }
    public function checkrequest($donationID, $userId)
    {
        $this->donationID = $donationID;
        $this->userId = $userId;
        $checkStmt = $this->conn->prepare("SELECT requestID FROM donation_requests WHERE donationID = ? AND userID = ?");
        $checkStmt->bind_param("ii", $donationID, $userId);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();

        if ($checkResult->num_rows > 0) {
            return (['success' => false, 'message' => 'You have already requested this donation.']);
        }
    }
    public function requestItem($donationID, $userId)
    {
        $this->donationID = $donationID;
        $this->userId = $userId;

        $stmt = $this->conn->prepare("INSERT INTO donation_requests (donationID, userID, status) VALUES (?, ?, 'pending')");
        $stmt->bind_param("ii", $donationID, $userId);

        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Request submitted successfully'];
        } else {
            return ['success' => false, 'message' => 'Database error', 'error' => $stmt->error];
        }
    }
    public function requestingUser($donationID)
    {
        $this->donationID = $donationID;

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
    public function getcredits($userId)
    {
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

    public function getDonationQuantity($donationID)
    {
        $this->donationID = $donationID;
        $sql = "SELECT quantity,availableQuantity FROM donation WHERE DonationID = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $donationID);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            return [
                'quantity' => (int)$row['quantity'],
                'availableQuantity' => (int)$row['availableQuantity']
            ];
        } else {
            return [
                'quantity' => 0,
                'availableQuantity' => 0
            ];
        }
    }

    // public function requestConfirmation($userID, $donationID, $status, $donorId, $quantity)
    // {
    //     $this->userId = $userID;
    //     $this->status = $status;
    //     $this->donationID = $donationID;
    //     $this->donorId = $donorId;
    //     $sql = "UPDATE donation_requests SET status = ? WHERE userID = ? AND donationID = ?";
    //     $stmt = $this->conn->prepare($sql);
    //     $stmt->bind_param("sii", $this->status, $this->userId, $this->donationID);

    //     if ($status === 'selected') {
    //         $stmt->execute();
    //         if ($stmt->affected_rows > 0) {
    //             $this->receiveItem($this->donationID, $this->donorId, $this->userId, $quantity, $status);
    //         } else {
    //             return ['success' => false, 'message' => 'Failed to update request status.'];
    //         }
    //     } else if ($status === 'rejected') {
    //         $stmt->execute();
    //         if ($stmt->affected_rows > 0) {
    //             $sql2 = "delete from receive_items where donationID=? and receiverID=? and donorID=?";
    //             $stmt2 = $this->conn->prepare($sql2);
    //             $stmt2->bind_param("iii", $this->donationID, $this->userId, $this->donorId);
    //             $stmt2->execute();
    //             $this->updateQuantity($this->donationID, $quantity, $status);
    //             return ['success' => true, 'message' => 'Request rejected successfully.'];
    //         } else {
    //             return ['success' => false, 'message' => 'Failed to update request status.'];
    //         }
    //     } else {
    //         return ['success' => false, 'message' => 'Invalid quantity for acceptance.'];
    //     }
    // }

    public function requestConfirmation($userID, $donationID, $status, $donorId, $quantity)
    {
        $this->userId = $userID;
        $this->status = $status;
        $this->donationID = $donationID;
        $this->donorId = $donorId;

        // Prepare request status update
        $sql = "UPDATE donation_requests SET status = ? WHERE userID = ? AND donationID = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("sii", $this->status, $this->userId, $this->donationID);

        if ($status === 'selected') {
            $stmt->execute();
            if ($stmt->affected_rows > 0) {
                return $this->receiveItem($this->donationID, $this->donorId, $this->userId, $quantity, $status);
            } else {
                return ['success' => false, 'message' => 'Failed to update request status.'];
            }
        } else if ($status === 'rejected') {
            $checkSql = "SELECT status FROM donation_requests WHERE donationID = ? AND userID = ?";
            $checkStmt = $this->conn->prepare($checkSql);
            $checkStmt->bind_param("ii", $this->donationID, $this->userId);
            $checkStmt->execute();
            $checkResult = $checkStmt->get_result();

            if ($row = $checkResult->fetch_assoc()) {
                $currentStatus = $row['status'];

                if ($currentStatus === "pending") {
                    $stmt->execute();
                    if ($stmt->affected_rows > 0) {
                        return ['success' => true, 'message' => 'Pending request rejected successfully.'];
                    } else {
                        return ['success' => false, 'message' => 'Failed to reject pending request.'];
                    }
                }

                // Case B: Rejecting a selected request → check quantity
                if ($currentStatus === "selected") {
                    $checkSql2 = "SELECT ri.quantity
                              FROM receive_items ri
                              WHERE ri.donationID = ? AND ri.donorID = ? AND ri.receiverID = ?";
                    $checkStmt2 = $this->conn->prepare($checkSql2);
                    $checkStmt2->bind_param("iii", $this->donationID, $this->donorId, $this->userId);
                    $checkStmt2->execute();
                    $checkResult2 = $checkStmt2->get_result();

                    if ($row2 = $checkResult2->fetch_assoc()) {
                        $dbQuantity = (int)$row2['quantity'];
                        $stmt->execute();
                        if ($stmt->affected_rows > 0) {
                            // Delete from receive_items
                            $sql2 = "DELETE FROM receive_items WHERE donationID=? AND receiverID=? AND donorID=?";
                            $stmt2 = $this->conn->prepare($sql2);
                            $stmt2->bind_param("iii", $this->donationID, $this->userId, $this->donorId);
                            $stmt2->execute();

                            // Restore quantity
                            $this->updateQuantity($this->donationID, $dbQuantity, "rejected");

                            return ['success' => true, 'message' => 'Selected request rejected successfully.'];
                        } else {
                            return ['success' => false, 'message' => 'Failed to reject selected request.'];
                        }
                    } else {
                        return ['success' => false, 'message' => 'No matching receive_items record found.'];
                    }
                }
            }

            return ['success' => false, 'message' => 'No matching donation request found.'];
        }
    }


    public function receiveItem($donationID, $donorID, $userID, $quantity, $status)
    {
        $this->donationID = $donationID;
        $this->donorId = $donorID;
        $this->userId = $userID;

        $sql = "INSERT INTO receive_items (donationID, donorID, receiverID, quantity) VALUES (?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("iiii", $donationID, $donorID, $userID, $quantity);

        if ($stmt->execute()) {
            if ($this->updateQuantity($donationID, $quantity, $status)['success']) {
                return ['success' => true, 'message' => 'Received item recorded and quantity updated successfully'];
            } else {
                return ['success' => false, 'message' => 'Failed to update donation quantity'];
            }
        } else {
            return ['success' => false, 'message' => 'Database error', 'error' => $stmt->error];
        }
    }

    public function updateQuantity($donationID, $newQuantity, $status)
    {
        $this->donationID = $donationID;
        if ($status === 'selected') {
            $sql = "UPDATE donation SET availableQuantity = availableQuantity - ? WHERE DonationID = ?";
        } else {
            $sql = "UPDATE donation SET availableQuantity = availableQuantity + ? WHERE DonationID = ?";
        }
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ii", $newQuantity, $donationID);

        if ($stmt->execute()) {
            return ['success' => true, 'message' => 'Donation quantity updated successfully'];
        } else {
            return ['success' => false, 'message' => 'Database error', 'error' => $stmt->error];
        }
    }
}
