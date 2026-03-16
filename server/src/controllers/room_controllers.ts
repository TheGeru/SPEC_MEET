import { Request, Response } from "express";
import { prisma } from '../config/prisma';
import { roomSchema } from "../utils/validation";

const getActiveRateFilter = () => ({
    effectiveFrom: { lte: new Date() },
    OR: [
        { effectiveUntil: null },
        { effectiveUntil: { gte: new Date() } }
    ]
});

// * -------------------------------------------REGISTRAR NUEVAS SALAS--------------------------------------------

export const createRoom = async (req: Request, res: Response): Promise<void> => {
    try{

        const validation = roomSchema.safeParse(req.body);

        if(!validation.success){
            res.status(400).json({
                error: "Datos de sala inválidos", 
                details: validation.error.format()
            });
            return;
        }

        const { name, wifi_ssid, wifi_pass, status, ttlock_lock_id, capacity, amenities, locationId } = validation.data;

        const newRoom = await prisma.room.create({
            data: {
                name,
                wifi_ssid,
                wifi_pass,
                capacity: capacity || 10,
                status: status ?? "INACTIVO",
                ttlock_lock_id: ttlock_lock_id || null,
                amenities: amenities || ["wifi", "acceso_autonomo"],
                locationId: locationId || 1 
            }
        });
        
        res.status(201).json({
            message: "Sala creada con éxito",
            room: newRoom
        });

    } catch(error){
        console.error(error);
        res.status(500).json({error: 'Error al crear la sala'});
    }
};

// * --------------------------------RESUMEN DE SALAS (NUEVO PARA ADMIN FRONTEND)------------------------

export const getRoomsSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        const rooms = await prisma.room.findMany({
            select: {
                id: true,
                name: true,
                capacity: true,
                status: true
            },
            orderBy: { createdAt: 'asc' }
        });
        res.json(rooms);
    } catch (error) {
        console.error("Error obteniendo resumen de salas:", error);
        res.status(500).json({ error: "Error al obtener el resumen de salas" });
    }
};

// * --------------------------------------OBTENER TODAS LAS SALAS PÚBLICAS------------------------

export const getRooms = async (req: Request, res: Response) : Promise<void> =>{
    try{
        const rooms = await prisma.room.findMany({
            where: {
                status: "ACTIVO" // Actualizado a ACTIVO (o DISPONIBLE, según tus reglas de negocio)
            },
            include: {
                baseRates: {
                    where:   getActiveRateFilter(),  // ← llamada a función, no constante
                    orderBy: { effectiveFrom: 'desc' },
                    take:    1
                },
            packages: {
                    where: { isActive: true }
                }
            }
        });
        res.json(rooms);
    } catch(error){
        console.error(error);
        res.status(500).json({error: 'Error, no se pudieron obtener las salas registradas'});
    }
};

// *--------------------------------------OBTENER SALA POR ID----------------------------------------

export const getRoomById = async (req: Request, res: Response) : Promise<void> =>{
    try{
        const {id} = req.params;

        const room = await prisma.room.findUnique({
            where: {id},
            include: {
                baseRates: {
                    where:   getActiveRateFilter(),
                    orderBy: { effectiveFrom: 'desc' },
                    take:    1
                },
                packages: {
                    where: { isActive: true }
                }
            }
        });

        if(!room){
            res.status(404).json({error: "Sala no encontrada"});
            return;
        }

        res.json(room);
    } catch(error){
        res.status(500).json({error: "Error al Obtener la sala"});
    }
};

// * ----------------------------------ACTUALIZAR INFORMACION DE LA SALA--------------------------

export const updateRoom = async (req: Request, res: Response) : Promise<void> =>{
    try{
        const {id} = req.params;
        const validation = roomSchema.partial().safeParse(req.body);

        if(!validation.success){
            res.status(400).json({
                error: "Datos inválidos",
                details: validation.error.format(),
            });
            return;
        }
        
        const updatedRoom = await prisma.room.update({
            where: {id},
            data: validation.data
        });

        res.json({
            room: updatedRoom
        });
    } catch(error){
        res.status(404).json({error: "Sala no encontrada o error al actualizarla"});
    }
};

// * ------------------------------------ELIMINAR SALA----------------------------------------------------------

export const deleteRoom = async (req: Request, res: Response) : Promise<void>=>{
    try{
        const {id} = req.params;

        await prisma.room.delete({
            where: {id}
        });

        res.json({message: "Sala eliminada con éxito"});

    } catch(error){
        res.status(404).json({error : "Error al eliminar la sala. Es posible que tenga reservas asociadas."});
    } 
};