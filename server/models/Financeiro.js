const mongoose = require('mongoose');

const FinanceiroSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true,
    unique: true
  },
  cobranca: { 
    type: String,
    trim: true
  },
  percentual: { 
    type: Number,
    min: 0,
    max: 100
  },
  valor: { 
    type: Number,
    min: 0
  },
  vencimento: { 
    type: Number,
    min: 1,
    max: 31
  },
  conexa: { 
    type: Boolean,
    default: false
  },
  valorConexa: { 
    type: Number,
    min: 0
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

module.exports = mongoose.model('Financeiro', FinanceiroSchema);
