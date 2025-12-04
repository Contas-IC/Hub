// arquivo: server/src/routes/clientesRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { verificarPermissao } = require('../middlewares/permissoes');
const clienteController = require('../controllers/clienteController');

// Todas as rotas exigem autenticação
router.use(authMiddleware);
router.use(verificarPermissao('LEGALIZACAO'));

// GET /api/clientes/estatisticas - DEVE VIR ANTES de /:id
router.get('/estatisticas', clienteController.estatisticasClientes);

// GET /api/clientes - Listar clientes
router.get('/', clienteController.listarClientes);

// GET /api/clientes/:id - Buscar por ID
router.get('/:id', clienteController.buscarClientePorId);

// POST /api/clientes - Criar novo cliente
router.post('/', clienteController.criarCliente);

// PUT /api/clientes/:id - Atualizar cliente
router.put('/:id', clienteController.atualizarCliente);

// DELETE /api/clientes/:id - Excluir cliente
router.delete('/:id', clienteController.excluirCliente);

module.exports = router;
