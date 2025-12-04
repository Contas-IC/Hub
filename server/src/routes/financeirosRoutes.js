// arquivo: server/src/routes/financeirosRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { verificarPermissao } = require('../middlewares/permissoes');
const financeiroController = require('../controllers/financeiroController');

// Todas as rotas exigem autenticação
router.use(authMiddleware);
router.use(verificarPermissao('LEGALIZACAO'));

// GET /api/financeiros - Listar todos os dados financeiros
router.get('/', financeiroController.listarFinanceiros);

// GET /api/financeiros/cliente/:clienteId - Buscar financeiro por cliente
router.get('/cliente/:clienteId', financeiroController.buscarFinanceiroPorCliente);

// PUT /api/financeiros/cliente/:clienteId - Atualizar dados financeiros
router.put('/cliente/:clienteId', financeiroController.atualizarFinanceiro);

module.exports = router;
