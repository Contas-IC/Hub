const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { verificarAutenticacao, verificarPermissao } = require('../middlewares/auth');

// Aplicar autenticação em todas as rotas
router.use(verificarAutenticacao);
router.use(verificarPermissao('LEGALIZACAO'));

// Rotas de clientes
router.get('/', clienteController.listarClientes);
router.get('/estatisticas', clienteController.estatisticasClientes);
router.get('/:id', clienteController.buscarClientePorId);
router.post('/', clienteController.criarCliente);
router.put('/:id', clienteController.atualizarCliente);
router.delete('/:id', clienteController.excluirCliente);

module.exports = router;
