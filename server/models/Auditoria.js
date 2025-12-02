const mongoose = require('mongoose');

const AuditoriaSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  acao: {
    type: String,
    enum: ['CRIAR', 'EDITAR', 'EXCLUIR', 'VISUALIZAR'],
    required: true
  },
  modulo: {
    type: String,
    enum: ['CLIENTES', 'FINANCEIROS', 'CERTIFICADOS', 'AGENDA'],
    required: true
  },
  entidade: {
    type: String,
    required: true
  },
  detalhes: { type: String },
  ip: { type: String },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
AuditoriaSchema.index({ usuario: 1, timestamp: -1 });
AuditoriaSchema.index({ modulo: 1, timestamp: -1 });

// TTL - Remove logs após 90 dias
AuditoriaSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('Auditoria', AuditoriaSchema);
