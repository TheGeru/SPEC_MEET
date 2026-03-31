-- AlterTable
ALTER TABLE "BusinessConfig" ADD COLUMN     "cleaningBufferMinutes" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "discountCodeId" TEXT,
ADD COLUMN     "isExtension" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentReservationId" TEXT;

-- CreateTable
CREATE TABLE "DiscountCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "hours" INTEGER NOT NULL,
    "description" TEXT,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "DiscountCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_code_key" ON "DiscountCode"("code");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_discountCodeId_fkey" FOREIGN KEY ("discountCodeId") REFERENCES "DiscountCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscountCode" ADD CONSTRAINT "DiscountCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
