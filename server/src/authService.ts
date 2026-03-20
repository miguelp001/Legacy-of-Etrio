import jwt from 'jsonwebtoken';
import { prisma } from './db.js';
import { StateService } from './stateService.js';

export class AuthService {
    // ... existing hashPassword and verifyPassword methods ...
    private static async hashPassword(password: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const salt = crypto.getRandomValues(new Uint8Array(16));
        
        const keyMaterial = await crypto.subtle.importKey(
            "raw", 
            data, 
            "PBKDF2", 
            false, 
            ["deriveBits", "deriveKey"]
        );
        
        const key = await crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 10000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );

        const exportedKey = await crypto.subtle.exportKey("raw", key);
        const hashBuffer = new Uint8Array(exportedKey);
        
        // Combine salt and hash for storage (hex)
        const combined = new Uint8Array(salt.length + hashBuffer.length);
        combined.set(salt);
        combined.set(hashBuffer, salt.length);
        
        return Array.from(combined).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    private static async verifyPassword(password: string, storedHash: string): Promise<boolean> {
        const combined = new Uint8Array(storedHash.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
        const salt = combined.slice(0, 16);
        const originalHash = combined.slice(16);
        
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        
        const keyMaterial = await crypto.subtle.importKey(
            "raw", 
            data, 
            "PBKDF2", 
            false, 
            ["deriveBits", "deriveKey"]
        );
        
        const key = await crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 10000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );

        const exportedKey = await crypto.subtle.exportKey("raw", key);
        const testHash = new Uint8Array(exportedKey);
        
        if (testHash.length !== originalHash.length) return false;
        return testHash.every((val, i) => val === originalHash[i]);
    }

    static async register(username: string, password: string, jwtSecret: string) {
        try {
            console.log('[AUTH] Registering user:', username);
            const existing = await (prisma as any).user.findFirst({ where: { username } });
            if (existing) throw new Error('Username already taken');

            console.log('[AUTH] Hashing password (Native Web Crypto)...');
            const hashedPassword = await this.hashPassword(password);
            
            console.log('[AUTH] Creating user in DB...');
            const user = await (prisma as any).user.create({
                data: {
                    username,
                    password: hashedPassword
                }
            });

            // Initialize Player State
            console.log('[AUTH] Initializing Player State...');
            await StateService.savePlayerState(user.id, StateService.getInitialState());

            console.log('[AUTH] Signing JWT...');
            const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });
            return { user, token };
        } catch (error: any) {
            console.error('[AUTH] Registration logic error:', error);
            throw error;
        }
    }

    static async login(username: string, password: string, jwtSecret: string) {
        const user = await (prisma as any).user.findFirst({ where: { username } });
        if (!user) throw new Error('Invalid credentials');

        console.log('[AUTH] Verifying password (Native Web Crypto)...');
        const valid = await this.verifyPassword(password, user.password);
        if (!valid) throw new Error('Invalid credentials');

        const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });
        return { user, token };
    }

    static verifyToken(token: string, jwtSecret: string) {
        try {
            return jwt.verify(token, jwtSecret) as { userId: string };
        } catch (e) {
            return null;
        }
    }
}
