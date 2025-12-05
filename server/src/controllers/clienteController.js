const { query, get, run } = require('../config/database');

function registrarAuditoria(usuarioId, acao, entidade, detalhes, ip) {
  try {
    run(
      `INSERT INTO auditoria (usuario_id, acao, modulo, entidade, detalhes, ip)
       VALUES (?, ?, 'CLIENTES', ?, ?, ?)`,
      [usuarioId, acao, entidade, detalhes, ip]
    );
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
}

// Listar todos os clientes com filtros
exports.listarClientes = async (req, res) => {
  try {
    const { busca, status, atividade, tipoApuracao, page = 1, limit = 50 } = req.query;

    let sql = `
      SELECT id, codigo, cnpj, nome_empresa, nome_fantasia, atividade, status, data_entrada_escritorio
      FROM clientes
      WHERE 1=1
    `;
    const params = [];

    if (busca) {
      sql += ' AND (nome_empresa LIKE ? OR cnpj LIKE ? OR codigo LIKE ?)';
      const like = `%${busca}%`;
      params.push(like, like, like);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (atividade) {
      sql += ' AND atividade = ?';
      params.push(atividade);
    }
    if (tipoApuracao) {
      sql += ' AND tipo_apuracao = ?';
      params.push(tipoApuracao);
    }

    const countRow = get(
      `SELECT COUNT(*) AS total FROM (${sql})`,
      params
    );

    sql += ' ORDER BY datetime(data_cadastro) DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const clientes = query(sql, params);

    res.json({
      clientes,
      totalPages: Math.ceil(countRow.total / parseInt(limit)),
      currentPage: parseInt(page),
      total: countRow.total
    });
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ message: 'Erro ao listar clientes', error: error.message });
  }
};

// Buscar cliente por ID
exports.buscarClientePorId = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = get(
      `SELECT 
         id,
         codigo,
         cnpj,
         nome_empresa,
         nome_fantasia,
         contato,
         telefone,
         email_principal,
         regime,
         responsavel_legal,
         data_abertura,
         data_constituicao,
         quantidade_funcionarios,
         tipo_apuracao,
         atividade,
         tipo_entrada,
         data_entrada_escritorio,
         grau_dificuldade,
         status,
         data_saida_escritorio,
         data_baixada,
         data_inativacao,
         observacoes,
         data_cadastro,
         data_atualizacao
       FROM clientes WHERE id = ?`,
      [id]
    );

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    const emails = query('SELECT email, tipo FROM clientes_emails WHERE cliente_id = ?', [id]);
    const localizacoes = query(
      'SELECT estado, cidade, inscricao_municipal, inscricao_estadual FROM clientes_localizacoes WHERE cliente_id = ?',
      [id]
    );
    const setores = query(
      'SELECT setor, responsavel, status FROM clientes_setores WHERE cliente_id = ?',
      [id]
    );
    const legalizacao = get('SELECT * FROM legalizacao WHERE cliente_id = ?', [id]);
    const financeiro = get('SELECT * FROM financeiros WHERE cliente_id = ?', [id]);

    registrarAuditoria(
      req.usuario?.id || 1,
      'VISUALIZAR',
      cliente.nome_empresa,
      `Visualizou dados do cliente ${cliente.codigo}`,
      req.ip
    );

    res.json({
      ...cliente,
      nome: cliente.nome_empresa,
      nomeFantasia: cliente.nome_fantasia,
      dataBaixa: cliente.data_baixada,
      dataInativacao: cliente.data_inativacao,
      emails,
      localizacoes,
      setores,
      legalizacao,
      financeiro
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ message: 'Erro ao buscar cliente', error: error.message });
  }
};

