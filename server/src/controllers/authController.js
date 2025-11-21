// arquivo: server/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, run } = require('../config/database');

// Login
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validar entrada
    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário
    const usuario = query(
      'SELECT * FROM usuarios WHERE email = ? AND ativo = 1',
      [email]
    )[0];

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Buscar permissões do usuário
    let permissoes = [];
    if (usuario.cargo === 'admin') {
      permissoes = ['ADMIN', 'LEGALIZACAO', 'ONBOARDING', 'CONTABIL', 'FISCAL', 'DP'];
    } else {
      permissoes = query(
        'SELECT modulo FROM permissoes_usuarios WHERE usuario_id = ?',
        [usuario.id]
      ).map(p => p.modulo);
    }

    // Gerar token
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        cargo: usuario.cargo
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          cargo: usuario.cargo
        },
        permissoes
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao realizar login',
      error: error.message
    });
  }
};

// Verificar token (para manter sessão)
exports.verificarToken = async (req, res) => {
  try {
    // Se chegou aqui, o token já foi validado pelo middleware
    const usuario = query(
      'SELECT id, nome, email, cargo FROM usuarios WHERE id = ? AND ativo = 1',
      [req.usuarioId]
    )[0];

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Buscar permissões
    let permissoes = [];
    if (usuario.cargo === 'admin') {
      permissoes = ['ADMIN', 'LEGALIZACAO', 'ONBOARDING', 'CONTABIL', 'FISCAL', 'DP'];
    } else {
      permissoes = query(
        'SELECT modulo FROM permissoes_usuarios WHERE usuario_id = ?',
        [usuario.id]
      ).map(p => p.modulo);
    }

    res.json({
      success: true,
      data: {
        usuario,
        permissoes
      }
    });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar token',
      error: error.message
    });
  }
};
