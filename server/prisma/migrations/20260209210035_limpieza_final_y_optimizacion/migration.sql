-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'MXN',
ADD COLUMN     "paymentMethod" TEXT;

-- CreateIndex
CREATE INDEX "Reservation_roomId_start_time_end_time_idx" ON "Reservation"("roomId", "start_time", "end_time");
