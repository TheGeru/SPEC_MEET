import { Router } from "express";
import { cancelReservation } from "../controllers/cancellation_controller";
import { authenticateToken } from "../middlewares/aut_middlewares";

const router = Router();

// Endpoint: POST /api/cancellations/:reservationId/cancel
router.post("/:reservationId/cancel", authenticateToken, cancelReservation);

export default router;