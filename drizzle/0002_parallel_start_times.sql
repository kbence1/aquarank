ALTER TABLE `parallel_slots` ADD COLUMN `start_time` text;
--> statement-breakpoint
PRAGMA optimize;
