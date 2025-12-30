-- Schema para SQLite Database
-- Budget Generator Application

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  email TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de orçamentos
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  budget_number TEXT NOT NULL,
  title TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  client_id TEXT NOT NULL,
  responsible TEXT NOT NULL,
  general_observations TEXT,
  status TEXT NOT NULL CHECK(status IN ('rascunho', 'enviado', 'aprovado', 'recusado')),
  quick_links_whatsapp TEXT,
  quick_links_website TEXT,
  quick_links_signature TEXT,
  quick_links_payment TEXT,
  public_link TEXT,
  is_public INTEGER NOT NULL DEFAULT 0,
  qr_code_link TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Tabela de opções de orçamento
CREATE TABLE IF NOT EXISTS budget_options (
  id TEXT PRIMARY KEY,
  budget_id TEXT NOT NULL,
  title TEXT NOT NULL,
  observations TEXT,
  total REAL NOT NULL,
  option_order INTEGER NOT NULL,
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE
);

-- Tabela de itens de orçamento
CREATE TABLE IF NOT EXISTS budget_items (
  id TEXT PRIMARY KEY,
  budget_option_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  features TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_value REAL NOT NULL,
  total_value REAL NOT NULL,
  presentation_link TEXT,
  item_order INTEGER NOT NULL,
  FOREIGN KEY (budget_option_id) REFERENCES budget_options(id) ON DELETE CASCADE
);

-- Tabela de configurações visuais
CREATE TABLE IF NOT EXISTS visual_settings (
  user_id TEXT PRIMARY KEY,
  company_logo_url TEXT,
  company_name TEXT,
  primary_color TEXT NOT NULL DEFAULT '#3b82f6',
  background_color TEXT NOT NULL DEFAULT '#ffffff',
  accent_color TEXT NOT NULL DEFAULT '#10b981',
  font_family TEXT NOT NULL DEFAULT 'Inter',
  custom_footer TEXT,
  show_qr_code INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_client_id ON budgets(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_options_budget_id ON budget_options(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_option_id ON budget_items(budget_option_id);
CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets(status);
CREATE INDEX IF NOT EXISTS idx_budgets_created_at ON budgets(created_at);

-- Tabela de cotações
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
);

-- Tabela de itens da cotação
CREATE TABLE IF NOT EXISTS quotation_items (
  id TEXT PRIMARY KEY,
  quotation_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  quantity REAL NOT NULL,
  unit TEXT NOT NULL,
  FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
);

-- Tabela de respostas de fornecedores
CREATE TABLE IF NOT EXISTS quotation_responses (
  id TEXT PRIMARY KEY,
  quotation_id TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  supplier_contact TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
);

-- Tabela de itens respondidos pelos fornecedores
CREATE TABLE IF NOT EXISTS quotation_response_items (
  id TEXT PRIMARY KEY,
  response_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  unit_value REAL NOT NULL,
  observations TEXT,
  FOREIGN KEY (response_id) REFERENCES quotation_responses(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES quotation_items(id) ON DELETE CASCADE
);

-- Índices para cotações
CREATE INDEX IF NOT EXISTS idx_quotations_user_id ON quotations(user_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_responses_quotation_id ON quotation_responses(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_response_items_response_id ON quotation_response_items(response_id);
