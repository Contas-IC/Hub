const mongoose = require('mongoose');

const CertificadoSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true,
    unique: true
  },
  temCertificado: {
    type: Boolean,
    default: false
  },
  tipo: {
    type: String,
    enum: ['e-CPF A1', 'e-CPF A3', 'e-CNPJ A1', 'e-CNPJ A3']
  },
  dataEmissao: { type: Date },
  dataVencimento: { type: Date },
  senha: { type: String },
  responsavel: { type: String },
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
  timestamps: true
});

// Índice para verificar certificados vencendo
CertificadoSchema.index({ dataVencimento: 1 });

module.exports = mongoose.model('Certificado', CertificadoSchema);
