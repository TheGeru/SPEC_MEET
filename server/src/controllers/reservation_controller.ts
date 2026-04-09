import { Request, Response } from 'express';
import { prisma} from '../config/prisma';
import { ReservationStatus } from '@prisma/client';
import { reservationSchema, extensionSchema} from '../utils/validation';
import { createPaymentIntent } from '../services/stripe.service';
import { checkAvailability } from '../services/time_validation.service';
import { notifyAdminsNewReservation, sendConfirmationEmail } from '../services/email.service';
import { generatePasscode } from '../services/ttlock.service';
// ==========================================
// 1. CREAR RESERVA
// ==========================================
export const createReservation = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = reservationSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                error: 'Datos inválidos',
                details: validation.error.format()
            });
            return;
        }

        const { roomId, packageId, startTime, endTime, termsAccepted, acceptedVersion } = validation.data;
        
        const discountCodeId = req.body.discountCodeId || null;
        const isExtension =  false;
        const userId = req.user?.userId || '';
        
        const [user, room] = await Promise.all([
            prisma.user.findUnique({where: {id: userId} }),
            prisma.room.findUnique({
                where: {id: roomId},
                include: {location: true}
             }),
        ]);

        if (!user || !room) {
            res.status(404).json({ error: "Usuario o Sala no encontrados" });
            return;
        }

  // 1. Buscar paquete solo si el ID existe y no es una cadena vacía
        let pricePackage = null;
        if (packageId && packageId !== "") {
            pricePackage = await prisma.pricePackage.findFirst({
                where: {
                    id: packageId,
                    isActive: true,
                    OR: [
                        { roomId: roomId },
                        { roomId: null }
                    ]
                }
            });

            if (!pricePackage) {
                res.status(400).json({ error: "El paquete seleccionado no es válido" });
                return;
            }
        }

        // 2. Calcular duración (Fuera del if para que sirva a ambos contextos)
        const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        const durationHours = durationMinutes / 60; // La mantenemos en horas para otros cálculos

        // 3. Validar duración del paquete (Comparando MINUTOS con MINUTOS)
        if (pricePackage && pricePackage.minDuration) {
            if (durationMinutes !== pricePackage.minDuration) { // 🚀 FIX: Usamos durationMinutes
                res.status(400).json({
                    error: `Duración inválida. Este plan requiere exactamente ${pricePackage.minDuration} minutos.`
                });
                return;
            }
        }

        // 4. Buscar tarifa base (Solo si NO hay paquete)
        const activeRate = await prisma.roomBaseRate.findFirst({
            where: {
                roomId: roomId,
                effectiveFrom: { lte: startTime },
                OR: [
                    { effectiveUntil: null },
                    { effectiveUntil: { gte: startTime } }
                ]
            },
            orderBy: { effectiveFrom: 'desc' }
        });

        // 5. Validar que tengamos forma de cobrar
        if (!activeRate && !pricePackage) {
            res.status(400).json({ error: "No existe una tarifa activa para esta sala." });
            return;
        }

        const isAvailable = await checkAvailability(roomId, startTime, endTime);

        if(!isAvailable){
            res.status(409).json({
                error: "El horario seleccionado no esta disponible. Existe un conflicto con otra reserva o mantenimiento. "
            });
            return;
        }

        let activeDiscount = null;
        let billableHours = durationHours;

        // Solo procesamos el descuento si NO hay un plan activo
        if (!pricePackage && discountCodeId) {
            activeDiscount = await prisma.discountCode.findFirst({
                where: {
                    id: discountCodeId,
                    userId: userId,
                    isUsed: false, // Aseguramos que tenga horas disponibles
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gte: new Date() } }
                    ]
                }
            });

            if (activeDiscount) {
                // Restamos las horas. Si el cupón tiene 5h y la reserva es de 2h, cobra 0.
                billableHours = Math.max(0, durationHours - activeDiscount.hours);
            }
        }

        // --- CÁLCULO DE PRECIO ---
        const currentTaxtRate= Number(room.location.taxRate || 0.16);
        
        let subtotal : number;

        if (pricePackage) {
            // Extraemos el metadata de forma segura
            const metadata = pricePackage.metadata as any;
            const metaObj = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
            
            // 1. Intentar precio fijo (Por si algún día le pones un precio manual en DB)
            if (metaObj?.price || metaObj?.amount) {
                subtotal = Number(metaObj.price || metaObj.amount);
            } 
            // 2. CÁLCULO DINÁMICO (La forma oficial)
            else {
                // Leemos los datos que guardaste desde tu panel de administrador
                const blockHours = Number(metaObj?.blockHours || 1);
                const discountPct = Number(metaObj?.discountPct || 0);
                
                // Usamos la tarifa base que ya consultaste más arriba
                const baseHourlyRate = Number(activeRate!.hourlyRate); 
                
                // Matemáticas: Tarifa * Horas - Descuento
                const rawSubtotal = baseHourlyRate * blockHours;
                const discountAmount = rawSubtotal * (discountPct / 100);
                subtotal = rawSubtotal - discountAmount;
            }

            // Alerta de seguridad: Si el cálculo da 0 o menos, frenamos la reserva
            if (subtotal <=  0) {
                res.status(400).json({ error: "El plan seleccionado no tiene un precio válido o calculó $0." });
                return;
            }
        } else {
            // Reserva normal (por horas individuales)
            subtotal = Number(activeRate!.hourlyRate) * billableHours;
        }

        const totalAmount = subtotal * (1 + currentTaxtRate);
        const isTotallyFree = totalAmount === 0;
        
        const result = await prisma.$transaction(async (tx)=> {

            const isAvailable = await checkAvailability(roomId, startTime, endTime, undefined, tx);
            if(!isAvailable){
                throw new Error("CONFLICT")
            }

            const reservation = await tx.reservation.create({
            data: {
                userId,
                roomId,
                start_time: startTime,
                end_time: endTime,
                total_paid: totalAmount,
                status: isTotallyFree ? ReservationStatus.PAID : ReservationStatus.PENDING,
                terms_accepted: termsAccepted,
                termsVersion: acceptedVersion,
                isExtension,
                discountCodeId: activeDiscount ? activeDiscount.id : null
            },
        });

        // --- ACTUALIZAR EL CUPÓN ---
        if (activeDiscount && isTotallyFree) {
            // Calculamos cuántas horas se consumieron realmente
            const hoursConsumed = Math.min(durationHours, activeDiscount.hours);
            const remainingHours = activeDiscount.hours - hoursConsumed;

            await prisma.discountCode.update({
                where: { id: activeDiscount.id },
                data: {
                    hours: remainingHours,
                    isUsed: remainingHours <= 0 // Se desactiva si el saldo llega a 0
                }
            });
        }
        return reservation;
    });

    const newReservation = result;
        // --- INTENCIÓN DE PAGO O CONFIRMACIÓN DIRECTA ---
    if (isTotallyFree) {
            try {
                let accessCode = null;
                if(room.ttlock_lock_id){
                    const startWithBuffer = new Date(startTime.getTime() - 10 * 60000);
                    accessCode = await generatePasscode(room.ttlock_lock_id, startWithBuffer, endTime);
                }
                const fullReservation =await prisma.reservation.findUnique({
                    where: {id: newReservation.id},
                    include: {
                        user: true,
                        room: true
                    }
                });
                if(fullReservation){
                    await sendConfirmationEmail(fullReservation, accessCode);
                    await notifyAdminsNewReservation(newReservation.id);
                }

                res.status(201).json({
                    message: 'Reserva confirmada exitosamente con beneficio de cortesía.',
                    reservationId: newReservation.id,
                    totalAmount: 0,
                    clientSecret: null // El frontend sabrá que no debe abrir Stripe
                });
                return;

            } catch(error){
                console.error("Error en proceso post-reserva gratuira: ", error);
                res.status(201).json({
                    message: 'Reserva creada, pero hubo un detalle con el codigo de acceso. Contacto a soporte.',
                    reservationId: newReservation.id,
                    totalAmount: 0,
                    clientSecret: null
                });
                return;
            }
        } else {
            // FLUJO NORMAL CON STRIPE
            const paymentIntent = await createPaymentIntent(
                totalAmount,
                newReservation.id,
                user.email
            );

            res.status(201).json({
                message: 'Reserva iniciada. Se requiere pago.',
                reservationId: newReservation.id,
                clientSecret: paymentIntent.client_secret,
                totalAmount,
            });
            return;
        }

    } catch (error: any) {
        if(error.message === "CONFLICT"){
            res.status(409).json({
                error: "El horario seleccionado acaba de ser reservado por alguien mas."
            });
            return;
        }
        console.error("Error creating reservation:", error);
        res.status(500).json({error: "Error interno al crear reserva"})
    }
};

