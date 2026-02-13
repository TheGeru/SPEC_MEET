import { Router } from "express";
import { createReservation } from "../controllers/reservation_controller";
import { authenticateToken } from "../middlewares/aut_middlewares"; 

const reservas = Router();

reservas.post('/', authenticateToken, createReservation);
export default reservas;