// Serviço de Auditoria - Registra todas as ações do sistema
class AuditoriaService {
  constructor() {
    this.logs = this.carregarLogs();
  }

  // Carrega logs do localStorage (ou futuramente do backend)
  carregarLogs() {
    const logs = localStorage.getItem('auditoria_legalizacao');
    return logs ? JSON.parse(logs) : [];
  }

  // Salva logs no localStorage (ou futuramente no backend)
  salvarLogs() {
    localStorage.setItem('auditoria_legalizacao', JSON.stringify(this.logs));
  }

  // Registra uma nova ação
  registrar(dados) {
    const log = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      usuario: dados.usuario || this.getUsuarioAtual(),
      acao: dados.acao, // 'CRIAR', 'EDITAR', 'EXCLUIR', 'VISUALIZAR'
      modulo: dados.modulo, // 'CLIENTES', 'FINANCEIROS', 'CERTIFICADOS', 'AGENDA'
      entidade: dados.entidade, // Nome do cliente/empresa/tarefa
      detalhes: dados.detalhes || '',
      ip: '192.168.1.1' // Pode ser obtido do backend
    };

    this.logs.unshift(log); // Adiciona no início
    
    // Mantém apenas os últimos 100 registros
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100);
    }

    this.salvarLogs();

    // TODO: Enviar para o backend
    // await api.post('/auditoria', log);

    return log;
  }

  // Obtém usuário atual (do localStorage ou contexto)
  getUsuarioAtual() {
    const user = localStorage.getItem('usuario');
    if (user) {
      const userData = JSON.parse(user);
      return userData.nome || userData.email || 'Usuário';
    }
    return 'Sistema';
  }

  // Obtém logs com filtros
  getLogs(filtros = {}) {
    let logsFiltrados = [...this.logs]; // CORRIGIDO: era "logsF filtrados"

    if (filtros.modulo) {
      logsFiltrados = logsFiltrados.filter(log => log.modulo === filtros.modulo);
    }

    if (filtros.acao) {
      logsFiltrados = logsFiltrados.filter(log => log.acao === filtros.acao);
    }

    if (filtros.usuario) {
      logsFiltrados = logsFiltrados.filter(log => 
        log.usuario.toLowerCase().includes(filtros.usuario.toLowerCase())
      );
    }

    if (filtros.limite) {
      logsFiltrados = logsFiltrados.slice(0, filtros.limite);
    }

    return logsFiltrados;
  }

  // Limpa todos os logs
  limparLogs() {
    this.logs = [];
    this.salvarLogs();
  }
}

export const auditoriaService = new AuditoriaService();
