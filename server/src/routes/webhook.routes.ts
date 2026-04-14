import { Router, raw } from "express";
import { handleStripeWebhook } from '../controllers/webhook_controller';

const router = Router();
router.post('/', handleStripeWebhook); // Quitamos el raw() de aquí
export default router;