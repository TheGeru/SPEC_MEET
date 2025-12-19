import express, {Application} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth_routes';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.get('/', (req, res)=>{
    res.send('API de SPEC.MEET funcionando y segura');
});

export default app;