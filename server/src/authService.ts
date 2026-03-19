import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export class AuthService {
    static async register(username: string, password: string) {
        const existing = await (prisma as any).user.findUnique({ where: { username } });
        if (existing) throw new Error('Username already taken');

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await (prisma as any).user.create({
            data: {
                username,
                password: hashedPassword
            }
        });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        return { user, token };
    }

    static async login(username: string, password: string) {
        const user = await (prisma as any).user.findUnique({ where: { username } });
        if (!user) throw new Error('Invalid credentials');

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error('Invalid credentials');

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        return { user, token };
    }

    static verifyToken(token: string) {
        try {
            return jwt.verify(token, JWT_SECRET) as { userId: string };
        } catch (e) {
            return null;
        }
    }
}
