const express = require('express');
const router = express.Router();
const configuracaoController = require('../controllers/configuracaoController');
const { verificarAutenticacao, verificarPermissao } = require('../middlewares/auth');

router.use(verificarAutenticacao);
router.use(verificarPermissao('ADMIN')); // Apenas admins podem alterar configurações

router.get('/', configuracaoController.listarConfiguracoes);
router.get('/salario-minimo', configuracaoController.buscarSalarioMinimo);
router.get('/:chave', configuracaoController.buscarConfiguracao);
router.post('/', configuracaoController.salvarConfiguracao);
router.put('/salario-minimo', configuracaoController.atualizarSalarioMinimo);

module.exports = router;
