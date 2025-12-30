"use server";

import { cookies } from 'next/headers';
import { signup as authSignup, login as authLogin, LoginData, SignupData, AuthResult } from '@/lib/auth-service';
import { redirect } from 'next/navigation';

const AUTH_COOKIE_NAME = 'auth-token';

/**
 * Action para Signup
 */
export async function signupAction(data: SignupData): Promise<AuthResult> {
    const result = await authSignup(data);

    if (result.success && result.token) {
        (await cookies()).set(AUTH_COOKIE_NAME, result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 dias
            path: '/',
        });
    }

    return result;
}

/**
 * Action para Login
 */
export async function loginAction(data: LoginData): Promise<AuthResult> {
    const result = await authLogin(data);

    if (result.success && result.token) {
        (await cookies()).set(AUTH_COOKIE_NAME, result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 dias
            path: '/',
        });
    }

    return result;
}

/**
 * Action para Logout
 */
export async function logoutAction() {
    (await cookies()).delete(AUTH_COOKIE_NAME);
    redirect('/login');
}

/**
 * Obter token da sessão (server-side)
 */
export async function getSessionToken() {
    return (await cookies()).get(AUTH_COOKIE_NAME)?.value || null;
}
