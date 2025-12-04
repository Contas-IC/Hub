// arquivo: server/src/routes/tarefasRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { verificarPermissao } = require('../middlewares/permissoes');
const tarefaController = require('../controllers/tarefaController');

// Todas as rotas exigem autenticação
router.use(authMiddleware);
router.use(verificarPermissao('LEGALIZACAO'));

// GET /api/tarefas - Listar tarefas com filtros
router.get('/', tarefaController.listarTarefas);

// GET /api/tarefas/estatisticas - Estatísticas de tarefas
router.get('/estatisticas', tarefaController.estatisticasTarefas);

// GET /api/tarefas/:id - Buscar tarefa por ID
router.get('/:id', tarefaController.buscarTarefaPorId);

// POST /api/tarefas - Criar nova tarefa
router.post('/', tarefaController.criarTarefa);

// PUT /api/tarefas/:id - Atualizar tarefa
router.put('/:id', tarefaController.atualizarTarefa);

// DELETE /api/tarefas/:id - Excluir tarefa
router.delete('/:id', tarefaController.excluirTarefa);

module.exports = router;
