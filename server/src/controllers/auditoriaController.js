// arquivo: server/src/controllers/auditoriaController.js

const { query, get } = require('../config/database');

// ========================================
// LISTAR AUDITORIA COM FILTROS
// ========================================
exports.listarAuditoria = async (req, res) => {
  try {
    const { 
      usuarioId, 
      modulo, 
      acao, 
      dataInicio, 
      dataFim, 
      page = 1, 
      limit = 50 
    } = req.query;

    let sql = `
      SELECT 
        a.*,
        u.nome as usuario_nome,
        u.email as usuario_email
      FROM auditoria a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (usuarioId) {
      sql += ' AND a.usuario_id = ?';
      params.push(usuarioId);
    }

    if (modulo) {
      sql += ' AND a.modulo = ?';
      params.push(modulo);
    }

    if (acao) {
      sql += ' AND a.acao = ?';
      params.push(acao);
    }

    if (dataInicio) {
      sql += ' AND date(a.data_hora) >= date(?)';
      params.push(dataInicio);
    }

    if (dataFim) {
      sql += ' AND date(a.data_hora) <= date(?)';
      params.push(dataFim);
    }

    // Contagem total
    const countSql = sql.replace('SELECT a.*, u.nome as usuario_nome, u.email as usuario_email', 'SELECT COUNT(*) as total');
    const total = get(countSql, params).total;

    // Paginação
    sql += ' ORDER BY a.data_hora DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const registros = query(sql, params);

    res.json({
      registros,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('Erro ao listar auditoria:', error);
    res.status(500).json({ message: 'Erro ao listar auditoria', error: error.message });
  }
};

// ========================================
// LISTAR POR USUÁRIO
// ========================================
exports.listarPorUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { limit = 100 } = req.query;

    const registros = query(`
      SELECT 
        a.*,
        u.nome as usuario_nome,
        u.email as usuario_email
      FROM auditoria a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.usuario_id = ?
      ORDER BY a.data_hora DESC
      LIMIT ?
    `, [usuarioId, parseInt(limit)]);

    res.json(registros);

  } catch (error) {
    console.error('Erro ao listar auditoria por usuário:', error);
    res.status(500).json({ message: 'Erro ao listar auditoria', error: error.message });
  }
};

// ========================================
// LISTAR POR MÓDULO
// ========================================
exports.listarPorModulo = async (req, res) => {
  try {
    const { modulo } = req.params;
    const { limit = 100 } = req.query;

    const registros = query(`
      SELECT 
        a.*,
        u.nome as usuario_nome,
        u.email as usuario_email
      FROM auditoria a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.modulo = ?
      ORDER BY a.data_hora DESC
      LIMIT ?
    `, [modulo, parseInt(limit)]);

    res.json(registros);

  } catch (error) {
    console.error('Erro ao listar auditoria por módulo:', error);
    res.status(500).json({ message: 'Erro ao listar auditoria', error: error.message });
  }
};

// ========================================
// ESTATÍSTICAS DE AUDITORIA
// ========================================
exports.estatisticasAuditoria = async (req, res) => {
  try {
    const totalRegistros = get('SELECT COUNT(*) as count FROM auditoria').count;

    const porAcao = query(`
      SELECT acao, COUNT(*) as total 
      FROM auditoria 
      GROUP BY acao 
      ORDER BY total DESC
    `);

    const porModulo = query(`
      SELECT modulo, COUNT(*) as total 
      FROM auditoria 
      GROUP BY modulo 
      ORDER BY total DESC
    `);

    const usuariosMaisAtivos = query(`
      SELECT 
        u.nome,
        u.email,
        COUNT(a.id) as total_acoes
      FROM auditoria a
      INNER JOIN usuarios u ON a.usuario_id = u.id
      GROUP BY u.id
      ORDER BY total_acoes DESC
      LIMIT 10
    `);

    res.json({
      totalRegistros,
      porAcao,
      porModulo,
      usuariosMaisAtivos
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas', error: error.message });
  }
};

module.exports = exports;
