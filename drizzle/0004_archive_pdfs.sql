ALTER TABLE `events` ADD COLUMN `pdf_name` text;
--> statement-breakpoint
PRAGMA optimize;
