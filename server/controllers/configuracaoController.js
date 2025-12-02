const Configuracao = require('../models/Configuracao');
const Auditoria = require('../models/Auditoria');

const registrarAuditoria = async (usuario, acao, entidade, detalhes, ip) => {
  try {
    await Auditoria.create({
      usuario,
      acao,
      modulo: 'CONFIGURACOES',
      entidade,
      detalhes,
      ip
    });
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
};

// Listar todas as configurações
exports.listarConfiguracoes = async (req, res) => {
  try {
    const configuracoes = await Configuracao.find()
      .populate('atualizadoPor', 'nome email')
      .sort({ chave: 1 });
    
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
    
    const config = await Configuracao.findOne({ chave });
    
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
    
    let config = await Configuracao.findOne({ chave });
    
    if (config) {
      // Atualizar
      const valorAnterior = config.valor;
      config.valor = valor;
      config.descricao = descricao || config.descricao;
      config.atualizadoPor = req.usuario.id;
      await config.save();
      
      await registrarAuditoria(
        req.usuario.id,
        'EDITAR',
        chave,
        `Alterou configuração ${chave} de ${valorAnterior} para ${valor}`,
        req.ip
      );
      
      res.json(config);
    } else {
      // Criar
      config = await Configuracao.create({
        chave,
        valor,
        descricao,
        atualizadoPor: req.usuario.id
      });
      
      await registrarAuditoria(
        req.usuario.id,
        'CRIAR',
        chave,
        `Criou configuração ${chave} com valor ${valor}`,
        req.ip
      );
      
      res.status(201).json(config);
    }
  } catch (error) {
    console.error('Erro ao salvar configuração:', error);
    res.status(500).json({ message: 'Erro ao salvar configuração', error: error.message });
  }
};

// Buscar salário mínimo
exports.buscarSalarioMinimo = async (req, res) => {
  try {
    let config = await Configuracao.findOne({ chave: 'SALARIO_MINIMO' });
    
    // Se não existir, criar com valor padrão
    if (!config) {
      config = await Configuracao.create({
        chave: 'SALARIO_MINIMO',
        valor: 1412.00,
        descricao: 'Valor do salário mínimo atual para cálculos financeiros',
        atualizadoPor: req.usuario.id
      });
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
    
    let config = await Configuracao.findOne({ chave: 'SALARIO_MINIMO' });
    
    const valorAnterior = config ? config.valor : 0;
    
    if (config) {
      config.valor = parseFloat(valor);
      config.atualizadoPor = req.usuario.id;
      await config.save();
    } else {
      config = await Configuracao.create({
        chave: 'SALARIO_MINIMO',
        valor: parseFloat(valor),
        descricao: 'Valor do salário mínimo atual para cálculos financeiros',
        atualizadoPor: req.usuario.id
      });
    }
    
    await registrarAuditoria(
      req.usuario.id,
      'EDITAR',
      'Salário Mínimo',
      `Atualizou salário mínimo de R$ ${valorAnterior} para R$ ${valor}`,
      req.ip
    );
    
    res.json({ 
      message: 'Salário mínimo atualizado com sucesso',
      valor: config.valor 
    });
  } catch (error) {
    console.error('Erro ao atualizar salário mínimo:', error);
    res.status(500).json({ message: 'Erro ao atualizar salário mínimo', error: error.message });
  }
};
