

const { query, get, run } = require('../config/database');

function registrarAuditoria(usuarioId, acao, entidade, detalhes, ip) {
  try {
    run(
      `INSERT INTO auditoria (usuario_id, acao, modulo, entidade, detalhes, ip)
       VALUES (?, ?, 'AGENDA', ?, ?, ?)`,
      [usuarioId, acao, entidade, detalhes, ip]
    );
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
}

// Listar todas as tarefas (SQLite)
exports.listarTarefas = async (req, res) => {
  try {
    const { status, dataInicio, dataFim } = req.query;

    let sql = `
      SELECT 
        t.id,
        t.titulo,
        t.descricao,
        t.status,
        t.prioridade,
        t.data_vencimento,
        c.nome_empresa AS cliente_nome
      FROM tarefas t
      LEFT JOIN clientes c ON c.id = t.cliente_id
      WHERE 1=1
    `;

    const params = [];

    if (status && status !== 'TODAS') {
      sql += ' AND t.status = ?';
      params.push(status);
    }

    if (dataInicio && dataFim) {
      sql += " AND date(t.data_vencimento) BETWEEN date(?) AND date(?)";
      params.push(dataInicio, dataFim);
    } else if (dataInicio) {
      sql += " AND date(t.data_vencimento) >= date(?)";
      params.push(dataInicio);
    } else if (dataFim) {
      sql += " AND date(t.data_vencimento) <= date(?)";
      params.push(dataFim);
    }

    sql += ' ORDER BY datetime(t.data_vencimento) ASC';

    const tarefas = query(sql, params);
    res.json(tarefas);
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    res.status(500).json({ message: 'Erro ao listar tarefas', error: error.message });
  }
};

// Buscar tarefa por ID (SQLite)
exports.buscarTarefaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const tarefa = get(
      `SELECT 
         t.*, 
         c.nome_empresa AS cliente_nome
       FROM tarefas t
       LEFT JOIN clientes c ON c.id = t.cliente_id
       WHERE t.id = ?`,
      [id]
    );

    if (!tarefa) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    res.json(tarefa);
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error);
    res.status(500).json({ message: 'Erro ao buscar tarefa', error: error.message });
  }
};

// Criar nova tarefa (SQLite)
exports.criarTarefa = async (req, res) => {
  try {
    const {
      titulo,
      descricao,
      cliente_id,
      usuario_responsavel_id,
      prioridade,
      status,
      data_vencimento
    } = req.body;

    if (!titulo) {
      return res.status(400).json({ message: 'Título é obrigatório' });
    }

    const result = run(
      `INSERT INTO tarefas (
         titulo, descricao, cliente_id, usuario_responsavel_id, prioridade, status, data_vencimento
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        titulo,
        descricao || '',
        cliente_id || null,
        usuario_responsavel_id || null,
        prioridade || 'MEDIA',
        status || 'PENDENTE',
        data_vencimento || null
      ]
    );

    const novaTarefa = get('SELECT * FROM tarefas WHERE id = ?', [result.lastInsertRowid]);

    registrarAuditoria(
      req.usuario?.id || 1,
      'CRIAR',
      novaTarefa.titulo,
      `Criou nova tarefa: ${novaTarefa.titulo}`,
      req.ip
    );

    res.status(201).json(novaTarefa);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({ message: 'Erro ao criar tarefa', error: error.message });
  }
};

// Atualizar tarefa (SQLite)
exports.atualizarTarefa = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descricao,
      cliente_id,
      usuario_responsavel_id,
      prioridade,
      status,
      data_vencimento
    } = req.body;

    const existente = get('SELECT * FROM tarefas WHERE id = ?', [id]);
    if (!existente) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    run(
      `UPDATE tarefas SET 
         titulo = COALESCE(?, titulo),
       descricao = COALESCE(?, descricao),
       cliente_id = COALESCE(?, cliente_id),
       usuario_responsavel_id = COALESCE(?, usuario_responsavel_id),
       prioridade = COALESCE(?, prioridade),
       status = COALESCE(?, status),
       data_vencimento = COALESCE(?, data_vencimento)
       WHERE id = ?`,
      [
        titulo,
        descricao,
        cliente_id,
        usuario_responsavel_id,
        prioridade,
        status,
        data_vencimento,
        id
      ]
    );

    const tarefaAtualizada = get('SELECT * FROM tarefas WHERE id = ?', [id]);

    registrarAuditoria(
      req.usuario?.id || 1,
      'EDITAR',
      tarefaAtualizada.titulo,
      `Atualizou tarefa: ${tarefaAtualizada.titulo}`,
      req.ip
    );

    res.json(tarefaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ message: 'Erro ao atualizar tarefa', error: error.message });
  }
};

// Excluir tarefa (SQLite)
exports.excluirTarefa = async (req, res) => {
  try {
    const { id } = req.params;

    const tarefa = get('SELECT * FROM tarefas WHERE id = ?', [id]);
    if (!tarefa) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }

    run('DELETE FROM tarefas WHERE id = ?', [id]);

    registrarAuditoria(
      req.usuario?.id || 1,
      'EXCLUIR',
      tarefa.titulo,
      `Excluiu tarefa: ${tarefa.titulo}`,
      req.ip
    );

    res.json({ message: 'Tarefa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
    res.status(500).json({ message: 'Erro ao excluir tarefa', error: error.message });
  }
};

// Estatísticas de tarefas (SQLite)
exports.estatisticasTarefas = async (req, res) => {
  try {
    const pendentes = get("SELECT COUNT(*) AS count FROM tarefas WHERE status = 'PENDENTE'").count;
    const emAndamento = get("SELECT COUNT(*) AS count FROM tarefas WHERE status = 'EM_ANDAMENTO'").count;
    const concluidas = get("SELECT COUNT(*) AS count FROM tarefas WHERE status = 'CONCLUIDA'").count;
    const atrasadas = get(
      "SELECT COUNT(*) AS count FROM tarefas WHERE status != 'CONCLUIDA' AND date(data_vencimento) < date('now')"
    ).count;

    res.json({
      pendentes,
      emAndamento,
      concluidas,
      atrasadas,
      total: pendentes + emAndamento + concluidas
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas', error: error.message });
  }
};
