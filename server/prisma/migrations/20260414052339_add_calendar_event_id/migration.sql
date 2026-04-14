-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "calendar_event_id" TEXT;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_parentReservationId_fkey" FOREIGN KEY ("parentReservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
