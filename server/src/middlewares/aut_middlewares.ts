import { NextFunction, Request, Response } from "express";
import jwt  from 'jsonwebtoken';

interface TokenPayload {
    userId: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}


export const authenticateToken = (req: Request, res: Response, next: NextFunction) =>{
    const token = req.cookies['auth_token'];

    if(!token){
        res.status(401).json({error: 'Acceso denegado Token no proporcionado correctamente'});
        return;
    }
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = verified as TokenPayload;
        next();
    } catch(error){
        res.status(403).json({error: 'Token invalido o expirado'});
        return;
    }
};

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
    // Asumimos que authenticateToken ya se ejecutó antes y puso req.user

    if (!req.user || req.user.role !== 'ADMIN') {
         res.status(403).json({ error: "Acceso denegado. Se requieren permisos de Administrador." });
         return; 
    }

    next();
};