// Criar novo cliente
exports.criarCliente = async (req, res) => {
  try {
    const dados = req.body || {};

    const existeCnpj = get('SELECT id FROM clientes WHERE cnpj = ?', [dados.cnpj]);
    if (existeCnpj) {
      return res.status(400).json({ message: 'CNPJ já cadastrado' });
    }

    const existeCodigo = get('SELECT id FROM clientes WHERE codigo = ?', [dados.codigo]);
    if (existeCodigo) {
      return res.status(400).json({ message: 'Código já cadastrado' });
    }

    const result = run(
      `INSERT INTO clientes (
         codigo, cnpj, nome_empresa, nome_fantasia, contato, telefone, email_principal,
         regime, responsavel_legal, data_abertura, data_constituicao, quantidade_funcionarios,
         tipo_apuracao, atividade, tipo_entrada, data_entrada_escritorio, grau_dificuldade,
         status, data_baixada, data_inativacao, observacoes, criado_por
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dados.codigo,
        dados.cnpj,
        dados.nome_empresa,
        dados.nome_fantasia || null,
        dados.contato || null,
        dados.telefone || null,
        dados.email_principal || null,
        dados.regime || null,
        dados.responsavel_legal || null,
        dados.data_abertura || null,
        dados.data_constituicao || null,
        dados.quantidade_funcionarios || 0,
        dados.tipo_apuracao || null,
        dados.atividade || null,
        dados.tipo_entrada || 'CLIENTE_NOVO',
        dados.data_entrada_escritorio || null,
        dados.grau_dificuldade || 'MEDIO',
        dados.status || 'ATIVO',
        dados.data_baixada || null,
        dados.data_inativacao || null,
        dados.observacoes || null,
        req.usuario?.id || null
      ]
    );

    const novoId = result.lastInsertRowid;

    (dados.emails || []).forEach(e => {
      run(
        `INSERT INTO clientes_emails (cliente_id, email, tipo) VALUES (?, ?, ?)`,
        [novoId, e.email, e.tipo || 'Secundário']
      );
    });

    (dados.localizacoes || []).forEach(l => {
      run(
        `INSERT INTO clientes_localizacoes (cliente_id, estado, cidade, inscricao_municipal, inscricao_estadual)
         VALUES (?, ?, ?, ?, ?)`,
        [novoId, l.estado || null, l.cidade || null, l.inscricao_municipal || null, l.inscricao_estadual || null]
      );
    });

    (dados.setores || []).forEach(s => {
      run(
        `INSERT INTO clientes_setores (cliente_id, setor, responsavel, status) VALUES (?, ?, ?, ?)`,
        [novoId, s.setor, s.responsavel || null, s.status || 'PENDENTE']
      );
    });

    const novoCliente = get('SELECT * FROM clientes WHERE id = ?', [novoId]);

    registrarAuditoria(
      req.usuario?.id || 1,
      'CRIAR',
      novoCliente.nome_empresa,
      `Criou novo cliente ${novoCliente.codigo}`,
      req.ip
    );

    res.status(201).json(novoCliente);
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ message: 'Erro ao criar cliente', error: error.message });
  }
};

// Atualizar cliente
exports.atualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body || {};

    const existente = get('SELECT * FROM clientes WHERE id = ?', [id]);
    if (!existente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    run(
      `UPDATE clientes SET
         codigo = COALESCE(?, codigo),
         cnpj = COALESCE(?, cnpj),
         nome_empresa = COALESCE(?, nome_empresa),
         nome_fantasia = COALESCE(?, nome_fantasia),
         contato = COALESCE(?, contato),
         telefone = COALESCE(?, telefone),
         email_principal = COALESCE(?, email_principal),
         regime = COALESCE(?, regime),
         responsavel_legal = COALESCE(?, responsavel_legal),
         data_abertura = COALESCE(?, data_abertura),
         data_constituicao = COALESCE(?, data_constituicao),
         quantidade_funcionarios = COALESCE(?, quantidade_funcionarios),
         tipo_apuracao = COALESCE(?, tipo_apuracao),
         atividade = COALESCE(?, atividade),
         tipo_entrada = COALESCE(?, tipo_entrada),
         data_entrada_escritorio = COALESCE(?, data_entrada_escritorio),
         grau_dificuldade = COALESCE(?, grau_dificuldade),
         status = COALESCE(?, status),
         data_saida_escritorio = COALESCE(?, data_saida_escritorio),
         data_baixada = COALESCE(?, data_baixada),
         data_inativacao = COALESCE(?, data_inativacao),
         observacoes = COALESCE(?, observacoes),
         data_atualizacao = datetime('now','localtime')
       WHERE id = ?`,
      [
        dados.codigo,
        dados.cnpj,
        dados.nome_empresa,
        dados.nome_fantasia,
        dados.contato,
        dados.telefone,
        dados.email_principal,
        dados.regime,
        dados.responsavel_legal,
        dados.data_abertura,
        dados.data_constituicao,
        dados.quantidade_funcionarios,
        dados.tipo_apuracao,
        dados.atividade,
        dados.tipo_entrada,
        dados.data_entrada_escritorio,
        dados.grau_dificuldade,
        dados.status,
        dados.data_saida_escritorio,
        dados.data_baixada,
        dados.data_inativacao,
        dados.observacoes,
        id
      ]
    );

    if (Array.isArray(dados.emails)) {
      run('DELETE FROM clientes_emails WHERE cliente_id = ?', [id]);
      dados.emails.forEach(e => {
        run(
          `INSERT INTO clientes_emails (cliente_id, email, tipo) VALUES (?, ?, ?)`,
          [id, e.email, e.tipo || 'Secundário']
        );
      });
    }

    if (Array.isArray(dados.localizacoes)) {
      run('DELETE FROM clientes_localizacoes WHERE cliente_id = ?', [id]);
      dados.localizacoes.forEach(l => {
        run(
          `INSERT INTO clientes_localizacoes (cliente_id, estado, cidade, inscricao_municipal, inscricao_estadual)
           VALUES (?, ?, ?, ?, ?)`,
          [id, l.estado || null, l.cidade || null, l.inscricao_municipal || null, l.inscricao_estadual || null]
        );
      });
    }

    if (Array.isArray(dados.setores)) {
      run('DELETE FROM clientes_setores WHERE cliente_id = ?', [id]);
      dados.setores.forEach(s => {
        run(
          `INSERT INTO clientes_setores (cliente_id, setor, responsavel, status) VALUES (?, ?, ?, ?)`,
          [id, s.setor, s.responsavel || null, s.status || 'PENDENTE']
        );
      });
    }

    const clienteAtualizado = get('SELECT * FROM clientes WHERE id = ?', [id]);

    registrarAuditoria(
      req.usuario?.id || 1,
      'EDITAR',
      clienteAtualizado.nome_empresa,
      `Atualizou dados do cliente ${clienteAtualizado.codigo}`,
      req.ip
    );

    res.json(clienteAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ message: 'Erro ao atualizar cliente', error: error.message });
  }
};

// Excluir cliente
exports.excluirCliente = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = get('SELECT * FROM clientes WHERE id = ?', [id]);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }

    run('DELETE FROM clientes WHERE id = ?', [id]);

    registrarAuditoria(
      req.usuario?.id || 1,
      'EXCLUIR',
      cliente.nome_empresa,
      `Excluiu cliente ${cliente.codigo}`,
      req.ip
    );

    res.json({ message: 'Cliente excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({ message: 'Erro ao excluir cliente', error: error.message });
  }
};

// Estatísticas de clientes
exports.estatisticasClientes = async (req, res) => {
  try {
    const total = get('SELECT COUNT(*) AS count FROM clientes').count;
    const ativos = get("SELECT COUNT(*) AS count FROM clientes WHERE status = 'ATIVO'").count;
    const inativos = get("SELECT COUNT(*) AS count FROM clientes WHERE status = 'INATIVO'").count;
    const baixados = get("SELECT COUNT(*) AS count FROM clientes WHERE status = 'BAIXADA'").count;

    const entradas = get(
      "SELECT COUNT(*) AS count FROM clientes WHERE date(data_entrada_escritorio) >= date('now','-30 day')"
    ).count;

    res.json({ total, ativos, inativos, baixados, entradas });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas', error: error.message });
  }
};
