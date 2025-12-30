import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token expira em 7 dias

export interface JWTPayload {
    userId: string;
    email: string;
}

/**
 * Gera um token JWT para o usuário
 */
export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifica e decodifica um token JWT
 */
export function verifyToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
        return decoded;
    } catch (error) {
        console.error('Invalid token:', error);
        return null;
    }
}

/**
 * Extrai o token dos cookies
 */
export function getTokenFromCookies(cookieHeader: string | null): string | null {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);

    return cookies['auth-token'] || null;
}
