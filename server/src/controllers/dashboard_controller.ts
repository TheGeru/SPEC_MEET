import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { ReservationStatus } from '@prisma/client';

// ── Filtro de estados "activos" (pagados = PENDING, PAID, CONFIRMED, COMPLETED) ──
// Incluimos PENDING porque en este flujo PENDING = pago recibido pero aún
// no confirmado por webhook. Excluimos solo CANCELLED.
const ACTIVE_STATUSES = { not: ReservationStatus.CANCELLED};

// ================================================================
// GET /api/dashboard/stats  — Panel Administrador
// ================================================================
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const now          = new Date();
        const currentYear  = now.getFullYear();
        const currentMonth = now.getMonth();

        const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
        const endOfCurrentMonth   = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
        const startOfPrevMonth    = new Date(currentYear, currentMonth - 1, 1);
        const endOfPrevMonth      = new Date(currentYear, currentMonth, 0, 23, 59, 59);

        const [currentReservations, prevReservations, recentReservations, totalRooms] =
            await Promise.all([
                // Mes actual — cualquier estado menos CANCELLED
                prisma.reservation.findMany({
                    where: {
                        start_time: { gte: startOfCurrentMonth, lte: endOfCurrentMonth },
                        status: ACTIVE_STATUSES,
                    },
                }),
                // Mes anterior
                prisma.reservation.findMany({
                    where: {
                        start_time: { gte: startOfPrevMonth, lte: endOfPrevMonth },
                        status: ACTIVE_STATUSES,
                    },
                }),
                // Últimas 4 reservas (todas, para ver actividad reciente)
                prisma.reservation.findMany({
                    take: 4,
                    orderBy: { createdAt: 'desc' },
                    include: { user: { select: { name: true } } },
                }),
                prisma.room.count(),
            ]);

        // ── Ingresos ──────────────────────────────────────────
        const currentRevenue     = currentReservations.reduce((a, r) => a + Number(r.total_paid), 0);
        const prevRevenue        = prevReservations.reduce((a, r) => a + Number(r.total_paid), 0);
        const revenueChange      = prevRevenue === 0 ? 100 : ((currentRevenue - prevRevenue) / prevRevenue) * 100;

        // ── Reservas ──────────────────────────────────────────
        const currentCount       = currentReservations.length;
        const prevCount          = prevReservations.length;
        const reservationsChange = prevCount === 0 ? 100 : ((currentCount - prevCount) / prevCount) * 100;

        // ── Horas promedio ────────────────────────────────────
        const avgHours = (list: any[]) => {
            if (!list.length) return 0;
            return list.reduce((a, r) => {
                return a + (new Date(r.end_time).getTime() - new Date(r.start_time).getTime()) / 3600000;
            }, 0) / list.length;
        };
        const currentAvg   = avgHours(currentReservations);
        const prevAvg      = avgHours(prevReservations);
        const avgChange    = prevAvg === 0 ? 100 : ((currentAvg - prevAvg) / prevAvg) * 100;

        // ── Ocupación ─────────────────────────────────────────
        const OPS_HOURS    = 12; // horas operativas por día
        const daysInMonth  = endOfCurrentMonth.getDate();
        const capacity     = daysInMonth * OPS_HOURS * (totalRooms || 1);
        const bookedHours  = currentReservations.reduce((a, r) => {
            return a + (new Date(r.end_time).getTime() - new Date(r.start_time).getTime()) / 3600000;
        }, 0);
        const currentOcc   = capacity === 0 ? 0 : (bookedHours / capacity) * 100;

        const daysInPrev   = endOfPrevMonth.getDate();
        const capPrev      = daysInPrev * OPS_HOURS * (totalRooms || 1);
        const bkdPrev      = prevReservations.reduce((a, r) => {
            return a + (new Date(r.end_time).getTime() - new Date(r.start_time).getTime()) / 3600000;
        }, 0);
        const prevOcc      = capPrev === 0 ? 0 : (bkdPrev / capPrev) * 100;
        const occChange    = prevOcc === 0 ? 100 : ((currentOcc - prevOcc) / prevOcc) * 100;

        // ── Ocupación por día de la semana ────────────────────
        const dayNames    = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const hoursPerDay = new Array(7).fill(0);
        const dayCounts   = new Array(7).fill(0);

        for (let d = 1; d <= daysInMonth; d++) {
            dayCounts[new Date(currentYear, currentMonth, d).getDay()]++;
        }
        currentReservations.forEach(r => {
            const idx = new Date(r.start_time).getDay();
            hoursPerDay[idx] += (new Date(r.end_time).getTime() - new Date(r.start_time).getTime()) / 3600000;
        });
        const occupancyByDay = [1, 2, 3, 4, 5].map(i => ({
            day: dayNames[i],
            percentage: dayCounts[i] === 0 ? 0 :
                Math.round((hoursPerDay[i] / (dayCounts[i] * OPS_HOURS * (totalRooms || 1))) * 100),
        }));

        // ── Ingresos por semana (BUG 2 CORREGIDO) ────────────
        // Usamos ACTIVE_STATUSES para incluir PENDING (= pagado en este flujo)
        const revenueByWeek = [];
        for (let i = 6; i >= 0; i--) {
            const end   = new Date();
            const start = new Date(end);
            start.setDate(start.getDate() - (i * 7) - 6);
            start.setHours(0, 0, 0, 0);
            end.setDate(end.getDate() - (i * 7));
            end.setHours(23, 59, 59, 999);

            const weekly = await prisma.reservation.findMany({
                where: { start_time: { gte: start, lte: end }, status: ACTIVE_STATUSES },
            });
            revenueByWeek.push({
                week:   `Sem ${7 - i}`,
                amount: weekly.reduce((a, r) => a + Number(r.total_paid), 0),
            });
        }
        const maxWeekly        = Math.max(...revenueByWeek.map(w => w.amount)) || 1;
        const revenueChartData = revenueByWeek.map(w => ({
            ...w,
            heightPercent: Math.round((w.amount / maxWeekly) * 100),
        }));

        res.json({
            stats: {
                revenue:      { current: currentRevenue,             percentChange: revenueChange.toFixed(1) },
                reservations: { current: currentCount,               percentChange: reservationsChange.toFixed(1) },
                occupancy:    { current: Math.round(currentOcc),     percentChange: occChange.toFixed(1) },
                averageHours: { current: currentAvg.toFixed(1),      percentChange: avgChange.toFixed(1) },
            },
            recentReservations: recentReservations.map(r => ({
                id:       r.id,
                userName: (r as any).user?.name || 'Usuario',
                date:     r.start_time,
                time:     `${String(new Date(r.start_time).getHours()).padStart(2,'0')}:00 - ${String(new Date(r.end_time).getHours()).padStart(2,'0')}:00`,
                status:   r.status,
                amount:   Number(r.total_paid),
            })),
            occupancyByDay,
            revenueChartData,
        });

    } catch (error) {
        console.error('Error en getDashboardStats:', error);
        res.status(500).json({ error: 'Error calculando métricas' });
    }
};

