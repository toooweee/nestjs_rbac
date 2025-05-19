/*
  Warnings:

  - You are about to drop the column `user_id` on the `roles` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "roles" DROP CONSTRAINT "roles_user_id_fkey";

-- DropIndex
DROP INDEX "roles_user_id_key";

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role_id" INTEGER;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
