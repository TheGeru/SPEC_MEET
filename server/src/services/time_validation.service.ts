import { ReservationStatus } from "@prisma/client";
import prisma from "../config/prisma";

export const checkAvailability = async (
    roomId: string,
    startTime: Date,
    endTime: Date,
    excludeReservationId?: string,
    tx: any = prisma
) => {
    const config = await tx.businessConfig.findFirst();
    const bufferMinutes = config?.cleaningBufferMinutes ?? 30;

    const startWithBuffer = new Date(startTime.getTime() - bufferMinutes * 60000);
    const endWithBuffer = new Date(endTime.getTime() + bufferMinutes * 60000);

    const collisions = await tx.reservation.findFirst({
        where: {
            roomId: roomId,
            status: {in: [
                ReservationStatus.PAID,
                ReservationStatus.CONFIRMED,
                ReservationStatus.PENDING
            ]},
            NOT: excludeReservationId ? {id: excludeReservationId} : undefined,
            AND: [
                {
                    start_time: {lt: endWithBuffer},
                    end_time: {gt: startWithBuffer}
                }
            ]
        } 
    });

    const blocks = await tx.blockedSlot.findFirst({
        where: {
            roomId: roomId,
            start_time: {lt: endWithBuffer},
            end_time: {gt: startWithBuffer}
        }
    });
    return !collisions && !blocks;
}