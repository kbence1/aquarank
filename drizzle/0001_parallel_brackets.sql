CREATE TABLE `parallel_brackets` (
	`event_id` integer PRIMARY KEY NOT NULL,
	`bracket_size` integer NOT NULL CHECK (`bracket_size` IN (4, 8, 16, 32)),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `parallel_slots` (
	`event_id` integer NOT NULL,
	`round` integer NOT NULL,
	`position` integer NOT NULL,
	`athlete` text NOT NULL,
	PRIMARY KEY (`event_id`, `round`, `position`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_parallel_slots_event_round` ON `parallel_slots` (`event_id`,`round`,`position`);
--> statement-breakpoint
PRAGMA optimize;
