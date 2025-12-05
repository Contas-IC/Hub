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

// Habilitar foreign keys e otimizações
db.exec('PRAGMA foreign_keys = ON');
db.exec('PRAGMA journal_mode = WAL');
console.log('✅ Banco de dados conectado:', dbPath);

// ========================================
// Inicialização COMPLETA de Tabelas
// ========================================
try {
  db.exec(`
    -- ========================================
    -- TABELA DE USUÁRIOS
    -- ========================================
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      cargo TEXT,
      ativo INTEGER DEFAULT 1,
      data_criacao TEXT DEFAULT (datetime('now','localtime')),
      data_atualizacao TEXT DEFAULT (datetime('now','localtime'))
    );
    
    CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

    -- TABELA DE PERMISSÕES DE USUÁRIOS
    CREATE TABLE IF NOT EXISTS permissoes_usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      modulo TEXT NOT NULL,
      pode_visualizar INTEGER DEFAULT 1,
      pode_editar INTEGER DEFAULT 0,
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_permissoes_usuario ON permissoes_usuarios(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_permissoes_modulo ON permissoes_usuarios(modulo);

    -- ========================================
    -- TABELA DE CLIENTES (COMPLETA)
    -- ========================================
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL UNIQUE,
      cnpj TEXT NOT NULL UNIQUE,
      nome_empresa TEXT NOT NULL,
      nome_fantasia TEXT,
      contato TEXT,
      telefone TEXT,
      email_principal TEXT,
      regime TEXT CHECK (regime IN ('CEI','MEI','SIMPLES','PRESUMIDO','REAL')),
      responsavel_legal TEXT,
      data_abertura TEXT,
      data_constituicao TEXT,
      quantidade_funcionarios INTEGER DEFAULT 0,
      tipo_apuracao TEXT,
      atividade TEXT,
      tipo_entrada TEXT,
      data_entrada_escritorio TEXT,
      grau_dificuldade TEXT CHECK (grau_dificuldade IN ('BAIXO','MEDIO','ALTO')) DEFAULT 'MEDIO',
      status TEXT NOT NULL DEFAULT 'ATIVO' CHECK (status IN ('ATIVO','INATIVO','BAIXADA')),
      data_saida_escritorio TEXT,
      data_baixada TEXT,
      data_inativacao TEXT,
      observacoes TEXT,
      criado_por INTEGER,
      data_cadastro TEXT DEFAULT (datetime('now','localtime')),
      data_atualizacao TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY(criado_por) REFERENCES usuarios(id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_clientes_codigo ON clientes(codigo);
    CREATE INDEX IF NOT EXISTS idx_clientes_cnpj ON clientes(cnpj);
    CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);

    -- ========================================
    -- TABELA DE EMAILS DO CLIENTE
    -- ========================================
    CREATE TABLE IF NOT EXISTS clientes_emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      email TEXT NOT NULL,
      tipo TEXT DEFAULT 'Secundário',
      FOREIGN KEY(cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_clientes_emails_cliente ON clientes_emails(cliente_id);

    -- ========================================
    -- TABELA DE LOCALIZAÇÕES DO CLIENTE
    -- ========================================
    CREATE TABLE IF NOT EXISTS clientes_localizacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      estado TEXT,
      cidade TEXT,
      inscricao_municipal TEXT,
      inscricao_estadual TEXT,
      FOREIGN KEY(cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_clientes_localizacoes_cliente ON clientes_localizacoes(cliente_id);

    -- ========================================
    -- TABELA DE SETORES DO CLIENTE
    -- ========================================
    CREATE TABLE IF NOT EXISTS clientes_setores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      setor TEXT NOT NULL,
      responsavel TEXT,
      status TEXT DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE','EM_ANDAMENTO','CONCLUIDO')),
      FOREIGN KEY(cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_clientes_setores_cliente ON clientes_setores(cliente_id);

    -- ========================================
    -- TABELA DE LEGALIZAÇÃO (ONBOARDING)
    -- ========================================
    CREATE TABLE IF NOT EXISTS legalizacao (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL UNIQUE,
      tipo_cobranca TEXT,
      percentual_cobranca REAL,
      valor_cobranca REAL,
      dia_vencimento INTEGER,
      status_processo TEXT DEFAULT 'EM_ANDAMENTO' CHECK (status_processo IN ('PENDENTE','EM_ANDAMENTO','CONCLUIDO','CANCELADO')),
      data_inicio TEXT DEFAULT (datetime('now','localtime')),
      data_conclusao TEXT,
      observacoes TEXT,
      criado_em TEXT DEFAULT (datetime('now','localtime')),
      atualizado_em TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY(cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_legalizacao_cliente ON legalizacao(cliente_id);
    CREATE INDEX IF NOT EXISTS idx_legalizacao_status ON legalizacao(status_processo);

    -- ========================================
    -- TABELA DE FINANCEIROS
    -- ========================================
    CREATE TABLE IF NOT EXISTS financeiros (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL UNIQUE,
      valor_mensalidade REAL,
      dia_vencimento INTEGER,
      forma_pagamento TEXT,
      banco TEXT,
      agencia TEXT,
      conta TEXT,
      pix_chave TEXT,
      pix_tipo TEXT,
      observacoes_financeiras TEXT,
      criado_por INTEGER,
      atualizado_por INTEGER,
      data_criacao TEXT DEFAULT (datetime('now','localtime')),
      data_atualizacao TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY(cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
      FOREIGN KEY(criado_por) REFERENCES usuarios(id),
      FOREIGN KEY(atualizado_por) REFERENCES usuarios(id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_financeiros_cliente ON financeiros(cliente_id);

    -- ========================================
    -- TABELA DE CERTIFICADOS
    -- ========================================
    CREATE TABLE IF NOT EXISTS certificados (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      nome_cliente TEXT,
      tipo_certificado TEXT NOT NULL,
      numero_serie TEXT,
      data_emissao TEXT,
      data_vencimento TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ATIVO' CHECK (status IN ('ATIVO','VENCIDO','RENOVADO')),
      arquivo_path TEXT,
      observacoes TEXT,
      criado_em TEXT DEFAULT (datetime('now','localtime')),
      atualizado_em TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY(cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_certificados_cliente ON certificados(cliente_id);
    CREATE INDEX IF NOT EXISTS idx_certificados_vencimento ON certificados(data_vencimento);
    CREATE INDEX IF NOT EXISTS idx_certificados_status ON certificados(status);

    -- ========================================
    -- TABELA DE TAREFAS
    -- ========================================
    CREATE TABLE IF NOT EXISTS tarefas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT,
      cliente_id INTEGER,
      usuario_responsavel_id INTEGER,
      prioridade TEXT CHECK (prioridade IN ('BAIXA','MEDIA','ALTA','URGENTE')) DEFAULT 'MEDIA',
      status TEXT DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE','EM_ANDAMENTO','CONCLUIDA','CANCELADA')),
      data_vencimento TEXT,
      data_conclusao TEXT,
      criado_em TEXT DEFAULT (datetime('now','localtime')),
      atualizado_em TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY(cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
      FOREIGN KEY(usuario_responsavel_id) REFERENCES usuarios(id) ON DELETE SET NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_tarefas_status ON tarefas(status);
    CREATE INDEX IF NOT EXISTS idx_tarefas_responsavel ON tarefas(usuario_responsavel_id);
    CREATE INDEX IF NOT EXISTS idx_tarefas_cliente ON tarefas(cliente_id);

    -- ========================================
    -- TABELA DE CONFIGURAÇÕES
    -- ========================================
    CREATE TABLE IF NOT EXISTS configuracoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chave TEXT NOT NULL UNIQUE,
      valor REAL,
      descricao TEXT,
      atualizado_por INTEGER,
      atualizado_em TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY(atualizado_por) REFERENCES usuarios(id)
    );

    CREATE INDEX IF NOT EXISTS idx_config_chave ON configuracoes(chave);

    -- ========================================
    -- TABELA DE AUDITORIA
    -- ========================================
    CREATE TABLE IF NOT EXISTS auditoria (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      acao TEXT NOT NULL,
      modulo TEXT NOT NULL,
      entidade TEXT,
      detalhes TEXT,
      ip TEXT,
      data_hora TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_auditoria_modulo ON auditoria(modulo);
    CREATE INDEX IF NOT EXISTS idx_auditoria_data ON auditoria(data_hora);

  `);

  console.log('✅ Tabelas verificadas/criadas com sucesso');

  // Migrações leves para compatibilidade com schemas antigos
  try {
    const usuariosCols = db.prepare("PRAGMA table_info(usuarios)").all();
    const hasSenhaHash = usuariosCols.some(c => c.name === 'senha_hash');
    const hasSenha = usuariosCols.some(c => c.name === 'senha');
    if (!hasSenhaHash && hasSenha) {
      db.exec('ALTER TABLE usuarios RENAME COLUMN senha TO senha_hash');
      console.log('🔧 Migração: coluna usuarios.senha renomeada para senha_hash');
    }

    const permCols = db.prepare("PRAGMA table_info(permissoes_usuarios)").all();
    const hasPodeVisualizar = permCols.some(c => c.name === 'pode_visualizar');
    if (!hasPodeVisualizar) {
      db.exec('ALTER TABLE permissoes_usuarios ADD COLUMN pode_visualizar INTEGER DEFAULT 1');
      console.log('🔧 Migração: adicionada coluna permissoes_usuarios.pode_visualizar');
    }
  } catch (migErr) {
    console.warn('⚠️ Falha ao executar migrações leves:', migErr.message);
  }
  
  // Criar usuário admin padrão se não existir
  const adminExists = db.prepare('SELECT id FROM usuarios WHERE email = ?').get('admin@hub.com');
  
  if (!adminExists) {
    const bcrypt = require('bcryptjs');
    const senhaHash = bcrypt.hashSync('admin123', 10);
    
    db.prepare(`
      INSERT INTO usuarios (nome, email, senha_hash, cargo, ativo)
      VALUES (?, ?, ?, ?, ?)
    `).run('Administrador', 'admin@hub.com', senhaHash, 'Administrador', 1);
    
    console.log('✅ Usuário admin criado: admin@hub.com / admin123');
  }

} catch (e) {
  console.error('❌ Erro ao inicializar tabelas:', e.message);
  throw e;
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function query(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  } catch (error) {
    console.error('Erro ao executar query:', error);
    throw error;
  }
}

function get(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    return stmt.get(...params);
  } catch (error) {
    console.error('Erro ao executar get:', error);
    throw error;
  }
}

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
