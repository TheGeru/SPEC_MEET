import {Request, Response} from 'express';
import { prisma } from "../config/prisma";
import { reservationSchema } from '../utils/validation';
import { createPaymentIntent} from '../services/stripe.service';

export const createReservation = async (req: Request, res: Response): Promise<void> =>{
    try {
        const validation = reservationSchema.safeParse(req.body);

        if(!validation.success) {
            res.status(400).json({
                error: "Datos invalidos",
                details: validation.error.format()
            });
            return;
        }
        const {roomId, startTime, endTime, termsAccepted, acceptedVersion} = validation.data;
        const userId = (req as any).user?.userId || (req as any).user?.id;
        const user = await prisma.user.findUnique({
            where: {id: userId}
        });

        if(!user){
            res.status(404).json({
                error: "Usuario no encontrado"
            });
            return;
        }

        const room = await prisma.room.findUnique({
            where: {id: roomId}
        });

        if(!room){
            res.status(404).json({
                error: "Sala no encontrada"
            });
            return;
        }

        const CLEANING_BUFFER_MS = 30 * 60 * 1000;
        const mySafeStart = new Date(startTime.getTime() - CLEANING_BUFFER_MS);
        const myEffectiveEnd = new Date(endTime.getTime() + CLEANING_BUFFER_MS);

        const conflict = await prisma.reservation.findFirst({
            where: {
                roomId: roomId,
                status: {not: "CANCELLED"},
                AND: [
                    {
                        start_time: {lt: myEffectiveEnd}
                    },
                    {
                        end_time: {gt: mySafeStart}
                    }
                ]
            }
        });

        if(conflict){
            res.status(409).json({
                error: "Horario no disponible. Existe un conflicto con otra reserva o su tiempo de limpieza"
            });
            return;
        }

        // calculo del precio
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);

        if(durationHours <= 0){
            res.status(400).json({
                error: "La hora de fin debe ser mayor a la de inicio"
            })
        }

        const totalAmount = Number(room.price_per_hour) * durationHours;

        const newReservation = await prisma.reservation.create({
            data: {
                userId: user.id,
                roomId: room.id,
                start_time: startTime,
                end_time: endTime,
                total_paid: totalAmount,
                status: "PENDING",     // <--- Nace pendiente de pago
                access_code: null,     // <--- Aún no tiene llave
                terms_accepted: termsAccepted,       // <--- Guardamos que aceptó
                accepted_terms_version: acceptedVersion
            },
        });

        const paymentIntent = await createPaymentIntent(
            totalAmount,
            newReservation.id,
            user.email
        );

        res.status(201).json({
            message: "Reserva iniciada, Se requiere pago.",
            reservationId: newReservation.id,
            clientSecret: paymentIntent.client_secret,
            totalAmount: totalAmount
        });
    } catch(error){
        console.error("Error al crear reserva:", error);
        res.status(500).json({error: "Error interno del servidor al procesar la reserva"});
    }
}