/**
 * ADMIN-DASHBOARD FEATURE — MODELS
 * Types matching GET /dashboard/stats backend response.
 */

export const RESERVATION_STATUS = {
  CONFIRMED: "confirmed",
  PAID: "paid",
  PENDING: "pending",
  CANCELLED: "cancelled",
} as const;

export type ReservationStatus =
  (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];

export interface StatCard {
  current: number | string;
  percentChange: string | number;
}

export interface DashboardStats {
  revenue: StatCard;
  reservations: StatCard;
  occupancy: StatCard;
  averageHours: StatCard;
}

export interface RecentReservation {
  id: string;
  userName: string;
  date: string;
  time: string;
  status: string;
  amount: number;
}

export interface OccupancyDay {
  day: string;
  percentage: number;
}

export interface RevenueWeek {
  week: string;
  amount: number;
  heightPercent: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentReservations: RecentReservation[];
  occupancyByDay: OccupancyDay[];
  revenueChartData: RevenueWeek[];
}