// ==========================================
// 2. OBTENER CALENDARIO ADMIN (Rango)
// ==========================================
export const getReservationsByRange = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId, startDate, endDate } = req.query;

        if (!roomId || !startDate || !endDate) {
            res.status(400).json({ error: "Faltan parámetros roomId, startDate o endDate" });
            return;
        }

        const start = new Date(startDate as string);
        const end = new Date(endDate as string);


        const [reservations, blocks] = await Promise.all([
           prisma.reservation.findMany({
            where:{
                roomId: String(roomId),
                status: {not:  ReservationStatus.CANCELLED},
                start_time: {gte: start, lte: end}
            },
            include: {user: {select: {name: true, email: true}}}
           }),
           prisma.blockedSlot.findMany({
            where: {
                roomId: String(roomId),
                start_time: {gte: start, lte: end}
            }
           })
        ]);
        res.json({ reservations, blocks });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error obteniendo calendario" });
    }
};

// ==========================================
// 3. OBTENER CALENDARIO USUARIO (Día)
// ==========================================
export const getReservationsByDate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId, startOfDay, endOfDay} = req.query;

        if (!roomId || !startOfDay || !endOfDay) {
            res.status(400).json({ error: 'Faltan parámetros roomId, StartDay o endDay' });
            return;
        }
        const start = new Date(startOfDay as string);
        const end = new Date(endOfDay as string);

        const [reservations, blocks] = await Promise.all([
            prisma.reservation.findMany({
                where: {
                    roomId: String(roomId),
                    status: { not: ReservationStatus.CANCELLED},
                    start_time: { gte: start, lte: end }
                },
                select: { start_time: true, end_time: true, userId: true }
            }),
            prisma.blockedSlot.findMany({
                where: {
                    roomId: String(roomId),
                    start_time: { gte: start, lte: end }
                },
                select: { start_time: true, end_time: true, reason: true }
            })
        ]);

        const currentUserId = req.user?.userId || '';

        const responseData = [
            ...reservations.map(r => ({
                start: r.start_time,
                end: r.end_time,
                type: r.userId === currentUserId ? 'MY_RESERVATION' : 'RESERVATION'
            })),
            ...blocks.map(b => ({
                start: b.start_time,
                end: b.end_time,
                type: 'BLOCK',
                reason: b.reason
            }))
        ];

        res.json(responseData);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener reservas' });
    }
};

