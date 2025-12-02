// server/src/controllers/auditoriaController.js

const { query, get, run } = require('../config/database');

// Registrar auditoria
const registrarAuditoria = async (req, res) => {
  try {
    const {
      usuario_id,
      acao,
      tabela,
      registro_id,
      dados_anteriores,
      dados_novos,
      ip_address,
      user_agent
    } = req.body;

    // Validações
    if (!usuario_id || !acao || !tabela) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Usuário, ação e tabela são obrigatórios'
      });
    }

    const resultado = run(
      `
      INSERT INTO auditoria (
        usuario_id,
        acao,
        tabela,
        registro_id,
        dados_anteriores,
        dados_novos,
        ip_address,
        user_agent,
        criado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `,
      [
        usuario_id,
        acao,
        tabela,
        registro_id || null,
        dados_anteriores ? JSON.stringify(dados_anteriores) : null,
        dados_novos ? JSON.stringify(dados_novos) : null,
        ip_address || null,
        user_agent || null
      ]
    );

    res.status(201).json({
      sucesso: true,
      mensagem: 'Auditoria registrada com sucesso',
      dados: {
        id: resultado.lastInsertRowid
      }
    });

  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao registrar auditoria',
      erro: error.message
    });
  }
};

// Listar auditorias
const listarAuditorias = async (req, res) => {
  try {
    const { 
      usuario_id, 
      acao, 
      tabela, 
      data_inicio, 
      data_fim,
      limite = 50,
      pagina = 1
    } = req.query;

    let query = `
      SELECT 
        a.id,
        a.usuario_id,
        a.acao,
        a.tabela,
        a.registro_id,
        a.dados_anteriores,
        a.dados_novos,
        a.ip_address,
        a.user_agent,
        a.criado_em,
        u.nome as usuario_nome,
        u.email as usuario_email
      FROM auditoria a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE 1=1
    `;

    const params = [];

    // Filtros
    if (usuario_id) {
      query += ' AND a.usuario_id = ?';
      params.push(usuario_id);
    }

    if (acao) {
      query += ' AND a.acao = ?';
      params.push(acao);
    }

    if (tabela) {
      query += ' AND a.tabela = ?';
      params.push(tabela);
    }

    if (data_inicio) {
      query += ' AND DATE(a.criado_em) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      query += ' AND DATE(a.criado_em) <= ?';
      params.push(data_fim);
    }

    query += ' ORDER BY a.criado_em DESC';

    // Paginação
    const offset = (pagina - 1) * limite;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limite), offset);

    const auditorias = query(query, params);

    // Parsear JSON dos dados
    const auditoriasFormatadas = auditorias.map(auditoria => ({
      ...auditoria,
      dados_anteriores: auditoria.dados_anteriores ? JSON.parse(auditoria.dados_anteriores) : null,
      dados_novos: auditoria.dados_novos ? JSON.parse(auditoria.dados_novos) : null
    }));

    // Contar total
    let countQuery = 'SELECT COUNT(*) as total FROM auditoria WHERE 1=1';
    const countParams = [];

    if (usuario_id) {
      countQuery += ' AND usuario_id = ?';
      countParams.push(usuario_id);
    }

    if (acao) {
      countQuery += ' AND acao = ?';
      countParams.push(acao);
    }

    if (tabela) {
      countQuery += ' AND tabela = ?';
      countParams.push(tabela);
    }

    if (data_inicio) {
      countQuery += ' AND DATE(criado_em) >= ?';
      countParams.push(data_inicio);
    }

    if (data_fim) {
      countQuery += ' AND DATE(criado_em) <= ?';
      countParams.push(data_fim);
    }

    const { total } = get(countQuery, countParams);

    res.json({
      sucesso: true,
      dados: auditoriasFormatadas,
      paginacao: {
        total,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalPaginas: Math.ceil(total / limite)
      }
    });

  } catch (error) {
    console.error('Erro ao listar auditorias:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar auditorias',
      erro: error.message
    });
  }
};

// Auditorias recentes
const auditoriasRecentes = async (req, res) => {
  try {
    const { limite = 20 } = req.query;

    const auditorias = query(
      `
      SELECT 
        a.id,
        a.usuario_id,
        a.acao,
        a.tabela,
        a.registro_id,
        a.criado_em,
        u.nome as usuario_nome
      FROM auditoria a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      ORDER BY a.criado_em DESC
      LIMIT ?
      `,
      [parseInt(limite)]
    );

    res.json({
      sucesso: true,
      dados: auditorias
    });

  } catch (error) {
    console.error('Erro ao buscar auditorias recentes:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar auditorias recentes',
      erro: error.message
    });
  }
};

// Estatísticas de auditoria
const estatisticasAuditoria = async (req, res) => {
  try {
    // Total de registros
    const { total } = get('SELECT COUNT(*) as total FROM auditoria');

    // Registros por ação
    const porAcao = query(`
      SELECT acao, COUNT(*) as quantidade
      FROM auditoria
      GROUP BY acao
    `);

    // Registros por tabela
    const porTabela = query(`
      SELECT tabela, COUNT(*) as quantidade
      FROM auditoria
      GROUP BY tabela
      ORDER BY quantidade DESC
      LIMIT 10
    `);

    // Registros por usuário
    const porUsuario = query(`
      SELECT 
        u.nome as usuario,
        COUNT(a.id) as quantidade
      FROM auditoria a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      GROUP BY a.usuario_id
      ORDER BY quantidade DESC
      LIMIT 10
    `);

    // Atividades por dia (últimos 7 dias)
    const porDia = query(`
      SELECT 
        DATE(criado_em) as data,
        COUNT(*) as quantidade
      FROM auditoria
      WHERE criado_em >= DATE('now', '-7 days')
      GROUP BY DATE(criado_em)
      ORDER BY data ASC
    `);

    // Registros de hoje
    const { total: hoje } = get(`
      SELECT COUNT(*) as total
      FROM auditoria
      WHERE DATE(criado_em) = DATE('now')
    `);

    // Registros desta semana
    const { total: semana } = get(`
      SELECT COUNT(*) as total
      FROM auditoria
      WHERE criado_em >= DATE('now', '-7 days')
    `);

    res.json({
      sucesso: true,
      dados: {
        total,
        hoje,
        semana,
        porAcao,
        porTabela,
        porUsuario,
        porDia
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas de auditoria:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar estatísticas de auditoria',
      erro: error.message
    });
  }
};

module.exports = {
  registrarAuditoria,
  listarAuditorias,
  auditoriasRecentes,
  estatisticasAuditoria
};
