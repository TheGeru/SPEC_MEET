import { Router } from 'express';
import { 
    getPricingSettings, 
    updatePricingSettings, 
    getLocationSettings, 
    updateLocationSettings,
    getTermsSettings,
    updateTermsSettings
} from '../controllers/admin_settings_controller';
import { authenticateToken } from '../middlewares/aut_middlewares'; // Asegúrate que la ruta sea correcta

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

export default router;