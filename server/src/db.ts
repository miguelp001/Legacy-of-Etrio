import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

export let prisma: any;

export function initPrisma(d1: any) {
    if (!prisma && d1) {
        const adapter = new PrismaD1(d1);
        prisma = new (PrismaClient as any)({ adapter });
    }
}
