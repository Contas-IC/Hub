const express = require('express');
const router = express.Router();
const auditoriaController = require('../src/controllers/auditoriaController');
const { verificarAutenticacao, verificarPermissao } = require('../middlewares/auth');

router.use(verificarAutenticacao);

router.get('/', auditoriaController.listarAuditorias);
router.get('/recentes', auditoriaController.auditoriasRecentes);
router.get('/estatisticas', auditoriaController.estatisticasAuditoria);
router.post('/', auditoriaController.registrarAuditoria);

module.exports = router;
