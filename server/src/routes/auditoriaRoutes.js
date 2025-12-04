// arquivo: server/src/routes/auditoriaRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const auditoriaController = require('../controllers/auditoriaController');

// Todas as rotas exigem autenticação (apenas admin)
router.use(authMiddleware);

// GET /api/auditoria - Listar logs de auditoria
router.get('/', auditoriaController.listarAuditoria);

// GET /api/auditoria/usuario/:usuarioId - Logs de um usuário específico
router.get('/usuario/:usuarioId', auditoriaController.listarPorUsuario);

// GET /api/auditoria/modulo/:modulo - Logs de um módulo específico
router.get('/modulo/:modulo', auditoriaController.listarPorModulo);

module.exports = router;
