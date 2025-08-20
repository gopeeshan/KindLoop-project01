<?php
require_once 'dbc.php';

class Complaint {
    private $conn;

    public function __construct() {
        $db = new DBconnector();
        $this->conn = $db->connect();
    }

    
    public function submitComplaint($donationID, $userID, $reason, $description, $files) {
    $evidencePaths = []; // images uploaded by complainant

    // Match input name and column name
    if (isset($files['evidenceImages'])) { // <- matches HTML input name
        foreach ($files['evidenceImages']['name'] as $key => $name) {
            if ($files['evidenceImages']['error'][$key] === 0) {
                $targetDir = "uploads/complaints/";
                if (!is_dir($targetDir)) mkdir($targetDir, 0755, true);

                $fileName = time() . "_" . basename($name);
                $targetFilePath = $targetDir . $fileName;

                $allowedExts = ['jpg','jpeg','png','gif','webp'];
                $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

                if (in_array($fileExt, $allowedExts)) {
                    if (move_uploaded_file($files['evidenceImages']['tmp_name'][$key], $targetFilePath)) {
                        $evidencePaths[] = $targetFilePath;
                    }
                } else {
                    return [
                        "status"=>"error",
                        "message"=>"Invalid image format for $name. Allowed: jpg, jpeg, png, gif, webp"
                    ];
                }
            }
        }
    }

    $evidenceJson = !empty($evidencePaths) ? json_encode($evidencePaths) : null;

    $stmt = $this->conn->prepare("
        INSERT INTO complaints (DonationID, userID, reason, description, evidence_images, created_at)
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
            LEFT JOIN user u ON c.userID = u.userID
            ORDER BY c.created_at DESC
        ");

        $complaints = $result->fetch_all(MYSQLI_ASSOC);

        // Decode JSON images
        foreach ($complaints as &$c) {
            $c['evidenceImages']    = $c['evidence_Images'] ? json_decode($c['evidence_Images'], true) : [];
            $c['proof_images'] = $c['image'] ? json_decode($c['image'], true) : []; // admin evidence
        }

        return $complaints;
    }

    public function respond($id, $solution) {
        $stmt = $this->conn->prepare("UPDATE complaints SET solution=? WHERE ComplaintID=?");
        $stmt->bind_param("si", $solution, $id);
        return $stmt->execute();
    }

    public function resolve($id, $solution, $files = []) {
        $adminImages = [];
        foreach ($files as $file) {
            $filename = time() . "_" . basename($file['name']);
            $target = $this->uploadDir . $filename;
            if (move_uploaded_file($file['tmp_name'], $target)) {
                $adminImages[] = "http://localhost/KindLoop-project01/Backend/" . $target;
            }
        }
        $proofJson = json_encode($adminImages);
        $stmt = $this->conn->prepare("UPDATE complaints SET status='resolved', solution=?, proof_images=? WHERE ComplaintID=?");
        $stmt->bind_param("ssi", $solution, $proofJson, $id);
        return $stmt->execute();
    }

    public function getAllComplaint() {
        $sql = "SELECT c.ComplaintID AS id, 
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
                JOIN user u ON u.userID = c.userID
                JOIN user d ON d.userID = don.userID
                ORDER BY c.created_at DESC";

        $result = $this->conn->query($sql);
        $complaints = [];
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $row['evidence_images'] = !empty($row['evidence_images']) ? json_decode($row['evidence_images'], true) : [];
                $row['proof_images']    = !empty($row['proof_images']) ? json_decode($row['proof_images'], true) : [];
                $complaints[] = $row;
            }
        }
        return $complaints;
    }
}
?>
