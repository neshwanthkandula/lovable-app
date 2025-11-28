/*
  Warnings:

  - Made the column `files` on table `Fragment` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `userId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Fragment" ALTER COLUMN "files" SET NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "userId" TEXT NOT NULL;
