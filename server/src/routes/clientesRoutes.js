// arquivo: server/src/routes/clientesRoutes.js
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middlewares/auth');
const { verificarPermissao } = require('../middlewares/permissoes');
const clientesController = require('../controllers/clientesController');

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// Listar clientes
router.get('/', verificarPermissao('LEGALIZACAO'), clientesController.listarClientes);

// Buscar por ID
router.get('/:id', verificarPermissao('LEGALIZACAO'), clientesController.buscarClientePorId);

// Criar novo cliente
router.post('/', verificarPermissao('LEGALIZACAO', true), clientesController.criarCliente);

// Atualizar cliente
router.put('/:id', verificarPermissao('LEGALIZACAO', true), clientesController.atualizarCliente);

// Atualizar dados financeiros (Legalização)
router.put('/:id/financeiro', verificarPermissao('LEGALIZACAO', true), clientesController.atualizarFinanceiro);

// Excluir cliente
router.delete('/:id', verificarPermissao('LEGALIZACAO', true), clientesController.excluirCliente);

module.exports = router;