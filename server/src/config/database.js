// arquivo: server/src/config/database.js
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

// Garantir que a pasta database existe
const dbDir = path.join(__dirname, '../../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'hub.db');

// Criar conexão com o banco
const db = new DatabaseSync(dbPath);

// Habilitar foreign keys
db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA journal_mode = WAL');

console.log('✅ Banco de dados conectado:', dbPath);

// ========================================
// Inicialização de Tabelas (se não existirem)
// ========================================
try {
  db.exec(`
    -- Tabela de Clientes
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL UNIQUE,
      cnpj TEXT NOT NULL UNIQUE,
      nome_empresa TEXT NOT NULL,
      contato TEXT,
      telefone TEXT,
      email_principal TEXT,
      regime TEXT CHECK (regime IN ('CEI','MEI','SIMPLES','PRESUMIDO','REAL')),
      responsavel_legal TEXT,
      data_abertura TEXT,
      status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa','inativa','baixada')),
      data_entrada_escritorio TEXT,
      data_saida_escritorio TEXT,
      data_baixada TEXT,
      criado_por INTEGER,
      data_cadastro TEXT DEFAULT (datetime('now','localtime')),
      data_atualizacao TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE INDEX IF NOT EXISTS idx_clientes_codigo ON clientes(codigo);
    CREATE INDEX IF NOT EXISTS idx_clientes_cnpj ON clientes(cnpj);

    -- Tabela complementar de Legalização dos Clientes
    CREATE TABLE IF NOT EXISTS clientes_legalizacao (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      tipo_cobranca TEXT,
      percentual_cobranca REAL,
      valor_cobranca REAL,
      dia_vencimento INTEGER,
      data_criacao TEXT DEFAULT (datetime('now','localtime')),
      data_atualizacao TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY(cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_clientes_legalizacao_cliente ON clientes_legalizacao(cliente_id);

    -- Tabela de Certificados
    CREATE TABLE IF NOT EXISTS certificados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      nome_cliente TEXT,
      tipo_certificado TEXT NOT NULL,
      numero_serie TEXT,
      data_emissao TEXT,
      data_vencimento TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ativo',
      arquivo_path TEXT,
      observacoes TEXT,
      criado_em TEXT DEFAULT (datetime('now','localtime')),
      atualizado_em TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY(cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_certificados_cliente ON certificados(cliente_id);
    CREATE INDEX IF NOT EXISTS idx_certificados_vencimento ON certificados(data_vencimento);
  `);
  console.log('✅ Tabelas principais verificadas/criadas com sucesso');
} catch (e) {
  console.warn('⚠️ Falha ao inicializar tabelas:', e.message);
}

// Função para executar queries preparadas
function query(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  } catch (error) {
    console.error('Erro ao executar query:', error);
    throw error;
  }
}

// Função para executar um único resultado
function get(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.get(...params);
  } catch (error) {
    console.error('Erro ao executar get:', error);
    throw error;
  }
}

// Função para executar INSERT/UPDATE/DELETE
function run(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  } catch (error) {
    console.error('Erro ao executar run:', error);
    throw error;
  }
}

module.exports = {
  db,
  query,
  get,
  run
};
