import { Router } from "express";
import { getMyDiscountCodes, getUsersWithReservations } from "../controllers/user_controllers";
import { authenticateToken } from "../middlewares/aut_middlewares";
import { assignDiscountToUser } from "../controllers/admin_settings_controller";
import { createAdminUser } from "../controllers/user_controllers";

const adminRoutes = Router();
const userRoutes = Router();
// Endpoint que el frontend está buscando
adminRoutes.get('/users-with-reservations', authenticateToken, getUsersWithReservations);
userRoutes.get('/my-discounts', authenticateToken, getMyDiscountCodes)
adminRoutes.post('/assign-discount', authenticateToken, assignDiscountToUser);
adminRoutes.post('/create-user', authenticateToken, createAdminUser);

export {adminRoutes, userRoutes};