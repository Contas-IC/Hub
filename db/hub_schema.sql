-- arquivo: db/hub_schema.sql
-- SISTEMA HUB - Schema Completo
-- Base: Ondesk + Expansão para módulos Legalização, Contábil, Fiscal, DP

-- ========================================
-- TABELA DE USUÁRIOS (COM PERMISSÕES)
-- ========================================
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  cargo TEXT DEFAULT 'usuario',
  ativo INTEGER DEFAULT 1,
  tema TEXT DEFAULT 'claro', -- ADICIONAR ESTA LINHA
  data_criacao TEXT DEFAULT (datetime('now', 'localtime')),
  data_atualizacao TEXT DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);
-- ========================================
-- PERMISSÕES DE USUÁRIOS (CONTROLE DE ACESSO POR MÓDULO)
-- ========================================
CREATE TABLE IF NOT EXISTS permissoes_usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  modulo TEXT NOT NULL CHECK(modulo IN ('ADMIN', 'LEGALIZACAO', 'ONBOARDING', 'CONTABIL', 'FISCAL', 'DP')),
  pode_editar INTEGER DEFAULT 0,  -- 0 = só visualizar, 1 = editar
  data_criacao TEXT DEFAULT (datetime('now', 'localtime')),
  
  UNIQUE(usuario_id, modulo),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_permissoes_usuario ON permissoes_usuarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_permissoes_modulo ON permissoes_usuarios(modulo);

-- ========================================
-- TABELA BASE DE CLIENTES (ALIMENTADA PELA LEGALIZAÇÃO)
-- ========================================
CREATE TABLE IF NOT EXISTS clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Identificação
  codigo TEXT UNIQUE NOT NULL,              -- COD (gerado pela Legalização)
  cnpj TEXT UNIQUE NOT NULL,                -- CNPJ
  nome_empresa TEXT NOT NULL,               -- EMPRESA
  
  -- Dados de Contato
  contato TEXT,                             -- CONTATO (nome da pessoa)
  telefone TEXT,                            -- Telefone principal
  email_principal TEXT,                     -- EMAIL principal
  
  -- Dados Fiscais
  regime TEXT CHECK(regime IN ('CEI', 'MEI', 'SIMPLES', 'PRESUMIDO', 'REAL')),  -- REGIME
  responsavel_legal TEXT,                   -- RESP LEGAL
  data_abertura TEXT,                       -- Data de abertura da empresa
  
  -- Status e Ciclo de Vida
  status TEXT DEFAULT 'ativa' CHECK(status IN ('ativa', 'inativa', 'baixada')),
  data_entrada_escritorio TEXT,             -- Entrou no escritório
  data_saida_escritorio TEXT,               -- Saiu do escritório (quando baixada)
  data_baixada TEXT,                        -- Data da baixada
  
  -- Metadados
  criado_por INTEGER NOT NULL,              -- Usuário da Legalização que cadastrou
  data_cadastro TEXT DEFAULT (datetime('now', 'localtime')),
  data_atualizacao TEXT DEFAULT (datetime('now', 'localtime')),
  
  FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_clientes_codigo ON clientes(codigo);
CREATE INDEX IF NOT EXISTS idx_clientes_cnpj ON clientes(cnpj);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome_empresa);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);

-- ========================================
-- EMAILS DOS CLIENTES (MÚLTIPLOS EMAILS)
-- ========================================
CREATE TABLE IF NOT EXISTS cliente_emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  email TEXT NOT NULL,
  tipo TEXT DEFAULT 'principal' CHECK(tipo IN ('principal', 'secundario', 'financeiro', 'tecnico')),
  data_adicao TEXT DEFAULT (datetime('now', 'localtime')),
  
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_cliente_emails_cliente ON cliente_emails(cliente_id);

