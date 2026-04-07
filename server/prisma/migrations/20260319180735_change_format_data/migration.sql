/*
  Warnings:

  - You are about to alter the column `amount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `currency` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(3)`.
  - You are about to alter the column `total_paid` on the `Reservation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
CREATE SEQUENCE businessconfig_id_seq;
ALTER TABLE "BusinessConfig" ADD COLUMN     "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0.16,
ALTER COLUMN "id" SET DEFAULT nextval('businessconfig_id_seq');
ALTER SEQUENCE businessconfig_id_seq OWNED BY "BusinessConfig"."id";

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "currency" SET DATA TYPE CHAR(3);

-- AlterTable
ALTER TABLE "Reservation" ALTER COLUMN "total_paid" SET DATA TYPE DECIMAL(10,2);

-- CreateIndex
CREATE INDEX "Reservation_userId_idx" ON "Reservation"("userId");
