import { Router } from 'express';
import {
    getFinancialMetrics,
    saveFinancialConfig,
} from '../controllers/financial_controller';
import { authenticateToken } from '../middlewares/aut_middlewares';

const financialrouter = Router();

// Métricas reales del último mes + historial 6 meses
financialrouter.get('/metrics', authenticateToken, getFinancialMetrics);

// Guardar configuración del simulador
financialrouter.put('/config', authenticateToken, saveFinancialConfig);

export default financialrouter;