import { Request, Response } from 'express';
import { prisma } from "../config/prisma";

export const getUsersWithReservations = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await prisma.user.findMany({
            where: {
                role: {in: ["CLIENT", "ADMIN"]}
            },
            include: {
                reservations: true,
                discountCodes: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Formateamos la respuesta para que el frontend reciba "reservations" en plural
        const formattedUsers = users.map(user => ({
            ...user,
            reservations: user.reservations // Mapeo para consistencia en el frontend
        }));

        res.json(formattedUsers);
    } catch (error) {
        console.error("Error al obtener usuarios con reservas:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

export const getMyDiscountCodes = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;

        const codes = await prisma.discountCode.findMany({
            where: {
                userId: userId,
                isUsed: false,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gte: new Date() } }
                ]
            },
            select: {
                id: true,
                code: true,
                hours: true,
                description: true,
                expiresAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(codes);
    } catch (error) {
        console.error("Error obteniendo códigos:", error);
        res.status(500).json({ error: "No se pudieron obtener tus beneficios." });
    }
};

export const createAdminUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Validar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: "El correo ya está registrado" });
            return;
        }

        // 2. Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Crear el usuario en la base de datos
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || "ADMIN", // Por defecto ADMIN si viene de este flujo
            }
        });

        res.status(201).json({ message: "Usuario creado exitosamente", userId: newUser.id });
    } catch (error) {
        console.error("Error al crear usuario administrativo:", error);
        res.status(500).json({ error: "Error interno al crear usuario" });
    }
};