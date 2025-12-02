import { useState, useEffect } from 'react';
import { 
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Building2,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
  Download,
  Upload
} from 'lucide-react';
import LayoutSetor from '../../components/Layout/LayoutSetor';
import SidebarLegalizacao from './components/SidebarLegalizacao';
import ModalDetalhesCliente from './components/ModalDetalhesCliente';
import ModalCadastroCliente from './components/ModalCadastroCliente';
import api from '../../services/api';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modalCadastro, setModalCadastro] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  // Filtros
  const [filtros, setFiltros] = useState({
    busca: '',
    atividade: '',
    tipoApuracao: '',
    status: '',
    responsavelContabil: '',
    responsavelFiscal: '',
    responsavelDP: ''
  });

  const [paginacao, setPaginacao] = useState({
    paginaAtual: 1,
    itensPorPagina: 10,
    totalItens: 0
  });

  useEffect(() => {
    carregarClientes();
  }, [filtros, paginacao.paginaAtual]);

  const carregarClientes = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/clientes', {
        params: {
          busca: filtros.busca || undefined,
          status: filtros.status || undefined,
          regime: filtros.atividade || undefined,
          page: paginacao.paginaAtual,
          limit: paginacao.itensPorPagina
        }
      });

      const lista = (data?.dados || []).map((c) => ({
        id: c.id,
        codigo: c.codigo,
        nome: c.nome_empresa,
        cnpj: c.cnpj,
        telefone: c.telefone || '',
        atividade: c.regime || '',
        statusOnboarding: 'PENDENTE',
        dataEntrada: c.data_entrada_escritorio || c.data_cadastro
      }));

      setClientes(lista);
      setPaginacao({
        ...paginacao,
        totalItens: data?.total ?? lista.length
      });
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVisualizarCliente = (cliente) => {
    setClienteSelecionado(cliente);
    setModoEdicao(false);
    setModalDetalhes(true);
  };

  const handleEditarCliente = (cliente) => {
    setClienteSelecionado(cliente);
    setModoEdicao(true);
    setModalCadastro(true);
  };

  const handleNovoCliente = () => {
    setClienteSelecionado(null);
    setModoEdicao(false);
    setModalCadastro(true);
  };

  const handleExcluirCliente = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await api.delete(`/clientes/${id}`);
        alert('Cliente excluído com sucesso!');
        carregarClientes();
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        alert('Erro ao excluir cliente');
      }
    }
  };

  const handleSalvarCliente = async (dados) => {
    try {
      if (modoEdicao && clienteSelecionado) {
        await api.put(`/clientes/${clienteSelecionado.id}`,
          {
            codigo: dados.codigo,
            cnpj: dados.cnpj,
            nome_empresa: dados.razaoSocial || dados.nomeRazao || dados.nome,
            telefone: dados.telefone || null,
            email_principal: (dados.emails && dados.emails[0]?.email) || null,
            regime: dados.tipoApuracao || null,
            responsavel_legal: dados.responsavelLegal || null,
            data_abertura: dados.dataConstituicao || null,
            status: dados.status || 'ativa',
            data_entrada_escritorio: dados.dataEntrada || null
          }
        );
        alert('Cliente atualizado com sucesso!');
      } else {
        await api.post('/clientes', {
          codigo: dados.codigo,
          cnpj: dados.cnpj,
          nome_empresa: dados.razaoSocial || dados.nomeRazao || dados.nome,
          telefone: dados.telefone || null,
          email_principal: (dados.emails && dados.emails[0]?.email) || null,
          regime: dados.tipoApuracao || null,
          responsavel_legal: dados.responsavelLegal || null,
          data_abertura: dados.dataConstituicao || null,
          status: dados.status || 'ativa',
          data_entrada_escritorio: dados.dataEntrada || null
        });
        alert('Cliente cadastrado com sucesso!');
      }
      setModalCadastro(false);
      carregarClientes();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      CONCLUIDO: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Concluído' },
      EM_ANDAMENTO: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Em Andamento' },
      PENDENTE: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pendente' },
      AGUARDANDO_CLIENTE: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400', label: 'Aguardando Cliente' },
      DISPENSADO: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', label: 'Dispensado' }
    };
    return badges[status] || badges.PENDENTE;
  };

  const limparFiltros = () => {
    setFiltros({
      busca: '',
      atividade: '',
      tipoApuracao: '',
      status: '',
      responsavelContabil: '',
      responsavelFiscal: '',
      responsavelDP: ''
    });
  };

  return (
    <LayoutSetor sidebar={SidebarLegalizacao} titulo="Legalização - Clientes">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestão de Clientes
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Cadastre e gerencie empresas do setor de legalização
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => alert('Exportar para Excel')}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download size={20} />
              Exportar
            </button>
            <button
              onClick={handleNovoCliente}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Novo Cliente
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por nome, código ou CNPJ..."
                  value={filtros.busca}
                  onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Atividade */}
            <div>
              <select
                value={filtros.atividade}
                onChange={(e) => setFiltros({ ...filtros, atividade: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todas as Atividades</option>
                <option value="SERVICO">Serviço</option>
                <option value="COMERCIO">Comércio</option>
                <option value="INDUSTRIA">Indústria</option>
                <option value="CONSTRUTORA">Construtora</option>
              </select>
            </div>

            {/* Status Onboarding */}
            <div>
              <select
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todos os Status</option>
                <option value="PENDENTE">Pendente</option>
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="CONCLUIDO">Concluído</option>
                <option value="AGUARDANDO_CLIENTE">Aguardando Cliente</option>
              </select>
            </div>
          </div>

          {/* Botão Limpar Filtros */}
          {(filtros.busca || filtros.atividade || filtros.status) && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={limparFiltros}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
              >
                <X size={16} />
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Tabela de Clientes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    CNPJ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Atividade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Data Entrada
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando...</span>
                      </div>
                    </td>
                  </tr>
                ) : clientes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center">
                      <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Nenhum cliente encontrado
                      </p>
                      <button
                        onClick={handleNovoCliente}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Cadastrar primeiro cliente
                      </button>
                    </td>
                  </tr>
                ) : (
                  clientes.map((cliente) => {
                    const badge = getStatusBadge(cliente.statusOnboarding);
                    return (
                      <tr key={cliente.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {cliente.codigo}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {cliente.nome}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                <Phone size={12} />
                                {cliente.telefone}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {cliente.cnpj}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {cliente.atividade}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(cliente.dataEntrada).toLocaleDateString('pt-BR')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleVisualizarCliente(cliente)}
                              className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Visualizar"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleEditarCliente(cliente)}
                              className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleExcluirCliente(cliente.id)}
                              className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {clientes.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {clientes.length} de {paginacao.totalItens} clientes
              </div>
              <div className="flex gap-2">
                <button
                  disabled={paginacao.paginaAtual === 1}
                  onClick={() => setPaginacao({ ...paginacao, paginaAtual: paginacao.paginaAtual - 1 })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPaginacao({ ...paginacao, paginaAtual: paginacao.paginaAtual + 1 })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      {modalDetalhes && (
        <ModalDetalhesCliente
          cliente={clienteSelecionado}
          onClose={() => setModalDetalhes(false)}
          onEditar={() => {
            setModalDetalhes(false);
            handleEditarCliente(clienteSelecionado);
          }}
        />
      )}

      {modalCadastro && (
        <ModalCadastroCliente
          cliente={clienteSelecionado}
          modoEdicao={modoEdicao}
          onClose={() => setModalCadastro(false)}
          onSalvar={handleSalvarCliente}
        />
      )}
    </LayoutSetor>
  );
}
