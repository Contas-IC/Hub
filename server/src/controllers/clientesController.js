// arquivo: server/src/controllers/clientesController.js
const { query, get, run } = require('../config/database');

// Helpers de normalização para evitar falhas de CHECK no SQLite
const STATUS_PERMITIDOS = ['ativa', 'inativa', 'baixada'];
const REGIMES_PERMITIDOS = ['CEI', 'MEI', 'SIMPLES', 'PRESUMIDO', 'REAL'];

function normalizarStatus(valor) {
  if (!valor) return 'ativa';
  const v = String(valor).trim().toLowerCase();
  // tratar variações comuns
  const mapa = {
    ativo: 'ativa',
    ativa: 'ativa',
    inativo: 'inativa',
    inativa: 'inativa',
    baixa: 'baixada',
    baixada: 'baixada'
  };
  const resultado = mapa[v] || v;
  return STATUS_PERMITIDOS.includes(resultado) ? resultado : 'ativa';
}

function normalizarRegime(valor) {
  if (!valor) return null;
  const v = String(valor).trim().toUpperCase();
  // tratar variações comuns
  const mapa = {
    'SIMPLES NACIONAL': 'SIMPLES',
    'LUCRO PRESUMIDO': 'PRESUMIDO',
    'LUCRO REAL': 'REAL'
  };
  const resultado = mapa[v] || v;
  return REGIMES_PERMITIDOS.includes(resultado) ? resultado : null;
}

// Listar clientes com filtros e paginação
const listarClientes = async (req, res) => {
  try {
    const {
      busca = '',
      status,
      regime,
      page = 1,
      limit = 50
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Montagem correta de FROM + JOIN e WHERE separado
    let baseFrom = `
      FROM clientes cl
      LEFT JOIN clientes_legalizacao ll ON ll.cliente_id = cl.id
    `;
    let baseWhere = `
      WHERE 1=1
    `;
    const params = [];

    if (busca) {
      baseWhere += ` AND (
        LOWER(cl.nome_empresa) LIKE ? OR
        LOWER(cl.codigo) LIKE ? OR
        REPLACE(cl.cnpj, '.', '') LIKE ?
      )`;
      const like = `%${busca.toLowerCase()}%`;
      params.push(like, like, busca.replace(/\D/g, ''));
    }

    if (status) {
      const statusFiltro = normalizarStatus(status);
      baseWhere += ' AND cl.status = ?';
      params.push(statusFiltro);
    }

    if (regime) {
      const regimeFiltro = normalizarRegime(regime);
      if (regimeFiltro) {
        baseWhere += ' AND cl.regime = ?';
        params.push(regimeFiltro);
      }
    }

    const { total } = get(`SELECT COUNT(*) as total ${baseFrom} ${baseWhere}`, params);

    const clientes = query(
      `
      SELECT 
        cl.id,
        cl.codigo,
        cl.cnpj,
        cl.nome_empresa,
        cl.regime,
        cl.status,
        cl.data_entrada_escritorio,
        cl.data_cadastro,
        cl.data_atualizacao,
        -- Campos financeiros (clientes_legalizacao)
        ll.tipo_cobranca,
        ll.percentual_cobranca,
        ll.valor_cobranca,
        ll.dia_vencimento
      ${baseFrom}
      ${baseWhere}
      ORDER BY cl.data_cadastro DESC
      LIMIT ? OFFSET ?
      `,
      [...params, Number(limit), Number(offset)]
    );

    res.json({
      sucesso: true,
      dados: clientes,
      total,
      pagina: Number(page),
      totalPaginas: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar clientes', erro: error.message });
  }
};

// Buscar cliente por ID
const buscarClientePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = get(
      `
      SELECT 
        cl.*,
        ll.tipo_cobranca,
        ll.percentual_cobranca,
        ll.valor_cobranca,
        ll.dia_vencimento
      FROM clientes cl
      LEFT JOIN clientes_legalizacao ll ON ll.cliente_id = cl.id
      WHERE cl.id = ?
      `,
      [id]
    );
    if (!cliente) {
      return res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado' });
    }
    res.json({ sucesso: true, dados: cliente });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar cliente', erro: error.message });
  }
};

// Criar novo cliente
const criarCliente = async (req, res) => {
  try {
    if (!req.usuarioId) {
      return res.status(401).json({ sucesso: false, mensagem: 'Usuário não autenticado' });
    }
    const {
      codigo,
      cnpj,
      nome_empresa,
      contato,
      telefone,
      email_principal,
      regime,
      responsavel_legal,
      data_abertura,
      status,
      data_entrada_escritorio
    } = req.body;

    if (!codigo || !cnpj || !nome_empresa) {
      return res.status(400).json({ sucesso: false, mensagem: 'Código, CNPJ e nome da empresa são obrigatórios' });
    }

    const existeCodigo = get('SELECT id FROM clientes WHERE codigo = ?', [codigo]);
    if (existeCodigo) {
      return res.status(400).json({ sucesso: false, mensagem: 'Código já cadastrado' });
    }
    const existeCnpj = get('SELECT id FROM clientes WHERE cnpj = ?', [cnpj]);
    if (existeCnpj) {
      return res.status(400).json({ sucesso: false, mensagem: 'CNPJ já cadastrado' });
    }

    const statusFinal = normalizarStatus(status);
    const regimeFinal = normalizarRegime(regime);

    const info = run(
      `
      INSERT INTO clientes (
        codigo, cnpj, nome_empresa, contato, telefone, email_principal,
        regime, responsavel_legal, data_abertura, status,
        data_entrada_escritorio, criado_por, data_cadastro, data_atualizacao
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now','localtime'), datetime('now','localtime'))
      `,
      [
        codigo,
        cnpj,
        nome_empresa,
        contato || null,
        telefone || null,
        email_principal || null,
        regimeFinal,
        responsavel_legal || null,
        data_abertura || null,
        statusFinal,
        data_entrada_escritorio || null,
        req.usuarioId || null
      ]
    );

    const novo = get('SELECT * FROM clientes WHERE id = ?', [info.lastInsertRowid]);
    res.status(201).json({ sucesso: true, mensagem: 'Cliente criado com sucesso', dados: novo });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao criar cliente', erro: error.message });
  }
};

// Atualizar cliente
const atualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const campos = [
      'codigo','cnpj','nome_empresa','contato','telefone','email_principal',
      'regime','responsavel_legal','data_abertura','status',
      'data_entrada_escritorio','data_saida_escritorio','data_baixada'
    ];
    const sets = [];
    const params = [];
    for (const campo of campos) {
      if (req.body[campo] !== undefined) {
        if (campo === 'status') {
          const s = normalizarStatus(req.body[campo]);
          sets.push('status = ?');
          params.push(s);
        } else if (campo === 'regime') {
          const r = normalizarRegime(req.body[campo]);
          if (!r) {
            return res.status(400).json({ sucesso: false, mensagem: 'Regime inválido. Use CEI, MEI, SIMPLES, PRESUMIDO ou REAL.' });
          }
          sets.push('regime = ?');
          params.push(r);
        } else {
          sets.push(`${campo} = ?`);
          params.push(req.body[campo]);
        }
      }
    }
    if (sets.length === 0) {
      return res.status(400).json({ sucesso: false, mensagem: 'Nenhum campo para atualizar' });
    }
    sets.push('data_atualizacao = datetime("now","localtime")');
    const result = run(`UPDATE clientes SET ${sets.join(', ')} WHERE id = ?`, [...params, id]);
    if (result.changes === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado' });
    }
    const atualizado = get('SELECT * FROM clientes WHERE id = ?', [id]);
    res.json({ sucesso: true, mensagem: 'Cliente atualizado com sucesso', dados: atualizado });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar cliente', erro: error.message });
  }
};

