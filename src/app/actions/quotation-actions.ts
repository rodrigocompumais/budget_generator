"use server";

import { revalidatePath } from 'next/cache';
import * as QuotationService from '@/lib/quotation-service';
import { getUserFromToken } from '@/lib/auth-service';
import { getSessionToken } from './auth-actions';
import { Quotation, QuotationResponse } from '@/lib/types';

async function getAuthUser() {
    const token = await getSessionToken();
    if (!token) return null;
    return getUserFromToken(token);
}

/**
 * Criar cotação
 */
export async function createQuotationAction(data: Omit<Quotation, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'publicLink' | 'status'>) {
    const user = await getAuthUser();
    if (!user) return { success: false, error: 'Não autorizado' };

    try {
        const id = await QuotationService.createQuotation({
            ...data,
            userId: user.id
        });

        revalidatePath('/dashboard/quotations');
        return { success: true, id };
    } catch (error) {
        console.error('Action error creating quotation:', error);
        return { success: false, error: 'Erro ao criar cotação' };
    }
}

/**
 * Salvar resposta do fornecedor (ação pública)
 */
export async function saveQuotationResponseAction(data: Omit<QuotationResponse, 'id' | 'createdAt'>) {
    try {
        const id = await QuotationService.saveQuotationResponse(data);

        // Revalidar para que o admin veja a nova resposta
        revalidatePath(`/dashboard/quotations/${data.quotationId}`);
        return { success: true, id };
    } catch (error) {
        console.error('Action error saving response:', error);
        return { success: false, error: 'Erro ao enviar resposta' };
    }
}
