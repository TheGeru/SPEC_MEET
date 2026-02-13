import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard_controller"; // Tu controlador de admin existente
import { getUserDashboardStats } from "../controllers/user_dashboard_controller"; // <--- IMPORTAR ESTO
import { authenticateToken } from "../middlewares/aut_middlewares";

const router = Router();

// Rutas Admin
router.get('/stats', authenticateToken, getDashboardStats);

// Rutas Usuario (NUEVA)
router.get('/user-stats', authenticateToken, getUserDashboardStats);

export default router;