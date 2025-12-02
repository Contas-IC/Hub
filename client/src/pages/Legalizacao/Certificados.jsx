import { useState, useEffect } from 'react';
import { 
  Award, Search, Filter, Plus, Eye, Edit, AlertTriangle, 
  CheckCircle, Clock, Calendar, FileText, Download, Upload, X
} from 'lucide-react';
import LayoutSetor from '../../components/Layout/LayoutSetor';
import SidebarLegalizacao from './components/SidebarLegalizacao';
import ModalDetalhesCertificado from './components/ModalDetalhesCertificado';
import ModalGerenciarCertificado from './components/ModalGerenciarCertificado';
import ModalNovoCertificado from './components/ModalNovoCertificado';
import api from '../../services/api';

export default function Certificados() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modalGerenciar, setModalGerenciar] = useState(false);
  const [modalNovo, setModalNovo] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [filtros, setFiltros] = useState({
    busca: '',
    status: '',
    tipoEmissao: ''
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    vencendo: 0,
    vencidos: 0,
    semCertificado: 0
  });

  useEffect(() => {
    carregarDados();
  }, [filtros]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      // Buscar todos os clientes
      const clientesResp = await api.get('/clientes', {
        params: {
          busca: filtros.busca || undefined
        }
      });
      const clientesDados = (clientesResp.data?.dados || []).map((c) => ({
        id: c.id,
        codigo: c.codigo || `CLI-${String(c.id).padStart(3, '0')}`,
        nome: c.nome_empresa,
        cnpj: c.cnpj,
        certificado: {
          temCertificado: false,
          tipo: '',
          emissor: '-',
          dataEmissao: '',
          dataVencimento: '',
          senha: '',
          responsavel: '',
          observacoes: ''
        }
      }));

      // Buscar certificados e mesclar
      const certResp = await api.get('/certificados');
      const certificados = certResp.data?.dados || [];
      const porCliente = new Map();
      certificados.forEach((cert) => {
        const arr = porCliente.get(cert.cliente_id) || [];
        arr.push(cert);
        porCliente.set(cert.cliente_id, arr);
      });
      const lista = clientesDados.map((cli) => {
        const certs = porCliente.get(cli.id) || [];
        if (certs.length > 0) {
          // Usa o certificado com maior data de vencimento
          const ultimo = certs.sort((a, b) => new Date(a.data_vencimento) - new Date(b.data_vencimento))[certs.length - 1];
          return {
            ...cli,
            certificado: {
              temCertificado: true,
              tipo: ultimo.tipo_certificado,
              emissor: '-',
              dataEmissao: ultimo.data_emissao || '',
              dataVencimento: ultimo.data_vencimento || '',
              senha: '',
              responsavel: '',
              observacoes: ultimo.observacoes || ''
            }
          };
        }
        return cli;
      });

      // Aplicar filtro de busca local
      const filtrados = lista.filter(cliente => (
        cliente.nome.toLowerCase().includes((filtros.busca || '').toLowerCase()) ||
        (cliente.cnpj || '').includes(filtros.busca) ||
        cliente.codigo.toLowerCase().includes((filtros.busca || '').toLowerCase())
      ));

      // Aplicar filtro de status local
      const clientesFiltradosPorStatus = filtrados.filter((c) => {
        if (!filtros.status) return true;
        const status = getStatusCertificado(c.certificado).label;
        return status === filtros.status;
      });

      setClientes(clientesFiltradosPorStatus);

      // Calcular estatísticas locais
      const hoje = new Date();
      const em30Dias = new Date();
      em30Dias.setDate(hoje.getDate() + 30);
      const ativos = clientesFiltradosPorStatus.filter(c => {
        if (!c.certificado.temCertificado || !c.certificado.dataVencimento) return false;
        const venc = new Date(c.certificado.dataVencimento);
        return venc > em30Dias;
      }).length;
      const vencendo = clientesFiltradosPorStatus.filter(c => {
        if (!c.certificado.temCertificado || !c.certificado.dataVencimento) return false;
        const venc = new Date(c.certificado.dataVencimento);
        return venc > hoje && venc <= em30Dias;
      }).length;
      const vencidos = clientesFiltradosPorStatus.filter(c => {
        if (!c.certificado.temCertificado || !c.certificado.dataVencimento) return false;
        const venc = new Date(c.certificado.dataVencimento);
        return venc < hoje;
      }).length;
      const semCertificado = clientesFiltradosPorStatus.filter(c => !c.certificado.temCertificado).length;

      setStats({
        total: clientesDados.length,
        ativos,
        vencendo,
        vencidos,
        semCertificado
      });
    } catch (error) {
      console.error('Erro ao carregar certificados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusCertificado = (certificado) => {
    if (!certificado.temCertificado) {
      return { label: 'Sem Certificado', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: X };
    }

    const hoje = new Date();
    const venc = new Date(certificado.dataVencimento);
    const dias = Math.floor((venc - hoje) / (1000 * 60 * 60 * 24));

    if (dias < 0) {
      return { label: 'Vencido', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: AlertTriangle };
    } else if (dias <= 30) {
      return { label: 'Vence em breve', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock };
    } else {
      return { label: 'Ativo', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle };
    }
  };

  const handleVisualizarCertificado = (cliente) => {
    setClienteSelecionado(cliente);
    setModalDetalhes(true);
  };

  const handleGerenciarCertificado = (cliente) => {
    setClienteSelecionado(cliente);
    setModalGerenciar(true);
  };

  const handleNovoCertificado = () => {
    setModalNovo(true);
  };

  const clientesFiltrados = clientes.filter(cliente => {
    const buscaMatch = 
      cliente.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
      cliente.cnpj.includes(filtros.busca) ||
      cliente.codigo.toLowerCase().includes(filtros.busca.toLowerCase());

    const statusMatch = !filtros.status || (() => {
      const status = getStatusCertificado(cliente.certificado);
      return status.label === filtros.status;
    })();

    return buscaMatch && statusMatch;
  });

  return (
    <LayoutSetor sidebar={SidebarLegalizacao} titulo="Legalização - Certificados">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Award className="text-blue-600 dark:text-blue-400" size={32} />
              Controle de Certificados Digitais
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gerencie e monitore os certificados digitais dos clientes
            </p>
          </div>
          <button
            onClick={handleNovoCertificado}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Novo Certificado
          </button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Total */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total de Clientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
              </div>
              <Award className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          {/* Ativos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Certificados Ativos</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.ativos}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>

          {/* Vencendo */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 card-hover cursor-pointer hover:border-yellow-500 dark:hover:border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Vencendo (30 dias)</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.vencendo}</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-500" />
            </div>
          </div>

          {/* Vencidos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 card-hover cursor-pointer hover:border-red-500 dark:hover:border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Vencidos</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.vencidos}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
          </div>

          {/* Sem Certificado */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 card-hover">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Sem Certificado</p>
                <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">{stats.semCertificado}</p>
              </div>
              <X className="w-10 h-10 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
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
            <div>
              <select
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todos os Status</option>
                <option value="Ativo">Ativo</option>
                <option value="Vence em breve">Vencendo em 30 dias</option>
                <option value="Vencido">Vencido</option>
                <option value="Sem Certificado">Sem Certificado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela de Certificados */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Empresa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Emissor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Vencimento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Ações</th>
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
                ) : clientesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      Nenhum cliente encontrado
                    </td>
                  </tr>
                ) : (
                  clientesFiltrados.map((cliente) => {
                    const status = getStatusCertificado(cliente.certificado);
                    const StatusIcon = status.icon;
                    return (
                      <tr key={cliente.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{cliente.codigo}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{cliente.nome}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{cliente.cnpj}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {cliente.certificado.tipo || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {cliente.certificado.emissor || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {cliente.certificado.dataVencimento 
                            ? new Date(cliente.certificado.dataVencimento).toLocaleDateString('pt-BR')
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${status.color}`}>
                            <StatusIcon size={14} />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleVisualizarCertificado(cliente)}
                              className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="Visualizar"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleGerenciarCertificado(cliente)}
                              className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              title="Gerenciar"
                            >
                              <Edit size={18} />
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
        </div>
      </div>

      {/* Modais */}
      {modalDetalhes && (
        <ModalDetalhesCertificado
          cliente={clienteSelecionado}
          onClose={() => setModalDetalhes(false)}
          onEditar={() => {
            setModalDetalhes(false);
            handleGerenciarCertificado(clienteSelecionado);
          }}
        />
      )}

      {modalGerenciar && (
        <ModalGerenciarCertificado
          cliente={clienteSelecionado}
          onClose={() => setModalGerenciar(false)}
          onSalvar={async (dadosAtualizados) => {
            try {
              const payload = {
                tipo_certificado: dadosAtualizados.certificado?.tipo,
                data_emissao: dadosAtualizados.certificado?.dataEmissao || null,
                data_vencimento: dadosAtualizados.certificado?.dataVencimento,
                observacoes: dadosAtualizados.certificado?.observacoes || null,
                status: 'ativo'
              };

              if (!payload.tipo_certificado || !payload.data_vencimento) {
                alert('Tipo e vencimento são obrigatórios.');
                return;
              }

              await api.put(`/certificados/cliente/${dadosAtualizados.id}`, payload);

              setClientes(clientes.map(c =>
                c.id === dadosAtualizados.id ? dadosAtualizados : c
              ));
              setModalGerenciar(false);
              carregarDados();
            } catch (err) {
              console.error('Erro ao salvar certificado:', err);
              alert('Erro ao salvar certificado');
            }
          }}
        />
      )}

      {modalNovo && (
        <ModalNovoCertificado
          clientes={clientes}
          onClose={() => setModalNovo(false)}
          onSalvar={async (novo) => {
            try {
              const payload = {
                tipo_certificado: novo.tipo,
                data_emissao: novo.dataEmissao || null,
                data_vencimento: novo.dataVencimento,
                observacoes: novo.observacoes || null,
                status: 'ativo'
              };

              if (!payload.tipo_certificado || !payload.data_vencimento) {
                alert('Tipo e vencimento são obrigatórios.');
                return;
              }

              if (novo.clienteId) {
                await api.put(`/certificados/cliente/${novo.clienteId}`, payload);
              } else {
                if (!novo.nomeCliente || !novo.nomeCliente.trim()) {
                  alert('Informe o nome do cliente.');
                  return;
                }
                await api.post('/certificados', { ...payload, nome_cliente: novo.nomeCliente.trim() });
              }

              setModalNovo(false);
              carregarDados();
            } catch (err) {
              console.error('Erro ao criar certificado:', err);
              alert('Erro ao criar certificado');
            }
          }}
        />
      )}
    </LayoutSetor>
  );
}
