const mongoose = require('mongoose');

const TarefaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  data: {
    type: Date,
    required: true
  },
  hora: {
    type: String,
    required: true
  },
  cliente: { type: String },
  tipo: {
    type: String,
    enum: ['FINANCEIRO', 'REUNIAO', 'DOCUMENTO', 'OUTRO'],
    required: true
  },
  status: {
    type: String,
    enum: ['PENDENTE', 'CONCLUIDO', 'ATRASADO'],
    default: 'PENDENTE'
  },
  observacao: { type: String },
  
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
  timestamps: true
});

// Índices
TarefaSchema.index({ data: 1 });
TarefaSchema.index({ status: 1 });

module.exports = mongoose.model('Tarefa', TarefaSchema);
