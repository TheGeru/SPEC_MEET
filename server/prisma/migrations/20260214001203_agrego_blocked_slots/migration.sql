/*
  Warnings:

  - You are about to drop the column `resetPasswordExpired` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "iva_breakdown" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "resetPasswordExpired",
ADD COLUMN     "resetPasswordExpire" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "BlockedSlot" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockedSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlockedSlot_roomId_start_time_end_time_idx" ON "BlockedSlot"("roomId", "start_time", "end_time");

-- AddForeignKey
ALTER TABLE "BlockedSlot" ADD CONSTRAINT "BlockedSlot_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
