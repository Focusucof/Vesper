CREATE TABLE "messages" (
	"id" uuid DEFAULT gen_random_uuid(),
	"room_id" varchar(255) NOT NULL,
	"server_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" varchar(1000) NOT NULL,
	"timestamp" timestamp
);
