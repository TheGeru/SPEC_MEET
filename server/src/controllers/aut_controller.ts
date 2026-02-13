import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from "../config/prisma";
import { loginSchema, registerSchema } from "../utils/validation";

export const register = async (req: Request, res: Response) : Promise<void> =>{
    try {
        const validation = registerSchema.safeParse(req.body);

        if (!validation.success){
            res.status(400).json({
                error: "Datos invalidos",
                details: validation.error.format()
            });
            return;
        }

        const {email, password, name} = validation.data;
        const existingUser = await prisma.user.findUnique({
            where: {email}
        });

        if (existingUser) {
            res.status(409).json({error: "El correo ya se esta usando en otra cuenta"});
            return;
        } 

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: "CLIENT",
            },
        });

        res.status(201).json({
            message: "Registro realizado con exito",
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
            },
        });
    }catch(error){
        console.error(error);
        res.status(500).json({error: "Error al Realizar el registro"});
    }
};

// * ---------------------------FUNCION PARA EL LOGIN DEL USUARIO----------------------------------------------------------

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const validation = loginSchema.safeParse(req.body);

        if (!validation.success){
            res.status(400).json({
                error: "Datos Invalidos",
                details: validation.error.format()
            });
            return;
        }

        const {email, password} = validation.data;

        const user = await prisma.user.findUnique({
            where: {email},
        });
        if(!user){
            res.status(401).json({error: "Credenciales Invalidas, revise los datos"});
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            // Si la contraseña no coincide, adiós.
            res.status(401).json({ error: "Credenciales Inválidas, revise los datos" });
            return;
        }

        const token = jwt.sign(
            {userId: user.id, role: user.role},
            process.env.JWT_SECRET as string,
            {expiresIn: '1d'}
        );

        res.json({
            message:"Login exitoso",
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            }
        });
    } catch(error){
        console.error(error);
        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
};