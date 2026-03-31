import prisma from "../config/prisma";

export const checkAvailability = async (
    roomId: string,
    startTime: Date,
    endTime: Date,
    excludeReservationId?: string
) => {
    const config = await prisma.businessConfig.findFirst();
    const bufferMinutes = config?.cleaningBufferMinutes ?? 30;

    const startWithBuffer = new Date(startTime.getTime() - bufferMinutes * 60000);
    const endWithBuffer = new Date(endTime.getTime() + bufferMinutes * 60000);

    const collisions = await prisma.reservation.findFirst({
        where: {
            roomId: roomId,
            status: {in: ['PAID', 'CONFIRMED', 'PENDIG']},
            NOT: excludeReservationId ? {id: excludeReservationId} : undefined,
            AND: [
                {
                    start_time: {lt: endWithBuffer},
                    end_time: {gt: startWithBuffer}
                }
            ]
        } 
    });

    const blocks = await prisma.blockedSlot.findFirst({
        where: {
            roomId: roomId,
            start_time: {lt: endWithBuffer},
            end_time: {gt: startWithBuffer}
        }
    });
    return !collisions && !blocks;
}