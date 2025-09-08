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