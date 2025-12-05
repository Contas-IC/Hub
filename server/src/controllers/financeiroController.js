const { query, get, run } = require('../config/database');

function registrarAuditoria(usuarioId, acao, entidade, detalhes, ip) {
  try {
    run(
      `INSERT INTO auditoria (usuario_id, acao, modulo, entidade, detalhes, ip)
       VALUES (?, ?, 'FINANCEIROS', ?, ?, ?)`,
      [usuarioId, acao, entidade, detalhes, ip]
    );
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
}

// Listar todos os financeiros com dados dos clientes (SQLite)
exports.listarFinanceiros = async (req, res) => {
  try {
    const { busca } = req.query;

    let sql = `
      SELECT 
        c.id AS id,
        c.id AS cliente_id,
        c.codigo AS cliente_codigo,
        c.nome_empresa AS cliente_nome,
        c.cnpj AS cliente_cnpj,
        l.tipo_cobranca,
        l.percentual_cobranca AS percentual_salario_minimo,
        l.dia_vencimento
      FROM clientes c
      LEFT JOIN legalizacao l ON l.cliente_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (busca) {
      sql += ' AND (c.nome_empresa LIKE ? OR c.cnpj LIKE ? OR c.codigo LIKE ?)';
      const like = `%${busca}%`;
      params.push(like, like, like);
    }

    sql += ' ORDER BY c.data_cadastro DESC';

    const rows = query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao listar financeiros:', error);
    res.status(500).json({ message: 'Erro ao listar financeiros', error: error.message });
  }
};

// Buscar financeiro por ID do cliente (SQLite)
exports.buscarFinanceiroPorCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;

    const cliente = get(
      `SELECT id, codigo, nome_empresa AS nome, cnpj FROM clientes WHERE id = ?`,
      [clienteId]
    );

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const legal = get(
      `SELECT 
         tipo_cobranca AS cobranca,
         percentual_cobranca AS percentual,
         valor_cobranca AS valor,
         dia_vencimento AS vencimento,
         observacoes AS observacao
       FROM legalizacao
       WHERE cliente_id = ?`,
      [clienteId]
    );

    const financeiro = legal || { cobranca: '', percentual: '', valor: '', vencimento: '', observacao: '' };

    res.json({ ...cliente, financeiro });
  } catch (error) {
    console.error('Erro ao buscar financeiro:', error);
    res.status(500).json({ message: 'Erro ao buscar financeiro', error: error.message });
  }
};

// Atualizar dados financeiros (SQLite)
exports.atualizarFinanceiro = async (req, res) => {
  try {
    const { clienteId } = req.params;
    const { cobranca, percentual, valor, vencimento, observacao } = req.body || {};

    const cliente = get('SELECT id, codigo, nome_empresa AS nome FROM clientes WHERE id = ?', [clienteId]);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const existente = get('SELECT id FROM legalizacao WHERE cliente_id = ?', [clienteId]);

    if (existente) {
      run(
        `UPDATE legalizacao SET
           tipo_cobranca = ?,
           percentual_cobranca = ?,
           valor_cobranca = ?,
           dia_vencimento = ?,
           observacoes = ?,
           atualizado_em = datetime('now','localtime')
         WHERE cliente_id = ?`,
        [cobranca, percentual, valor, vencimento, observacao, clienteId]
      );
    } else {
      run(
        `INSERT INTO legalizacao (
           cliente_id, tipo_cobranca, percentual_cobranca, valor_cobranca, dia_vencimento, observacoes
         ) VALUES (?, ?, ?, ?, ?, ?)`,
        [clienteId, cobranca, percentual, valor, vencimento, observacao]
      );
    }

    registrarAuditoria(
      req.usuario?.id || 1,
      'EDITAR',
      cliente.nome,
      `Atualizou dados financeiros do cliente ${cliente.codigo}`,
      req.ip
    );

    const atualizado = get(
      `SELECT 
         tipo_cobranca AS cobranca,
         percentual_cobranca AS percentual,
         valor_cobranca AS valor,
         dia_vencimento AS vencimento,
         observacoes AS observacao
       FROM legalizacao WHERE cliente_id = ?`,
      [clienteId]
    );

    res.json({ ...cliente, financeiro: atualizado });
  } catch (error) {
    console.error('Erro ao atualizar financeiro:', error);
    res.status(500).json({ message: 'Erro ao atualizar financeiro', error: error.message });
  }
};
