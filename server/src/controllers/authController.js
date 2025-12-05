// arquivo: server/src/controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, run, query } = require('../config/database');

// Função auxiliar para registrar auditoria
const registrarAuditoria = (usuarioId, acao, detalhes, ip) => {
  try {
    run(`
      INSERT INTO auditoria (usuario_id, acao, modulo, entidade, detalhes, ip)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [usuarioId, acao, 'AUTENTICACAO', 'Login', detalhes, ip]);
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
};

// ========================================
// LOGIN
// ========================================
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validar campos
    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário por email
    const usuario = get('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (!usuario) {
      registrarAuditoria(null, 'FALHA_LOGIN', `Tentativa de login com email inexistente: ${email}`, req.ip);
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    // Verificar se usuário está ativo
    if (!usuario.ativo) {
      registrarAuditoria(usuario.id, 'FALHA_LOGIN', 'Tentativa de login com usuário inativo', req.ip);
      return res.status(401).json({ message: 'Usuário inativo. Entre em contato com o administrador.' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      registrarAuditoria(usuario.id, 'FALHA_LOGIN', 'Senha incorreta', req.ip);
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    // Buscar permissões do usuário
    const permissoes = query(`
      SELECT modulo, pode_visualizar, pode_editar 
      FROM permissoes_usuarios 
      WHERE usuario_id = ?
    `, [usuario.id]);

    // Gerar token JWT
    const secret = process.env.JWT_SECRET || 'hub-dev-secret';
    const token = jwt.sign(
      { 
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome
      },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Registrar login bem-sucedido
    registrarAuditoria(usuario.id, 'LOGIN', 'Login realizado com sucesso', req.ip);

    // Montar lista de permissões simplificada para o frontend
    const permissoesModulos = permissoes
      .filter(p => p.pode_visualizar === 1)
      .map(p => p.modulo);

    if (usuario.cargo && String(usuario.cargo).toLowerCase().includes('admin')) {
      if (!permissoesModulos.includes('ADMIN')) {
        permissoesModulos.push('ADMIN');
      }
    }

    // Retornar dados do usuário (sem senha) e token
    res.json({
      success: true,
      data: {
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          cargo: usuario.cargo,
          ativo: usuario.ativo
        },
        permissoes: permissoesModulos
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro ao realizar login', error: error.message });
  }
};

// ========================================
// VERIFICAR TOKEN
// ========================================
exports.verificarToken = async (req, res) => {
  try {
    // O middleware de autenticação já validou o token e adicionou req.usuario
    const usuario = get('SELECT * FROM usuarios WHERE id = ?', [req.usuario.id]);

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ message: 'Token inválido ou usuário inativo' });
    }

    // Buscar permissões atualizadas
    const permissoes = query(`
      SELECT modulo, pode_visualizar, pode_editar 
      FROM permissoes_usuarios 
      WHERE usuario_id = ?
    `, [usuario.id]);

    const permissoesModulos = permissoes
      .filter(p => p.pode_visualizar === 1)
      .map(p => p.modulo);

    if (usuario.cargo && String(usuario.cargo).toLowerCase().includes('admin')) {
      if (!permissoesModulos.includes('ADMIN')) {
        permissoesModulos.push('ADMIN');
      }
    }

    res.json({
      success: true,
      data: {
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          cargo: usuario.cargo,
          ativo: usuario.ativo
        },
        permissoes: permissoesModulos
      }
    });

  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({ message: 'Erro ao verificar token', error: error.message });
  }
};

// ========================================
// LOGOUT (Opcional - apenas registra auditoria)
// ========================================
exports.logout = async (req, res) => {
  try {
    registrarAuditoria(req.usuario.id, 'LOGOUT', 'Logout realizado', req.ip);
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ message: 'Erro ao realizar logout', error: error.message });
  }
};

module.exports = exports;
