// arquivo: server/src/controllers/usuariosController.js
const { query, run } = require('../config/database');
const bcrypt = require('bcryptjs');

// Listar todos os usuários (apenas admin)
exports.listarUsuarios = async (req, res) => {
  try {
    const usuarioCargo = req.usuarioCargo;

    if (usuarioCargo !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem listar usuários.'
      });
    }

    // Buscar todos os usuários
    const usuarios = query(`
      SELECT id, nome, email, cargo, ativo, tema, data_criacao 
      FROM usuarios 
      ORDER BY data_criacao DESC
    `);

    // Buscar permissões de cada usuário
    const usuariosComPermissoes = usuarios.map(usuario => {
      const permissoes = query(
        'SELECT modulo, pode_editar FROM permissoes_usuarios WHERE usuario_id = ?',
        [usuario.id]
      );
      return { ...usuario, permissoes };
    });

    res.json({
      success: true,
      data: usuariosComPermissoes
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar usuários',
      error: error.message
    });
  }
};

// Criar novo usuário (apenas admin)
exports.criarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, cargo, permissoes } = req.body;
    const usuarioCargo = req.usuarioCargo;

    if (usuarioCargo !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem criar usuários.'
      });
    }

    // Validações
    if (!nome || !email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'A senha deve ter no mínimo 6 caracteres'
      });
    }

    // Verificar se email já existe
    const emailExiste = query('SELECT id FROM usuarios WHERE email = ?', [email])[0];
    if (emailExiste) {
      return res.status(400).json({
        success: false,
        message: 'Este email já está em uso'
      });
    }

    // Criptografar senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário
    const result = run(
      'INSERT INTO usuarios (nome, email, senha, cargo, ativo) VALUES (?, ?, ?, ?, 1)',
      [nome, email, senhaHash, cargo || 'usuario']
    );

    const novoUsuarioId = result.lastInsertRowid;

    // Adicionar permissões se fornecidas
    if (permissoes && Array.isArray(permissoes)) {
      permissoes.forEach(perm => {
        run(
          'INSERT INTO permissoes_usuarios (usuario_id, modulo, pode_editar) VALUES (?, ?, ?)',
          [novoUsuarioId, perm.modulo, perm.pode_editar ? 1 : 0]
        );
      });
    }

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso!',
      data: {
        id: novoUsuarioId,
        nome,
        email,
        cargo: cargo || 'usuario'
      }
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário',
      error: error.message
    });
  }
};

// Atualizar permissões de um usuário (apenas admin)
exports.atualizarPermissoes = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissoes } = req.body;
    const usuarioCargo = req.usuarioCargo;

    if (usuarioCargo !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado.'
      });
    }

    // Deletar permissões antigas
    run('DELETE FROM permissoes_usuarios WHERE usuario_id = ?', [id]);

    // Adicionar novas permissões
    if (permissoes && Array.isArray(permissoes)) {
      permissoes.forEach(perm => {
        run(
          'INSERT INTO permissoes_usuarios (usuario_id, modulo, pode_editar) VALUES (?, ?, ?)',
          [id, perm.modulo, perm.pode_editar ? 1 : 0]
        );
      });
    }

    res.json({
      success: true,
      message: 'Permissões atualizadas com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao atualizar permissões:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar permissões',
      error: error.message
    });
  }
};

// Desativar/Ativar usuário (apenas admin)
exports.toggleUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioCargo = req.usuarioCargo;

    if (usuarioCargo !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado.'
      });
    }

    const usuario = query('SELECT ativo FROM usuarios WHERE id = ?', [id])[0];
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const novoStatus = usuario.ativo === 1 ? 0 : 1;
    run('UPDATE usuarios SET ativo = ? WHERE id = ?', [novoStatus, id]);

    res.json({
      success: true,
      message: `Usuário ${novoStatus === 1 ? 'ativado' : 'desativado'} com sucesso!`
    });
  } catch (error) {
    console.error('Erro ao alternar status do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao alternar status',
      error: error.message
    });
  }
};
