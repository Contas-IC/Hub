// arquivo: server/src/controllers/certificadoController.js

const { query, get, run } = require('../config/database');

// Função auxiliar para registrar auditoria
const registrarAuditoria = (usuarioId, acao, modulo, entidade, detalhes, ip) => {
  try {
    run(`
      INSERT INTO auditoria (usuario_id, acao, modulo, entidade, detalhes, ip)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [usuarioId, acao, modulo, entidade, detalhes, ip]);
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
};

// ========================================
// LISTAR CERTIFICADOS
// ========================================
exports.listarCertificados = async (req, res) => {
  try {
    const { busca, status, vencimento } = req.query;

    let sql = `
      SELECT 
        cert.*,
        c.codigo as cliente_codigo,
        c.nome_empresa as cliente_nome,
        c.cnpj as cliente_cnpj
      FROM certificados cert
      LEFT JOIN clientes c ON cert.cliente_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (busca) {
      sql += ' AND (c.nome_empresa LIKE ? OR cert.nome_cliente LIKE ? OR cert.numero_serie LIKE ?)';
      const buscaParam = `%${busca}%`;
      params.push(buscaParam, buscaParam, buscaParam);
    }

    if (status) {
      sql += ' AND cert.status = ?';
      params.push(status);
    }

    // Filtro de vencimento
    if (vencimento === 'vencidos') {
      sql += " AND date(cert.data_vencimento) < date('now')";
    } else if (vencimento === 'proximos') {
      sql += " AND date(cert.data_vencimento) BETWEEN date('now') AND date('now', '+30 days')";
    }

    sql += ' ORDER BY cert.data_vencimento ASC';

    const certificados = query(sql, params);

    res.json(certificados);

  } catch (error) {
    console.error('Erro ao listar certificados:', error);
    res.status(500).json({ message: 'Erro ao listar certificados', error: error.message });
  }
};

// ========================================
// BUSCAR CERTIFICADOS POR CLIENTE
// ========================================
exports.buscarCertificadoPorCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;

    const certificados = query(`
      SELECT * FROM certificados
      WHERE cliente_id = ?
      ORDER BY data_vencimento DESC
    `, [clienteId]);

    res.json(certificados);

  } catch (error) {
    console.error('Erro ao buscar certificados:', error);
    res.status(500).json({ message: 'Erro ao buscar certificados', error: error.message });
  }
};

// ========================================
// BUSCAR CERTIFICADO POR ID
// ========================================
exports.buscarCertificadoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const certificado = get('SELECT * FROM certificados WHERE id = ?', [id]);

    if (!certificado) {
      return res.status(404).json({ message: 'Certificado não encontrado' });
    }

    res.json(certificado);

  } catch (error) {
    console.error('Erro ao buscar certificado:', error);
    res.status(500).json({ message: 'Erro ao buscar certificado', error: error.message });
  }
};

// ========================================
// CRIAR CERTIFICADO
// ========================================
exports.criarCertificado = async (req, res) => {
  try {
    const {
      cliente_id,
      nome_cliente,
      tipo_certificado,
      numero_serie,
      data_emissao,
      data_vencimento,
      status,
      arquivo_path,
      observacoes
    } = req.body;

    const result = run(`
      INSERT INTO certificados (
        cliente_id, nome_cliente, tipo_certificado, numero_serie,
        data_emissao, data_vencimento, status, arquivo_path, observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      cliente_id,
      nome_cliente,
      tipo_certificado,
      numero_serie,
      data_emissao,
      data_vencimento,
      status || 'ATIVO',
      arquivo_path,
      observacoes
    ]);

    // Buscar certificado criado
    const novoCertificado = get('SELECT * FROM certificados WHERE id = ?', [result.lastInsertRowid]);

    // Registrar auditoria
    registrarAuditoria(
      req.usuario?.id || 1,
      'CRIAR',
      'CERTIFICADOS',
      nome_cliente,
      `Criou certificado ${tipo_certificado} para ${nome_cliente}`,
      req.ip
    );

    res.status(201).json(novoCertificado);

  } catch (error) {
    console.error('Erro ao criar certificado:', error);
    res.status(500).json({ message: 'Erro ao criar certificado', error: error.message });
  }
};

// ========================================
// ATUALIZAR CERTIFICADO
// ========================================
exports.atualizarCertificado = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cliente_id,
      nome_cliente,
      tipo_certificado,
      numero_serie,
      data_emissao,
      data_vencimento,
      status,
      arquivo_path,
      observacoes
    } = req.body;

    // Verificar se existe
    const existe = get('SELECT * FROM certificados WHERE id = ?', [id]);
    if (!existe) {
      return res.status(404).json({ message: 'Certificado não encontrado' });
    }

    run(`
      UPDATE certificados SET
        cliente_id = ?,
        nome_cliente = ?,
        tipo_certificado = ?,
        numero_serie = ?,
        data_emissao = ?,
        data_vencimento = ?,
        status = ?,
        arquivo_path = ?,
        observacoes = ?,
        atualizado_em = datetime('now','localtime')
      WHERE id = ?
    `, [
      cliente_id,
      nome_cliente,
      tipo_certificado,
      numero_serie,
      data_emissao,
      data_vencimento,
      status,
      arquivo_path,
      observacoes,
      id
    ]);

    const certificadoAtualizado = get('SELECT * FROM certificados WHERE id = ?', [id]);

    // Registrar auditoria
    registrarAuditoria(
      req.usuario?.id || 1,
      'EDITAR',
      'CERTIFICADOS',
      nome_cliente,
      `Atualizou certificado ${tipo_certificado}`,
      req.ip
    );

    res.json(certificadoAtualizado);

  } catch (error) {
    console.error('Erro ao atualizar certificado:', error);
    res.status(500).json({ message: 'Erro ao atualizar certificado', error: error.message });
  }
};

// ========================================
// EXCLUIR CERTIFICADO
// ========================================
exports.excluirCertificado = async (req, res) => {
  try {
    const { id } = req.params;

    const certificado = get('SELECT * FROM certificados WHERE id = ?', [id]);
    if (!certificado) {
      return res.status(404).json({ message: 'Certificado não encontrado' });
    }

    run('DELETE FROM certificados WHERE id = ?', [id]);

    // Registrar auditoria
    registrarAuditoria(
      req.usuario?.id || 1,
      'EXCLUIR',
      'CERTIFICADOS',
      certificado.nome_cliente,
      `Excluiu certificado ${certificado.tipo_certificado}`,
      req.ip
    );

    res.json({ message: 'Certificado excluído com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir certificado:', error);
    res.status(500).json({ message: 'Erro ao excluir certificado', error: error.message });
  }
};

// ========================================
// ESTATÍSTICAS DE CERTIFICADOS
// ========================================
exports.estatisticasCertificados = async (req, res) => {
  try {
    const total = get('SELECT COUNT(*) as count FROM certificados').count;
    const ativos = get("SELECT COUNT(*) as count FROM certificados WHERE status = 'ATIVO'").count;
    const vencidos = get("SELECT COUNT(*) as count FROM certificados WHERE status = 'VENCIDO'").count;
    
    const proximoVencer = get(`
      SELECT COUNT(*) as count FROM certificados 
      WHERE status = 'ATIVO'
      AND date(data_vencimento) BETWEEN date('now') AND date('now', '+30 days')
    `).count;

    res.json({
      total,
      ativos,
      vencidos,
      proximoVencer
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas', error: error.message });
  }
};

module.exports = exports;
