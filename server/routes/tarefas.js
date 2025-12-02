const express = require('express');
const router = express.Router();
const tarefaController = require('../controllers/tarefaController');
const { verificarAutenticacao, verificarPermissao } = require('../middlewares/auth');

router.use(verificarAutenticacao);
router.use(verificarPermissao('LEGALIZACAO'));

router.get('/', tarefaController.listarTarefas);
router.get('/estatisticas', tarefaController.estatisticasTarefas);
router.get('/:id', tarefaController.buscarTarefaPorId);
router.post('/', tarefaController.criarTarefa);
router.put('/:id', tarefaController.atualizarTarefa);
router.delete('/:id', tarefaController.excluirTarefa);

module.exports = router;
s