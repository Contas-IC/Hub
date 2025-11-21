// arquivo: server/src/controllers/configController.js
const { query, run } = require('../config/database');
const bcrypt = require('bcryptjs');

// Atualizar dados do admin (nome, email, senha, tema)
exports.atualizarDados = async (req, res) => {
  try {
    const { nome, email, senhaAtual, novaSenha, tema } = req.body;
    const usuarioId = req.usuarioId;
    const usuarioCargo = req.usuarioCargo;

    // Verificar se é admin
    if (usuarioCargo !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores podem alterar configurações'
      });
    }

    // Buscar usuário atual
    const usuario = query('SELECT * FROM usuarios WHERE id = ?', [usuarioId])[0];
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Atualizar nome e email se fornecidos
    if (nome && email) {
      // Verificar se email já existe em outro usuário
      const emailExiste = query(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        [email, usuarioId]
      )[0];

      if (emailExiste) {
        return res.status(400).json({
          success: false,
          message: 'Este email já está em uso por outro usuário'
        });
      }

      run(
        'UPDATE usuarios SET nome = ?, email = ?, data_atualizacao = datetime(\'now\', \'localtime\') WHERE id = ?',
        [nome, email, usuarioId]
      );
    }

    // Atualizar senha se fornecida
    if (senhaAtual && novaSenha) {
      // Verificar senha atual
      const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
      
      if (!senhaValida) {
        return res.status(400).json({
          success: false,
          message: 'Senha atual incorreta'
        });
      }

      // Validar nova senha
      if (novaSenha.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'A nova senha deve ter no mínimo 6 caracteres'
        });
      }

      // Criptografar e salvar nova senha
      const senhaHash = await bcrypt.hash(novaSenha, 10);
      run(
        'UPDATE usuarios SET senha = ?, data_atualizacao = datetime(\'now\', \'localtime\') WHERE id = ?',
        [senhaHash, usuarioId]
      );
    }

    // Atualizar tema se fornecido
    if (tema && (tema === 'claro' || tema === 'escuro')) {
      run(
        'UPDATE usuarios SET tema = ?, data_atualizacao = datetime(\'now\', \'localtime\') WHERE id = ?',
        [tema, usuarioId]
      );
    }

    // Buscar dados atualizados
    const usuarioAtualizado = query(
      'SELECT id, nome, email, cargo, tema FROM usuarios WHERE id = ?',
      [usuarioId]
    )[0];

    res.json({
      success: true,
      message: 'Configurações atualizadas com sucesso!',
      data: {
        usuario: usuarioAtualizado
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar configurações',
      error: error.message
    });
  }
};

// Obter configurações do usuário
exports.obterConfiguracoes = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;

    const usuario = query(
      'SELECT id, nome, email, cargo, tema FROM usuarios WHERE id = ?',
      [usuarioId]
    )[0];

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        usuario
      }
    });

  } catch (error) {
    console.error('Erro ao obter configurações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter configurações',
      error: error.message
    });
  }
};
