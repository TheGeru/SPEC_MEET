import { Request, Response } from "express";
import prisma from "../config/prisma";
import { createRefund } from "../services/stripe.service";
import { deleteCalendarEvent } from "../services/calendar.service";

export const cancelReservation = async (req: Request, res: Response) => {
    try {
        const {reservationId} = req.params;
        const userId = req.user?.userId;

        const [reservation, config] = await Promise.all([
            prisma.reservation.findUnique({
                where: {id: reservationId},
                include: {payment: true}
            }),
            prisma.businessConfig.findFirst()
        ]);
        if(!reservation || reservation.userId !== userId) {
            return res.status(404).json({error: "Reserva no encontrada"});
        }

        if(reservation.status === "CANCELLED"){
            return res.status(400).json({error: "La reserva ya esta cancelada"});
        }

        if(!config) {
            return res.status(500).json({error: "Configuration de negocio no encontrada"});
        }

        const now = new Date();
        const startTime = new Date(reservation.start_time);
        const diffInMilliseconds = startTime.getTime() - now.getTime();
        const hoursUntilStart = diffInMilliseconds / (1000 * 60 * 60);

        let refundAmount = 0;
        let cancellationType = "NO_REFUND";

        if (hoursUntilStart >= config.refundFullHours){
            refundAmount = Number(reservation.total_paid);
            cancellationType = "FULL_REFUND";
        }

        else if (hoursUntilStart >= config.refundPartialHours) {
            refundAmount =  Number(reservation.total_paid) * (config.refundPartialPct / 100);
            cancellationType = "PARTIAL_REFUND";
        }

        if(refundAmount > 0 && reservation.payment) {
            await createRefund(reservation.payment.provider_id, refundAmount);
        }

        await prisma.reservation.update({
            where: {id: reservationId},
            data: {status: "CANCELLED"}
        });

        if (reservation.calendar_event_id) {
            await deleteCalendarEvent(reservation.calendar_event_id);
        }

        res.status(200).json({
            message: "Reserva Cancelada con exito",
            cancellationType,
            refundAmount: refundAmount
        });
    }catch(error: any){
        console.log("Errpr en cancellacion: ", error);
        res.status(500).json({error: "No se pudo procesar la cancelacion"});
    }
}