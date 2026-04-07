import { Router } from "express";
import { authenticateToken, authorizeAdmin} from "../middlewares/aut_middlewares"; 
import {
    createReservation,
    getReservationsByDate,
    getMyReservations,
    getReservationsByRange,
    extendReservation
} from '../controllers/reservation_controller';

const reservas = Router();
reservas.get('/my-reservations', authenticateToken, getMyReservations);
reservas.get('/range', authenticateToken, authorizeAdmin, getReservationsByRange);
reservas.post('/', authenticateToken, createReservation);
reservas.get('/', authenticateToken, getReservationsByDate);
reservas.post('/:reservationId/extend', authenticateToken, extendReservation)
export default reservas;