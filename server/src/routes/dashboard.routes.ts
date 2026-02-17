import { Router } from "express";
import { getDashboardStats, getUserDashboardStats } from "../controllers/dashboard_controller";
import { authenticateToken } from "../middlewares/aut_middlewares";

const router = Router();

// GET /api/dashboard/stats — Panel del administrador
router.get('/stats', authenticateToken, getDashboardStats);

// GET /api/dashboard/user-stats — Panel del usuario (próximas y pasadas)
router.get('/user-stats', authenticateToken, getUserDashboardStats);

export default router;