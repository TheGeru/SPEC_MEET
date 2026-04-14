import { Request, Response } from 'express';
import { prisma } from "../config/prisma";
import { ReservationStatus } from '@prisma/client';
import { constructEvent } from '../services/stripe.service';
import { generatePasscode } from '../services/ttlock.service';
import { createReservationEvent } from '../services/calendar.service';
import { notifyAdminsNewReservation, sendConfirmationEmail} from '../services/email.service';

export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
    // 1. OBTENER LA FIRMA DE SEGURIDAD
    const sig = req.headers['stripe-signature'] as string;
    let event;

    try {
        // 2. VALIDAR LA FIRMA
        event = constructEvent(req.body, sig);
    } catch (err) {
        console.error("❌ Error validando firma del Webhook:", err)
        res.status(400).send(`Webhook Error: ${err}`);
        return;
    }

    // 3. MANEJAR EL EVENTO DE PAGO EXITOSO
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as any;
        const reservationId = paymentIntent.metadata.reservationId;

        console.log(`💰 Evento ${event.type} recibido. ID Reserva:`, reservationId);

        if (!reservationId) {
            console.error("❌ ERROR: El pago no tiene un reservationId en su metadata.");
            res.status(400).send("Falta reservationId en metadata");
            return;
        }

        try {
            // A. Buscar la reserva, la sala Y EL USUARIO (para saber a quién mandarle correo)
            const reservation = await prisma.reservation.findUnique({
                where: { id: reservationId },
                include: { 
                    room: {include: {location: true}},
                    user: true // <-- Nuevo: Necesitamos el correo y nombre del cliente
                }
            });

            

            const taxtRate = reservation?.room.location.taxRate ? Number(reservation.room.location.taxRate) : 0.16;
            const porcentajeIva = taxtRate * 100;

            if(!reservation) {
                console.error(`❌ ERROR: No se encontró la reserva con ID ${reservationId} en la base de datos.`);
                res.json({received: true});
                return;
            }

            if (reservation.status === ReservationStatus.PAID) {
            console.log(`⚠️ La reserva ${reservationId} ya estaba marcada como pagada.`);
            res.json({received: true});
            return;
        }
            // B. GENERAR CÓDIGO DE ACCESO (TTLock)
            let accessCode = null;
            if (reservation.room.ttlock_lock_id) {
                try {
                    const horaAperturaAdelantada = new Date(reservation.start_time.getTime() - (10 * 60 * 1000));
                    accessCode = await generatePasscode(
                        reservation.room.ttlock_lock_id, // TTLock pide número
                        horaAperturaAdelantada,
                        reservation.end_time
                    );
                } catch (ttlockError) {
                    console.error("⚠️ Error generando código TTLock:", ttlockError);
                }
            } else {
                console.warn("⚠️ La sala no tiene cerradura vinculada (ttlock_lock_id es null).");
            }

            // C. ACTUALIZAR BASE DE DATOS
            await prisma.$transaction(async (tx) => {
                const updatedReservation = await tx.reservation.update({
                    where: {id: reservationId},
                    data: {
                        status: ReservationStatus.PAID,
                        access_code: accessCode
                    }
                });

                await tx.payment.create({
                    data: {
                        amount: paymentIntent.amount / 100,
                        status: 'COMPLETED',
                        provider_id: paymentIntent.id,
                        iva_breakdown: `IVA ${porcentajeIva}% INCLUIDO`,
                        reservationId: reservationId, 
                    }
                });

                if(reservation.discountCodeId) {
                    const activeDiscount = await tx.discountCode.findUnique({
                        where: {id: reservation.discountCodeId}
                    });

                    if(activeDiscount){
                        const durationMinutes = (reservation.end_time.getTime() - reservation.start_time.getTime()) / (1000 * 60);
                        const durationHours = durationMinutes / 60;
                        
                        const hoursConsumed = Math.min(durationHours, activeDiscount.hours);
                        const remainingHours = activeDiscount.hours - hoursConsumed;

                        await tx.discountCode.update({
                            where: {id: activeDiscount.id},
                            data: {
                                hours: remainingHours,
                                isUsed: remainingHours <= 0
                            }
                        });
                        console.log(`🎟️ Cupón ${activeDiscount.code} actualizado. Horas restantes: ${remainingHours}`);
                    }
                 }

                if(updatedReservation.isExtension && updatedReservation.parentReservationId){
                    await tx.reservation.update({
                        where: {id: updatedReservation.parentReservationId},
                        data: {
                            end_time: updatedReservation.end_time
                        }
                    });
                    console.log(`🔗 Extensión vinculada: La reserva padre ${updatedReservation.parentReservationId} ha sido prolongada.`);
                }
            });
            

            console.log(`✅ BD Actualizada. Reserva ${reservationId} marcada como PAID.`);

            await notifyAdminsNewReservation(reservationId);
            await createReservationEvent({
                summary: `Reserva SPEC MEET: ${reservation.room.name} - ${reservation.user.name}`,
                description: `Cliente: ${reservation.user.name}\nCorreo: ${reservation.user.email}\nID Reserva: ${reservation.id}`,
                startTime: reservation.start_time,
                endTime: reservation.end_time
            });
            await sendConfirmationEmail(reservation, accessCode);
            console.log(`✅ Proceso completado para Reserva: ${reservationId}`);

        } catch (error) {
            console.error("❌ Error interno procesando webhook:", error);
            res.status(500).json({ error: "Error interno" });
            return;
        }
    }
    // 4. RESPONDER A STRIPE RÁPIDO
    res.json({ received: true });
};