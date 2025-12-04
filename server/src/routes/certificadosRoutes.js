// arquivo: server/src/routes/certificadosRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { verificarPermissao } = require('../middlewares/permissoes');
const certificadoController = require('../controllers/certificadoController');

// Todas as rotas exigem autenticação
router.use(authMiddleware);
router.use(verificarPermissao('LEGALIZACAO'));

// GET /api/certificados/estatisticas - DEVE VIR ANTES de rotas com :id
router.get('/estatisticas', certificadoController.estatisticasCertificados);

// GET /api/certificados - Listar certificados
router.get('/', certificadoController.listarCertificados);

// GET /api/certificados/cliente/:clienteId - Buscar por cliente
router.get('/cliente/:clienteId', certificadoController.buscarCertificadoPorCliente);

// GET /api/certificados/:id - Buscar certificado por ID
router.get('/:id', certificadoController.buscarCertificadoPorId);

// POST /api/certificados - Criar certificado
router.post('/', certificadoController.criarCertificado);

// PUT /api/certificados/:id - Atualizar certificado
router.put('/:id', certificadoController.atualizarCertificado);

// DELETE /api/certificados/:id - Excluir certificado
router.delete('/:id', certificadoController.excluirCertificado);

module.exports = router;
