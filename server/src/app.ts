import express, {Application} from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import routerRoom from './routes/room.routes';
import dashboardRoutes from './routes/dashboard.routes';
import adminSettingsRoutes from './routes/admin.settings.routes';
import usersRoutes from './routes/user.routes';
import webhookRoutes from './routes/webhook.routes'
import financialrouter from './routes/financial.routes';
import reservationRoutes from './routes/reservation.routes';

const app: Application = express();

app.use(helmet());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'DELETE','PUT', 'PATCH', 'OPTIONS']
}));

app.use(cookieParser());
app.use('/api/webhooks', express.raw({type: '*/*'}),webhookRoutes);
app.use(express.json());


app.use('/api/auth', authRoutes);
app.get('/', (req, res)=>{
    res.send('API de SPEC.MEET funcionando y segura');
});

app.use('/api/rooms', routerRoom)

app.use('/api/admin/settings', adminSettingsRoutes);

app.use('/api/admin', usersRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use('/api/admin/financial', financialrouter);

/* Ruta temporal para probar Google Calendar
app.get('/api/test-ttlock', async (req, res) => {
    try {
        const lockIdReal = "20612775"; // ¡Tu ID real!
        
        const fechaInicio = new Date();
        const fechaFin = new Date(fechaInicio.getTime() + (60 * 60 * 1000)); // Válido por 1 hora

        const codigo = await generatePasscode(lockIdReal, fechaInicio, fechaFin);

        res.json({ mensaje: "¡Éxito!", codigoGenerado: codigo });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});*/

export default app;