-- ========================================
-- MÓDULO: LEGALIZAÇÃO (CAMPOS ESPECÍFICOS)
-- ========================================
CREATE TABLE IF NOT EXISTS clientes_legalizacao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER UNIQUE NOT NULL,
  
  -- Cobrança e Financeiro
  tipo_cobranca TEXT,                       -- COBRANÇA (mensal, anual, etc)
  percentual_cobranca REAL,                 -- % ENCIMA
  valor_cobranca REAL,                      -- VALOR
  dia_vencimento INTEGER,                   -- VENCIMENTO (dia do mês)
  
  -- Checklist de Cadastros (para Barra de Progressão)
  cadastro_empresa_completo INTEGER DEFAULT 0,      -- 0 ou 1
  cadastro_dominio INTEGER DEFAULT 0,               -- 0 ou 1
  cadastro_acessorias INTEGER DEFAULT 0,            -- 0 ou 1
  pronto_para_onboarding INTEGER DEFAULT 0,         -- 0 ou 1
  
  -- Responsáveis por Setor (definidos pela Legalização)
  responsavel_contabil TEXT,                -- CONTÁBIL (nome do responsável)
  responsavel_fiscal TEXT,                  -- FISCAL (nome do responsável)
  responsavel_dp TEXT,                      -- DP (nome do responsável)
  
  -- Observações
  observacoes TEXT,                         -- OBSERVAÇÕES
  
  -- Metadados
  data_criacao TEXT DEFAULT (datetime('now', 'localtime')),
  data_atualizacao TEXT DEFAULT (datetime('now', 'localtime')),
  
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_legalizacao_cliente ON clientes_legalizacao(cliente_id);

