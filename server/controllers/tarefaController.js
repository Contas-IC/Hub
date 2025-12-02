    const Tarefa = require('../models/Tarefa');
const Auditoria = require('../models/Auditoria');

const registrarAuditoria = async (usuario, acao, modulo, entidade, detalhes, ip) => {
  try {
    await Auditoria.create({ usuario, acao, modulo, entidade, detalhes, ip });
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
};

// Listar todas as tarefas
exports.listarTarefas = async (req, res) => {
  try {
    const { status, tipo, dataInicio, dataFim } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (tipo) query.tipo = tipo;
    
    if (dataInicio || dataFim) {
      query.data = {};
      if (dataInicio) query.data.$gte = new Date(dataInicio);
      if (dataFim) query.data.$lte = new Date(dataFim);
    }
    
    const tarefas = await Tarefa.find(query)
      .sort({ data: 1, hora: 1 });
    
    res.json(tarefas);
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    res.status(500).json({ message: 'Erro ao listar tarefas', error: error.message });
  }
};

// Buscar tarefa por ID
exports.buscarTarefaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const tarefa = await Tarefa.findById(id);
    
    if (!tarefa) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }
    
    res.json(tarefa);
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error);
    res.status(500).json({ message: 'Erro ao buscar tarefa', error: error.message });
  }
};

// Criar nova tarefa
exports.criarTarefa = async (req, res) => {
  try {
    const dadosTarefa = {
      ...req.body,
      criadoPor: req.usuario.id
    };
    
    const novaTarefa = await Tarefa.create(dadosTarefa);
    
    // Registrar auditoria
    await registrarAuditoria(
      req.usuario.id,
      'CRIAR',
      'AGENDA',
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

// Atualizar tarefa
exports.atualizarTarefa = async (req, res) => {
  try {
    const { id } = req.params;
    const dadosAtualizacao = {
      ...req.body,
      atualizadoPor: req.usuario.id
    };
    
    const tarefaAtualizada = await Tarefa.findByIdAndUpdate(
      id,
      dadosAtualizacao,
      { new: true, runValidators: true }
    );
    
    if (!tarefaAtualizada) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }
    
    // Registrar auditoria
    await registrarAuditoria(
      req.usuario.id,
      'EDITAR',
      'AGENDA',
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

// Excluir tarefa
exports.excluirTarefa = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tarefa = await Tarefa.findByIdAndDelete(id);
    
    if (!tarefa) {
      return res.status(404).json({ message: 'Tarefa não encontrada' });
    }
    
    // Registrar auditoria
    await registrarAuditoria(
      req.usuario.id,
      'EXCLUIR',
      'AGENDA',
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

// Estatísticas de tarefas
exports.estatisticasTarefas = async (req, res) => {
  try {
    const pendentes = await Tarefa.countDocuments({ status: 'PENDENTE' });
    const concluidas = await Tarefa.countDocuments({ status: 'CONCLUIDO' });
    const atrasadas = await Tarefa.countDocuments({ status: 'ATRASADO' });
    
    res.json({
      pendentes,
      concluidas,
      atrasadas,
      total: pendentes + concluidas + atrasadas
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas', error: error.message });
  }
};
