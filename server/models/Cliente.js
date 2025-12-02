const mongoose = require('mongoose');

const EmailSchema = new mongoose.Schema({
  email: { type: String, required: true },
  tipo: { 
    type: String, 
    enum: ['Principal', 'Secundário', 'Financeiro', 'Técnico'],
    default: 'Principal'
  }
});

const SetorSchema = new mongoose.Schema({
  setor: { 
    type: String, 
    enum: ['CONTABIL', 'FISCAL', 'DP'],
    required: true
  },
  responsavel: { type: String },
  status: { 
    type: String, 
    enum: ['PENDENTE', 'ATIVO', 'INATIVO'],
    default: 'PENDENTE'
  }
});

const LocalizacaoSchema = new mongoose.Schema({
  estado: { type: String, required: true },
  cidade: { type: String, required: true },
  inscricaoMunicipal: { type: String },
  inscricaoEstadual: { type: String }
});

const ClienteSchema = new mongoose.Schema({
  codigo: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true
  },
  nome: { 
    type: String, 
    required: true,
    trim: true
  },
  cnpj: { 
    type: String, 
    required: true,
    unique: true
  },
  telefone: { type: String },
  dataConstituicao: { type: Date, required: true },
  quantidadeFuncionarios: { type: Number, default: 0 },
  tipoApuracao: { 
    type: String, 
    enum: ['CEI', 'MEI', 'PESSOA_FISICA', 'PRESUMIDO', 'REAL', 'SIMPLES'],
    required: true
  },
  atividade: { 
    type: String, 
    enum: [
      'AGRICULTURA_PECUARIA', 'COM_E_IND', 'COM_E_SERV', 
      'COM_IND_E_SERV', 'COMERCIO', 'CONSTRUTORA', 
      'ESCOLA', 'IMOBILIARIA', 'INDUSTRIA', 'SERVICO'
    ],
    required: true
  },
  tipoEntrada: {
    type: String,
    enum: ['CLIENTE_NOVO', 'MIGRACAO', 'RETORNO']
  },
  dataEntrada: { type: Date, default: Date.now },
  responsavelLegal: { type: String, required: true },
  
  // Status do Cliente
  status: { 
    type: String, 
    enum: ['ATIVO', 'INATIVO', 'BAIXADA'],
    default: 'ATIVO'
  },
  dataBaixa: { type: Date },
  dataInativacao: { type: Date },
  
  // Arrays
  emails: [EmailSchema],
  setores: [SetorSchema],
  localizacoes: [LocalizacaoSchema],
  
  grauDificuldade: { 
    type: String, 
    enum: ['BAIXO', 'MEDIO', 'ALTO'],
    default: 'MEDIO'
  },
  observacoes: { type: String },
  
  // Campos de controle
  criadoPor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario'
  },
  atualizadoPor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario'
  }
}, {
  timestamps: true // Adiciona createdAt e updatedAt automaticamente
});

// Índices para melhor performance
ClienteSchema.index({ nome: 'text', cnpj: 'text', codigo: 'text' });
ClienteSchema.index({ status: 1 });
ClienteSchema.index({ dataEntrada: -1 });

module.exports = mongoose.model('Cliente', ClienteSchema);
