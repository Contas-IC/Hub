// arquivo: server/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

// Rota pública de login
router.post('/login', authController.login);

// Verificar token atual
router.get('/verificar', authMiddleware, authController.verificarToken);

// Logout (apenas para auditoria)
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;
