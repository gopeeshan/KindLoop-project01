<?php
    require_once 'dbc.php';

    class CreatePost {
        private $conn;
        protected $userID;
        protected $title;
        protected $description;
        protected $category;
        protected $location;
        protected $condition;
        protected $images;
        protected $usageDuration;
        protected $credits;
        protected $quantity;
        protected $available_quantity;

        public function __construct() {
            $db = new DBconnector();
            $this->conn = $db->connect();
        }

        public function createNewPost($userID, $title, $description, $category, $location, $condition, $images, $usageDuration, $credits, $quantity,$available_quantity) {
            $this->userID = $userID;
            $this->title = $title;
            $this->description = $description;
            $this->category = $category;
            $this->location = $location;
            $this->condition = $condition;
            $this->images = $images;
            $this->usageDuration = $usageDuration;
            $this->credits = $credits;
            $this->quantity = $quantity;
            $this->available_quantity = $available_quantity;
            // $imagesJson = json_encode($this->images);

            $sql = "INSERT INTO donation (userID, title, description, category, location, `condition`, images, usageDuration, credits, quantity, available_quantity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param(
                "isssssssiii",
                $userID,
                $title,
                $description,
                $category,
                $location,
                $condition,
                $images,
                $usageDuration,
                $credits,
                $quantity,
                $available_quantity
            );

        if ($stmt->execute()) {
            return (["status" => "success", "message" => "Your post is posted successfully!"]);
        } else {
            return (["status" => "error", "message" => "Posting failed: " . $stmt->error]);
        }

        $stmt->close();
        $this->conn->close();
    }
}
?>