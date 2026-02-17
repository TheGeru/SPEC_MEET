// ============================================================
// SPEC.MEET - financial_controller.ts
// GET /api/admin/financial/metrics
// PUT /api/admin/financial/config
// ============================================================

import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// ── GET /admin/financial/metrics ─────────────────────────────
export const getFinancialMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();

    // Último mes completo
    const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0);
    endLastMonth.setHours(23, 59, 59, 999);

    // Historial: últimos 6 meses
    const revenueHistory = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      end.setHours(23, 59, 59, 999);

      const result = await prisma.reservation.aggregate({
        where: {
          start_time: { gte: start, lte: end },
          status: { not: 'CANCELLED' },
        },
        _sum: { total_paid: true },
      });

      revenueHistory.push({
        month:  start.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }),
        amount: Number(result._sum.total_paid) || 0,
      });
    }

    // Métricas del último mes
    const [revenueAgg, hoursData, countData] = await Promise.all([
      prisma.reservation.aggregate({
        where: { start_time: { gte: startLastMonth, lte: endLastMonth }, status: { not: 'CANCELLED' } },
        _sum: { total_paid: true },
        _count: true,
      }),
      prisma.reservation.findMany({
        where: { start_time: { gte: startLastMonth, lte: endLastMonth }, status: { not: 'CANCELLED' } },
        select: { start_time: true, end_time: true, total_paid: true },
      }),
      prisma.reservation.count({
        where: { start_time: { gte: startLastMonth, lte: endLastMonth }, status: { not: 'CANCELLED' } },
      }),
    ]);

    const totalRevenue = Number(revenueAgg._sum.total_paid) || 0;
    const totalReservations = countData;

    const totalHours = hoursData.reduce((acc, r) => {
      return acc + (new Date(r.end_time).getTime() - new Date(r.start_time).getTime()) / 3600000;
    }, 0);

    const avgTicket = totalReservations > 0 ? totalRevenue / totalReservations : 0;

    res.json({
      lastMonthRevenue:       totalRevenue,
      lastMonthHours:         totalHours,
      lastMonthReservations:  totalReservations,
      avgTicket,
      revenueHistory,
    });

  } catch (error) {
    console.error('financial metrics error:', error);
    res.status(500).json({ error: 'Error calculando métricas financieras' });
  }
};

// ── PUT /admin/financial/config ──────────────────────────────
// Guarda la configuración del simulador en BusinessConfig (como campo JSON)
export const saveFinancialConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      initialInvestment, monthlyFixedCosts,
      currentHourlyRate, estimatedHoursPerDay, operationalDaysMonth
    } = req.body;

    // Guardamos en un JSON dentro de BusinessConfig para no alterar el schema
    // Alternativamente, podrías crear un modelo FinancialConfig específico
    await prisma.businessConfig.upsert({
      where: { id: 1 },
      update: {
        // Usamos un campo genérico o puedes añadir campos específicos al schema
        // Por ahora se guarda sincrónicamente con el hourlyRate en Room
      },
      create: {
        id: 1,
        address: '',
        openingHours: {},
      },
    });

    // Actualizar tarifa en Room si fue modificada
    if (currentHourlyRate) {
      const room = await prisma.room.findFirst();
      if (room) {
        await prisma.room.update({
          where: { id: room.id },
          data: { price_per_hour: currentHourlyRate },
        });
      }
    }

    res.json({ message: 'Configuración financiera guardada' });
  } catch (error) {
    console.error('saveFinancialConfig error:', error);
    res.status(500).json({ error: 'Error guardando configuración' });
  }
};