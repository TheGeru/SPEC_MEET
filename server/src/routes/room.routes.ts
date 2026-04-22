import { Router } from "express";
import { 
    createRoom, 
    deleteRoom, 
    getRoomById, 
    getRooms, 
    updateRoom, 
    getRoomsSummary 
} from "../controllers/room_controllers";
import { authenticateToken, authorizeAdmin } from "../middlewares/aut_middlewares";

const routerRoom = Router();

// ==========================================
// RUTAS DE ADMINISTRACIÓN (Protegidas)
// ==========================================
// ⚠️ IMPORTANTE: /summary debe ir ANTES de /:id para que express no confunda "summary" con un ID
routerRoom.get('/summary', getRoomsSummary);

routerRoom.post('/', authenticateToken, authorizeAdmin, createRoom);
routerRoom.put('/:id', authenticateToken, authorizeAdmin, updateRoom);
routerRoom.delete('/:id', authenticateToken, authorizeAdmin, deleteRoom);


// ==========================================
// RUTAS PÚBLICAS / CLIENTES
// ==========================================
routerRoom.get('/', getRooms);
routerRoom.get('/:id', getRoomById);

export default routerRoom;