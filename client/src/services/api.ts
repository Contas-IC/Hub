// arquivo: client/src/services/api.js

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========================================
// AUTENTICAÇÃO
// ========================================
export const auth = {
  login: (email, senha) => api.post('/auth/login', { email, senha }),
  verificarToken: () => api.get('/auth/verificar'),
  logout: () => api.post('/auth/logout')
};

// ========================================
// CLIENTES
// ========================================
export const clientes = {
  listar: (params) => api.get('/clientes', { params }),
  buscarPorId: (id) => api.get(`/clientes/${id}`),
  criar: (dados) => api.post('/clientes', dados),
  atualizar: (id, dados) => api.put(`/clientes/${id}`, dados),
  excluir: (id) => api.delete(`/clientes/${id}`),
  estatisticas: () => api.get('/clientes/estatisticas')
};

// ========================================
// LEGALIZAÇÃO
// ========================================
export const legalizacao = {
  estatisticas: () => api.get('/legalizacao/estatisticas'),
  listarEmpresas: (params) => api.get('/legalizacao/empresas', { params }),
  buscarEmpresa: (id) => api.get(`/legalizacao/empresas/${id}`),
  salvarProcesso: (clienteId, dados) => api.put(`/legalizacao/${clienteId}`, dados)
};

// ========================================
// FINANCEIROS
// ========================================
export const financeiros = {
  listar: (params) => api.get('/financeiros', { params }),
  buscarPorCliente: (clienteId) => api.get(`/financeiros/cliente/${clienteId}`),
  atualizar: (clienteId, dados) => api.put(`/financeiros/cliente/${clienteId}`, dados)
};

// ========================================
// CERTIFICADOS
// ========================================
export const certificados = {
  listar: (params) => api.get('/certificados', { params }),
  buscarPorCliente: (clienteId) => api.get(`/certificados/cliente/${clienteId}`),
  criar: (dados) => api.post('/certificados', dados),
  atualizar: (id, dados) => api.put(`/certificados/${id}`, dados),
  excluir: (id) => api.delete(`/certificados/${id}`),
  estatisticas: () => api.get('/certificados/estatisticas')
};

// ========================================
// TAREFAS
// ========================================
export const tarefas = {
  listar: (params) => api.get('/tarefas', { params }),
  buscarPorId: (id) => api.get(`/tarefas/${id}`),
  criar: (dados) => api.post('/tarefas', dados),
  atualizar: (id, dados) => api.put(`/tarefas/${id}`, dados),
  excluir: (id) => api.delete(`/tarefas/${id}`),
  estatisticas: () => api.get('/tarefas/estatisticas')
};

// ========================================
// CONFIGURAÇÕES
// ========================================
export const configuracoes = {
  listar: () => api.get('/configuracoes'),
  buscar: (chave) => api.get(`/configuracoes/${chave}`),
  salvar: (dados) => api.post('/configuracoes', dados),
  buscarSalarioMinimo: () => api.get('/configuracoes/salario-minimo/valor'),
  atualizarSalarioMinimo: (valor) => api.put('/configuracoes/salario-minimo/valor', { valor })
};

// ========================================
// AUDITORIA
// ========================================
export const auditoria = {
  listar: (params) => api.get('/auditoria', { params }),
  porUsuario: (usuarioId, params) => api.get(`/auditoria/usuario/${usuarioId}`, { params }),
  porModulo: (modulo, params) => api.get(`/auditoria/modulo/${modulo}`, { params })
};

export default api;
