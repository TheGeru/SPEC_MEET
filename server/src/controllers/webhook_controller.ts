import { Request, Response } from 'express';
import { prisma } from "../config/prisma";
import { constructEvent } from '../services/stripe.service';
import { generatePasscode } from '../services/ttlock.service';
import { createReservationEvent } from '../services/calendar.service';
import { sendEmail } from '../services/email.service';

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

        console.log(`💰 Pago confirmado por Stripe. Procesando Reserva ID: ${reservationId}`);

        try {
            // A. Buscar la reserva, la sala Y EL USUARIO (para saber a quién mandarle correo)
            const reservation = await prisma.reservation.findUnique({
                where: { id: reservationId },
                include: { 
                    room: true,
                    user: true // <-- Nuevo: Necesitamos el correo y nombre del cliente
                }
            });

            if (!reservation) {
                console.error("Reserva no encontrada en base de datos.");
                res.status(404).json({ error: "Reserva no encontrada" });
                return;
            }

            if(reservation.status === 'PAID'){
                console.log(`⚠️ La reserva ${reservationId} ya había sido procesada. Ignorando webhook repetido.`);
                res.json({ received: true });
                return;
            }
            // B. GENERAR CÓDIGO DE ACCESO (TTLock)
            let accessCode = null;

            if (reservation.room.ttlock_lock_id) {
                try {
                    accessCode = await generatePasscode(
                        reservation.room.ttlock_lock_id, // TTLock pide número
                        reservation.start_time,
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
                await tx.reservation.update({
                    where: {id: reservationId},
                    data: {
                        status: 'PAID',
                        access_code: accessCode
                    }
                });

                await tx.payment.create({
                    data: {
                        amount: paymentIntent.amount / 100,
                        status: 'COMPLETED',
                        provider_id: paymentIntent.id,
                        iva_breakdown: "IVA 16% INCLUIDO",
                        reservationId: reservationId, 
                    }
                });
            });

            console.log(`✅ BD Actualizada. Reserva ${reservationId} marcada como PAID.`);

            // D. AGENDAR EN GOOGLE CALENDAR (Solo para el Admin)
            await createReservationEvent({
                summary: `Reserva SPEC MEET: ${reservation.room.name} - ${reservation.user.name}`,
                description: `Cliente: ${reservation.user.name}\nCorreo: ${reservation.user.email}\nID Reserva: ${reservation.id}`,
                startTime: reservation.start_time,
                endTime: reservation.end_time
            });

            // E. ENVIAR CORREO DE CONFIRMACIÓN AL CLIENTE
            // Formateamos las fechas para que se vean bonitas en el correo
            const fechaInicioStr = reservation.start_time.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
            const fechaFinStr = reservation.end_time.toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });

            const opcionesFecha: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Mexico_City' };
            const opcionesHora: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City' };

            const fechaReserva = reservation.start_time.toLocaleDateString('es-MX', opcionesFecha);
            const horaInicio = reservation.start_time.toLocaleTimeString('es-MX', opcionesHora);
            const horaFin = reservation.end_time.toLocaleTimeString('es-MX', opcionesHora);
            
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e4e4e7; border-radius: 12px; background-color: #ffffff; color: #27272a;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #000000; margin-bottom: 5px;">¡Bienvenido a tu sala .MEET! 🎉</h2>
                    </div>
                    
                    <p style="font-size: 16px;">Hola <strong>${reservation.user.name}</strong>,</p>
                    <p style="font-size: 16px; line-height: 1.5;">Tu reservación ha sido confirmada exitosamente. Nos da mucho gusto recibirte.</p>
                    <p style="font-size: 16px; line-height: 1.5;">A continuación, te compartimos todos los detalles que necesitas para tu sesión:</p>
                    
                    <div style="background-color: #f4f4f5; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e4e4e7;">
                        <p style="margin: 5px 0; font-size: 15px;"><strong>📅 Fecha:</strong> <span style="text-transform: capitalize;">${fechaReserva}</span></p>
                        <p style="margin: 5px 0; font-size: 15px;"><strong>⏰ Horario:</strong> ${horaInicio} a ${horaFin}</p>
                    </div>

                    <h3 style="color: #000000; margin-top: 30px; border-bottom: 2px solid #f4f4f5; padding-bottom: 5px;">🔑 Tu Acceso Autónomo</h3>
                    
                    ${accessCode 
                        ? `<div style="text-align: center; margin: 20px 0; padding: 20px; background-color: #000000; border-radius: 8px;">
                             <p style="margin: 0; color: #a1a1aa; font-size: 14px;">Código de puerta:</p>
                             <p style="font-size: 32px; font-weight: bold; color: #ffffff; letter-spacing: 5px; margin: 10px 0;">${accessCode}</p>
                             <p style="font-size: 12px; color: #a1a1aa; line-height: 1.4; margin-top: 10px;">(Digita este código en la cerradura electrónica para abrir. Tu código se activará 10 minutos antes de tu horario de inicio y caducará al finalizar tu tiempo).</p>
                           </div>` 
                        : `<div style="text-align: center; margin: 20px 0; padding: 20px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; color: #d97706;">
                             <p style="margin: 0;"><strong>⚠️ Tu código de acceso está en proceso.</strong></p>
                             <p style="font-size: 14px; margin-top: 10px;">Tuvimos un ligero retraso generando tu PIN automático. Te lo enviaremos a la brevedad. ¡Tu reserva está 100% confirmada!</p>
                           </div>`
                    }

                    <h3 style="color: #000000; margin-top: 30px; border-bottom: 2px solid #f4f4f5; padding-bottom: 5px;">📍 Ubicación</h3>
                    <p style="margin: 5px 0; font-size: 15px;"><strong>Lugar:</strong> Plaza Distrito Marqués, Local 209</p>
                    <p style="margin: 5px 0; font-size: 15px;"><strong>Dirección:</strong> Av. Paseo de la Reforma 231, Int 209. Lomas del Marqués. Querétaro Qro. 76146</p>
                    <p style="margin: 10px 0 5px 0; font-size: 15px;"><strong>🗺️ Google Maps:</strong> <a href="https://maps.app.goo.gl/Q35LHn7vStRbMfkH7" style="color: #2563eb; text-decoration: none;">Abrir en el mapa</a></p>

                    <h3 style="color: #000000; margin-top: 30px; border-bottom: 2px solid #f4f4f5; padding-bottom: 5px;">💡 Información Útil</h3>
                    <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <p style="margin: 5px 0; font-size: 15px;"><strong>📶 Red WiFi:</strong> ${reservation.room.wifi_ssid}</p>
                        <p style="margin: 5px 0; font-size: 15px;"><strong>🔐 Contraseña:</strong> ${reservation.room.wifi_pass}</p>
                    </div>

                    <p style="font-size: 15px; line-height: 1.5; margin-top: 20px;">Al ser un espacio 100% autónomo, te pedimos amablemente que al finalizar tu sesión nos ayudes <strong>apagando las luces y el aire acondicionado</strong>, y verificando que la puerta quede bien cerrada al salir.</p>
                    
                    <p style="font-size: 15px; line-height: 1.5;">Si necesitas asistencia durante tu visita, puedes responder a este correo o escribirnos directamente a nuestro WhatsApp: <a href="https://wa.me/521234567890" style="color: #2563eb; text-decoration: none;">[PON_TU_NUMERO_AQUI]</a>.</p>
                    
                    <p style="font-size: 16px; font-weight: bold; margin-top: 30px; text-align: center;">¡Que tengas una excelente y productiva sesión!</p>
                    <p style="font-size: 14px; color: #71717a; text-align: center;">Atentamente,<br>El equipo de .MEET</p>
                </div>
            `;

            await sendEmail(reservation.user.email, '¡Reserva Confirmada! - SPEC MEET', emailHtml);

        } catch (error) {
            console.error("❌ Error interno procesando webhook:", error);
            res.status(500).json({ error: "Error interno" });
            return;
        }
    }
    // 4. RESPONDER A STRIPE RÁPIDO
    res.json({ received: true });
};