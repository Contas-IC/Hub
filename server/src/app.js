// arquivo: server/src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARES GLOBAIS
// ========================================
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ========================================
// ROTAS
// ========================================
const authRoutes = require('./routes/authRoutes');
const configRoutes = require('./routes/configRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Hub funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Erro global:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ========================================
// INICIAR SERVIDOR
// ========================================
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║     🚀 SERVIDOR HUB INICIADO 🚀          ║
╠═══════════════════════════════════════════╣
║  Porta: ${PORT}                              ║
║  Ambiente: ${process.env.NODE_ENV || 'development'}            ║
║  URL: http://localhost:${PORT}             ║
╚═══════════════════════════════════════════╝
  `);
});

module.exports = app;
