// arquivo: server/src/routes/configRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const configController = require('../controllers/configController');

// Todas as rotas protegidas (requerem autenticação)
router.use(authMiddleware);

// PUT /api/config/admin - Atualizar configurações (apenas admin)
router.put('/admin', configController.atualizarDados);

// GET /api/config/admin - Obter configurações atuais
router.get('/admin', configController.obterConfiguracoes);

module.exports = router;
