// arquivo: server/src/routes/index.js

const express = require('express');
const router = express.Router();

// Importar todas as rotas
const authRoutes = require('./authRoutes');
const usuariosRoutes = require('./usuariosRoutes');
const clientesRoutes = require('./clientesRoutes');
const legalizacaoRoutes = require('./legalizacaoRoutes');
const financeirosRoutes = require('./financeirosRoutes');
const certificadosRoutes = require('./certificadosRoutes');
const tarefasRoutes = require('./tarefasRoutes');
const configuracoesRoutes = require('./configuracoesRoutes');
const auditoriaRoutes = require('./auditoriaRoutes');

// Registrar rotas
router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/clientes', clientesRoutes);
router.use('/legalizacao', legalizacaoRoutes);
router.use('/financeiros', financeirosRoutes);
router.use('/certificados', certificadosRoutes);
router.use('/tarefas', tarefasRoutes);
router.use('/configuracoes', configuracoesRoutes);
router.use('/auditoria', auditoriaRoutes);

// Rota de teste
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API Hub - Módulo de Legalização funcionando!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
