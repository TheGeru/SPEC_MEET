import {Request, Response} from 'express';
import { prisma } from "../config/prisma";
import { reservationSchema } from '../utils/validation';
import { createPaymentIntent} from '../services/stripe.service';

const CLEANING_BUFFER_MS = 30 * 60 * 1000; // 30 minutos después de cada reserva
const MAINTENANCE_BUFFER_MS = 15 * 60 * 1000; // 15 minutos después de mantenimiento

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

        const user = await prisma.user.findUnique({where: {id: userId}});
        const room = await prisma.room.findUnique({where: {id: roomId}});

        if (!user || !room){
            res.status(400).json({error: "Usuario o Sala no encontrados"});
            return;
        }

        // Aplicar buffers de seguridad
        const mySafeStart = new Date(startTime.getTime() - CLEANING_BUFFER_MS);
        const myEffectiveEnd = new Date(endTime.getTime() + CLEANING_BUFFER_MS);

        // Verificar conflictos con otras reservas (incluyendo buffer de limpieza)
        const conflictReservation = await prisma.reservation.findFirst({
            where: {
                roomId: roomId,
                status: {not: "CANCELLED"},
                AND: [
                    { start_time: {lt: myEffectiveEnd}},
                    {end_time: {gt: mySafeStart}}
                ]
            }
        });

        // Verificar conflictos con bloqueos de mantenimiento (incluyendo buffer)
        const conflictBlock = await prisma.blockedSlot.findFirst({
            where: {
                roomId: roomId,
                AND: [
                    {start_time: {lt: myEffectiveEnd}},
                    {end_time: {gt: new Date(startTime.getTime() - MAINTENANCE_BUFFER_MS)}}
                ]
            }
        });

        if(conflictReservation || conflictBlock){
            res.status(409).json({
                error: conflictReservation
                ?"Horario no disponible. Existe un conflicto con otra reserva o su tiempo de limpieza"
                : "Horario no disponible por mantenimiento programado."
            });
            return;
        }
        
        // Cálculo del precio
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        const totalAmount = Number(room.price_per_hour) * durationHours;

        const newReservation = await prisma.reservation.create({
            data: {
                userId: user.id,
                roomId: room.id,
                start_time: startTime,
                end_time: endTime,
                total_paid: totalAmount,
                status: "PENDING",
                access_code: null,
                terms_accepted: termsAccepted,
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

// Obtener reservas y bloqueos por rango de fechas (para vista admin)
export const getReservationsByRange = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId, startDate, endDate } = req.query;

        if (!roomId || !startDate || !endDate) {
             res.status(400).json({ error: "Faltan parámetros roomId, startDate o endDate" });
             return;
        }

        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T23:59:59`);

        // 1. Reservas
        const reservations = await prisma.reservation.findMany({
            where: {
                roomId: String(roomId),
                status: { not: "CANCELLED" },
                start_time: { gte: start, lte: end }
            },
            include: { user: { select: { name: true, email: true } } }
        });

        // 2. Bloqueos
        const blocks = await prisma.blockedSlot.findMany({
            where: {
                roomId: String(roomId),
                start_time: { gte: start, lte: end }
            }
        });

        res.json({ reservations, blocks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error obteniendo calendario" });
    }
};

// FUNCIÓN CORREGIDA: Obtener reservas y bloqueos de un día específico con formato correcto
export const getReservationsByDate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId, date } = req.query;

        if (!roomId || !date) {
             res.status(400).json({ error: "Faltan parámetros roomId o date" });
             return;
        }

        // Definir el rango del día completo (00:00 a 23:59)
        const startOfDay = new Date(`${date}T00:00:00`);
        const endOfDay = new Date(`${date}T23:59:59`);

        const reservations = await prisma.reservation.findMany({
            where: {
                roomId: String(roomId),
                status: { not: "CANCELLED" },
                start_time: {gte: startOfDay, lte: endOfDay}
            },
            select: {start_time: true, end_time: true, userId: true}
        });

        const blocks = await prisma.blockedSlot.findMany({
            where: {
                roomId: String(roomId),
                start_time: {gte: startOfDay, lte: endOfDay}
            },
            select: {start_time: true, end_time: true, reason: true}
        });

        const currentUserId = (req as any).user?.userId || (req as any).user?.id;
        
        // CORRECCIÓN: Devolver el array formateado correctamente
        const responseData = [
            ...reservations.map(r => ({
                start: r.start_time,
                end: r.end_time,
                type: r.userId === currentUserId ? 'MY_RESERVATION': 'RESERVATION'
            })),
            ...blocks.map(b => ({
                start: b.start_time,
                end: b.end_time,
                type: 'BLOCK',
                reason: b.reason
            }))
        ];

        res.json(responseData); // CORRECCIÓN: Devolver responseData en lugar de solo reservations
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener reservas" });
    }
};

// Obtener SOLO las fechas con reservas del usuario logueado
export const getMyReservations = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        
        const myReservations = await prisma.reservation.findMany({
            where: {
                userId: userId,
                status: { not: "CANCELLED" },
                start_time: {
                    gte: new Date() // Solo reservas futuras o de hoy
                }
            },
            select: {
                start_time: true
            }
        });

        // Formato simplificado: ["2026-02-14", "2026-02-20"]
        const dates = myReservations.map(r => r.start_time.toISOString().split('T')[0]);
        
        // Eliminamos duplicados (por si tiene 2 reservas el mismo día)
        const uniqueDates = [...new Set(dates)];

        res.json(uniqueDates);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error obteniendo mis reservas" });
    }
};