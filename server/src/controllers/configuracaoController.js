const { query, get, run } = require('../config/database');

function registrarAuditoria(usuarioId, acao, entidade, detalhes, ip) {
  try {
    run(
      `INSERT INTO auditoria (usuario_id, acao, modulo, entidade, detalhes, ip)
       VALUES (?, ?, 'CONFIGURACOES', ?, ?, ?)`,
      [usuarioId, acao, entidade, detalhes, ip]
    );
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
}

// Listar todas as configurações
exports.listarConfiguracoes = async (req, res) => {
  try {
    const configuracoes = query('SELECT * FROM configuracoes ORDER BY chave ASC');
    res.json(configuracoes);
  } catch (error) {
    console.error('Erro ao listar configurações:', error);
    res.status(500).json({ message: 'Erro ao listar configurações', error: error.message });
  }
};

// Buscar configuração por chave
exports.buscarConfiguracao = async (req, res) => {
  try {
    const { chave } = req.params;
    const config = get('SELECT * FROM configuracoes WHERE chave = ?', [chave]);
    if (!config) {
      return res.status(404).json({ message: 'Configuração não encontrada' });
    }
    res.json(config);
  } catch (error) {
    console.error('Erro ao buscar configuração:', error);
    res.status(500).json({ message: 'Erro ao buscar configuração', error: error.message });
  }
};

// Criar ou atualizar configuração
exports.salvarConfiguracao = async (req, res) => {
  try {
    const { chave, valor, descricao } = req.body;

    const existente = get('SELECT * FROM configuracoes WHERE chave = ?', [chave]);
    if (existente) {
      const valorAnterior = existente.valor;
      run(
        `UPDATE configuracoes SET valor = ?, descricao = COALESCE(?, descricao), atualizado_por = ?, atualizado_em = datetime('now','localtime') WHERE chave = ?`,
        [valor, descricao, req.usuario?.id || null, chave]
      );

      registrarAuditoria(
        req.usuario?.id || 1,
        'EDITAR',
        chave,
        `Alterou configuração ${chave} de ${valorAnterior} para ${valor}`,
        req.ip
      );

      const atualizada = get('SELECT * FROM configuracoes WHERE chave = ?', [chave]);
      res.json(atualizada);
    } else {
      const result = run(
        `INSERT INTO configuracoes (chave, valor, descricao, atualizado_por) VALUES (?, ?, ?, ?)`,
        [chave, valor, descricao, req.usuario?.id || null]
      );

      registrarAuditoria(
        req.usuario?.id || 1,
        'CRIAR',
        chave,
        `Criou configuração ${chave} com valor ${valor}`,
        req.ip
      );

      const criada = get('SELECT * FROM configuracoes WHERE id = ?', [result.lastInsertRowid]);
      res.status(201).json(criada);
    }
  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    res.status(500).json({ message: 'Erro ao salvar configuração', error: error.message });
  }
};

// Buscar salário mínimo
exports.buscarSalarioMinimo = async (req, res) => {
  try {
    let config = get('SELECT * FROM configuracoes WHERE chave = ?', ['SALARIO_MINIMO']);
    if (!config) {
      run(
        `INSERT INTO configuracoes (chave, valor, descricao, atualizado_por) VALUES (?, ?, ?, ?)`,
        ['SALARIO_MINIMO', 1412.00, 'Valor do salário mínimo atual para cálculos financeiros', req.usuario?.id || null]
      );
      config = get('SELECT * FROM configuracoes WHERE chave = ?', ['SALARIO_MINIMO']);
    }
    res.json({ valor: config.valor });
  } catch (error) {
    console.error('Erro ao buscar salário mínimo:', error);
    res.status(500).json({ message: 'Erro ao buscar salário mínimo', error: error.message });
  }
};

// Atualizar salário mínimo
exports.atualizarSalarioMinimo = async (req, res) => {
  try {
    const { valor } = req.body;

    if (!valor || isNaN(valor) || valor <= 0) {
      return res.status(400).json({ message: 'Valor inválido para salário mínimo' });
    }

    const existente = get('SELECT * FROM configuracoes WHERE chave = ?', ['SALARIO_MINIMO']);
    const anterior = existente ? existente.valor : 0;

    if (existente) {
      run(
        `UPDATE configuracoes SET valor = ?, atualizado_por = ?, atualizado_em = datetime('now','localtime') WHERE chave = ?`,
        [parseFloat(valor), req.usuario?.id || null, 'SALARIO_MINIMO']
      );
    } else {
      run(
        `INSERT INTO configuracoes (chave, valor, descricao, atualizado_por) VALUES (?, ?, ?, ?)`,
        ['SALARIO_MINIMO', parseFloat(valor), 'Valor do salário mínimo atual para cálculos financeiros', req.usuario?.id || null]
      );
    }

    registrarAuditoria(
      req.usuario?.id || 1,
      'EDITAR',
      'Salário Mínimo',
      `Atualizou salário mínimo de R$ ${anterior} para R$ ${valor}`,
      req.ip
    );

    const config = get('SELECT * FROM configuracoes WHERE chave = ?', ['SALARIO_MINIMO']);
    res.json({ message: 'Salário mínimo atualizado com sucesso', valor: config.valor });
  } catch (error) {
    console.error('Erro ao atualizar salário mínimo:', error);
    res.status(500).json({ message: 'Erro ao atualizar salário mínimo', error: error.message });
  }
};
