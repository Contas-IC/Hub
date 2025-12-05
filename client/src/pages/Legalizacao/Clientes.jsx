// arquivo: client/src/pages/Legalizacao/Clientes.jsx

import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import ModalCadastroCliente from './components/ModalCadastroCliente';
import ModalDetalhesCliente from './components/ModalDetalhesCliente';
import { clientes } from '../../services/api';

export default function Clientes() {
  const [clientesLista, setClientesLista] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  // Filtros
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [filtroAtividade, setFiltroAtividade] = useState('TODAS');

  useEffect(() => {
    carregarClientes();
  }, [filtroStatus, filtroAtividade]);

  const carregarClientes = async () => {
    try {
      setLoading(true);
      setErro('');

      const params = {};
      if (busca) params.busca = busca;
      if (filtroStatus !== 'TODOS') params.status = filtroStatus;
      if (filtroAtividade !== 'TODAS') params.atividade = filtroAtividade;

      const response = await clientes.listar(params);
      setClientesLista(response.data.clientes || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setErro('Erro ao carregar clientes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    carregarClientes();
  };

  const handleAbrirModalCadastro = () => {
    setClienteSelecionado(null);
    setModoEdicao(false);
    setModalCadastroAberto(true);
  };

  const handleAbrirModalEdicao = async (cliente) => {
    try {
      const resp = await clientes.buscarPorId(cliente.id);
      setClienteSelecionado(resp.data);
      setModoEdicao(true);
      setModalCadastroAberto(true);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      alert('Erro ao carregar dados do cliente');
    }
  };

  const handleAbrirDetalhes = async (cliente) => {
    try {
      const resp = await clientes.buscarPorId(cliente.id);
      setClienteSelecionado(resp.data);
      setModalDetalhesAberto(true);
    } catch (error) {
      console.error('Erro ao buscar detalhes do cliente:', error);
      alert('Erro ao carregar detalhes do cliente');
    }
  };

  const handleSalvarCliente = async (dadosForm) => {
    try {
      const payload = {
        codigo: dadosForm.codigo,
        cnpj: dadosForm.cnpj,
        nome_empresa: dadosForm.nome,
        nome_fantasia: dadosForm.nomeFantasia,
        contato: dadosForm.telefone || '',
        telefone: dadosForm.telefone || '',
        email_principal: dadosForm.emails?.[0]?.email || '',
        regime: dadosForm.regime || '',
        responsavel_legal: dadosForm.responsavelLegal,
        data_abertura: dadosForm.dataAbertura || null,
        data_constituicao: dadosForm.dataConstituicao,
        quantidade_funcionarios: dadosForm.quantidadeFuncionarios || 0,
        tipo_apuracao: dadosForm.tipoApuracao,
        atividade: dadosForm.atividade,
        tipo_entrada: dadosForm.tipoEntrada || 'CLIENTE_NOVO',
        data_entrada_escritorio: dadosForm.dataEntrada || null,
        grau_dificuldade: dadosForm.grauDificuldade || 'MEDIO',
        status: dadosForm.status || 'ATIVO',
        data_baixada: dadosForm.dataBaixa || null,
        data_inativacao: dadosForm.dataInativacao || null,
        observacoes: dadosForm.observacoes || '',
        emails: dadosForm.emails || [],
        localizacoes: dadosForm.localizacoes || [],
        setores: dadosForm.setores || []
      };

      if (modoEdicao && clienteSelecionado) {
        await clientes.atualizar(clienteSelecionado.id, payload);
        alert('Cliente atualizado com sucesso!');
      } else {
        await clientes.criar(payload);
        alert('Cliente cadastrado com sucesso!');
      }

      setModalCadastroAberto(false);
      setClienteSelecionado(null);
      await carregarClientes();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert(error.response?.data?.message || 'Erro ao salvar cliente');
    }
  };

  const handleExcluirCliente = async (cliente) => {
    if (!confirm(`Tem certeza que deseja excluir o cliente ${cliente.nome_empresa}?`)) {
      return;
    }

    try {
      await clientes.excluir(cliente.id);
      alert('Cliente excluído com sucesso!');
      await carregarClientes();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      alert(error.response?.data?.message || 'Erro ao excluir cliente');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      ATIVO: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      INATIVO: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      BAIXADA: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return map[status] || map.ATIVO;
  };

  const getAtividadeLabel = (atividade) => {
    const atividades = {
      SERVICO: 'Serviço',
      COMERCIO: 'Comércio',
      INDUSTRIA: 'Indústria',
      AGRICULTURA_PECUARIA: 'Agricultura/Pecuária',
      COM_E_IND: 'Comércio e Indústria',
      COM_E_SERV: 'Comércio e Serviço',
      COM_IND_E_SERV: 'Comércio, Indústria e Serviço',
      CONSTRUTORA: 'Construtora',
      ESCOLA: 'Escola',
      IMOBILIARIA: 'Imobiliária'
    };
    return atividades[atividade] || atividade || 'N/A';
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return '-';
    return new Date(dataISO).toLocaleDateString('pt-BR');
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
                Gestão de Clientes
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {clientesLista.length} cliente{clientesLista.length !== 1 ? 's' : ''} cadastrado
                {clientesLista.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={handleAbrirModalCadastro}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Novo Cliente
            </button>
          </div>
        </div>

        {/* Filtros e busca */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleBuscar} className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar por nome, CNPJ ou código..."
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
                  <option value="INATIVO">Inativo</option>
                  <option value="BAIXADA">Baixada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Atividade
                </label>
                <select
                  value={filtroAtividade}
                  onChange={(e) => setFiltroAtividade(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value="TODAS">Todas</option>
                  <option value="SERVICO">Serviço</option>
                  <option value="COMERCIO">Comércio</option>
                  <option value="INDUSTRIA">Indústria</option>
                  <option value="AGRICULTURA_PECUARIA">Agricultura/Pecuária</option>
                  <option value="CONSTRUTORA">Construtora</option>
                  <option value="ESCOLA">Escola</option>
                  <option value="IMOBILIARIA">Imobiliária</option>
                </select>
              </div>
            </div>
          </form>

          {erro && (
            <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
              {erro}
            </div>
          )}
        </div>

        {/* Tabela de clientes */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    CNPJ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Atividade
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Data Entrada
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {clientesLista.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {c.codigo}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {c.nome_empresa}
                      </div>
                      {c.nome_fantasia && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {c.nome_fantasia}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {c.cnpj}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {getAtividadeLabel(c.atividade)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                          c.status
                        )}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {formatarData(c.data_entrada_escritorio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleAbrirDetalhes(c)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAbrirModalEdicao(c)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExcluirCliente(c)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {clientesLista.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhum cliente encontrado
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modais */}
      {modalCadastroAberto && (
        <ModalCadastroCliente
          cliente={clienteSelecionado}
          modoEdicao={modoEdicao}
          onClose={() => {
            setModalCadastroAberto(false);
            setClienteSelecionado(null);
          }}
          onSalvar={handleSalvarCliente}
        />
      )}

      {modalDetalhesAberto && clienteSelecionado && (
        <ModalDetalhesCliente
          cliente={clienteSelecionado}
          onClose={() => {
            setModalDetalhesAberto(false);
            setClienteSelecionado(null);
          }}
          onEditar={() => {
            setModalDetalhesAberto(false);
            setModoEdicao(true);
            setModalCadastroAberto(true);
          }}
        />
      )}
    </div>
  );
}
