import { Router } from 'express';
import { authenticateToken, authorizeAdmin } from '../middlewares/aut_middlewares';
import { validateSchema } from '../middlewares/validate_middleware';
import { 
    businessConfigSchema, 
    termsConfigSchema, 
    roomWifiSchema,
    roomBaseRateSchema,
    pricePackagePayloadSchema
} from '../utils/validation';
import { 
    getBusinessConfig, updateBusinessConfig,
    getTermsSettings, updateTermsSettings,
    getWifiSettings, updateWifiSettings,
    getPackages, createPackage, updatePackage, togglePackageActive, deletePackage,
    getBaseRates, createBaseRate,
    createBlockedSlot, deleteBlockedSlot
} from '../controllers/admin_settings_controller';

const router = Router();

// ==========================================
// RUTA BASE: /api/admin/settings (Definido en app.ts)
// ==========================================

// Configuración de Negocio
router.get('/business', authenticateToken, authorizeAdmin, getBusinessConfig);
router.put('/business', authenticateToken, authorizeAdmin, validateSchema(businessConfigSchema), updateBusinessConfig);

// Términos
router.get('/terms', authenticateToken, authorizeAdmin, getTermsSettings);
router.put('/terms', authenticateToken, authorizeAdmin, validateSchema(termsConfigSchema), updateTermsSettings);

// Wi-Fi
router.get('/wifi/:id', authenticateToken, authorizeAdmin, getWifiSettings);
router.put('/wifi/:id', authenticateToken, authorizeAdmin, validateSchema(roomWifiSchema), updateWifiSettings);

// Paquetes (Ahora vivirán en /api/admin/settings/packages)
router.get('/packages',  getPackages);
router.post('/packages', authenticateToken, authorizeAdmin, validateSchema(pricePackagePayloadSchema), createPackage);
router.put('/packages/:id', authenticateToken, authorizeAdmin, validateSchema(pricePackagePayloadSchema), updatePackage);
router.patch('/packages/:id/toggle', authenticateToken, authorizeAdmin, togglePackageActive);
router.delete('/packages/:id', authenticateToken, authorizeAdmin, deletePackage);

// Tarifas (Ahora vivirán en /api/admin/settings/rates)
router.get('/rates', authenticateToken, authorizeAdmin, getBaseRates);
router.post('/rates', authenticateToken, authorizeAdmin, validateSchema(roomBaseRateSchema), createBaseRate);

// Bloqueos
router.post('/blocks', authenticateToken, authorizeAdmin, createBlockedSlot);
router.delete('/blocks/:id', authenticateToken, authorizeAdmin, deleteBlockedSlot);

export default router;