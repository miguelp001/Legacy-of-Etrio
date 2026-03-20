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
            console.log('D1 Binding Type:', typeof d1);
            if (d1 && d1.prepare) {
                console.log('D1 Binding seems valid (has prepare method)');
            } else {
                console.warn('D1 Binding might be invalid or improperly passed.');
            }
            
            const adapter = new PrismaD1(d1);
            prisma = new (PrismaClient as any)({ adapter });
            console.log('Prisma instance created successfully. Testing connection...');
        } catch (error: any) {
            console.error('CRITICAL: Failed to initialize Prisma instance!', error.message, error.stack);
            throw error; // Rethrow so the middleware/debug endpoint can report it
        }
    }
}
