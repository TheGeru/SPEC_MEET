import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { reservationSchema } from '../utils/validation';
import { createPaymentIntent } from '../services/stripe.service';

// ─── Helper: genera PIN de 6 dígitos ────────────────────────
// En producción esto se reemplaza por la llamada real a TTLock API
const generateAccessCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// ================================================================
// POST /api/reservations — Crear reserva + Payment Intent
// ================================================================
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

        const { roomId, startTime, endTime, termsAccepted, acceptedVersion } = validation.data;
        const userId = (req as any).user?.userId || (req as any).user?.id;

        const [user, room] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.room.findUnique({ where: { id: roomId } }),
        ]);

        if (!user) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }
        if (!room) { res.status(404).json({ error: 'Sala no encontrada' }); return; }

        // ── Validación de conflicto con buffer de limpieza ────
        const CLEANING_BUFFER_MS = 30 * 60 * 1000;
        const mySafeStart        = new Date(startTime.getTime() - CLEANING_BUFFER_MS);
        const myEffectiveEnd     = new Date(endTime.getTime() + CLEANING_BUFFER_MS);

        const conflict = await prisma.reservation.findFirst({
            where: {
                roomId,
                status: { not: 'CANCELLED' },
                AND: [
                    { start_time: { lt: myEffectiveEnd } },
                    { end_time:   { gt: mySafeStart    } },
                ],
            },
        });

        if (conflict) {
            res.status(409).json({
                error: 'Horario no disponible. Existe un conflicto con otra reserva o su tiempo de limpieza'
            });
            return;
        }

        // ── Cálculo de precio ─────────────────────────────────
        const durationMs    = endTime.getTime() - startTime.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);

        if (durationHours <= 0) {
            res.status(400).json({ error: 'La hora de fin debe ser mayor a la de inicio' });
            return;
        }

        const totalAmount = Number(room.price_per_hour) * durationHours;

        // ── BUG 1 CORREGIDO: generar y guardar access_code ────
        // Se genera un código provisional para mostrar en la UI.
        // Cuando se integre TTLock se reemplazará aquí la lógica.
        const accessCode = generateAccessCode();

        const newReservation = await prisma.reservation.create({
            data: {
                userId:                  user.id,
                roomId:                  room.id,
                start_time:              startTime,
                end_time:                endTime,
                total_paid:              totalAmount,
                status:                  'PENDING',
                access_code:             accessCode,   // ← guardado en BD
                terms_accepted:          termsAccepted,
                accepted_terms_version:  acceptedVersion,
            },
        });

        const paymentIntent = await createPaymentIntent(
            totalAmount,
            newReservation.id,
            user.email
        );

        res.status(201).json({
            message:       'Reserva iniciada. Se requiere pago.',
            reservationId: newReservation.id,
            clientSecret:  paymentIntent.client_secret,
            totalAmount,
            accessCode,    // ← devuelto al frontend para mostrarlo en confirmación
        });

    } catch (error) {
        console.error('Error al crear reserva:', error);
        res.status(500).json({ error: 'Error interno del servidor al procesar la reserva' });
    }
};

// ================================================================
// GET /api/reservations?roomId=&date= — Bloques ocupados del día
// ================================================================
export const getReservationsByDate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId, date } = req.query;

        if (!roomId || !date) {
            res.status(400).json({ error: 'Faltan parámetros roomId o date' });
            return;
        }

        const startOfDay = new Date(`${date}T00:00:00`);
        const endOfDay   = new Date(`${date}T23:59:59`);

        const reservations = await prisma.reservation.findMany({
            where: {
                roomId: String(roomId),
                status: { not: 'CANCELLED' },
                start_time: { gte: startOfDay, lte: endOfDay },
            },
            select: { start_time: true, end_time: true },
        });

        res.json(reservations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener reservas' });
    }
};

// ================================================================
// GET /api/reservations/my-reservations — Fechas del usuario
// ================================================================
export const getMyReservations = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;

        const myReservations = await prisma.reservation.findMany({
            where: {
                userId,
                status: { not: 'CANCELLED' },
                start_time: { gte: new Date() },
            },
            select: { start_time: true },
        });

        const dates       = myReservations.map(r => r.start_time.toISOString().split('T')[0]);
        const uniqueDates = [...new Set(dates)];

        res.json(uniqueDates);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obteniendo mis reservas' });
    }
};