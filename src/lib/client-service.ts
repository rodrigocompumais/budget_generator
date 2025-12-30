import db from './db';
import { randomBytes } from 'node:crypto';

export interface Client {
    id: string;
    name: string;
    company?: string;
    phone?: string;
    email: string;
    userId: string;
}

function generateId(): string {
    return randomBytes(16).toString('hex');
}

/**
 * Listar clientes de um usuário
 */
export async function getClients(userId: string): Promise<Client[]> {
    try {
        const clients = db.prepare(`
      SELECT id, name, company, phone, email, user_id as userId
      FROM clients
      WHERE user_id = ?
      ORDER BY name ASC
    `).all(userId) as Client[];

        return clients;
    } catch (error) {
        console.error('Error getting clients:', error);
        return [];
    }
}

/**
 * Obter um cliente por ID
 */
export async function getClientById(id: string, userId: string): Promise<Client | null> {
    try {
        const client = db.prepare(`
      SELECT id, name, company, phone, email, user_id as userId
      FROM clients
      WHERE id = ? AND user_id = ?
    `).get(id, userId) as Client | undefined;

        return client || null;
    } catch (error) {
        console.error('Error getting client by id:', error);
        return null;
    }
}

/**
 * Criar um novo cliente
 */
export async function createClient(data: Omit<Client, 'id'>): Promise<Client | null> {
    try {
        const id = generateId();
        const now = new Date().toISOString();

        db.prepare(`
      INSERT INTO clients (id, name, company, phone, email, user_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.name, data.company || null, data.phone || null, data.email, data.userId, now);

        return { id, ...data };
    } catch (error) {
        console.error('Error creating client:', error);
        return null;
    }
}

/**
 * Atualizar um cliente
 */
export async function updateClient(id: string, userId: string, data: Partial<Omit<Client, 'id' | 'userId'>>): Promise<boolean> {
    try {
        const fields = Object.keys(data).map(key => {
            const dbKey = key === 'userId' ? 'user_id' : (key === 'company' ? 'company' : (key === 'phone' ? 'phone' : key));
            return `${dbKey} = ?`;
        });

        if (fields.length === 0) return true;

        const values = Object.values(data);

        const result = db.prepare(`
      UPDATE clients
      SET ${fields.join(', ')}
      WHERE id = ? AND user_id = ?
    `).run(...values, id, userId);

        return result.changes > 0;
    } catch (error) {
        console.error('Error updating client:', error);
        return false;
    }
}

/**
 * Excluir um cliente
 */
export async function deleteClient(id: string, userId: string): Promise<boolean> {
    try {
        const result = db.prepare(`
      DELETE FROM clients
      WHERE id = ? AND user_id = ?
    `).run(id, userId);

        return result.changes > 0;
    } catch (error) {
        console.error('Error deleting client:', error);
        return false;
    }
}
