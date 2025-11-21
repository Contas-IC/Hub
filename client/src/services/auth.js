import api from './api';

export const authService = {
  // Login
  async login(email, senha) {
    const response = await api.post('/auth/login', { email, senha });
    if (response.data.success) {
      const { token, usuario, permissoes } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));
      localStorage.setItem('permissoes', JSON.stringify(permissoes));
    }
    return response.data;
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('permissoes');
    window.location.href = '/login';
  },

  // Verificar se está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Obter usuário logado
  getUsuario() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
  },

  // Obter permissões
  getPermissoes() {
    const permissoes = localStorage.getItem('permissoes');
    return permissoes ? JSON.parse(permissoes) : [];
  },

  // Verificar se tem permissão em um módulo
  temPermissao(modulo) {
    const permissoes = this.getPermissoes();
    return permissoes.includes(modulo) || permissoes.includes('ADMIN');
  },

  // Verificar token
  async verificarToken() {
    try {
      const response = await api.get('/auth/verificar');
      return response.data;
    } catch (error) {
      this.logout();
      return null;
    }
  }
};
