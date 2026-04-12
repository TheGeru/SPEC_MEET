import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from "../config/prisma";
import { loginSchema, registerSchema } from "../utils/validation";
import crypto from 'crypto';
import { sendEmail } from "../services/email.service";


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
        const {rememberMe} = req.body;
        const user = await prisma.user.findUnique({
            where: {email},
        });

        if(!user || !(await bcrypt.compare(password, user.password))){
            res.status(401).json({error: "Credenciales Invalidas, revise los datos"});
            return;
        }
        const expiresIn = rememberMe ? '30d': '1d';
        const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

        const token = jwt.sign(
            {userId: user.id, role: user.role},
            process.env.JWT_SECRET as string,
            {expiresIn}
        );
        console.log("Send cookie auth_token");

        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: maxAge
        });
        
        res.json({
            message: "Login exitoso",
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

export const logout = (req: Request, res: Response) => {
    res.clearCookie('auth_token');
    res.sendStatus(200);
};

export const verifySession = (req: Request, res: Response) =>{
    res.json(req.user);
};

// ............................. RECUPERAR LA CONTRASEÑA ---------------------

export const forgotPassowrd = async (req: Request, res: Response): Promise<void> => {
    try {
        const {email} = req.body;

        if(!email) {
            res.status(400).json({error: 'El correo es obligatorio'});
            return;
        }
        const user = await prisma.user.findUnique({where: {email}});

        if (!user) {
            res.status(200).json({message: "Si el correo esta registrado, recibiras un enlace."});
            return;
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expireDate = new Date(Date.now() + 3600000);
        
        await prisma.user.update({
            where: {email},
            data: {
                resetPasswordToken: hashedToken,
                resetPasswordExpire: expireDate,
            }
        });

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #4F46E5; text-align: center;">Recuperación de Contraseña</h2>
                <p>Hola <strong>${user.name}</strong>,</p>
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en SPEC.MEET.</p>
                <p>Haz clic en el siguiente botón para crear una nueva contraseña. Este enlace es válido por 1 hora.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Restablecer Contraseña</a>
                </div>
                <p style="color: #6b7280; font-size: 14px;">Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
            </div>
        `;
        await sendEmail(user.email, 'Recupera tu contraseña - SPEC MEET', htmlContent);
        res.status(200).json({ message: 'Si el correo existe, se ha enviado un enlace de recuperación.' });
    } catch (error){
        console.error(error);
        res.status(500).json({error: "Error al procesar la solicitud"})
    }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token } = req.params; // El token viene en la URL
        const { newPassword } = req.body;

        if(!token){
            res.status(400).json({error: 'Token de seguridad no proporcionado'});
            return;
        }

        if(!newPassword || newPassword.length < 6) {
            res.status(400).json({error: 'La contraseña debe de tener al menos 6 caracteres'});
            return;
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Buscar usuario que tenga ese token Y que el token no haya expirado
        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpire: { gt: new Date() } // gt = greater than (mayor que ahora)
            }
        });

        if (!user) {
            res.status(400).json({ error: "El enlace es inválido o ha expirado" });
            return;
        }

        // Encriptar la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Actualizar usuario y BORRAR el token (para que no se use dos veces)
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpire: null
            }
        });

        res.json({ message: "Contraseña actualizada correctamente. Ya puedes iniciar sesión." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al restablecer contraseña" });
    }
};