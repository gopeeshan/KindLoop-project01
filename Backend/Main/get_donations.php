<?php
    require_once 'dbc.php';

    class Donation {
        private $conn;
        protected $donationID;

        public function __construct() {
            $db= new DBconnector();
            $this->conn = $db->connect();
        }

        // Function to get all donations
        public function getAllDonations() {
            $sql = "SELECT
                donation.DonationID,
                donation.userID,
                user.fullName,
                donation.title,
                donation.description,
                donation.category,
                donation.location,
                donation.`condition`,
                donation.images,
                donation.date_time,
                donation.isVerified,
                donation.setVisible,
                donation.usageDuration,
                donation.credits,
                donation.quantity
            FROM donation
            JOIN user ON donation.userID = user.userID
            WHERE donation.setVisible = 1 && donation.isVerified = 1
            AND donation.date_time >= NOW() - INTERVAL 24 HOUR
            ORDER BY donation.date_time DESC";

            $result = $this->conn->query($sql);
            $donations = [];

            if ($result) {
                while ($row = $result->fetch_assoc()) {
                    // Decode images JSON stored as text if exists
                    $row['images'] = $row['images'] ? json_decode($row['images'], true) : [];
                    $donations[] = $row;
                }
                return ["status" => "success", "data" => $donations];
            } else {
                return ["status" => "error", "message" => "Failed to fetch donations"];
            }
        }

        public function getDonationById($donationID) {
            $this->donationID = $donationID;
            $stmt = $this->conn->prepare("
                SELECT *, user.fullName
                FROM donation
                JOIN user ON donation.userID = user.userID
                WHERE donation.DonationID = ?
            ");
            $stmt->bind_param("i", $donationID);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $donation = $result->fetch_assoc();
                return ["status" => "success", "data" => $donation];
            } else {
                return ["status" => "error", "message" => "Donation not found."];
            }
        }

    }
