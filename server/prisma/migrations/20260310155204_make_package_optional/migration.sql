-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_package_id_fkey";

-- AlterTable
ALTER TABLE "Reservation" ALTER COLUMN "package_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "price_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
