const Financeiro = require('../../models/Financeiro');
const Cliente = require('../../models/Cliente');
const Auditoria = require('../../models/Auditoria');

const registrarAuditoria = async (usuario, acao, modulo, entidade, detalhes, ip) => {
  try {
    await Auditoria.create({ usuario, acao, modulo, entidade, detalhes, ip });
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
};

// Listar todos os financeiros com dados dos clientes
exports.listarFinanceiros = async (req, res) => {
  try {
    const { busca } = req.query;
    
    let query = {};
    
    if (busca) {
      const clientes = await Cliente.find({
        $or: [
          { nome: { $regex: busca, $options: 'i' } },
          { cnpj: { $regex: busca, $options: 'i' } },
          { codigo: { $regex: busca, $options: 'i' } }
        ]
      }).select('_id');
      
      const clienteIds = clientes.map(c => c._id);
      query.cliente = { $in: clienteIds };
    }
    
    const financeiros = await Financeiro.find(query)
      .populate('cliente', 'codigo nome cnpj')
      .sort({ updatedAt: -1 });
    
    res.json(financeiros);
  } catch (error) {
    console.error('Erro ao listar financeiros:', error);
    res.status(500).json({ message: 'Erro ao listar financeiros', error: error.message });
  }
};

// Buscar financeiro por ID do cliente
exports.buscarFinanceiroPorCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;
    
    let financeiro = await Financeiro.findOne({ cliente: clienteId })
      .populate('cliente', 'codigo nome cnpj');
    
    // Se não existir, criar
    if (!financeiro) {
      financeiro = await Financeiro.create({
        cliente: clienteId,
        criadoPor: req.usuario.id
      });
      financeiro = await Financeiro.findById(financeiro._id)
        .populate('cliente', 'codigo nome cnpj');
    }
    
    res.json(financeiro);
  } catch (error) {
    console.error('Erro ao buscar financeiro:', error);
    res.status(500).json({ message: 'Erro ao buscar financeiro', error: error.message });
  }
};

// Atualizar dados financeiros
exports.atualizarFinanceiro = async (req, res) => {
  try {
    const { clienteId } = req.params;
    const dadosAtualizacao = {
      ...req.body,
      atualizadoPor: req.usuario.id
    };
    
    let financeiro = await Financeiro.findOneAndUpdate(
      { cliente: clienteId },
      dadosAtualizacao,
      { new: true, upsert: true, runValidators: true }
    ).populate('cliente', 'codigo nome cnpj');
    
    // Registrar auditoria
    await registrarAuditoria(
      req.usuario.id,
      'EDITAR',
      'FINANCEIROS',
      financeiro.cliente.nome,
      `Atualizou dados financeiros do cliente ${financeiro.cliente.codigo}`,
      req.ip
    );
    
    res.json(financeiro);
  } catch (error) {
    console.error('Erro ao atualizar financeiro:', error);
    res.status(500).json({ message: 'Erro ao atualizar financeiro', error: error.message });
  }
};
