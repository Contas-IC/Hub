// arquivo: server/src/middlewares/permissoes.js
const { query } = require('../config/database');

/**
 * Middleware para verificar se usuário tem permissão para acessar um módulo
 * @param {string} modulo - ADMIN, LEGALIZACAO, ONBOARDING, CONTABIL, FISCAL, DP
 * @param {boolean} precisaEditar - Se precisa permissão de edição
 */
function verificarPermissao(modulo, precisaEditar = false) {
  return async (req, res, next) => {
    try {
      const usuarioId = req.usuario && req.usuario.id;

      // Admin tem acesso a tudo
      if (req.usuario && req.usuario.cargo && String(req.usuario.cargo).toLowerCase().includes('admin')) {
        req.podeEditar = true;
        return next();
      }

      // Verificar permissão específica do módulo
      const permissao = query(
        `SELECT * FROM permissoes_usuarios 
         WHERE usuario_id = ? AND modulo = ?`,
        [usuarioId, modulo.toUpperCase()]
      )[0];

      if (!permissao) {
        return res.status(403).json({
          success: false,
          message: `Você não tem permissão para acessar o módulo ${modulo}`
        });
      }

      // Verificar se precisa editar e se tem permissão
      if (precisaEditar && !permissao.pode_editar) {
        return res.status(403).json({
          success: false,
          message: `Você não tem permissão para editar neste módulo`
        });
      }

      req.podeEditar = permissao.pode_editar === 1;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar permissões',
        error: error.message
      });
    }
  };
}

/**
 * Middleware para obter todas as permissões do usuário
 */
function obterPermissoesUsuario(req, res, next) {
  try {
    const usuarioId = req.usuario && req.usuario.id;

    // Admin tem todas as permissões
    if (req.usuario && req.usuario.cargo && String(req.usuario.cargo).toLowerCase().includes('admin')) {
      req.permissoes = [
        { modulo: 'ADMIN', pode_editar: 1 },
        { modulo: 'LEGALIZACAO', pode_editar: 1 },
        { modulo: 'ONBOARDING', pode_editar: 1 },
        { modulo: 'CONTABIL', pode_editar: 1 },
        { modulo: 'FISCAL', pode_editar: 1 },
        { modulo: 'DP', pode_editar: 1 }
      ];
      return next();
    }

    // Buscar permissões do usuário
    const permissoes = query(
      `SELECT modulo, pode_editar FROM permissoes_usuarios WHERE usuario_id = ?`,
      [usuarioId]
    );

    req.permissoes = permissoes;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter permissões',
      error: error.message
    });
  }
}

module.exports = {
  verificarPermissao,
  obterPermissoesUsuario
};
