"use server";

import { revalidatePath } from 'next/cache';
import * as BudgetService from '@/lib/budget-service';
import { getUserFromToken } from '@/lib/auth-service';
import { getSessionToken } from './auth-actions';
import { Budget, BudgetStatus } from '@/lib/types';

async function getAuthUser() {
    const token = await getSessionToken();
    if (!token) return null;
    return getUserFromToken(token);
}

/**
 * Action para criar orçamento
 */
export async function createBudgetAction(data: Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) {
    const user = await getAuthUser();
    if (!user) return { success: false, error: 'Não autorizado' };

    const budget = await BudgetService.createBudget({
        ...data,
        userId: user.id
    });

    if (budget) {
        revalidatePath('/dashboard');
        return { success: true, budget };
    }

    return { success: false, error: 'Erro ao criar orçamento' };
}

/**
 * Action para atualizar orçamento
 */
export async function updateBudgetAction(id: string, data: Partial<Budget>) {
    const user = await getAuthUser();
    if (!user) return { success: false, error: 'Não autorizado' };

    const success = await BudgetService.updateBudget(id, user.id, data);

    if (success) {
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/budgets');
        revalidatePath(`/budget/${id}`);
        return { success: true };
    }

    return { success: false, error: 'Erro ao atualizar orçamento' };
}

/**
 * Action para atualizar status
 */
export async function updateBudgetStatusAction(id: string, status: BudgetStatus) {
    const user = await getAuthUser();
    if (!user) return { success: false, error: 'Não autorizado' };

    const success = await BudgetService.updateBudgetStatus(id, user.id, status);

    if (success) {
        revalidatePath('/dashboard');
        revalidatePath(`/budget/${id}`);
        return { success: true };
    }

    return { success: false, error: 'Erro ao atualizar status' };
}

/**
 * Action para excluir orçamento
 */
export async function deleteBudgetAction(id: string) {
    const user = await getAuthUser();
    if (!user) return { success: false, error: 'Não autorizado' };

    const success = await BudgetService.deleteBudget(id, user.id);

    if (success) {
        revalidatePath('/dashboard');
        return { success: true };
    }

    return { success: false, error: 'Erro ao excluir orçamento' };
}
