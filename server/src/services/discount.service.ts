import {prisma} from '../config/prisma';
import crypto from 'crypto';

export const createGiftCard = async (userId: string, hours: number, description: string) => {
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const code = `SPEC-${hours}H-${randomSuffix}`;

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3);

    const discount = await prisma.discountCode.create({
        data: {
            code,
            hours,
            description,
            userId,
            expiresAt,
            isUsed: false
        },
        include: {
            user: {select: {email: true, name: true}}
        }
    });
    return discount;
}