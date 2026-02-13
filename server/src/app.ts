import express, {Application} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth_routes';
import routerRoom from './routes/room_routes';
import dashboardRoutes from './routes/dashboard.routes';
import adminSettingsRoutes from './routes/admin.settings.routes';
import usersRoutes from './routes/user.routes';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.get('/', (req, res)=>{
    res.send('API de SPEC.MEET funcionando y segura');
});

app.use('/api/rooms', routerRoom)


app.use('/api/admin/settings', adminSettingsRoutes);

app.use('/api/admin', usersRoutes);

app.use('/api/dashboard', dashboardRoutes);
export default app;