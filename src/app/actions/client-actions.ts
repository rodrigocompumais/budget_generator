"use server";

import { revalidatePath } from 'next/cache';
import * as ClientService from '@/lib/client-service';
import { getUserFromToken } from '@/lib/auth-service';
import { getSessionToken } from './auth-actions';
import { Client } from '@/lib/types';

async function getAuthUser() {
    const token = await getSessionToken();
    if (!token) return null;
    return getUserFromToken(token);
}

/**
 * Action para criar cliente
 */
export async function createClientAction(data: Omit<Client, 'id' | 'userId'>) {
    const user = await getAuthUser();
    if (!user) return { success: false, error: 'Não autorizado' };

    const client = await ClientService.createClient({
        ...data,
        userId: user.id
    });

    if (client) {
        revalidatePath('/dashboard/clients');
        return { success: true, client };
    }

    return { success: false, error: 'Erro ao criar cliente' };
}

/**
 * Action para atualizar cliente
 */
export async function updateClientAction(id: string, data: Partial<Omit<Client, 'id' | 'userId'>>) {
    const user = await getAuthUser();
    if (!user) return { success: false, error: 'Não autorizado' };

    const success = await ClientService.updateClient(id, user.id, data);

    if (success) {
        revalidatePath('/dashboard/clients');
        return { success: true };
    }

    return { success: false, error: 'Erro ao atualizar cliente' };
}

/**
 * Action para excluir cliente
 */
export async function deleteClientAction(id: string) {
    const user = await getAuthUser();
    if (!user) return { success: false, error: 'Não autorizado' };

    const success = await ClientService.deleteClient(id, user.id);

    if (success) {
        revalidatePath('/dashboard/clients');
        return { success: true };
    }

    return { success: false, error: 'Erro ao excluir cliente' };
}
