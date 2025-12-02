// arquivo: server/src/routes/certificadosRoutes.js
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth');
const { verificarPermissao } = require('../middlewares/permissoes');
const certificadoController = require('../controllers/certificadoController');

// Todas as rotas de certificados exigem autenticação
router.use(authMiddleware);

// Listar certificados com filtros (status, vencimento, clienteId)
router.get('/', verificarPermissao('LEGALIZACAO'), certificadoController.listarCertificados);

// Estatísticas gerais de certificados
router.get('/estatisticas', verificarPermissao('LEGALIZACAO'), certificadoController.estatisticasCertificados);

// Buscar certificados por cliente
router.get('/cliente/:clienteId', verificarPermissao('LEGALIZACAO'), certificadoController.buscarCertificadoPorCliente);

// Criar/Atualizar certificado de um cliente
router.put('/cliente/:clienteId', verificarPermissao('LEGALIZACAO', true), certificadoController.atualizarCertificado);

// Criar certificado avulso (sem cliente cadastrado)
router.post('/', verificarPermissao('LEGALIZACAO', true), certificadoController.criarCertificadoAvulso);

module.exports = router;