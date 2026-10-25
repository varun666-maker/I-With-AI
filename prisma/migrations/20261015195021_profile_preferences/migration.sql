-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "preferred_locations_json" JSONB,
ADD COLUMN     "preferred_roles_json" JSONB;
