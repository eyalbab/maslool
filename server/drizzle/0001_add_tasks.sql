CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_unit_id" uuid NOT NULL,
	"assignee_membership_id" uuid,
	"created_by_membership_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"status" text DEFAULT 'PLANNED' NOT NULL,
	"priority" text DEFAULT 'NORMAL' NOT NULL,
	"scheduled_start" timestamp with time zone,
	"scheduled_end" timestamp with time zone,
	"due_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_org_unit_id_org_units_id_fk" FOREIGN KEY ("org_unit_id") REFERENCES "public"."org_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_membership_id_unit_memberships_id_fk" FOREIGN KEY ("assignee_membership_id") REFERENCES "public"."unit_memberships"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_membership_id_unit_memberships_id_fk" FOREIGN KEY ("created_by_membership_id") REFERENCES "public"."unit_memberships"("id") ON DELETE set null ON UPDATE no action;