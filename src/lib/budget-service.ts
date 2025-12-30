import db from './db';
import { randomBytes } from 'node:crypto';
import { Budget, BudgetOption, BudgetItem, BudgetStatus, BillingCycle } from './types';

function generateId(): string {
    return randomBytes(16).toString('hex');
}

/**
 * Listar orçamentos de um usuário
 */
export async function getBudgets(userId: string): Promise<Budget[]> {
    try {
        const rows = db.prepare(`
      SELECT b.*, c.name as client_name, c.email as client_email, c.company as client_company, c.phone as client_phone
      FROM budgets b
      JOIN clients c ON b.client_id = c.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `).all(userId) as any[];

        const budgets: Budget[] = rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            budgetNumber: row.budget_number,
            title: row.title,
            issueDate: row.issue_date,
            responsible: row.responsible,
            generalObservations: row.general_observations,
            status: row.status as BudgetStatus,
            isPublic: Boolean(row.is_public),
            publicLink: row.public_link,
            qrCodeLink: row.qr_code_link,
            primaryColor: row.primary_color,
            accentColor: row.accent_color,
            backgroundColor: row.background_color,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            client: {
                id: row.client_id,
                name: row.client_name,
                email: row.client_email,
                company: row.client_company,
                phone: row.client_phone
            },
            quickLinks: {
                whatsapp: row.quick_links_whatsapp,
                website: row.quick_links_website,
                signature: row.quick_links_signature,
                payment: row.quick_links_payment
            },
            options: [] // To be loaded separately or joined (complex for single query)
        }));

        return budgets;
    } catch (error) {
        console.error('Error getting budgets:', error);
        return [];
    }
}

/**
 * Obter um orçamento detalhado por ID
 */
export async function getBudgetById(id: string, userId: string): Promise<Budget | null> {
    try {
        const row = db.prepare(`
      SELECT b.*, c.name as client_name, c.email as client_email, c.company as client_company, c.phone as client_phone
      FROM budgets b
      JOIN clients c ON b.client_id = c.id
      WHERE b.id = ? AND b.user_id = ?
    `).get(id, userId) as any;

        if (!row) return null;

        const budget: Budget = {
            id: row.id,
            userId: row.user_id,
            budgetNumber: row.budget_number,
            title: row.title,
            issueDate: row.issue_date,
            responsible: row.responsible,
            generalObservations: row.general_observations,
            status: row.status as BudgetStatus,
            isPublic: Boolean(row.is_public),
            publicLink: row.public_link,
            qrCodeLink: row.qr_code_link,
            primaryColor: row.primary_color,
            accentColor: row.accent_color,
            backgroundColor: row.background_color,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            client: {
                id: row.client_id,
                name: row.client_name,
                email: row.client_email,
                company: row.client_company,
                phone: row.client_phone
            },
            quickLinks: {
                whatsapp: row.quick_links_whatsapp,
                website: row.quick_links_website,
                signature: row.quick_links_signature,
                payment: row.quick_links_payment
            },
            options: []
        };

        // Carregar opções
        const optionsRows = db.prepare(`
      SELECT * FROM budget_options WHERE budget_id = ? ORDER BY option_order ASC
    `).all(id) as any[];

        for (const optRow of optionsRows) {
            const option: BudgetOption = {
                id: optRow.id,
                title: optRow.title,
                observations: optRow.observations,
                total: optRow.total,
                items: []
            };

            // Carregar itens da opção
            const itemRows = db.prepare(`
        SELECT * FROM budget_items WHERE budget_option_id = ? ORDER BY item_order ASC
      `).all(optRow.id) as any[];

            option.items = itemRows.map(iRow => {
                const prices = db.prepare(`SELECT * FROM budget_item_prices WHERE item_id = ?`).all(iRow.id) as any[];
                return {
                    id: iRow.id,
                    title: iRow.title,
                    description: iRow.description,
                    features: iRow.features,
                    presentationLink: iRow.presentation_link,
                    quantity: iRow.quantity,
                    prices: prices.map(p => ({
                        id: p.id,
                        billingCycle: p.billing_cycle as BillingCycle,
                        value: p.value
                    })),
                    item_order: iRow.item_order
                };
            });

            // Calculate recurring totals based on item quantity * price value
            option.total = option.items.reduce((sum, item) => {
                const itemTotal = item.prices
                    .filter(p => p.billingCycle === 'unico')
                    .reduce((pSum, p) => pSum + (p.value * item.quantity), 0);
                return sum + itemTotal;
            }, 0);

            option.totalMensal = option.items.reduce((sum, item) => {
                const itemMensal = item.prices
                    .filter(p => p.billingCycle === 'mensal')
                    .reduce((pSum, p) => pSum + (p.value * item.quantity), 0);
                return sum + itemMensal;
            }, 0);

            option.totalAnual = option.items.reduce((sum, item) => {
                const itemAnual = item.prices
                    .filter(p => p.billingCycle === 'anual')
                    .reduce((pSum, p) => pSum + (p.value * item.quantity), 0);
                return sum + itemAnual;
            }, 0);

            budget.options.push(option);
        }

        return budget;
    } catch (error) {
        console.error('Error getting budget by id:', error);
        return null;
    }
}

