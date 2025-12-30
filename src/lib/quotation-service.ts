import db from './db';
import { Quotation, QuotationItem, QuotationResponse, QuotationResponseItem, QuotationStatus } from './types';
import { v4 as uuidv4 } from 'uuid';

const generateId = () => uuidv4();

/**
 * Criar uma nova cotação
 */
export async function createQuotation(data: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt' | 'publicLink' | 'status'>): Promise<string> {
    const transaction = db.transaction(() => {
        const id = generateId();
        const now = new Date().toISOString();
        const publicLink = `/quotation/${id}`;

        // Inserir cotação
        db.prepare(`
      INSERT INTO quotations (id, user_id, title, description, status, public_link, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.userId, data.title, data.description || null, 'aberta', publicLink, now, now);

        // Inserir itens
        const insertItem = db.prepare(`
      INSERT INTO quotation_items (id, quotation_id, title, description, quantity, unit)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

        data.items.forEach(item => {
            insertItem.run(generateId(), id, item.title, item.description || null, item.quantity, item.unit);
        });

        return id;
    });

    return transaction();
}

/**
 * Obter uma cotação por ID (para o admin)
 */
export async function getQuotationById(id: string, userId: string): Promise<Quotation | null> {
    try {
        const qRow = db.prepare(`SELECT * FROM quotations WHERE id = ? AND user_id = ?`).get(id) as any;
        if (!qRow) return null;

        const items = db.prepare(`SELECT * FROM quotation_items WHERE quotation_id = ?`).all(id) as any[];

        return {
            id: qRow.id,
            userId: qRow.user_id,
            title: qRow.title,
            description: qRow.description,
            status: qRow.status as QuotationStatus,
            createdAt: qRow.created_at,
            updatedAt: qRow.updated_at,
            publicLink: qRow.public_link,
            items: items.map(i => ({
                id: i.id,
                quotationId: i.quotation_id,
                title: i.title,
                description: i.description,
                quantity: i.quantity,
                unit: i.unit
            }))
        };
    } catch (error) {
        console.error('Error fetching quotation:', error);
        return null;
    }
}

/**
 * Listar cotações do usuário
 */
export async function getQuotations(userId: string): Promise<Quotation[]> {
    const rows = db.prepare(`SELECT * FROM quotations WHERE user_id = ? ORDER BY created_at DESC`).all(userId) as any[];

    return rows.map(qRow => ({
        id: qRow.id,
        userId: qRow.user_id,
        title: qRow.title,
        description: qRow.description,
        status: qRow.status as QuotationStatus,
        createdAt: qRow.created_at,
        updatedAt: qRow.updated_at,
        publicLink: qRow.public_link,
        items: [] // Não carregamos itens na listagem para performance
    }));
}

/**
 * Obter cotação para o fornecedor (página pública) - Não precisa de userId
 */
export async function getQuotationForSupplier(id: string): Promise<Quotation | null> {
    const qRow = db.prepare(`SELECT * FROM quotations WHERE id = ? AND status = 'aberta'`).get(id) as any;
    if (!qRow) return null;

    const items = db.prepare(`SELECT * FROM quotation_items WHERE quotation_id = ?`).all(id) as any[];

    return {
        id: qRow.id,
        userId: qRow.user_id,
        title: qRow.title,
        description: qRow.description,
        status: qRow.status as QuotationStatus,
        createdAt: qRow.created_at,
        updatedAt: qRow.updated_at,
        publicLink: qRow.public_link,
        items: items.map(i => ({
            id: i.id,
            quotationId: i.quotation_id,
            title: i.title,
            description: i.description,
            quantity: i.quantity,
            unit: i.unit
        }))
    };
}

/**
 * Salvar resposta do fornecedor
 */
export async function saveQuotationResponse(data: Omit<QuotationResponse, 'id' | 'createdAt'>): Promise<string> {
    const transaction = db.transaction(() => {
        const responseId = generateId();
        const now = new Date().toISOString();

        db.prepare(`
      INSERT INTO quotation_responses (id, quotation_id, supplier_name, supplier_contact, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(responseId, data.quotationId, data.supplierName, data.supplierContact, now);

        const insertResponseItem = db.prepare(`
      INSERT INTO quotation_response_items (id, response_id, item_id, unit_value, observations)
      VALUES (?, ?, ?, ?, ?)
    `);

        data.items.forEach(item => {
            insertResponseItem.run(generateId(), responseId, item.itemId, item.unitValue, item.observations || null);
        });

        return responseId;
    });

    return transaction();
}

/**
 * Obter resumo da cotação com comparação de preços
 */
export async function getQuotationSummary(quotationId: string, userId: string) {
    // Verificar se a cotação pertence ao usuário
    const q = db.prepare(`SELECT title FROM quotations WHERE id = ? AND user_id = ?`).get(quotationId, userId);
    if (!q) return null;

    const items = db.prepare(`SELECT * FROM quotation_items WHERE quotation_id = ?`).all(quotationId) as any[];
    const responses = db.prepare(`SELECT * FROM quotation_responses WHERE quotation_id = ?`).all(quotationId) as any[];

    const responseData = responses.map(r => {
        const rItems = db.prepare(`SELECT * FROM quotation_response_items WHERE response_id = ?`).all(r.id) as any[];
        return {
            ...r,
            items: rItems
        };
    });

    // Para cada item, encontrar o melhor preço
    const itemsWithComparison = items.map(item => {
        const prices = responseData.map(r => {
            const respItem = r.items.find((ri: any) => ri.item_id === item.id);
            return {
                supplierName: r.supplier_name,
                value: respItem ? respItem.unit_value : Infinity,
                observations: respItem ? respItem.observations : null
            };
        }).filter(p => p.value !== Infinity);

        const bestPrice = prices.length > 0 ? prices.reduce((min, p) => p.value < min.value ? p : min, prices[0]) : null;

        return {
            ...item,
            prices,
            bestPrice
        };
    });

    return {
        quotationTitle: q.title,
        items: itemsWithComparison,
        totalResponses: responses.length
    };
}
