import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

export let prisma: any;

export function initPrisma(d1: any) {
    if (!d1) {
        console.error('CRITICAL: D1 binding (DB) is missing from environment!');
        return;
    }
    
    if (!prisma) {
        try {
            console.log('Initializing Prisma with D1 Adapter...');
            const adapter = new PrismaD1(d1);
            prisma = new (PrismaClient as any)({ adapter });
            console.log('Prisma initialized successfully.');
        } catch (error) {
            console.error('Failed to initialize Prisma:', error);
        }
    }
}
