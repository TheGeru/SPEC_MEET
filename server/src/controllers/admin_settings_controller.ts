import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendGiftCardEmail } from '../services/email.service';
import { createGiftCard } from '../services/discount.service';
import { sendEmail } from '../services/email.service';
// ==========================================
// 1. GESTIÓN DE NEGOCIO (Ubicación, Horarios, Reembolsos)
// ==========================================

export const getBusinessConfig = async (req: Request, res: Response): Promise<void> => {
    try {
        const config = await prisma.businessConfig.findUnique({ where: { id: 1 } });
        
        if (!config) {
            res.json({ 
                locationName: "", 
                address: "", 
                openingHours: {}, 
                accessInstructions: "",
                refundFullHours: 24,
                refundPartialHours: 12,
                refundPartialPct: 50
            });
            return;
        }

        res.json(config);
    } catch (error) {
        console.error("Error obteniendo business config:", error);
        res.status(500).json({ error: "Error al obtener configuración del negocio" });
    }
};

export const updateBusinessConfig = async (req: Request, res: Response): Promise<void> => {
    try {
        const { locationName, address, openingHours, accessInstructions, refundFullHours, refundPartialHours, refundPartialPct } = req.body;

        const updatedConfig = await prisma.businessConfig.upsert({
            where: { id: 1 },
            update: {
                locationName,
                address,
                openingHours,
                accessInstructions,
                refundFullHours,
                refundPartialHours,
                refundPartialPct
            },
            create: {
                id: 1,
                locationName: locationName || "SPEC.MEET Central",
                address: address || "Pendiente",
                openingHours: openingHours || {},
                accessInstructions,
                refundFullHours: refundFullHours || 24,
                refundPartialHours: refundPartialHours || 12,
                refundPartialPct: refundPartialPct || 50
            }
        });

        res.json(updatedConfig);
    } catch (error) {
        console.error("Error actualizando business config:", error);
        res.status(500).json({ error: "Error al guardar configuración del negocio" });
    }
};

// ==========================================
// 2. GESTIÓN DE TÉRMINOS Y CONDICIONES
// ==========================================

export const getTermsSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const terms = await prisma.termsConfig.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });

        res.json(terms || {
            templateContent: "",
            additionalClauses: "",
            privacyOptions: { collectEmail: true, shareData: false, cctvNotice: true, cookieConsent: true }
        });
    } catch (error) {
        console.error("Error obteniendo términos:", error);
        res.status(500).json({ error: "Error obteniendo términos" });
    }
};

export const updateTermsSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { templateContent, additionalClauses, privacyOptions } = req.body;

        await prisma.termsConfig.updateMany({
            where: { isActive: true },
            data: { isActive: false }
        });

        const newVersion = `v${Date.now()}`;
        
        const newTerms = await prisma.termsConfig.create({
            data: {
                version: newVersion,
                isActive: true,
                templateContent,
                additionalClauses,
                privacyOptions 
            }
        });

        res.json(newTerms);
    } catch (error) {
        console.error("Error actualizando términos:", error);
        res.status(500).json({ error: "Error guardando términos" });
    }
};

// ==========================================
// 3. GESTIÓN DE WI-FI
// ==========================================

export const getWifiSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const room = await prisma.room.findUnique({
            where: { id }
        });
        
        if (!room) {
             res.status(404).json({ error: "Sala no encontrada" });
             return;
        }

        res.json({
            id: room.id,
            wifi_ssid: room.wifi_ssid,
            wifi_pass: room.wifi_pass
        });
    } catch (error) {
        console.error("Error obteniendo Wi-Fi:", error);
        res.status(500).json({ error: "Error al obtener configuración Wi-Fi" });
    }
};

export const updateWifiSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { wifi_ssid, wifi_pass } = req.body;

        if (!wifi_ssid || wifi_ssid.trim() === "") {
            res.status(400).json({ error: "El nombre de Wi-Fi es obligatorio" });
            return;
        }

        const updatedRoom = await prisma.room.update({
            where: { id },
            data: {
               wifi_ssid,
               wifi_pass: wifi_pass || ""
            }
        });

        res.json({
            id: updatedRoom.id,
            wifi_ssid: updatedRoom.wifi_ssid,
            wifi_pass: updatedRoom.wifi_pass
        });
    } catch (error) {
        console.error("Error actualizando Wi-Fi:", error);
        res.status(500).json({ error: "Error al guardar configuración Wi-Fi" });
    }
};

// ==========================================
// 4. GESTIÓN DE PAQUETES (PricePackage)
// ==========================================

