// arquivo: server/src/controllers/legalizacaoController.js

const { query, get, run } = require('../config/database');

// ========================================
// ESTATÍSTICAS DASHBOARD
// ========================================
exports.obterEstatisticas = async (req, res) => {
  try {
    // Empresas por status
    const empresasEntradas = query(`
      SELECT COUNT(*) as total FROM clientes 
      WHERE data_entrada_escritorio IS NOT NULL
    `)[0].total;

    const empresasSaidas = query(`
      SELECT COUNT(*) as total FROM clientes 
      WHERE data_saida_escritorio IS NOT NULL
    `)[0].total;

    const empresasAtivas = query(`
      SELECT COUNT(*) as total FROM clientes 
      WHERE status = 'ATIVO'
    `)[0].total;

    const dadosIncompletos = query(`
      SELECT COUNT(*) as total FROM clientes 
      WHERE responsavel_legal IS NULL 
      OR email_principal IS NULL 
      OR telefone IS NULL
    `)[0].total;

    // Certificados
    const totalCertificados = query(`
      SELECT COUNT(*) as total FROM certificados
    `)[0].total;

    const certificadosAtivos = query(`
      SELECT COUNT(*) as total FROM certificados 
      WHERE status = 'ATIVO'
    `)[0].total;

    const certificadosVencidos = query(`
      SELECT COUNT(*) as total FROM certificados 
      WHERE status = 'VENCIDO'
    `)[0].total;

    const proximosVencer = query(`
      SELECT COUNT(*) as total FROM certificados 
      WHERE status = 'ATIVO'
      AND date(data_vencimento) BETWEEN date('now') AND date('now', '+30 days')
    `)[0].total;

    res.json({
      empresas: {
        entradas: empresasEntradas,
        saidas: empresasSaidas,
        ativas: empresasAtivas,
        dadosIncompletos
      },
      certificados: {
        total: totalCertificados,
        ativos: certificadosAtivos,
        vencidos: certificadosVencidos,
        proximoVencer: proximosVencer
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ 
      message: 'Erro ao obter estatísticas', 
      error: error.message 
    });
  }
};

// ========================================
// LISTAR EMPRESAS EM LEGALIZAÇÃO
// ========================================
exports.listarEmpresas = async (req, res) => {
  try {
    const { status, busca } = req.query;

    let sql = `
      SELECT 
        c.*,
        l.status_processo as status_legalizacao,
        l.data_inicio,
        l.data_conclusao
      FROM clientes c
      LEFT JOIN legalizacao l ON c.id = l.cliente_id
      WHERE 1=1
    `;

    const params = [];

    if (status && status !== 'TODOS') {
      sql += ' AND c.status = ?';
      params.push(status);
    }

    if (busca) {
      sql += ' AND (c.nome_empresa LIKE ? OR c.cnpj LIKE ? OR c.codigo LIKE ?)';
      const buscaParam = `%${busca}%`;
      params.push(buscaParam, buscaParam, buscaParam);
    }

    sql += ' ORDER BY c.data_cadastro DESC';

    const empresas = query(sql, params);

    // Buscar emails, localizações e setores para cada cliente
    const empresasCompletas = empresas.map(empresa => {
      const emails = query(
        'SELECT email, tipo FROM clientes_emails WHERE cliente_id = ?',
        [empresa.id]
      );

      const localizacoes = query(
        'SELECT estado, cidade, inscricao_municipal, inscricao_estadual FROM clientes_localizacoes WHERE cliente_id = ?',
        [empresa.id]
      );

      const setores = query(
        'SELECT setor, responsavel, status FROM clientes_setores WHERE cliente_id = ?',
        [empresa.id]
      );

      return {
        ...empresa,
        emails,
        localizacoes,
        setores
      };
    });

    res.json(empresasCompletas);

  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    res.status(500).json({ 
      message: 'Erro ao listar empresas', 
      error: error.message 
    });
  }
};

// ========================================
// BUSCAR EMPRESA POR ID
// ========================================
exports.buscarEmpresaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const empresa = get('SELECT * FROM clientes WHERE id = ?', [id]);

    if (!empresa) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }

    // Buscar dados relacionados
    const emails = query(
      'SELECT email, tipo FROM clientes_emails WHERE cliente_id = ?',
      [id]
    );

    const localizacoes = query(
      'SELECT estado, cidade, inscricao_municipal, inscricao_estadual FROM clientes_localizacoes WHERE cliente_id = ?',
      [id]
    );

    const setores = query(
      'SELECT setor, responsavel, status FROM clientes_setores WHERE cliente_id = ?',
      [id]
    );

    const legalizacao = get(
      'SELECT * FROM legalizacao WHERE cliente_id = ?',
      [id]
    );

    const financeiro = get(
      'SELECT * FROM financeiros WHERE cliente_id = ?',
      [id]
    );

    res.json({
      ...empresa,
      emails,
      localizacoes,
      setores,
      legalizacao,
      financeiro
    });

  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar empresa', 
      error: error.message 
    });
  }
};

// ========================================
// CRIAR/ATUALIZAR PROCESSO DE LEGALIZAÇÃO
// ========================================
exports.salvarProcessoLegalizacao = async (req, res) => {
  try {
    const { clienteId } = req.params;
    const {
      tipo_cobranca,
      percentual_cobranca,
      valor_cobranca,
      dia_vencimento,
      status_processo,
      observacoes
    } = req.body;

    // Verificar se cliente existe
    const cliente = get('SELECT id FROM clientes WHERE id = ?', [clienteId]);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    // Verificar se já existe processo
    const processoExistente = get(
      'SELECT id FROM legalizacao WHERE cliente_id = ?',
      [clienteId]
    );

    if (processoExistente) {
      // Atualizar
      run(`
        UPDATE legalizacao SET
          tipo_cobranca = ?,
          percentual_cobranca = ?,
          valor_cobranca = ?,
          dia_vencimento = ?,
          status_processo = ?,
          observacoes = ?,
          data_conclusao = CASE WHEN ? = 'CONCLUIDO' THEN datetime('now','localtime') ELSE data_conclusao END,
          atualizado_em = datetime('now','localtime')
        WHERE cliente_id = ?
      `, [
        tipo_cobranca,
        percentual_cobranca,
        valor_cobranca,
        dia_vencimento,
        status_processo,
        observacoes,
        status_processo,
        clienteId
      ]);

      res.json({ message: 'Processo de legalização atualizado com sucesso' });
    } else {
      // Criar
      run(`
        INSERT INTO legalizacao (
          cliente_id, tipo_cobranca, percentual_cobranca, valor_cobranca,
          dia_vencimento, status_processo, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        clienteId,
        tipo_cobranca,
        percentual_cobranca,
        valor_cobranca,
        dia_vencimento,
        status_processo || 'EM_ANDAMENTO',
        observacoes
      ]);

      res.status(201).json({ message: 'Processo de legalização criado com sucesso' });
    }

  } catch (error) {
    console.error('Erro ao salvar processo:', error);
    res.status(500).json({ 
      message: 'Erro ao salvar processo de legalização', 
      error: error.message 
    });
  }
};

module.exports = exports;
