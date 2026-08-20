CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`location` text NOT NULL,
	`event_date` text NOT NULL,
	`is_live` integer DEFAULT false NOT NULL,
	`next_start` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`athlete` text NOT NULL,
	`club` text NOT NULL,
	`time` text NOT NULL,
	`points` integer NOT NULL,
	`status` text DEFAULT 'Befejezte' NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_events_live_date` ON `events` (`is_live`,`event_date`);
--> statement-breakpoint
CREATE INDEX `idx_results_event_points` ON `results` (`event_id`,`points`);
--> statement-breakpoint
PRAGMA optimize;
