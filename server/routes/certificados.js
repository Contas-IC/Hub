    const express = require('express');
const router = express.Router();
const certificadoController = require('../controllers/certificadoController');
const { verificarAutenticacao, verificarPermissao } = require('../middlewares/auth');

router.use(verificarAutenticacao);
router.use(verificarPermissao('LEGALIZACAO'));

router.get('/', certificadoController.listarCertificados);
router.get('/estatisticas', certificadoController.estatisticasCertificados);
router.get('/cliente/:clienteId', certificadoController.buscarCertificadoPorCliente);
router.put('/cliente/:clienteId', certificadoController.atualizarCertificado);

module.exports = router;
