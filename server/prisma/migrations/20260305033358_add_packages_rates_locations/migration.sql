/*
  Warnings:

  - You are about to drop the column `accepted_terms_version` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `price_per_hour` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the `PricingPackage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SystemSetting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TermsConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TermsHistory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `package_id` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `terms_version` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location_id` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BillingUnit" AS ENUM ('hour', 'half_day', 'full_day', 'flat', 'custom');

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "accepted_terms_version",
ADD COLUMN     "package_id" TEXT NOT NULL,
ADD COLUMN     "terms_version" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "price_per_hour",
ADD COLUMN     "amenities" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "location_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "PricingPackage";

-- DropTable
DROP TABLE "SystemSetting";

-- DropTable
DROP TABLE "TermsConfig";

-- DropTable
DROP TABLE "TermsHistory";

-- CreateTable
CREATE TABLE "price_packages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "billing_unit" "BillingUnit" NOT NULL,
    "min_duration" INTEGER,
    "max_duration" INTEGER,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "room_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_base_rates" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "hourly_rate" DECIMAL(10,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'MXN',
    "effective_from" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_until" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "room_base_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terms_and_conditions" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "templateContent" TEXT NOT NULL,
    "additionalClauses" TEXT,
    "privacyOptions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "terms_and_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "price_packages_room_id_idx" ON "price_packages"("room_id");

-- CreateIndex
CREATE INDEX "price_packages_billing_unit_idx" ON "price_packages"("billing_unit");

-- CreateIndex
CREATE INDEX "room_base_rates_room_id_effective_from_idx" ON "room_base_rates"("room_id", "effective_from" DESC);

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "BusinessConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "price_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_packages" ADD CONSTRAINT "price_packages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_base_rates" ADD CONSTRAINT "room_base_rates_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
