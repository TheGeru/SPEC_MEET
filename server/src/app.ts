import express, {Application} from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes';
import routerRoom from './routes/room.routes';
import dashboardRoutes from './routes/dashboard.routes';
import adminSettingsRoutes from './routes/admin.settings.routes';
import { adminRoutes, userRoutes } from './routes/user.routes';
import webhookRoutes from './routes/webhook.routes'
import financialrouter from './routes/financial.routes';
import reservationRoutes from './routes/reservation.routes';
import cancellationRoutes from './routes/cancellation.routes'

const app: Application = express();

app.use(helmet());
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://spec-meet.netlify.app/'
    ],
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

app.use('/api/admin', adminRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/user', userRoutes); 
app.use('/api/admin/financial', financialrouter);
app.use("/api/cancellations", cancellationRoutes);


export default app;