export const getPackages = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Obtener todos los paquetes
        const packages = await prisma.pricePackage.findMany({
            orderBy: { createdAt: 'desc' },
            // Opcional: incluir datos de la sala si los necesitas en el frontend
            // include: { room: true } 
        });

        // 2. Obtener TODAS las tarifas base ACTIVAS (effectiveUntil es null)
        const activeRates = await prisma.roomBaseRate.findMany({
            where: { effectiveUntil: null }
        });

        // 3. Crear un mapa rápido de tarifas por RoomID para no hacer un bucle pesado (Optimización O(1))
        const ratesMap = new Map(activeRates.map(rate => [rate.roomId, rate.hourlyRate]));

       // 4. Mapear los paquetes y calcular el precio al vuelo
    const packagesWithComputedPrice = packages.map(pkg => {
        // 🛡️ FIX 1 (TS2345): Manejar el null de Prisma de forma segura
        const safeRoomId = pkg.roomId ?? "";
        
        // Buscar la tarifa cruda (Prisma Decimal)
        const rawRate = ratesMap.get(safeRoomId);
        
        // 🛡️ FIX 2 (TS2362): Convertir el Objeto Decimal a un primitivo numérico para hacer matemáticas
        const baseHourlyRate = rawRate ? Number(rawRate) : 0; 
        
        // Parseo defensivo del JSON de Prisma
        let metadata: any = {};
        if (typeof pkg.metadata === 'string') {
            try { metadata = JSON.parse(pkg.metadata); } catch (e) { console.error("Error parseando metadata"); }
        } else if (pkg.metadata && typeof pkg.metadata === 'object') {
            metadata = pkg.metadata;
        }

        // Extracción segura forzando a Number
        const blockHours = Number(metadata?.blockHours ?? 1); 
        const discountPct = Number(metadata?.discountPct ?? 0); 

        // 🧮 LA FÓRMULA MÁGICA: Ya son números 100% primitivos, el operador '*' funcionará perfecto
        const subtotal = baseHourlyRate * blockHours;
        const discountAmount = subtotal * (discountPct / 100);
        const computedPrice = subtotal - discountAmount;

        return {
            ...pkg,
            price: computedPrice,
        };
    });

        res.json(packagesWithComputedPrice);
    } catch (error) {
        console.error("Error obteniendo paquetes:", error);
        res.status(500).json({ error: "Error al obtener paquetes" });
    }
};

export const createPackage = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        const newPackage = await prisma.pricePackage.create({ data });
        res.status(201).json(newPackage);
    } catch (error) {
        console.error("Error creando paquete:", error);
        res.status(500).json({ error: "Error al crear paquete" });
    }
};

export const updatePackage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedPackage = await prisma.pricePackage.update({
            where: { id },
            data
        });
        res.json(updatedPackage);
    } catch (error) {
        console.error("Error actualizando paquete:", error);
        res.status(500).json({ error: "Error al actualizar paquete" });
    }
};

export const togglePackageActive = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const updatedPackage = await prisma.pricePackage.update({
            where: { id },
            data: { isActive }
        });
        res.json(updatedPackage);
    } catch (error) {
        console.error("Error cambiando estado de paquete:", error);
        res.status(500).json({ error: "Error al cambiar estado del paquete" });
    }
};

export const deletePackage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.pricePackage.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error("Error eliminando paquete:", error);
        res.status(500).json({ error: "Error al eliminar paquete" });
    }
};

// ==========================================
// 5. GESTIÓN DE TARIFAS BASE (RoomBaseRate)
// ==========================================

export const getBaseRates = async (req: Request, res: Response): Promise<void> => {
    try {
        const rates = await prisma.roomBaseRate.findMany({
            orderBy: { effectiveFrom: 'desc' }
        });
        res.json(rates);
    } catch (error) {
        console.error("Error obteniendo tarifas:", error);
        res.status(500).json({ error: "Error al obtener tarifas base" });
    }
};

export const createBaseRate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { roomId, hourlyRate, currency } = req.body;

        // "Archivar" la tarifa actual (ponerle fecha de fin)
        await prisma.roomBaseRate.updateMany({
            where: { 
                roomId, 
                effectiveUntil: null 
            },
            data: { 
                effectiveUntil: new Date() 
            }
        });

        // Crear la nueva tarifa
        const newRate = await prisma.roomBaseRate.create({
            data: {
                roomId,
                hourlyRate,
                currency: currency || "MXN"
            }
        });

        res.status(201).json(newRate);
    } catch (error) {
        console.error("Error creando tarifa:", error);
        res.status(500).json({ error: "Error al crear tarifa base" });
    }
};

// ==========================================
// 6. RESUMEN DE SALAS (Para dropdowns)
// ==========================================

export const getRoomsSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        const rooms = await prisma.room.findMany({
            select: {
                id: true,
                name: true,
                capacity: true,
                status: true
            }
        });
        res.json(rooms);
    } catch (error) {
        console.error("Error obteniendo resumen de salas:", error);
        res.status(500).json({ error: "Error al obtener salas" });
    }
};

// ==========================================
// 7. GESTIÓN DE BLOQUEOS (MANTENIMIENTO)
// ==========================================

export const createBlockedSlot = async (req: Request, res: Response): Promise<void> => {
    // ... (Mantén la lógica que ya tenías para createBlockedSlot) ...
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
     // ... (Mantén la lógica que ya tenías para deleteBlockedSlot) ...
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
    }
};

export const assignDiscountToUser = async (req: Request, res: Response) => {
    try {
        const { userId, hours, description } = req.body;

        // 1. Crear el código en la base de datos (usando el service de discount)
        const discount = await createGiftCard(userId, hours, description);

        // 2. Notificar por correo (usando el service de email)
        if (discount.user) {
            await sendGiftCardEmail(
                discount.user.email,
                discount.user.name,
                discount.code,
                discount.hours,
                discount.expiresAt!,
                description
            );
        }

        res.status(201).json({ 
            message: "Beneficio asignado y correo enviado.", 
            code: discount.code 
        });

    } catch (error) {
        console.error("Error en assignDiscountToUser:", error);
        res.status(500).json({ error: "No se pudo asignar el beneficio." });
    }
};