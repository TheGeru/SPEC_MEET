import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { reservationSchema } from '../utils/validation';
import { createPaymentIntent } from '../services/stripe.service';

// Constantes de tiempo
const CLEANING_BUFFER_MS = 30 * 60 * 1000; // 30 minutos
const MAINTENANCE_BUFFER_MS = 15 * 60 * 1000; // 15 minutos

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
        const userId = req.user?.userId || '';
        
        const [user, room] = await Promise.all([
            prisma.user.findUnique({where: {id: userId} }),
            prisma.room.findUnique({where: {id: roomId} }),
        ]);

        if (!user || !room) {
            res.status(404).json({ error: "Usuario o Sala no encontrados" });
            return;
        }

        const pricePackage = await prisma.pricePackage.findFirst({
            where: {
                id: packageId,
                isActive: true,
                OR: [
                    {roomId: roomId},
                    {roomId: null}
                ]
            }
        });

        if(!pricePackage){
            res.status(400).json({error: "El paquete seleccionado no es valido para esta sala"});
            return;
        }

        const activeRate = await prisma.roomBaseRate.findFirst({
            where: {
                roomId: roomId,
                effectiveFrom: {lte: startTime},
                OR: [
                    {effectiveUntil: null},
                    {effectiveUntil: {gte: startTime}}
                ]
            },
            orderBy: {effectiveFrom: 'desc'}
        });

        if(!activeRate){
            res.status(400).json({error: "No existe una tarifa activa para esta sala. Contacta al administrador"});
            return;
        }
        // --- LÓGICA DE CONFLICTOS Y BUFFERS ---
        const mySafeStart = new Date(startTime.getTime() - CLEANING_BUFFER_MS);
        const myEffectiveEnd = new Date(endTime.getTime() + CLEANING_BUFFER_MS);

        const [conflictReservation, conflictBlock] = await Promise.all([
            prisma.reservation.findFirst({
                where: {
                    roomId,
                    status: {not: 'CANCELLED'},
                    AND: [
                        {start_time: {lt: myEffectiveEnd}},
                        {end_time: {gt: mySafeStart}}
                    ]
                }
            }),
            prisma.blockedSlot.findFirst({
                where: {
                    roomId,
                    AND: [
                        {start_time: {lt: myEffectiveEnd}},
                        {end_time: {gt: new Date(startTime.getTime() - MAINTENANCE_BUFFER_MS)}}
                    ]
                }
            })
        ]);

        if (conflictReservation || conflictBlock) {
            res.status(409).json({
                error: conflictReservation
                    ? "Horario no disponible. Existe un conflicto con otra reserva."
                    : "Horario no disponible por mantenimiento programado."
            });
            return;
        }

        // --- CÁLCULO DE PRECIO ---
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        const totalAmount = Number(activeRate.hourlyRate) * durationHours;

        const newReservation = await prisma.reservation.create({
            data: {
                userId: user.id,
                roomId: room.id,
                start_time: startTime,
                end_time: endTime,
                total_paid: totalAmount,
                status: "PENDING",
                access_code: null, // Se guarda null hasta que pague (o accessCode si prefieres guardarlo ya)
                terms_accepted: termsAccepted,
                termsVersion: acceptedVersion
            },
        });

        // --- INTENCIÓN DE PAGO STRIPE ---
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

    } catch (error) {
        console.error("Error creating reservation:", error);
        res.status(500).json({ error: "Error interno al crear reserva" });
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

        const start = new Date(`${startDate}T00:00:00-06:00`);
        const end = new Date(`${endDate}T23:59:59-06:00`);


        const [reservations, blocks] = await Promise.all([
           prisma.reservation.findMany({
            where:{
                roomId: String(roomId),
                status: {not: "CANCELLED"},
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
        const { roomId, date } = req.query;

        if (!roomId || !date) {
            res.status(400).json({ error: 'Faltan parámetros roomId o date' });
            return;
        }
        const startOfDay = new Date(`${date}T00:00:00-06:00`);
        const endOfDay = new Date(`${date}T23:59:59-06:00`);

        const [reservations, blocks] = await Promise.all([
            prisma.reservation.findMany({
                where: {
                    roomId: String(roomId),
                    status: { not: "CANCELLED" },
                    start_time: { gte: startOfDay, lte: endOfDay }
                },
                select: { start_time: true, end_time: true, userId: true }
            }),
            prisma.blockedSlot.findMany({
                where: {
                    roomId: String(roomId),
                    start_time: { gte: startOfDay, lte: endOfDay }
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
                status: { not: "CANCELLED" },
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