// ================================================================
// GET /api/dashboard/user-stats  — Panel Usuario
// ================================================================
export const getUserDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        const now    = new Date();

        const [upcomingRaw, pastRaw] = await Promise.all([
            prisma.reservation.findMany({
                where: {
                    userId,
                    status: { not: ReservationStatus.CANCELLED},
                    start_time: { gte: now },
                },
                orderBy: { start_time: 'asc' },
            }),
            prisma.reservation.findMany({
                where: {
                    userId,
                    OR: [
                        { start_time: { lt: now } },
                        { status: ReservationStatus.CANCELLED },
                    ],
                },
                orderBy: { start_time: 'desc' },
                take: 20,
            }),
        ]);

        const fmt = (d: Date) =>
            `${String(new Date(d).getHours()).padStart(2,'0')}:${String(new Date(d).getMinutes()).padStart(2,'0')}`;

        const toCard = (r: any) => {
            const start      = new Date(r.start_time);
            const hoursUntil = (start.getTime() - now.getTime()) / 3600000;
            const isFuture   = start > now;
            const isActive   = [
                ReservationStatus.PENDING,
                ReservationStatus.CONFIRMED,
                ReservationStatus.PAID
            ].includes(r.status);
            return {
                id:               r.id,
                date:             r.start_time.toISOString(),
                startTime:        fmt(r.start_time),
                endTime:          fmt(r.end_time),
                accessCode:       r.access_code ?? null,
                status:           r.status,
                totalAmount:      Number(r.total_paid),
                canCancel:        isFuture && isActive && hoursUntil >= 1,
                canExtend:        isFuture && isActive,
                invoiceRequested: (r as any).invoice_requested ?? false,
            };
        };

        const upcoming = upcomingRaw.map(toCard);
        const past     = pastRaw.map(toCard);

        const totalHours = upcomingRaw.reduce((a, r) => {
            return a + (new Date(r.end_time).getTime() - new Date(r.start_time).getTime()) / 3600000;
        }, 0);

        res.json({
            stats: {
                activeReservations:  upcoming.length,
                totalHours:          Math.round(totalHours * 10) / 10,
                nextReservationDate: upcomingRaw[0]
                    ? new Date(upcomingRaw[0].start_time).toLocaleDateString('es-MX', {
                          day: '2-digit', month: 'short', year: 'numeric',
                      })
                    : '--',
            },
            upcoming,
            past,
        });

    } catch (error) {
        console.error('Error en getUserDashboardStats:', error);
        res.status(500).json({ error: 'Error calculando datos del usuario' });
    }
};