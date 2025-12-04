// arquivo: server/src/routes/configuracoesRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const configuracaoController = require('../controllers/configuracaoController');

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// GET /api/configuracoes - Listar todas as configurações
router.get('/', configuracaoController.listarConfiguracoes);

// GET /api/configuracoes/:chave - Buscar configuração específica
router.get('/:chave', configuracaoController.buscarConfiguracao);

// POST /api/configuracoes - Salvar configuração
router.post('/', configuracaoController.salvarConfiguracao);

// GET /api/configuracoes/salario-minimo/valor - Buscar salário mínimo
router.get('/salario-minimo/valor', configuracaoController.buscarSalarioMinimo);

// PUT /api/configuracoes/salario-minimo/valor - Atualizar salário mínimo
router.put('/salario-minimo/valor', configuracaoController.atualizarSalarioMinimo);

module.exports = router;