-- ========================================
-- MÓDULO: ONBOARDING (DADOS DO ONDESK)
-- ========================================
CREATE TABLE IF NOT EXISTS clientes_onboarding (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER UNIQUE NOT NULL,
  
  -- Status e Datas
  status_onboarding TEXT DEFAULT 'PENDENTE' CHECK(status_onboarding IN (
    'PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'AGUARDANDO_CLIENTE', 'DISPENSADO'
  )),
  data_inicial TEXT,                        -- Data de início do onboarding
  data_conclusao TEXT,                      -- Data de conclusão
  
  -- Informações do Onboarding
  grau_dificuldade TEXT DEFAULT 'MEDIO' CHECK(grau_dificuldade IN ('BAIXO', 'MEDIO', 'ALTO')),
  tipo_entrada TEXT CHECK(tipo_entrada IN ('CONSTITUICAO', 'COOPERATIVA', 'MIGRACAO', 'ABERTURA')),
  contrato_assinado INTEGER DEFAULT 0,
  
  -- Reunião
  reuniao_agendada INTEGER DEFAULT 0,       -- 0 ou 1
  reuniao_concluida INTEGER DEFAULT 0,      -- 0 ou 1
  data_reuniao TEXT,
  
  -- Observações específicas do onboarding
  observacoes_onboarding TEXT,
  
  -- Metadados
  data_criacao TEXT DEFAULT (datetime('now', 'localtime')),
  data_atualizacao TEXT DEFAULT (datetime('now', 'localtime')),
  
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_onboarding_cliente ON clientes_onboarding(cliente_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_status ON clientes_onboarding(status_onboarding);

-- ========================================
-- MÓDULO: CONTÁBIL (CAMPOS ESPECÍFICOS)
-- ========================================
CREATE TABLE IF NOT EXISTS clientes_contabil (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER UNIQUE NOT NULL,
  
  -- Status do setor
  status_contabil TEXT DEFAULT 'PENDENTE' CHECK(status_contabil IN (
    'PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'BLOQUEADO'
  )),
  
  -- Dados específicos do Contábil
  regime_contabil TEXT,
  data_inicio_atendimento TEXT,
  data_conclusao_atendimento TEXT,
  observacoes_contabil TEXT,
  
  -- Metadados
  data_criacao TEXT DEFAULT (datetime('now', 'localtime')),
  data_atualizacao TEXT DEFAULT (datetime('now', 'localtime')),
  
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_contabil_cliente ON clientes_contabil(cliente_id);
CREATE INDEX IF NOT EXISTS idx_contabil_status ON clientes_contabil(status_contabil);

-- ========================================
-- MÓDULO: FISCAL (CAMPOS ESPECÍFICOS)
-- ========================================
CREATE TABLE IF NOT EXISTS clientes_fiscal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER UNIQUE NOT NULL,
  
  -- Status do setor
  status_fiscal TEXT DEFAULT 'PENDENTE' CHECK(status_fiscal IN (
    'PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'BLOQUEADO'
  )),
  
  -- Dados específicos do Fiscal
  regime_fiscal TEXT,
  data_inicio_atendimento TEXT,
  data_conclusao_atendimento TEXT,
  observacoes_fiscal TEXT,
  
  -- Metadados
  data_criacao TEXT DEFAULT (datetime('now', 'localtime')),
  data_atualizacao TEXT DEFAULT (datetime('now', 'localtime')),
  
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_fiscal_cliente ON clientes_fiscal(cliente_id);
CREATE INDEX IF NOT EXISTS idx_fiscal_status ON clientes_fiscal(status_fiscal);

-- ========================================
-- MÓDULO: DP (DEPARTAMENTO PESSOAL - CAMPOS ESPECÍFICOS)
-- ========================================
CREATE TABLE IF NOT EXISTS clientes_dp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER UNIQUE NOT NULL,
  
  -- Status do setor
  status_dp TEXT DEFAULT 'PENDENTE' CHECK(status_dp IN (
    'PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'BLOQUEADO'
  )),
  
  -- Dados específicos do DP
  qtd_funcionarios INTEGER DEFAULT 0,
  data_inicio_atendimento TEXT,
  data_conclusao_atendimento TEXT,
  observacoes_dp TEXT,
  
  -- Metadados
  data_criacao TEXT DEFAULT (datetime('now', 'localtime')),
  data_atualizacao TEXT DEFAULT (datetime('now', 'localtime')),
  
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_dp_cliente ON clientes_dp(cliente_id);
CREATE INDEX IF NOT EXISTS idx_dp_status ON clientes_dp(status_dp);

-- ========================================
-- BARRA DE PROGRESSÃO (TRACKING LEGALIZAÇÃO → ONBOARDING)
-- ========================================
CREATE TABLE IF NOT EXISTS barra_progressao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER UNIQUE NOT NULL,
  
  -- Etapas da Legalização (0 ou 1)
  etapa_cadastro_empresa INTEGER DEFAULT 0,
  etapa_cadastro_dominio INTEGER DEFAULT 0,
  etapa_cadastro_acessorias INTEGER DEFAULT 0,
  etapa_enviado_onboarding INTEGER DEFAULT 0,
  
  -- Etapas do Onboarding (0 ou 1)
  etapa_reuniao_agendada INTEGER DEFAULT 0,
  etapa_reuniao_concluida INTEGER DEFAULT 0,
  etapa_cliente_ativo INTEGER DEFAULT 0,
  
  -- Porcentagem calculada automaticamente (0 a 100)
  porcentagem_conclusao INTEGER DEFAULT 0,
  
  -- Datas
  data_inicio TEXT DEFAULT (datetime('now', 'localtime')),
  data_conclusao TEXT,
  
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_progressao_cliente ON barra_progressao(cliente_id);
CREATE INDEX IF NOT EXISTS idx_progressao_porcentagem ON barra_progressao(porcentagem_conclusao);

-- ========================================
-- SOLICITAÇÕES DE ALTERAÇÃO (POP-UP DE SOLICITAÇÕES)
-- ========================================
CREATE TABLE IF NOT EXISTS solicitacoes_alteracao (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  usuario_solicitante INTEGER NOT NULL,
  
  -- Dados da solicitação
  campo_solicitado TEXT NOT NULL,           -- Ex: "cnpj", "regime", "nome_empresa"
  valor_atual TEXT,                         -- Valor antes da alteração
  valor_solicitado TEXT NOT NULL,           -- Valor desejado
  justificativa TEXT,                       -- Motivo da solicitação
  
  -- Status da solicitação
  status TEXT DEFAULT 'pendente' CHECK(status IN ('pendente', 'aprovado', 'rejeitado')),
  aprovado_por INTEGER,                     -- Usuário que aprovou/rejeitou
  resposta TEXT,                            -- Resposta do responsável
  
  -- Datas
  data_solicitacao TEXT DEFAULT (datetime('now', 'localtime')),
  data_resposta TEXT,
  
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_solicitante) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (aprovado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_cliente ON solicitacoes_alteracao(cliente_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON solicitacoes_alteracao(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_usuario ON solicitacoes_alteracao(usuario_solicitante);

-- ========================================
-- TABELAS DO ONDESK (MANTIDAS PARA COMPATIBILIDADE)
-- ========================================

-- Grupos (mantido do Ondesk)
CREATE TABLE IF NOT EXISTS grupos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  descricao TEXT,
  observacoes TEXT,
  data_criacao TEXT DEFAULT (datetime('now', 'localtime')),
  criado_por INTEGER,
  data_atualizacao TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_grupos_nome ON grupos(nome);

CREATE TABLE IF NOT EXISTS grupo_clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grupo_id INTEGER NOT NULL,
  cliente_id INTEGER NOT NULL,
  data_adicao TEXT DEFAULT (datetime('now', 'localtime')),
  UNIQUE(grupo_id, cliente_id),
  FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_grupo_clientes_grupo ON grupo_clientes(grupo_id);
CREATE INDEX IF NOT EXISTS idx_grupo_clientes_cliente ON grupo_clientes(cliente_id);

-- Reuniões (mantido do Ondesk)
CREATE TABLE IF NOT EXISTS reunioes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assunto TEXT NOT NULL,
  data_reuniao TEXT NOT NULL,
  hora_inicio TEXT NOT NULL,
  hora_fim TEXT,
  status TEXT DEFAULT 'agendada' CHECK(status IN ('agendada', 'em_andamento', 'finalizada', 'cancelada')),
  tipo TEXT DEFAULT 'normal' CHECK(tipo IN ('normal', 'entrada')),
  observacoes TEXT,
  grupo_id INTEGER,
  criado_por INTEGER,
  data_criacao TEXT DEFAULT (datetime('now', 'localtime')),
  data_atualizacao TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE SET NULL,
  FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_reunioes_data ON reunioes(data_reuniao);
CREATE INDEX IF NOT EXISTS idx_reunioes_status ON reunioes(status);

CREATE TABLE IF NOT EXISTS reunioes_clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reuniao_id INTEGER NOT NULL,
  cliente_id INTEGER NOT NULL,
  presente INTEGER DEFAULT 0,
  data_adicao TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (reuniao_id) REFERENCES reunioes(id) ON DELETE CASCADE,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_reunioes_clientes_reuniao ON reunioes_clientes(reuniao_id);
CREATE INDEX IF NOT EXISTS idx_reunioes_clientes_cliente ON reunioes_clientes(cliente_id);

-- Relatórios (mantido do Ondesk)
CREATE TABLE IF NOT EXISTS relatorios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reuniao_id INTEGER,
  cliente_id INTEGER,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT,
  data_envio TEXT,
  tipo_envio TEXT,
  justificativa TEXT,
  arquivo_path TEXT,
  arquivo_nome TEXT,
  tipo_arquivo TEXT,
  tamanho_arquivo INTEGER,
  criado_por INTEGER,
  data_criacao TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (reuniao_id) REFERENCES reunioes(id) ON DELETE CASCADE,
  FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_relatorios_reuniao ON relatorios(reuniao_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_data ON relatorios(data_criacao);

-- Acompanhamentos (mantido do Ondesk)
CREATE TABLE IF NOT EXISTS acompanhamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  reuniao_id INTEGER,
  assunto TEXT NOT NULL,
  descricao TEXT,
  data_prevista TEXT NOT NULL,
  data_conclusao TEXT,
  status TEXT DEFAULT 'pendente' CHECK(status IN ('pendente', 'concluido', 'atrasado')),
  prioridade TEXT DEFAULT 'media' CHECK(prioridade IN ('baixa', 'media', 'alta')),
  observacoes TEXT,
  criado_por INTEGER,
  data_criacao TEXT DEFAULT (datetime('now', 'localtime')),
  data_atualizacao TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (reuniao_id) REFERENCES reunioes(id) ON DELETE SET NULL,
  FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_acompanhamentos_cliente ON acompanhamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_acompanhamentos_data_prevista ON acompanhamentos(data_prevista);
CREATE INDEX IF NOT EXISTS idx_acompanhamentos_status ON acompanhamentos(status);

-- Histórico (mantido do Ondesk)
CREATE TABLE IF NOT EXISTS historico (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entidade_tipo TEXT NOT NULL CHECK(entidade_tipo IN ('cliente', 'reuniao', 'grupo', 'acompanhamento')),
  entidade_id INTEGER NOT NULL,
  acao TEXT NOT NULL,
  detalhes TEXT,
  usuario_id INTEGER,
  data_acao TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_historico_entidade ON historico(entidade_tipo, entidade_id);
CREATE INDEX IF NOT EXISTS idx_historico_data ON historico(data_acao);
