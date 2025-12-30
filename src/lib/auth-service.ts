import bcrypt from 'bcrypt';
import db from './db';
import { generateToken } from './jwt-utils';
import { randomBytes } from 'node:crypto';

const SALT_ROUNDS = 10;

export interface SignupData {
    email: string;
    password: string;
    displayName: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResult {
    success: boolean;
    token?: string;
    user?: {
        id: string;
        email: string;
        displayName: string | null;
    };
    error?: string;
}

/**
 * Hash de senha usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Comparar senha com hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Gerar ID único
 */
function generateId(): string {
    return randomBytes(16).toString('hex');
}

/**
 * Criar novo usuário (signup)
 */
export async function signup(data: SignupData): Promise<AuthResult> {
    try {
        // Verificar se email já existe
        const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email);

        if (existingUser) {
            return {
                success: false,
                error: 'Email já está em uso',
            };
        }

        // Hash da senha
        const passwordHash = await hashPassword(data.password);

        // Criar usuário
        const userId = generateId();
        const now = new Date().toISOString();

        db.prepare(`
      INSERT INTO users (id, email, password_hash, display_name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, data.email, passwordHash, data.displayName, now, now);

        // Gerar token
        const token = generateToken({
            userId,
            email: data.email,
        });

        return {
            success: true,
            token,
            user: {
                id: userId,
                email: data.email,
                displayName: data.displayName,
            },
        };
    } catch (error) {
        console.error('Signup error:', error);
        return {
            success: false,
            error: 'Erro ao criar usuário',
        };
    }
}

/**
 * Login de usuário
 */
export async function login(data: LoginData): Promise<AuthResult> {
    try {
        // Buscar usuário por email
        const user = db.prepare(`
      SELECT id, email, password_hash, display_name
      FROM users
      WHERE email = ?
    `).get(data.email) as { id: string; email: string; password_hash: string; display_name: string | null } | undefined;

        if (!user) {
            return {
                success: false,
                error: 'Credenciais inválidas',
            };
        }

        // Verificar senha
        const isPasswordValid = await comparePassword(data.password, user.password_hash);

        if (!isPasswordValid) {
            return {
                success: false,
                error: 'Credenciais inválidas',
            };
        }

        // Gerar token
        const token = generateToken({
            userId: user.id,
            email: user.email,
        });

        return {
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                displayName: user.display_name,
            },
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: 'Erro ao fazer login',
        };
    }
}

/**
 * Verificar token e obter usuário
 */
export function getUserFromToken(token: string) {
    try {
        const payload = require('./jwt-utils').verifyToken(token);

        if (!payload) {
            return null;
        }

        const user = db.prepare(`
      SELECT id, email, display_name, created_at, updated_at
      FROM users
      WHERE id = ?
    `).get(payload.userId) as {
            id: string;
            email: string;
            display_name: string | null;
            created_at: string;
            updated_at: string;
        } | undefined;

        return user || null;
    } catch (error) {
        console.error('Get user from token error:', error);
        return null;
    }
}
