import e, { Router } from "express";
import { login, register } from "../controllers/aut_controller";

const router = Router();

router.post('/register', register);
router.post('/login', login);

export default router;