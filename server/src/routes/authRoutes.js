// arquivo: server/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

// Rotas públicas
router.post('/login', authController.login);

// Rotas protegidas
router.get('/verificar', authMiddleware, authController.verificarToken);

module.exports = router;