// ==========================================
// 4. MIS RESERVAS
// ==========================================
export const getMyReservations = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId || '';

        const myReservations = await prisma.reservation.findMany({
            where: {
                userId: userId,
                status: { not: ReservationStatus.CANCELLED },
                start_time: {
                    gte: new Date() // Solo reservas futuras o de hoy
                }
            },
            select: { start_time: true },
        });

        const dates = myReservations.map(r => r.start_time.toISOString().split('T')[0]);
        const uniqueDates = [...new Set(dates)];
        res.json(uniqueDates);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obteniendo mis reservas' });
    }
};

export const extendReservation = async (req: Request, res: Response) => {
    try {
        const validation = extensionSchema.safeParse(req.body);

        if(!validation.success){
            return res.status(400).json({
                error: 'Datos invalidos para la extension',
                details: validation.error.format()
            });
        }

        const userId = req.user?.userId;
        const {reservationId} = req.params;
        const {additionalHours} = validation.data;

        const original = await prisma.reservation.findUnique({
            where: {id: reservationId},
            include: {
                room: {include: {location: true}}
            }
        });

        if(!original) return res.status(404).json({error: "Reserva original no encontrada"});

        if(original.userId !== req.user?.userId){
            return res.status(403).json({
                error: "No tienes permiso para extender una reserva que no es tuya, respeta"
            })
        }

        if (original.end_time < new Date()) {
            return res.status(400).json({ 
                error: "No puedes extender una reserva que ya ha finalizado." 
            });
        } 
              
        const newStart = original.end_time;
        const newEnd = new Date(newStart.getTime() + (additionalHours * 60 * 60 * 1000));

        const isAvailable = await checkAvailability(original.roomId, newStart, newEnd);
        if(!isAvailable){
            return res.status(409).json({error: "No es posible extender; la sala ya esta reservada despues de tu horario"});
        }

        const rate = await prisma.roomBaseRate.findFirst({
            where: {roomId: original.roomId, effectiveFrom: {lte: new Date()}},
            orderBy: {effectiveFrom: 'desc'}
        });

        const taxRate = Number(original.room.location.taxRate || 0.16);
        const subtotalExtra = Number(rate?.hourlyRate || 0) * additionalHours;
        const totalExtra = subtotalExtra * (1 + taxRate);

        const extension = await prisma.reservation.create({
            data: {
                userId: original.userId,
                roomId: original.roomId,
                start_time: newStart,
                end_time: newEnd,
                total_paid: totalExtra,
                status: ReservationStatus.PENDING,
                isExtension: true,
                parentReservationId: original.id,
                terms_accepted: true,
                termsVersion: original.termsVersion
            }
        });

        const paymentIntent = await createPaymentIntent(totalExtra, extension.id, req.user?.email || '');

        res.json({
            clientSecret: paymentIntent.client_secret,
            extension: extension.id,
            totalExtra
        });
    } catch(error){
        console.error("Error en extension:", error);
        res.status(500).json({error: "Error al procesar la extension"});
    }
}