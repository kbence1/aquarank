CREATE TABLE `start_lists` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `location` text NOT NULL,
  `event_date` text NOT NULL,
  `file_name` text NOT NULL,
  `content` text NOT NULL,
  `created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_start_lists_date` ON `start_lists` (`event_date`);
--> statement-breakpoint
PRAGMA optimize;
