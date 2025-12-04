// arquivo: server/src/routes/legalizacaoRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { verificarPermissao } = require('../middlewares/permissoes');
const legalizacaoController = require('../controllers/legalizacaoController');

// Todas as rotas exigem autenticação e permissão de LEGALIZACAO
router.use(authMiddleware);
router.use(verificarPermissao('LEGALIZACAO'));

// GET /api/legalizacao/estatisticas - Dashboard com estatísticas gerais
router.get('/estatisticas', legalizacaoController.obterEstatisticas);

// GET /api/legalizacao/empresas - Listar empresas em processo de legalização
router.get('/empresas', legalizacaoController.listarEmpresas);

// GET /api/legalizacao/empresas/:id - Buscar empresa específica
router.get('/empresas/:id', legalizacaoController.buscarEmpresaPorId);

// POST /api/legalizacao/:clienteId - Criar processo de legalização
router.post('/:clienteId', legalizacaoController.salvarProcessoLegalizacao);

// PUT /api/legalizacao/:clienteId - Atualizar processo de legalização
router.put('/:clienteId', legalizacaoController.salvarProcessoLegalizacao);

module.exports = router;