// Excluir cliente
const excluirCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const result = run('DELETE FROM clientes WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado' });
    }
    res.json({ sucesso: true, mensagem: 'Cliente excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir cliente', erro: error.message });
  }
};

module.exports = {
  listarClientes,
  buscarClientePorId,
  criarCliente,
  atualizarCliente,
  excluirCliente,
  // Atualização financeira (legalização)
  atualizarFinanceiro: async (req, res) => {
    try {
      const { id } = req.params; // cliente_id
      const {
        tipo_cobranca,
        percentual_cobranca,
        valor_cobranca,
        dia_vencimento
      } = req.body;

      // Validar cliente existente
      const cliente = get('SELECT id, codigo, nome_empresa FROM clientes WHERE id = ?', [id]);
      if (!cliente) {
        return res.status(404).json({ sucesso: false, mensagem: 'Cliente não encontrado' });
      }

      const existente = get('SELECT id FROM clientes_legalizacao WHERE cliente_id = ?', [id]);
      if (existente) {
        run(
          `UPDATE clientes_legalizacao SET 
            tipo_cobranca = ?,
            percentual_cobranca = ?,
            valor_cobranca = ?,
            dia_vencimento = ?,
            data_atualizacao = datetime('now','localtime')
          WHERE cliente_id = ?`,
          [
            tipo_cobranca || null,
            percentual_cobranca ?? null,
            valor_cobranca ?? null,
            dia_vencimento ?? null,
            id
          ]
        );
      } else {
        run(
          `INSERT INTO clientes_legalizacao (
            cliente_id, tipo_cobranca, percentual_cobranca, valor_cobranca, dia_vencimento, data_criacao, data_atualizacao
          ) VALUES (?, ?, ?, ?, ?, datetime('now','localtime'), datetime('now','localtime'))`,
          [
            id,
            tipo_cobranca || null,
            percentual_cobranca ?? null,
            valor_cobranca ?? null,
            dia_vencimento ?? null
          ]
        );
      }

      const dados = get(
        `SELECT 
          cl.id,
          cl.codigo,
          cl.nome_empresa,
          ll.tipo_cobranca,
          ll.percentual_cobranca,
          ll.valor_cobranca,
          ll.dia_vencimento
        FROM clientes cl
        LEFT JOIN clientes_legalizacao ll ON ll.cliente_id = cl.id
        WHERE cl.id = ?`,
        [id]
      );

      return res.json({ sucesso: true, mensagem: 'Financeiro atualizado', dados });
    } catch (error) {
      console.error('Erro ao atualizar financeiro do cliente:', error);
      return res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar financeiro', erro: error.message });
    }
  }
};