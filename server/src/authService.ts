import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './db.js';

export class AuthService {
    static async register(username: string, password: string, jwtSecret: string) {
        try {
            console.log('Registering user:', username);
            const existing = await (prisma as any).user.findUnique({ where: { username } });
            if (existing) throw new Error('Username already taken');

            console.log('Hashing password...');
            const hashedPassword = await bcrypt.hash(password, 10);
            
            console.log('Creating user in DB...');
            const user = await (prisma as any).user.create({
                data: {
                    username,
                    password: hashedPassword
                }
            });

            console.log('Signing JWT...');
            const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });
            return { user, token };
        } catch (error: any) {
            console.error('Registration error details:', error);
            throw error;
        }
    }

    static async login(username: string, password: string, jwtSecret: string) {
        const user = await (prisma as any).user.findUnique({ where: { username } });
        if (!user) throw new Error('Invalid credentials');

        const valid = await bcrypt.compare(password, user.password);
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
