// arquivo: server/src/controllers/usuariosController.js

const bcrypt = require('bcryptjs');
const { query, get, run } = require('../config/database');

// Função auxiliar para registrar auditoria
const registrarAuditoria = (usuarioId, acao, entidade, detalhes, ip) => {
  try {
    run(`
      INSERT INTO auditoria (usuario_id, acao, modulo, entidade, detalhes, ip)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [usuarioId, acao, 'USUARIOS', entidade, detalhes, ip]);
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
};

// ========================================
// LISTAR USUÁRIOS
// ========================================
exports.listarUsuarios = async (req, res) => {
  try {
    const { busca, ativo } = req.query;

    let sql = 'SELECT id, nome, email, cargo, ativo, data_criacao FROM usuarios WHERE 1=1';
    const params = [];

    if (busca) {
      sql += ' AND (nome LIKE ? OR email LIKE ?)';
      const buscaParam = `%${busca}%`;
      params.push(buscaParam, buscaParam);
    }

    if (ativo !== undefined) {
      sql += ' AND ativo = ?';
      params.push(ativo === 'true' ? 1 : 0);
    }

    sql += ' ORDER BY nome ASC';

    const usuarios = query(sql, params);

    // Buscar permissões de cada usuário
    const usuariosComPermissoes = usuarios.map(usuario => {
      const permissoes = query(`
        SELECT modulo, pode_visualizar, pode_editar 
        FROM permissoes_usuarios 
        WHERE usuario_id = ?
      `, [usuario.id]);

      return {
        ...usuario,
        permissoes: permissoes.reduce((acc, p) => {
          acc[p.modulo] = {
            visualizar: p.pode_visualizar === 1,
            editar: p.pode_editar === 1
          };
          return acc;
        }, {})
      };
    });

    res.json(usuariosComPermissoes);

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ message: 'Erro ao listar usuários', error: error.message });
  }
};

// ========================================
// CRIAR USUÁRIO
// ========================================
exports.criarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, cargo, permissoes } = req.body;

    // Validações
    if (!nome || !email || !senha) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
    }

    // Verificar se email já existe
    const emailExistente = get('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (emailExistente) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserir usuário
    const result = run(`
      INSERT INTO usuarios (nome, email, senha_hash, cargo, ativo)
      VALUES (?, ?, ?, ?, 1)
    `, [nome, email, senhaHash, cargo || 'Usuário']);

    const novoUsuarioId = result.lastInsertRowid;

    // Criar permissões padrão
    const modulosPadrao = ['LEGALIZACAO', 'CLIENTES', 'CERTIFICADOS', 'TAREFAS', 'CONFIGURACOES'];
    
    modulosPadrao.forEach(modulo => {
      const perm = permissoes && permissoes[modulo] ? permissoes[modulo] : { visualizar: true, editar: false };
      
      run(`
        INSERT INTO permissoes_usuarios (usuario_id, modulo, pode_visualizar, pode_editar)
        VALUES (?, ?, ?, ?)
      `, [novoUsuarioId, modulo, perm.visualizar ? 1 : 0, perm.editar ? 1 : 0]);
    });

    // Registrar auditoria
    registrarAuditoria(
      req.usuario.id,
      'CRIAR',
      nome,
      `Criou novo usuário: ${email}`,
      req.ip
    );

    const novoUsuario = get('SELECT id, nome, email, cargo, ativo FROM usuarios WHERE id = ?', [novoUsuarioId]);

    res.status(201).json(novoUsuario);

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
  }
};

// ========================================
// ATUALIZAR USUÁRIO
// ========================================
exports.atualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, cargo, senha } = req.body;

    // Verificar se usuário existe
    const usuario = get('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Se está alterando email, verificar se já existe
    if (email && email !== usuario.email) {
      const emailExistente = get('SELECT id FROM usuarios WHERE email = ? AND id != ?', [email, id]);
      if (emailExistente) {
        return res.status(400).json({ message: 'Email já está em uso' });
      }
    }

    // Atualizar dados básicos
    let sql = 'UPDATE usuarios SET nome = ?, email = ?, cargo = ?';
    const params = [nome || usuario.nome, email || usuario.email, cargo || usuario.cargo];

    // Se forneceu nova senha, incluir no update
    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      sql += ', senha_hash = ?';
      params.push(senhaHash);
    }

    sql += ', data_atualizacao = datetime("now","localtime") WHERE id = ?';
    params.push(id);

    run(sql, params);

    // Registrar auditoria
    registrarAuditoria(
      req.usuario.id,
      'EDITAR',
      usuario.nome,
      `Atualizou dados do usuário: ${email || usuario.email}`,
      req.ip
    );

    const usuarioAtualizado = get('SELECT id, nome, email, cargo, ativo FROM usuarios WHERE id = ?', [id]);

    res.json(usuarioAtualizado);

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário', error: error.message });
  }
};

// ========================================
// ATUALIZAR PERMISSÕES
// ========================================
exports.atualizarPermissoes = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissoes } = req.body;

    // Verificar se usuário existe
    const usuario = get('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Atualizar permissões
    Object.keys(permissoes).forEach(modulo => {
      const { visualizar, editar } = permissoes[modulo];

      // Verificar se já existe
      const existe = get('SELECT id FROM permissoes_usuarios WHERE usuario_id = ? AND modulo = ?', [id, modulo]);

      if (existe) {
        run(`
          UPDATE permissoes_usuarios 
          SET pode_visualizar = ?, pode_editar = ?
          WHERE usuario_id = ? AND modulo = ?
        `, [visualizar ? 1 : 0, editar ? 1 : 0, id, modulo]);
      } else {
        run(`
          INSERT INTO permissoes_usuarios (usuario_id, modulo, pode_visualizar, pode_editar)
          VALUES (?, ?, ?, ?)
        `, [id, modulo, visualizar ? 1 : 0, editar ? 1 : 0]);
      }
    });

    // Registrar auditoria
    registrarAuditoria(
      req.usuario.id,
      'EDITAR',
      usuario.nome,
      `Atualizou permissões do usuário: ${usuario.email}`,
      req.ip
    );

    res.json({ message: 'Permissões atualizadas com sucesso' });

  } catch (error) {
    console.error('Erro ao atualizar permissões:', error);
    res.status(500).json({ message: 'Erro ao atualizar permissões', error: error.message });
  }
};

// ========================================
// ATIVAR/DESATIVAR USUÁRIO
// ========================================
exports.toggleUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = get('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const novoStatus = usuario.ativo ? 0 : 1;

    run('UPDATE usuarios SET ativo = ? WHERE id = ?', [novoStatus, id]);

    // Registrar auditoria
    registrarAuditoria(
      req.usuario.id,
      novoStatus ? 'ATIVAR' : 'DESATIVAR',
      usuario.nome,
      `${novoStatus ? 'Ativou' : 'Desativou'} usuário: ${usuario.email}`,
      req.ip
    );

    res.json({ 
      message: `Usuário ${novoStatus ? 'ativado' : 'desativado'} com sucesso`,
      ativo: novoStatus === 1
    });

  } catch (error) {
    console.error('Erro ao ativar/desativar usuário:', error);
    res.status(500).json({ message: 'Erro ao alterar status do usuário', error: error.message });
  }
};

module.exports = exports;
