const express = require('express');
const router = express.Router();
const financeiroController = require('../controllers/financeiroController');
const { verificarAutenticacao, verificarPermissao } = require('../middlewares/auth');

router.use(verificarAutenticacao);
router.use(verificarPermissao('LEGALIZACAO'));

router.get('/', financeiroController.listarFinanceiros);
router.get('/cliente/:clienteId', financeiroController.buscarFinanceiroPorCliente);
router.put('/cliente/:clienteId', financeiroController.atualizarFinanceiro);

module.exports = router;
