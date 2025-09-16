<?php
require_once 'dbc.php';

class Complaint {
    private $conn;

    public function __construct() {
        $this->conn = DBconnector::getInstance()->getConnection();
    }

    
    public function submitComplaint($donationID, $userID, $reason, $description, $files) {
    $evidencePaths = [];

    
    if (isset($files['evidence_images'])) { 
        foreach ($files['evidence_images']['name'] as $key => $name) {
            if ($files['evidence_images']['error'][$key] === 0) {
                $targetDir = "uploads/complaints/";
                if (!is_dir($targetDir)) mkdir($targetDir, 0755, true);

                $fileName = time() . "_" . basename($name);
                $targetFilePath = $targetDir . $fileName;

             
                    if (move_uploaded_file($files['evidence_images']['tmp_name'][$key], $targetFilePath)) {
                        $evidencePaths[] = $targetFilePath;
                    }
            }
                }
            }
        
    

    $evidenceJson = !empty($evidencePaths) ? json_encode($evidencePaths) : null;

    $stmt = $this->conn->prepare("
        INSERT INTO complaints (DonationID, complainantID, reason, description, evidence_images, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
    ");
    $stmt->bind_param("iisss", $donationID, $userID, $reason, $description, $evidenceJson);

    if ($stmt->execute()) {
        return ["status"=>"success","message"=>"Complaint submitted successfully."];
    } else {
        return ["status"=>"error","message"=>$stmt->error];
    }

    }
    
    // Fetch all complaints
    public function getAllComplaints() {
        $result = $this->conn->query("
            SELECT c.*, d.title AS donationTitle, u.fullName AS complainantName
            FROM complaints c
            LEFT JOIN donation d ON c.DonationID = d.DonationID
            LEFT JOIN user u ON c.complainantID = u.userID
            ORDER BY c.created_at DESC
        ");

        $complaints = $result->fetch_all(MYSQLI_ASSOC);
       
    }

    public function getAllComplaint() {
        $sql = "SELECT c.ComplaintID AS id,
                       c.DonationID AS donationID,
                       c.description, 
                       c.reason, 
                       IFNULL(c.status,'pending') AS status, 
                       c.created_at AS submittedDate,
                       c.solution, 
                       c.evidence_images, 
                       c.proof_images,
                       u.fullName AS userName, 
                       u.email AS userEmail, 
                       u.userID AS userId,
                       d.fullName AS donorName, 
                       d.userID AS donorId,
                       don.title AS donationTitle
                FROM complaints c
                JOIN donation don ON don.DonationID = c.DonationID
                JOIN user u ON u.userID = c.complainantID
                JOIN user d ON d.userID = don.userID
                ORDER BY c.created_at DESC";

        $result = $this->conn->query($sql);
        $complaints = [];

        if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            foreach (['evidence_images', 'proof_images'] as $col) {
                $row[$col] = !empty($row[$col]) ? json_decode($row[$col], true) : [];
            }
            $complaints[] = $row;
        }
    }
    return $complaints;
    }


// --- Respond ---
    public function respond($id, $solution) {
        $stmt = $this->conn->prepare("UPDATE complaints SET solution=?, status='responded' WHERE ComplaintID=?");
        $stmt->bind_param("si", $solution, $id);
        return $stmt->execute();
    }

    // --- Resolve (with proof images) ---
    public function resolve($id, $solution, $files) {
        $uploadDir = "uploads/complaints/";
        $proofImages = [];

        if (!empty($files['name'][0])) {
            foreach ($files['tmp_name'] as $key => $tmpName) {
                $filename = time() . "_" . basename($files['name'][$key]);
                $target = $uploadDir . $filename;
                if (move_uploaded_file($tmpName, $target)) {
                    $proofImages[] = $target;
                }
            }
        }

        $proofJson = json_encode($proofImages);
        $stmt = $this->conn->prepare("UPDATE complaints SET solution=?, proof_images=?, status='resolved' WHERE ComplaintID=?");
        $stmt->bind_param("ssi", $solution, $proofJson, $id);
        return $stmt->execute();
    }

public function getComplaints($userID, $donationID) {
    $sql = "SELECT 
                ComplaintID,
                DonationID,
                complainantID,
                reason AS Title,
                description AS Description,
                created_at
            FROM complaints
            WHERE complainantID = ? AND DonationID = ?
            ORDER BY created_at DESC";
    
    $stmt = $this->conn->prepare($sql);
    $stmt->bind_param("ii", $userID, $donationID);
    $stmt->execute();
    $result = $stmt->get_result();

    $complaints = [];
    while ($row = $result->fetch_assoc()) {
        $complaints[] = $row;
    }
    return [
        "complaints" => $complaints,
        "count" => count($complaints)
    ];


}
}
?>
