import Database from 'better-sqlite3';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

// Caminho para o arquivo de banco de dados
const DB_PATH = process.env.DATABASE_PATH || join(process.cwd(), 'data', 'database.sqlite');
const SCHEMA_PATH = join(process.cwd(), 'src', 'lib', 'schema.sql');

// Criar diretório se não existir
const dbDir = dirname(DB_PATH);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

// Inicializar banco de dados
let db: Database.Database;

try {
  db = new Database(DB_PATH);
  // Habilitar foreign keys
  db.pragma('foreign_keys = ON');
} catch (error) {
  console.error('❌ Error creating database:', error);
  throw error;
}

// Função para inicializar o schema
export function initializeDatabase() {
  try {
    if (existsSync(SCHEMA_PATH)) {
      const schema = readFileSync(SCHEMA_PATH, 'utf-8');
      db.exec(schema);

      // Migrações manuais para colunas novas
      try {
        db.prepare("ALTER TABLE budgets ADD COLUMN qr_code_link TEXT").run();
      } catch (e) { } // Ignorar se já existir

      try {
        db.prepare("ALTER TABLE budgets ADD COLUMN primary_color TEXT").run();
        db.prepare("ALTER TABLE budgets ADD COLUMN accent_color TEXT").run();
        db.prepare("ALTER TABLE budgets ADD COLUMN background_color TEXT").run();
      } catch (e) { } // Ignorar se já existir

      try {
        db.prepare("ALTER TABLE visual_settings ADD COLUMN show_qr_code INTEGER NOT NULL DEFAULT 1").run();
      } catch (e) { } // Ignorar se já existir

      try {
        db.prepare("ALTER TABLE budget_items ADD COLUMN presentation_link TEXT").run();
      } catch (e) { } // Ignorar se já existir

      try {
        db.prepare("ALTER TABLE budget_items ADD COLUMN billing_cycle TEXT NOT NULL DEFAULT 'unico'").run();
      } catch (e) { } // Ignorar se já existir

      // Nova tabela para múltiplos preços
      db.prepare(`
        CREATE TABLE IF NOT EXISTS budget_item_prices (
          id TEXT PRIMARY KEY,
          item_id TEXT NOT NULL,
          billing_cycle TEXT NOT NULL,
          value REAL NOT NULL,
          FOREIGN KEY (item_id) REFERENCES budget_items(id) ON DELETE CASCADE
        )
      `).run();

      // Tabelas do Módulo de Cotação
      db.prepare(`
        CREATE TABLE IF NOT EXISTS quotations (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL DEFAULT 'aberta',
          public_link TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `).run();

      db.prepare(`
        CREATE TABLE IF NOT EXISTS quotation_items (
          id TEXT PRIMARY KEY,
          quotation_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          quantity REAL NOT NULL,
          unit TEXT NOT NULL,
          FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
        )
      `).run();

      db.prepare(`
        CREATE TABLE IF NOT EXISTS quotation_responses (
          id TEXT PRIMARY KEY,
          quotation_id TEXT NOT NULL,
          supplier_name TEXT NOT NULL,
          supplier_contact TEXT NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
        )
      `).run();

      db.prepare(`
        CREATE TABLE IF NOT EXISTS quotation_response_items (
          id TEXT PRIMARY KEY,
          response_id TEXT NOT NULL,
          item_id TEXT NOT NULL,
          unit_value REAL NOT NULL,
          observations TEXT,
          FOREIGN KEY (response_id) REFERENCES quotation_responses(id) ON DELETE CASCADE,
          FOREIGN KEY (item_id) REFERENCES quotation_items(id) ON DELETE CASCADE
        )
      `).run();

      // Migração: Se houver itens que ainda não têm preços na nova tabela, migrar
      const itemsToMigrate = db.prepare(`
        SELECT id, unit_value, billing_cycle 
        FROM budget_items 
        WHERE id NOT IN (SELECT DISTINCT item_id FROM budget_item_prices)
      `).all() as any[];

      if (itemsToMigrate.length > 0) {
        const insertPrice = db.prepare(`
          INSERT INTO budget_item_prices (id, item_id, billing_cycle, value)
          VALUES (?, ?, ?, ?)
        `);
        itemsToMigrate.forEach(item => {
          insertPrice.run(Math.random().toString(36).substring(2), item.id, item.billing_cycle || 'unico', item.unit_value || 0);
        });
        console.log(`✅ Migrated ${itemsToMigrate.length} items to new pricing structure.`);
      }

      console.log('✅ Database initialized successfully at:', DB_PATH);
    } else {
      console.warn('⚠️  Schema file not found at:', SCHEMA_PATH);
    }
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Executar inicialização apenas uma vez
let initialized = false;
if (!initialized) {
  initializeDatabase();
  initialized = true;
}

export default db;
