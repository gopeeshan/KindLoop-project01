<?php
require_once 'dbc.php';

class CreatePost
{
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

    public function __construct()
    {
        $this->conn = DBconnector::getInstance()->getConnection();
    }

    public function createNewPost($userID, $title, $description, $category, $location, $condition, $images, $usageDuration, $credits, $quantity, $available_quantity)
    {
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

        $sql = "INSERT INTO donation (userID, title, description, category, location, `condition`, images, usageDuration, credits, quantity, availableQuantity)
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
            $quantity,
        );

        $result = [];
        if ($stmt->execute()) {
            $result = ["status" => "success", "message" => "Your post is created successfully! Once approved, it will be visible to others."];
        } else {
            $result = ["status" => "error", "message" => "Creating post failed: " . $stmt->error];
        }

        $stmt->close();
        $this->conn->close();
        return $result;
    }

    public function editPost($donationID, $userID, $title, $description, $category, $location, $condition, $images, $usageDuration, $quantity)
    {
        $sql = "UPDATE donation SET title=?, description=?, category=?, location=?, `condition`=?, images=?, usageDuration=?, quantity=? WHERE DonationID=? AND userID=?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param(
            "sssssssiii",
            $title,
            $description,
            $category,
            $location,
            $condition,
            $images,
            $usageDuration,
            $quantity,
            $donationID,
            $userID
        );

        $result = [];
        if ($stmt->execute()) {
            $result = ["status" => "success", "message" => "Post updated successfully!"];
        } else {
            $result = ["status" => "error", "message" => "Update failed: " . $stmt->error];
        }
        $stmt->close();
        $this->conn->close();
        return $result;
    }
}
