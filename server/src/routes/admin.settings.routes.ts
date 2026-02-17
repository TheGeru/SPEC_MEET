import { Router } from 'express';
import { authenticateToken, authorizeAdmin } from '../middlewares/aut_middlewares';
import { 
    getPricingSettings, 
    updatePricingSettings,
    createBlockedSlot,
    deleteBlockedSlot,
    getLocationSettings, 
    updateLocationSettings,
    getTermsSettings,
    updateTermsSettings,
    getWifiSettings,        // ← ADD THIS
    updateWifiSettings 
} from '../controllers/admin_settings_controller';

const router = Router();

// Rutas de Precios
router.get('/pricing',  getPricingSettings);
router.put('/pricing', authenticateToken, updatePricingSettings);

// Rutas de Ubicación
router.get('/location', getLocationSettings);
router.put('/location', authenticateToken, updateLocationSettings);

// Rutas de Términos
router.get('/terms', getTermsSettings);
router.put('/terms', authenticateToken, updateTermsSettings);

router.post('/blocks', authenticateToken, authorizeAdmin, createBlockedSlot);
router.delete('/blocks/:id', authenticateToken, authorizeAdmin, deleteBlockedSlot);

export default router;