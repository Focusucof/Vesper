CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT '440317ad-3084-4928-aef4-f8c67f344540' NOT NULL,
	"room_id" varchar(255) NOT NULL,
	"server_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" varchar(1000) NOT NULL,
	"timestamp" timestamp
);
