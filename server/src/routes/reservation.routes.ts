import { Router } from 'express';
import {
    createReservation,
    getMyReservations,
    getReservationsByDate,
} from '../controllers/reservation_controller';
import { authenticateToken } from '../middlewares/aut_middlewares';

const reservas = Router();

// ⚠️  IMPORTANTE: las rutas específicas van ANTES que '/'
// para que Express no las intercepte con el POST raíz.

// GET /api/reservations/my-reservations — Fechas del usuario (calendario)
reservas.get('/my-reservations', authenticateToken, getMyReservations);

// GET /api/reservations?roomId=&date= — Bloques ocupados de un día
// BookingPage llama directo a /reservations con query params
reservas.get('/', getReservationsByDate);

// POST /api/reservations — Crear reserva + Payment Intent
reservas.post('/', authenticateToken, createReservation);

export default reservas;