/**
 * Criar um novo orçamento
 */
export async function createBudget(data: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget | null> {
    const transaction = db.transaction(() => {
        const id = generateId();
        const now = new Date().toISOString();

        // Inserir orçamento
        db.prepare(`
      INSERT INTO budgets (
        id, user_id, budget_number, title, issue_date, client_id, responsible, 
        general_observations, status, quick_links_whatsapp, quick_links_website, 
        quick_links_signature, quick_links_payment, public_link, is_public, 
        qr_code_link, primary_color, accent_color, background_color, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
            id, data.userId, data.budgetNumber, data.title, data.issueDate, data.client.id,
            data.responsible, data.generalObservations || null, data.status,
            data.quickLinks?.whatsapp || null, data.quickLinks?.website || null,
            data.quickLinks?.signature || null, data.quickLinks?.payment || null,
            data.publicLink || null, data.isPublic ? 1 : 0,
            data.qrCodeLink || null,
            data.primaryColor || null, data.accentColor || null, data.backgroundColor || null,
            now, now
        );

        // Inserir opções e itens
        data.options.forEach((opt, optIdx) => {
            const optId = generateId();
            db.prepare(`
        INSERT INTO budget_options (id, budget_id, title, observations, total, option_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(optId, id, opt.title, opt.observations || null, opt.total, optIdx);

            opt.items.forEach((item, itemIdx) => {
                const itemId = generateId();
                db.prepare(`
            INSERT INTO budget_items (
              id, budget_option_id, title, description, features, quantity, 
              unit_value, total_value, item_order, presentation_link
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
                    itemId, optId, item.title, item.description, item.features,
                    item.quantity, 0, 0, item.item_order || itemIdx,
                    item.presentationLink || null
                );

                // Deletar preços antigos (não aplicável em createBudget, mas útil em updateBudget se implementado)
                // db.prepare(`DELETE FROM budget_item_prices WHERE item_id = ?`).run(itemId);

                // Inserir novos preços
                const insertPrice = db.prepare(`
            INSERT INTO budget_item_prices (id, item_id, billing_cycle, value)
            VALUES (?, ?, ?, ?)
          `);
                item.prices.forEach(price => {
                    insertPrice.run(generateId(), itemId, price.billingCycle, price.value);
                });
            });
        });

        return id;
    });

    try {
        const id = transaction();
        return getBudgetById(id, data.userId);
    } catch (error) {
        console.error('Error creating budget:', error);
        return null;
    }
}

/**
 * Atualizar um orçamento existente
 */
export async function updateBudget(id: string, userId: string, data: Partial<Budget>): Promise<boolean> {
    const transaction = db.transaction(() => {
        const now = new Date().toISOString();

        // 1. Atualizar dados básicos do orçamento
        const updates: string[] = [];
        const values: any[] = [];

        if (data.title) { updates.push('title = ?'); values.push(data.title); }
        if (data.budgetNumber) { updates.push('budget_number = ?'); values.push(data.budgetNumber); }
        if (data.responsible) { updates.push('responsible = ?'); values.push(data.responsible); }
        if (data.client?.id) { updates.push('client_id = ?'); values.push(data.client.id); }
        if (data.status) { updates.push('status = ?'); values.push(data.status); }
        if (data.generalObservations !== undefined) { updates.push('general_observations = ?'); values.push(data.generalObservations); }
        if (data.isPublic !== undefined) { updates.push('is_public = ?'); values.push(data.isPublic ? 1 : 0); }
        if (data.qrCodeLink !== undefined) { updates.push('qr_code_link = ?'); values.push(data.qrCodeLink); }
        if (data.primaryColor) { updates.push('primary_color = ?'); values.push(data.primaryColor); }
        if (data.accentColor) { updates.push('accent_color = ?'); values.push(data.accentColor); }
        if (data.backgroundColor) { updates.push('background_color = ?'); values.push(data.backgroundColor); }

        updates.push('updated_at = ?');
        values.push(now);

        if (updates.length > 0) {
            db.prepare(`
                UPDATE budgets 
                SET ${updates.join(', ')} 
                WHERE id = ? AND user_id = ?
            `).run(...values, id, userId);
        }

        // 2. Se houver novas opções, remover as antigas e inserir tudo novamente (estratégia mais segura)
        if (data.options) {
            // Remover opções antigas (cascade removerá itens e preços)
            db.prepare(`DELETE FROM budget_options WHERE budget_id = ?`).run(id);

            // Inserir novas opções
            data.options.forEach((opt, optIdx) => {
                const optId = generateId();
                db.prepare(`
                    INSERT INTO budget_options (id, budget_id, title, observations, total, option_order)
                    VALUES (?, ?, ?, ?, ?, ?)
                `).run(optId, id, opt.title, opt.observations || null, opt.total, optIdx);

                opt.items.forEach((item, itemIdx) => {
                    const itemId = generateId();
                    db.prepare(`
                        INSERT INTO budget_items (
                            id, budget_option_id, title, description, features, quantity, 
                            unit_value, total_value, item_order, presentation_link
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `).run(
                        itemId, optId, item.title, item.description, item.features,
                        item.quantity, 0, 0, item.item_order || itemIdx,
                        item.presentationLink || null
                    );

                    // Inserir novos preços
                    const insertPrice = db.prepare(`
                        INSERT INTO budget_item_prices (id, item_id, billing_cycle, value)
                        VALUES (?, ?, ?, ?)
                    `);
                    item.prices.forEach(price => {
                        insertPrice.run(generateId(), itemId, price.billingCycle, price.value);
                    });
                });
            });
        }

        return true;
    });

    try {
        return transaction();
    } catch (error) {
        console.error('Error updating budget:', error);
        return false;
    }
}

/**
 * Atualizar status do orçamento
 */
export async function updateBudgetStatus(id: string, userId: string, status: BudgetStatus): Promise<boolean> {
    try {
        const now = new Date().toISOString();
        const result = db.prepare(`
      UPDATE budgets SET status = ?, updated_at = ? WHERE id = ? AND user_id = ?
    `).run(status, now, id, userId);
        return result.changes > 0;
    } catch (error) {
        console.error('Error updating budget status:', error);
        return false;
    }
}

/**
 * Excluir orçamento
 */
export async function deleteBudget(id: string, userId: string): Promise<boolean> {
    try {
        // Foreign keys with ON DELETE CASCADE handled by SQLite
        const result = db.prepare(`DELETE FROM budgets WHERE id = ? AND user_id = ?`).run(id, userId);
        return result.changes > 0;
    } catch (error) {
        console.error('Error deleting budget:', error);
        return false;
    }
}
