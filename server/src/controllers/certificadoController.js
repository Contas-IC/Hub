// server/src/controllers/certificadoController.js

const { query, get, run } = require('../config/database');

// Listar todos os certificados
const listarCertificados = async (req, res) => {
  try {
    const { status, vencimento, clienteId } = req.query;
    
    let sql = `
      SELECT 
        c.id,
        c.cliente_id,
        c.tipo_certificado,
        c.numero_serie,
        c.data_emissao,
        c.data_vencimento,
        c.status,
        c.arquivo_path,
        c.observacoes,
        c.criado_em,
        c.atualizado_em,
        cl.codigo as cliente_codigo,
        COALESCE(cl.nome_empresa, c.nome_cliente) as cliente_nome,
        cl.cnpj as cliente_cnpj
      FROM certificados c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      WHERE 1=1
    `;
    
    const params = [];

    // Filtro por status
    if (status) {
      sql += ' AND c.status = ?';
      params.push(status);
    }

    // Filtro por cliente
    if (clienteId) {
      sql += ' AND c.cliente_id = ?';
      params.push(clienteId);
    }

    // Filtro por vencimento
    if (vencimento === 'vencidos') {
      sql += ' AND c.data_vencimento < DATE("now")';
    } else if (vencimento === 'proximo_vencer') {
      sql += ' AND c.data_vencimento BETWEEN DATE("now") AND DATE("now", "+30 days")';
    }

    sql += ' ORDER BY c.data_vencimento ASC';

    const certificados = query(sql, params);

    res.json({
      sucesso: true,
      dados: certificados,
      total: certificados.length
    });

  } catch (error) {
    console.error('Erro ao listar certificados:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar certificados',
      erro: error.message
    });
  }
};

// Buscar certificado por cliente
const buscarCertificadoPorCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;

    const sql = `
      SELECT 
        c.id,
        c.cliente_id,
        c.tipo_certificado,
        c.numero_serie,
        c.data_emissao,
        c.data_vencimento,
        c.status,
        c.arquivo_path,
        c.observacoes,
        c.criado_em,
        c.atualizado_em,
        cl.codigo as cliente_codigo,
        COALESCE(cl.nome_empresa, c.nome_cliente) as cliente_nome,
        cl.cnpj as cliente_cnpj
      FROM certificados c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      WHERE c.cliente_id = ?
      ORDER BY c.data_vencimento DESC
    `;
    const certificados = query(sql, [clienteId]);

    if (!certificados || certificados.length === 0) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Nenhum certificado encontrado para este cliente'
      });
    }

    res.json({
      sucesso: true,
      dados: certificados
    });

  } catch (error) {
    console.error('Erro ao buscar certificados do cliente:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar certificados do cliente',
      erro: error.message
    });
  }
};

