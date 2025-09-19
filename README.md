-- Create new database
CREATE DATABASE kindloop_db;
USE kindloop_db;

-- =========================
-- User Table
-- =========================
CREATE TABLE `user` (
  `userID` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `fullName` varchar(100) NOT NULL,
  `nic` varchar(12) NOT NULL,
  `contactNumber` varchar(10) DEFAULT NULL CHECK (octet_length(`contactNumber`) = 10),
  `occupation` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `active_state` enum('active','suspend') DEFAULT 'active',
  PRIMARY KEY (`userID`),
  UNIQUE KEY `nic` (`nic`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================
-- Admin Table
-- =========================
CREATE TABLE `admin` (
  `AdminID` int(11) NOT NULL AUTO_INCREMENT,
  `fullName` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `contactNumber` varchar(10) DEFAULT NULL CHECK (octet_length(`contactNumber`) = 10),
  `nic` varchar(12) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` enum('superadmin','subadmin') NOT NULL DEFAULT 'subadmin',
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `active_state` enum('active','suspend') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`AdminID`),
  UNIQUE KEY `nic` (`nic`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================
-- Donation Table
-- =========================
CREATE TABLE `donation` (
  `DonationID` int(11) NOT NULL AUTO_INCREMENT,
  `userID` int(11) DEFAULT NULL,
  `title` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `date_time` datetime DEFAULT current_timestamp(),
  `category` varchar(100) DEFAULT NULL,
  `condition` varchar(100) DEFAULT NULL,
  `images` text DEFAULT NULL,
  `isVerified` tinyint(1) DEFAULT 0,
  `isDonationCompleted` tinyint(1) DEFAULT 0,
  `approvedBy` int(11) DEFAULT NULL,
  `credits` int(11) DEFAULT 0,
  `location` varchar(255) DEFAULT NULL,
  `setVisible` tinyint(1) NOT NULL DEFAULT 1,
  `usageDuration` varchar(30) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `availableQuantity` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`DonationID`),
  KEY `userID` (`userID`),
  KEY `approvedBy` (`approvedBy`),
  CONSTRAINT `donation_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`),
  CONSTRAINT `donation_ibfk_2` FOREIGN KEY (`approvedBy`) REFERENCES `admin` (`AdminID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================
-- Complaints Table
-- =========================
CREATE TABLE `complaints` (
  `ComplaintID` int(11) NOT NULL AUTO_INCREMENT,
  `DonationID` int(11) NOT NULL,
  `complainantID` int(11) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `solution` text DEFAULT NULL,
  `evidence_images` text DEFAULT NULL,
  `proof_images` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','resolved') DEFAULT 'pending',
  PRIMARY KEY (`ComplaintID`),
  KEY `DonationID` (`DonationID`),
  KEY `fk_complaints_user` (`complainantID`),
  CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`DonationID`) REFERENCES `donation` (`DonationID`) ON DELETE CASCADE,
  CONSTRAINT `complaints_ibfk_2` FOREIGN KEY (`complainantID`) REFERENCES `user` (`userID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================
-- Donation Requests Table
-- =========================
CREATE TABLE `donation_requests` (
  `requestID` int(11) NOT NULL AUTO_INCREMENT,
  `donationID` int(11) NOT NULL,
  `userID` int(11) NOT NULL,
  `status` enum('pending','selected','rejected') DEFAULT 'pending',
  `request_date` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`requestID`),
  KEY `donationID` (`donationID`),
  KEY `userID` (`userID`),
  CONSTRAINT `donation_requests_ibfk_1` FOREIGN KEY (`donationID`) REFERENCES `donation` (`DonationID`) ON DELETE CASCADE,
  CONSTRAINT `donation_requests_ibfk_2` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================
-- Messages Table
-- =========================
CREATE TABLE `messages` (
  `messageID` int(11) NOT NULL AUTO_INCREMENT,
  `senderID` int(11) NOT NULL,
  `receiverID` int(11) NOT NULL,
  `donationID` int(11) DEFAULT NULL,
  `message` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_read` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`messageID`),
  KEY `idx_pair_time` (`senderID`,`receiverID`,`timestamp`),
  KEY `idx_receiver_unread` (`receiverID`,`is_read`),
  KEY `idx_donation` (`donationID`),
  CONSTRAINT `fk_messages_receiver` FOREIGN KEY (`receiverID`) REFERENCES `user` (`userID`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`senderID`) REFERENCES `user` (`userID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================
-- Notifications Table
-- =========================
CREATE TABLE `notifications` (
  `notificationID` int(11) NOT NULL AUTO_INCREMENT,
  `userID` int(11) NOT NULL,
  `from_userID` int(11) DEFAULT NULL,
  `donationID` int(11) DEFAULT NULL,
  `complaintID` int(11) DEFAULT NULL,
  `type` enum('request_received','donation_received','request_accepted','request_declined','complaint_registered','complaint_resolved') NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`notificationID`),
  KEY `user_id` (`userID`),
  KEY `from_user_id` (`from_userID`),
  KEY `donation_id` (`donationID`),
  KEY `complaintID` (`complaintID`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`),
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`from_userID`) REFERENCES `user` (`userID`),
  CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`donationID`) REFERENCES `donation` (`DonationID`),
  CONSTRAINT `notifications_ibfk_4` FOREIGN KEY (`complaintID`) REFERENCES `complaints` (`ComplaintID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================
-- Receive Items Table
-- =========================
CREATE TABLE `receive_items` (
  `receiveID` int(11) NOT NULL AUTO_INCREMENT,
  `donationID` int(11) NOT NULL,
  `donorID` int(11) NOT NULL,
  `receiverID` int(11) NOT NULL,
  `received_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `quantity` int(11) NOT NULL CHECK (`quantity` > 0),
  `status` enum('pending','completed') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`receiveID`),
  KEY `donationID` (`donationID`),
  KEY `donorID` (`donorID`),
  KEY `receiverID` (`receiverID`),
  CONSTRAINT `receive_items_ibfk_1` FOREIGN KEY (`donationID`) REFERENCES `donation` (`DonationID`) ON DELETE CASCADE,
  CONSTRAINT `receive_items_ibfk_2` FOREIGN KEY (`donorID`) REFERENCES `user` (`userID`) ON DELETE CASCADE,
  CONSTRAINT `receive_items_ibfk_3` FOREIGN KEY (`receiverID`) REFERENCES `user` (`userID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================
-- Rejected Items Table
-- =========================
CREATE TABLE `rejecteditems` (
  `RejectID` int(11) NOT NULL AUTO_INCREMENT,
  `DonationID` int(11) NOT NULL,
  `rejectedBy` int(11) DEFAULT NULL,
  `rejected_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`RejectID`),
  CONSTRAINT `fk_rejecteditems_donation`
      FOREIGN KEY (`DonationID`) REFERENCES `donation`(`DonationID`)
      ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rejecteditems_admin`
      FOREIGN KEY (`rejectedBy`) REFERENCES `admin`(`AdminID`)
      ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================
-- User Info Table
-- =========================
CREATE TABLE `user_info` (
  `userID` int(11) NOT NULL,
  `credit_points` int(11) DEFAULT 0,
  `registered_date` datetime NOT NULL DEFAULT current_timestamp(),
  `year_points` int(11) DEFAULT 0,
  `current_year_requests` int(11) DEFAULT 0,
  `current_year_request_limit` int(11) DEFAULT 12,
  `last_year_reset` datetime DEFAULT NULL,
  PRIMARY KEY (`userID`),
  CONSTRAINT `user_info_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
