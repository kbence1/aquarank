ALTER TABLE `events` ADD COLUMN `is_official` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
PRAGMA optimize;
