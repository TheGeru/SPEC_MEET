import express, {Application} from 'express';
import cors from 'cors';
import helmet from 'helmet';

// rutas
import authRoutes from './routes/auth.routes';
import routerRoom from './routes/room.routes';
import reservas from './routes/reservation.routes';
import webhookRoutes from './routes/webhook.routes';

const app: Application = express();

app.use(helmet());
app.use(cors());

app.use('/api/webhooks', express.raw({type: '*/*'}),webhookRoutes);
app.use(express.json());


app.use('/api/auth', authRoutes);
app.get('/', (req, res)=>{
    res.send('API de SPEC.MEET funcionando y segura');
});

app.use('/api/rooms', routerRoom);
app.use('/api/reservations', reservas);

export default app;