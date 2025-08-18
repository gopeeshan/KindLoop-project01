<?php
require_once 'dbc.php';

class Complaint {
    private $conn;

    public function __construct() {
        $db = new DBconnector();
        $this->conn = $db->connect();
    }

    // Submit a complaint
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
}
?>
