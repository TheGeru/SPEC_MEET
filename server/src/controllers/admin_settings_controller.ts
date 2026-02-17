import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// ==========================================
// 1. GESTIÓN DE PRECIOS Y PAQUETES
// ==========================================

export const getPricingSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const room = await prisma.room.findFirst();
        const packages = await prisma.pricingPackage.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' }
        });
        
        const businessConfig = await prisma.businessConfig.findUnique({ where: { id: 1 } });

        res.json({
            hourlyRate: room?.price_per_hour || 0,
            packages: packages,
            cancellationPolicy: {
                fullRefund: businessConfig?.refundFullHours || 24,
                partialRefund: businessConfig?.refundPartialHours || 12,
                partialRefundPercentage: businessConfig?.refundPartialPct || 50
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener precios" });
    }
};

export const updatePricingSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { hourlyRate, packages, cancellationPolicy } = req.body;

        const room = await prisma.room.findFirst();
        if (room) {
            await prisma.room.update({
                where: { id: room.id },
                data: { price_per_hour: hourlyRate }
            });
        }

        await prisma.businessConfig.upsert({
            where: { id: 1 },
            update: {
                refundFullHours: cancellationPolicy.fullRefund,
                refundPartialHours: cancellationPolicy.partialRefund,
                refundPartialPct: cancellationPolicy.partialRefundPercentage
            },
            create: {
                id: 1,
                address: "Dirección Pendiente",
                openingHours: {},
                refundFullHours: cancellationPolicy.fullRefund,
                refundPartialHours: cancellationPolicy.partialRefund,
                refundPartialPct: cancellationPolicy.partialRefundPercentage
            }
        });

        await prisma.pricingPackage.deleteMany({}); 
        
        if (packages && packages.length > 0) {
            await prisma.pricingPackage.createMany({
                data: packages.map((pkg: any) => ({
                    name: pkg.name,
                    hours: pkg.hours,
                    price: pkg.price,
                    discount: pkg.discount,
                    isActive: true
                }))
            });
        }

        res.json({ message: "Configuración de precios guardada correctamente" });
    } catch (error) {
        console.error("Error updating pricing:", error);
        res.status(500).json({ error: "Error al guardar configuración de precios" });
    }
};

// ==========================================
// 2. GESTIÓN DE UBICACIÓN Y HORARIOS
// ==========================================

export const getLocationSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const config = await prisma.businessConfig.findUnique({ where: { id: 1 } });
        
        if (!config) {
            res.json({ 
                name: "", address: "", openingHours: {}, capacity: 0, accessInstructions: "" 
            });
            return;
        }

        const room = await prisma.room.findFirst();

        res.json({
            name: config.locationName,
            address: config.address,
            openingHours: config.openingHours,
            capacity: room?.capacity || 10,
            accessInstructions: config.accessInstructions
        });
    } catch (error) {
        res.status(500).json({ error: "Error al obtener ubicación" });
    }
};

export const updateLocationSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, address, openingHours, capacity, accessInstructions } = req.body;

        await prisma.businessConfig.upsert({
            where: { id: 1 },
            update: {
                locationName: name,
                address: address,
                openingHours: openingHours,
                accessInstructions: accessInstructions
            },
            create: {
                id: 1,
                locationName: name,
                address: address,
                openingHours: openingHours,
                accessInstructions: accessInstructions
            }
        });

        const room = await prisma.room.findFirst();
        if (room) {
            await prisma.room.update({
                where: { id: room.id },
                data: { capacity: Number(capacity) }
            });
        }

        res.json({ message: "Ubicación actualizada correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al guardar ubicación" });
    }
};

// ==========================================
// 3. GESTIÓN DE TÉRMINOS Y CONDICIONES
// ==========================================

export const getTermsSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const terms = await prisma.termsConfig.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            template: terms?.templateContent || "",
            additionalClauses: terms?.additionalClauses || "",
            privacyOptions: terms?.privacyOptions || {
                collectEmail: true, shareData: false, cctvNotice: true, cookieConsent: true
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo términos" });
    }
};

export const updateTermsSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { template, additionalClauses, privacyOptions } = req.body;

        await prisma.termsConfig.updateMany({
            where: { isActive: true },
            data: { isActive: false }
        });

        const newVersion = `v${Date.now()}`;
        
        await prisma.termsConfig.create({
            data: {
                version: newVersion,
                isActive: true,
                templateContent: template,
                additionalClauses: additionalClauses,
                privacyOptions: privacyOptions 
            }
        });

        res.json({ message: "Términos actualizados y nueva versión generada." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error guardando términos" });
    }
};

// ==========================================
// 4. GESTIÓN DE BLOQUEOS (MANTENIMIENTO)
// ==========================================

export const createBlockedSlot = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId, startTime, endTime, reason } = req.body;
        
        if (!roomId || !startTime || !endTime) {
             res.status(400).json({ error: "Faltan datos de fecha o sala" });
             return;
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (start >= end) {
             res.status(400).json({ error: "La fecha fin debe ser mayor a la de inicio" });
             return;
        }

        const conflict = await prisma.reservation.findFirst({
            where: {
                roomId: roomId,
                status: { not: "CANCELLED" },
                AND: [
                    { start_time: { lt: end } },
                    { end_time: { gt: start } }
                ]
            }
        });

        if (conflict) {
             res.status(409).json({ error: "No se puede bloquear: Hay reservas existentes en ese horario." });
             return;
        }

        await prisma.blockedSlot.create({
            data: {
                roomId,
                start_time: start,
                end_time: end,
                reason: reason || "Mantenimiento General"
            }
        });

        res.json({ message: "Bloqueo creado correctamente" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear bloqueo" });
    }
};

export const deleteBlockedSlot = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({ error: "ID es requerido" });
            return;
        }

        await prisma.blockedSlot.delete({
            where: { id: id }
        });

        res.json({ message: "Bloqueo eliminado correctamente" });
    } catch (error) {
        console.error("Error eliminando bloqueo:", error);
        res.status(500).json({ error: "Error al eliminar el bloqueo" });
    } // <--- AQUÍ FALTABA CERRAR EL CATCH Y LA FUNCIÓN
}; 

// ==========================================
// 5. GESTIÓN DE WI-FI
// ==========================================

export const getWifiSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const room = await prisma.room.findFirst();
        
        res.json({
            wifiName: room?.wifi_ssid || "",
            wifiPassword: room?.wifi_pass || ""
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener configuración Wi-Fi" });
    }
};

export const updateWifiSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { wifiName, wifiPassword } = req.body;

        if (!wifiName || wifiName.trim() === "") {
            res.status(400).json({ error: "El nombre de Wi-Fi es obligatorio" });
            return;
        }

        const room = await prisma.room.findFirst();
        
        if (!room) {
            res.status(404).json({ error: "No se encontró ninguna sala configurada" });
            return;
        }

        await prisma.room.update({
            where: { id: room.id },
            data: {
               wifi_ssid: wifiName,
                wifi_pass: wifiPassword || null
            }
        });

        res.json({ message: "Configuración Wi-Fi actualizada correctamente" });
    } catch (error) {
        console.error("Error updating Wi-Fi settings:", error);
        res.status(500).json({ error: "Error al guardar configuración Wi-Fi" });
    }
};