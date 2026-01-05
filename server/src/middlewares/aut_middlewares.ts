import { NextFunction, Request, Response } from "express";
import jwt  from 'jsonwebtoken';

interface TokePayload {
    userId: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: TokePayload;
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void =>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    /*console.log("--- DEBUG MIDDLEWARE ---");
    console.log("1. Header completo:", authHeader);
    console.log("2. Token extraído:", token);
    console.log("3. Longitud del token:", token ? token.length : 0);
    console.log("4. Mi Secreto:", process.env.JWT_SECRET);*/

    if(!token){
        res.status(401).json({error: 'Acceso denegado Token no proporcionado correctamente'});
        return;
    }

    try {
        const secret = process.env.JWT_SECRET as string;
        const decode = jwt.verify(token, secret) as TokePayload;
        req.user = decode;
        next()
    } catch(error){
        res.status(403).json({error: 'Token invalido o expirado'});
    }
}