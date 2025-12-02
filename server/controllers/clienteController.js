const Cliente = require('../models/Cliente');
const Financeiro = require('../models/Financeiro');
const Certificado = require('../models/Certificado');
const Auditoria = require('../models/Auditoria');

// Função auxiliar para registrar auditoria
const registrarAuditoria = async (usuario, acao, modulo, entidade, detalhes, ip) => {
  try {
    await Auditoria.create({
      usuario,
      acao,
      modulo,
      entidade,
      detalhes,
      ip
    });
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
};

// Listar todos os clientes com filtros
exports.listarClientes = async (req, res) => {
  try {
    const { busca, status, atividade, tipoApuracao, page = 1, limit = 50 } = req.query;
    
    const query = {};
    
    // Filtro de busca
    if (busca) {
      query.$or = [
        { nome: { $regex: busca, $options: 'i' } },
        { cnpj: { $regex: busca.replace(/\D/g, ''), $options: 'i' } },
        { codigo: { $regex: busca, $options: 'i' } }
      ];
    }
    
    // Outros filtros
    if (status) query.status = status;
    if (atividade) query.atividade = atividade;
    if (tipoApuracao) query.tipoApuracao = tipoApuracao;
    
    const clientes = await Cliente.find(query)
      .sort({ dataEntrada: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    const count = await Cliente.countDocuments(query);
    
    res.json({
      clientes,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
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
    const cliente = await Cliente.findById(id);
    
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    
    // Registrar auditoria
    await registrarAuditoria(
      req.usuario.id,
      'VISUALIZAR',
      'CLIENTES',
      cliente.nome,
      `Visualizou dados do cliente ${cliente.codigo}`,
      req.ip
    );
    
    res.json(cliente);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ message: 'Erro ao buscar cliente', error: error.message });
  }
};

// Criar novo cliente
exports.criarCliente = async (req, res) => {
  try {
    const dadosCliente = {
      ...req.body,
      criadoPor: req.usuario.id
    };
    
    // Validar se CNPJ já existe
    const clienteExistente = await Cliente.findOne({ cnpj: dadosCliente.cnpj });
    if (clienteExistente) {
      return res.status(400).json({ message: 'CNPJ já cadastrado' });
    }
    
    // Validar se código já existe
    const codigoExistente = await Cliente.findOne({ codigo: dadosCliente.codigo });
    if (codigoExistente) {
      return res.status(400).json({ message: 'Código já cadastrado' });
    }
    
    const novoCliente = await Cliente.create(dadosCliente);
    
    // Criar registros relacionados vazios
    await Financeiro.create({ 
      cliente: novoCliente._id,
      criadoPor: req.usuario.id
    });
    
    await Certificado.create({ 
      cliente: novoCliente._id,
      temCertificado: false,
      criadoPor: req.usuario.id
    });
    
    // Registrar auditoria
    await registrarAuditoria(
      req.usuario.id,
      'CRIAR',
      'CLIENTES',
      novoCliente.nome,
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
    const dadosAtualizacao = {
      ...req.body,
      atualizadoPor: req.usuario.id
    };
    
    const clienteAtualizado = await Cliente.findByIdAndUpdate(
      id,
      dadosAtualizacao,
      { new: true, runValidators: true }
    );
    
    if (!clienteAtualizado) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    
    // Registrar auditoria
    await registrarAuditoria(
      req.usuario.id,
      'EDITAR',
      'CLIENTES',
      clienteAtualizado.nome,
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
    
    const cliente = await Cliente.findByIdAndDelete(id);
    
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    
    // Excluir registros relacionados
    await Financeiro.deleteOne({ cliente: id });
    await Certificado.deleteOne({ cliente: id });
    
    // Registrar auditoria
    await registrarAuditoria(
      req.usuario.id,
      'EXCLUIR',
      'CLIENTES',
      cliente.nome,
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
    const total = await Cliente.countDocuments();
    const ativos = await Cliente.countDocuments({ status: 'ATIVO' });
    const inativos = await Cliente.countDocuments({ status: 'INATIVO' });
    const baixados = await Cliente.countDocuments({ status: 'BAIXADA' });
    
    // Clientes entrados nos últimos 30 dias
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - 30);
    const entradas = await Cliente.countDocuments({ 
      dataEntrada: { $gte: dataLimite } 
    });
    
    res.json({
      total,
      ativos,
      inativos,
      baixados,
      entradas
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas', error: error.message });
  }
};
