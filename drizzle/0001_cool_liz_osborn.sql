CREATE TABLE `conversions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`originalFileName` varchar(255) NOT NULL,
	`originalFormat` varchar(32) NOT NULL,
	`outputFormat` varchar(32) NOT NULL,
	`fileType` varchar(32) NOT NULL,
	`originalFileSize` int NOT NULL,
	`convertedFileSize` int,
	`originalFileUrl` text,
	`convertedFileUrl` text,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`processingTimeMs` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversions_id` PRIMARY KEY(`id`)
);
