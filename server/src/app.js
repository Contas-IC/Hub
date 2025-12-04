// arquivo: server/src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// ========================================
// MIDDLEWARES GLOBAIS
// ========================================

// Segurança
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Parser de JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logs de requisições
app.use(morgan('dev'));

// ========================================
// ROTAS
// ========================================

const routes = require('./routes');

app.use('/api', routes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Hub - Sistema de Gestão Integrado',
    version: '1.0.0',
    modules: ['Legalização', 'Clientes', 'Certificados', 'Tarefas', 'Financeiros']
  });
});

// ========================================
// TRATAMENTO DE ERROS
// ========================================

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Erro global
app.use((error, req, res, next) => {
  console.error('Erro:', error);
  res.status(error.status || 500).json({
    message: error.message || 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? error : {}
  });
});

// ========================================
// INICIAR SERVIDOR
// ========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(60));
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(60));
  console.log('');
});

module.exports = app;
