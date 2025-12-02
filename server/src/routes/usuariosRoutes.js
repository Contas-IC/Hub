// arquivo: server/src/routes/usuariosRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const usuariosController = require('../controllers/usuariosController');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// GET /api/usuarios - Listar todos os usuários (apenas admin)
router.get('/', usuariosController.listarUsuarios);

// POST /api/usuarios - Criar novo usuário (apenas admin)
router.post('/', usuariosController.criarUsuario);

// PUT /api/usuarios/:id - Atualizar usuário completo (apenas admin)
router.put('/:id', usuariosController.atualizarUsuario);

// PUT /api/usuarios/:id/permissoes - Atualizar permissões (apenas admin)
router.put('/:id/permissoes', usuariosController.atualizarPermissoes);

// PATCH /api/usuarios/:id/toggle - Ativar/Desativar usuário (apenas admin)
router.patch('/:id/toggle', usuariosController.toggleUsuario);

module.exports = router;