// Atualizar certificado
const atualizarCertificado = async (req, res) => {
  try {
    const { clienteId } = req.params;
    const {
      tipo_certificado,
      numero_serie,
      data_emissao,
      data_vencimento,
      status,
      arquivo_path,
      observacoes
    } = req.body;

    // Validações
    if (!tipo_certificado || !data_vencimento) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Tipo de certificado e data de vencimento são obrigatórios'
      });
    }

    // Verificar se já existe certificado para este cliente
    const certificadoExistente = get('SELECT id FROM certificados WHERE cliente_id = ?', [clienteId]);

    let resultado;

    if (certificadoExistente) {
      // Atualizar certificado existente
      resultado = run(
        `
        UPDATE certificados SET
          tipo_certificado = ?,
          numero_serie = ?,
          data_emissao = ?,
          data_vencimento = ?,
          status = ?,
          arquivo_path = ?,
          observacoes = ?,
          atualizado_em = CURRENT_TIMESTAMP
        WHERE cliente_id = ?
        `,
        [
          tipo_certificado,
          numero_serie || null,
          data_emissao || null,
          data_vencimento,
          status || 'ativo',
          arquivo_path || null,
          observacoes || null,
          clienteId
        ]
      );

    } else {
      // Criar novo certificado
      resultado = run(
        `
        INSERT INTO certificados (
          cliente_id,
          tipo_certificado,
          numero_serie,
          data_emissao,
          data_vencimento,
          status,
          arquivo_path,
          observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          clienteId,
          tipo_certificado,
          numero_serie || null,
          data_emissao || null,
          data_vencimento,
          status || 'ativo',
          arquivo_path || null,
          observacoes || null
        ]
      );
    }

    // Buscar certificado atualizado
    const certificadoAtualizado = get(
      `
      SELECT 
        c.*,
        cl.codigo as cliente_codigo,
        COALESCE(cl.nome_empresa, c.nome_cliente) as cliente_nome,
        cl.cnpj as cliente_cnpj
      FROM certificados c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      WHERE c.cliente_id = ?
      `,
      [clienteId]
    );

    res.json({
      sucesso: true,
      mensagem: certificadoExistente ? 'Certificado atualizado com sucesso' : 'Certificado criado com sucesso',
      dados: certificadoAtualizado
    });

  } catch (error) {
    console.error('Erro ao atualizar certificado:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao atualizar certificado',
      erro: error.message
    });
  }
};

// Criar certificado avulso (sem cliente cadastrado)
const criarCertificadoAvulso = async (req, res) => {
  try {
    const {
      nome_cliente,
      tipo_certificado,
      numero_serie,
      data_emissao,
      data_vencimento,
      status,
      arquivo_path,
      observacoes
    } = req.body;

    if (!nome_cliente || !tipo_certificado || !data_vencimento) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Nome do cliente, tipo e vencimento são obrigatórios'
      });
    }

    // Garantir que a coluna nome_cliente exista (migração leve)
    try {
      const cols = query('PRAGMA table_info(certificados)');
      const temNomeCliente = Array.isArray(cols) && cols.some(c => c.name === 'nome_cliente');
      if (!temNomeCliente) {
        run('ALTER TABLE certificados ADD COLUMN nome_cliente TEXT');
      }
    } catch (e) {
      // Ignorar caso não consiga verificar/alterar; tentativa de inserir pode falhar e será reportada
      console.warn('Aviso: não foi possível garantir coluna nome_cliente:', e.message);
    }

    const resultado = run(
      `
      INSERT INTO certificados (
        cliente_id,
        nome_cliente,
        tipo_certificado,
        numero_serie,
        data_emissao,
        data_vencimento,
        status,
        arquivo_path,
        observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        null,
        nome_cliente,
        tipo_certificado,
        numero_serie || null,
        data_emissao || null,
        data_vencimento,
        status || 'ativo',
        arquivo_path || null,
        observacoes || null
      ]
    );

    const novo = get(
      `
      SELECT 
        c.id, c.cliente_id, c.nome_cliente, c.tipo_certificado, c.numero_serie,
        c.data_emissao, c.data_vencimento, c.status, c.arquivo_path, c.observacoes,
        c.criado_em, c.atualizado_em
      FROM certificados c
      WHERE c.id = ?
      `,
      [resultado.lastInsertRowid || resultado.lastID]
    );

    res.json({
      sucesso: true,
      mensagem: 'Certificado avulso criado com sucesso',
      dados: novo
    });

  } catch (error) {
    console.error('Erro ao criar certificado avulso:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao criar certificado avulso',
      erro: error.message
    });
  }
};

// Estatísticas de certificados
const estatisticasCertificados = async (req, res) => {
  try {
    // Total de certificados
    const { total } = get('SELECT COUNT(*) as total FROM certificados');

    // Certificados ativos
    const { total: ativos } = get('SELECT COUNT(*) as total FROM certificados WHERE status = "ativo"');

    // Certificados vencidos
    const { total: vencidos } = get('SELECT COUNT(*) as total FROM certificados WHERE data_vencimento < DATE("now")');

    // Certificados próximos a vencer (30 dias)
    const { total: proximoVencer } = get(
      `
      SELECT COUNT(*) as total 
      FROM certificados 
      WHERE data_vencimento BETWEEN DATE("now") AND DATE("now", "+30 days")
      `
    );

    // Certificados por tipo
    const porTipo = query(
      `
      SELECT tipo_certificado, COUNT(*) as quantidade
      FROM certificados
      GROUP BY tipo_certificado
      `
    );

    // Certificados vencendo nos próximos dias (lista)
    const vencendoEmBreve = query(
      `
      SELECT 
        c.id,
        c.tipo_certificado,
        c.data_vencimento,
        COALESCE(cl.nome_empresa, c.nome_cliente) as cliente_nome,
        cl.cnpj as cliente_cnpj
      FROM certificados c
      LEFT JOIN clientes cl ON c.cliente_id = cl.id
      WHERE c.data_vencimento BETWEEN DATE("now") AND DATE("now", "+30 days")
      ORDER BY c.data_vencimento ASC
      LIMIT 10
      `
    );

    res.json({
      sucesso: true,
      dados: {
        total,
        ativos,
        vencidos,
        proximoVencer,
        porTipo,
        vencendoEmBreve
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas de certificados:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar estatísticas de certificados',
      erro: error.message
    });
  }
};

module.exports = {
  listarCertificados,
  buscarCertificadoPorCliente,
  atualizarCertificado,
  criarCertificadoAvulso,
  estatisticasCertificados
};
