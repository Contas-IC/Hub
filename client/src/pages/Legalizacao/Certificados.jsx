// arquivo: client/src/pages/Legalizacao/Certificados.jsx

import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Eye, Trash2, Award, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import ModalNovoCertificado from './components/ModalNovoCertificado';
import ModalDetalhesCertificado from './components/ModalDetalhesCertificado';
import ModalGerenciarCertificado from './components/ModalGerenciarCertificado';
import { certificados } from '../../services/api';

export default function Certificados() {
  const [certificadosLista, setCertificadosLista] = useState([]);
  const [certificadoSelecionado, setCertificadoSelecionado] = useState(null);
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [modalGerenciarAberto, setModalGerenciarAberto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    vencidos: 0,
    proximoVencer: 0
  });

  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [filtroVencimento, setFiltroVencimento] = useState('TODOS');

  useEffect(() => {
    carregarDados();
  }, [filtroStatus, filtroVencimento]);

  const carregarDados = async () => {
    try {
      setLoading(true);

      const params = {};
      if (busca) params.busca = busca;
      if (filtroStatus !== 'TODOS') params.status = filtroStatus;
      if (filtroVencimento !== 'TODOS') params.vencimento = filtroVencimento;

      const [certResponse, statsResponse] = await Promise.all([
        certificados.listar(params),
        certificados.estatisticas()
      ]);

      setCertificadosLista(certResponse.data || []);
      setStats(statsResponse.data || { total: 0, ativos: 0, vencidos: 0, proximoVencer: 0 });

    } catch (error) {
      console.error('Erro ao carregar certificados:', error);
      alert('Erro ao carregar dados dos certificados');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    carregarDados();
  };

  const handleAbrirModalNovo = () => {
    setCertificadoSelecionado(null);
    setModalNovoAberto(true);
  };

  const handleAbrirDetalhes = (cert) => {
    setCertificadoSelecionado(cert);
    setModalDetalhesAberto(true);
  };

  const handleAbrirGerenciar = (cert) => {
    setCertificadoSelecionado(cert);
    setModalGerenciarAberto(true);
  };

  const handleSalvarCertificado = async (dados) => {
    try {
      if (certificadoSelecionado) {
        await certificados.atualizar(certificadoSelecionado.id, dados);
        alert('Certificado atualizado com sucesso!');
      } else {
        await certificados.criar(dados);
        alert('Certificado cadastrado com sucesso!');
      }

      setModalNovoAberto(false);
      setModalGerenciarAberto(false);
      carregarDados();

    } catch (error) {
      console.error('Erro ao salvar certificado:', error);
      alert(error.response?.data?.message || 'Erro ao salvar certificado');
    }
  };

  const handleExcluirCertificado = async (cert) => {
    if (!confirm(`Tem certeza que deseja excluir o certificado de ${cert.nome_cliente}?`)) {
      return;
    }

    try {
      await certificados.excluir(cert.id);
      alert('Certificado excluído com sucesso!');
      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir certificado:', error);
      alert(error.response?.data?.message || 'Erro ao excluir certificado');
    }
  };

  const getStatusBadge = (cert) => {
    const dataVencimento = new Date(cert.data_vencimento);
    const hoje = new Date();
    const diasRestantes = Math.ceil((dataVencimento - hoje) / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) {
      return {
        label: 'Vencido',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        icon: XCircle
      };
    } else if (diasRestantes <= 30) {
      return {
        label: 'Vence em breve',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: Clock
      };
    } else {
      return {
        label: 'Ativo',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle
      };
    }
  };

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Gestão de Certificados Digitais
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gerencie e monitore os certificados digitais dos clientes
              </p>
            </div>
            <button
              onClick={handleAbrirModalNovo}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Novo Certificado
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total de Certificados</h3>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.ativos}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Certificados Ativos</h3>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.proximoVencer}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vencendo (30 dias)</h3>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{stats.vencidos}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Certificados Vencidos</h3>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleBuscar} className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, tipo ou número de série..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Buscar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value="TODOS">Todos</option>
                  <option value="ATIVO">Ativo</option>
                  <option value="VENCIDO">Vencido</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vencimento
                </label>
                <select
                  value={filtroVencimento}
                  onChange={(e) => setFiltroVencimento(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value="TODOS">Todos</option>
                  <option value="vencidos">Vencidos</option>
                  <option value="proximos">Próximos 30 dias</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Tabela de Certificados */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Cliente</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Nº Série</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Emissão</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Vencimento</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {certificadosLista.map((cert) => {
                  const badge = getStatusBadge(cert);
                  const Icon = badge.icon;

                  return (
                    <tr key={cert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {cert.nome_cliente}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {cert.cliente_codigo}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {cert.tipo_certificado || 'e-CNPJ'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 dark:text-gray-400">
                        {cert.numero_serie || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatarData(cert.data_emissao)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {formatarData(cert.data_vencimento)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${badge.className}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleAbrirDetalhes(cert)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAbrirGerenciar(cert)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                            title="Gerenciar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleExcluirCertificado(cert)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {certificadosLista.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhum certificado encontrado
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modais */}
      {modalNovoAberto && (
        <ModalNovoCertificado
          onClose={() => setModalNovoAberto(false)}
          onSalvar={handleSalvarCertificado}
        />
      )}

      {modalDetalhesAberto && certificadoSelecionado && (
        <ModalDetalhesCertificado
          certificado={certificadoSelecionado}
          onClose={() => setModalDetalhesAberto(false)}
        />
      )}

      {modalGerenciarAberto && certificadoSelecionado && (
        <ModalGerenciarCertificado
          certificado={certificadoSelecionado}
          onClose={() => setModalGerenciarAberto(false)}
          onSalvar={handleSalvarCertificado}
        />
      )}
    </div>
  );
}
