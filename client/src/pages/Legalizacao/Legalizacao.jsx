import { useState, useEffect } from 'react';
import { 
  Building2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  FileCheck,
  ArrowRight,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LayoutSetor from '../../components/Layout/LayoutSetor';
import SidebarLegalizacao from './components/SidebarLegalizacao';
import LoadingModulo from '../../components/common/LoadingModulo';
import AtividadesRecentes from '../../components/common/AtividadesRecentes';
import { useModuloLoading } from '../../hooks/useModuloLoading';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Legalizacao() {
  const loadingModulo = useModuloLoading(1200);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [periodo, setPeriodo] = useState('mes'); // mes, trimestre, ano

  // Estados para dados do dashboard
  const [stats, setStats] = useState({
    empresasEntradas: 0,
    empresasSaidas: 0,
    empresasAtivas: 0,
    dadosIncompletos: 0,
    processosPendentes: 0,
    processosAndamento: 0,
    processosConcluidos: 0
  });

  const [empresasRecentes, setEmpresasRecentes] = useState([]);
  const [certStats, setCertStats] = useState({
    total: 0,
    ativos: 0,
    vencidos: 0,
    proximoVencer: 0,
    porTipo: [],
    vencendoEmBreve: []
  });

  // Dados para gráfico de linha (Entradas e Saídas por mês)
  const dadosFluxoEmpresas = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'],
    datasets: [
      {
        label: 'Entradas',
        data: [8, 12, 10, 15, 13, 18, 16, 14, 17, 15, 12],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Saídas',
        data: [2, 3, 1, 4, 2, 3, 2, 1, 3, 2, 3],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Dados para gráfico de barras (Status dos Processos)
  const dadosStatusProcessos = {
    labels: ['Pendentes', 'Em Andamento', 'Concluídos'],
    datasets: [
      {
        label: 'Quantidade',
        data: [stats.processosPendentes, stats.processosAndamento, stats.processosConcluidos],
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgb(251, 191, 36)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)'
        ],
        borderWidth: 2
      }
    ]
  };

  // Dados para gráfico de rosca (Distribuição de Empresas)
  const dadosDistribuicao = {
    labels: ['Ativas', 'Dados Incompletos', 'Saídas'],
    datasets: [
      {
        data: [stats.empresasAtivas, stats.dadosIncompletos, stats.empresasSaidas],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 2
      }
    ]
  };

  const opcoesGraficoLinha = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5
        }
      }
    }
  };

  const opcoesGraficoBarra = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const opcoesGraficoRosca = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  useEffect(() => {
    if (!loadingModulo) {
      carregarDados();
    }
  }, [loadingModulo, periodo]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/clientes', { params: { page: 1, limit: 200 } });
      const lista = data?.dados || [];

      // Calcular período
      const agora = new Date();
      const inicioPeriodo = new Date(agora);
      if (periodo === 'mes') {
        inicioPeriodo.setMonth(agora.getMonth());
        inicioPeriodo.setDate(1);
      } else if (periodo === 'trimestre') {
        const trimestreInicioMes = Math.floor(agora.getMonth() / 3) * 3;
        inicioPeriodo.setMonth(trimestreInicioMes);
        inicioPeriodo.setDate(1);
      } else if (periodo === 'ano') {
        inicioPeriodo.setMonth(0);
        inicioPeriodo.setDate(1);
      }

      // Helpers
      const parseData = (txt) => {
        if (!txt) return null;
        const d = new Date(txt);
        return isNaN(d.getTime()) ? null : d;
      };

      const empresasEntradas = lista.filter((c) => {
        const d = parseData(c.data_entrada_escritorio || c.data_cadastro);
        return d && d >= inicioPeriodo && d <= agora;
      }).length;

      const empresasSaidas = lista.filter((c) => c.status === 'baixada').length;
      const empresasAtivas = lista.filter((c) => c.status === 'ativa').length;
      const dadosIncompletos = lista.filter((c) => !c.cnpj || !c.regime).length;

      // Processos (estimativas com base em campos da legalização)
      const pendentes = lista.filter((c) => !c.tipo_cobranca && !c.valor_cobranca && !c.percentual_cobranca).length;
      const andamento = lista.filter((c) => c.tipo_cobranca || c.valor_cobranca || c.percentual_cobranca).length;
      const concluidos = 0; // Sem regra definida no schema atual

      setStats({
        empresasEntradas,
        empresasSaidas,
        empresasAtivas,
        dadosIncompletos,
        processosPendentes: pendentes,
        processosAndamento: andamento,
        processosConcluidos: concluidos
      });

      const recentes = lista
        .sort((a, b) => new Date(b.data_cadastro) - new Date(a.data_cadastro))
        .slice(0, 5)
        .map((c) => ({
          id: c.id,
          nome: c.nome_empresa,
          cnpj: c.cnpj,
          dataEntrada: c.data_entrada_escritorio || c.data_cadastro,
          status: c.status === 'ativa' ? 'EM_ANDAMENTO' : (c.status === 'baixada' ? 'CONCLUIDO' : 'PENDENTE'),
          progresso: c.percentual_cobranca ? 70 : (c.tipo_cobranca || c.valor_cobranca ? 40 : 20)
        }));

      setEmpresasRecentes(recentes);

      // Estatísticas de certificados
      try {
        const { data: certData } = await api.get('/certificados/estatisticas');
        const d = certData?.dados || {};
        setCertStats({
          total: d.total ?? 0,
          ativos: d.ativos ?? 0,
          vencidos: d.vencidos ?? 0,
          proximoVencer: d.proximoVencer ?? 0,
          porTipo: Array.isArray(d.porTipo) ? d.porTipo : [],
          vencendoEmBreve: Array.isArray(d.vencendoEmBreve) ? d.vencendoEmBreve : []
        });
      } catch (e) {
        console.error('Erro ao carregar estatísticas de certificados:', e);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      EM_ANDAMENTO: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Em Andamento' },
      PENDENTE: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pendente' },
      DADOS_INCOMPLETOS: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Dados Incompletos' },
      CONCLUIDO: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Concluído' }
    };
    return badges[status] || badges.PENDENTE;
  };

  if (loadingModulo) {
    return <LoadingModulo modulo="Legalização" />;
  }

  return (
    <LayoutSetor sidebar={SidebarLegalizacao} titulo="Legalização - Dashboard">
      <div className="p-6 space-y-6">
        {/* Header com Filtros */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard de Legalização
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Visão geral dos processos e empresas
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPeriodo('mes')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                periodo === 'mes'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Este Mês
            </button>
            <button
              onClick={() => setPeriodo('trimestre')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                periodo === 'trimestre'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Trimestre
            </button>
            <button
              onClick={() => setPeriodo('ano')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                periodo === 'ano'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Este Ano
            </button>
          </div>
        </div>

        {/* Cards de Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Empresas Entradas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 card-hover">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Empresas Entradas
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.empresasEntradas}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    +15% vs mês anterior
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Empresas Saídas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 card-hover">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Empresas Saídas
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.empresasSaidas}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                    -5% vs mês anterior
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          {/* Empresas Ativas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 card-hover">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Empresas Ativas
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.empresasAtivas}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Total em carteira
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* Dados Incompletos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 card-hover cursor-pointer hover:border-yellow-500 dark:hover:border-yellow-500">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Dados Incompletos
                </p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                  {stats.dadosIncompletos}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                    Requer atenção
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Fluxo de Empresas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Fluxo de Empresas (2025)
            </h3>
            <div className="h-80">
              <Line data={dadosFluxoEmpresas} options={opcoesGraficoLinha} />
            </div>
          </div>

          {/* Gráfico de Status dos Processos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Status dos Processos
            </h3>
            <div className="h-80">
              <Bar data={dadosStatusProcessos} options={opcoesGraficoBarra} />
            </div>
          </div>
        </div>

        {/* Distribuição e Empresas Recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de Distribuição */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Distribuição de Empresas
            </h3>
            <div className="h-64">
              <Doughnut data={dadosDistribuicao} options={opcoesGraficoRosca} />
            </div>
          </div>

          {/* Empresas Recentes */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Empresas Recentes
              </h3>
              <button
                onClick={() => navigate('/legalizacao/clientes')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
              >
                Ver todas
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {empresasRecentes.map((empresa) => {
                const badge = getStatusBadge(empresa.status);
                return (
                  <div
                    key={empresa.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/legalizacao/clientes`)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {empresa.nome}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        CNPJ: {empresa.cnpj}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${empresa.progresso}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                          {empresa.progresso}%
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Entrada
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(empresa.dataEntrada).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Atividades Recentes - NOVO COMPONENTE */}
        <AtividadesRecentes limite={10} />

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <button
            onClick={() => navigate('/legalizacao/clientes')}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 hover:from-blue-600 hover:to-blue-700 transition-all card-hover text-left"
          >
            <Users className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Gerenciar Clientes</h3>
            <p className="text-sm text-blue-100">
              Visualize e gerencie todos os clientes cadastrados
            </p>
          </button>

          <button
            onClick={() => navigate('/legalizacao/financeiros')}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 hover:from-green-600 hover:to-green-700 transition-all card-hover text-left"
          >
            <FileCheck className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Financeiros</h3>
            <p className="text-sm text-green-100">
              Gerencie cobranças e valores dos clientes
            </p>
          </button>

          <button
            onClick={() => navigate('/legalizacao/certificados')}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 hover:from-purple-600 hover:to-purple-700 transition-all card-hover text-left"
          >
            <Award className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Certificados</h3>
            <p className="text-sm text-purple-100">
              Gestão de certificados digitais
            </p>
          </button>

          <button
            onClick={() => navigate('/legalizacao/agenda')}
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 hover:from-orange-600 hover:to-orange-700 transition-all card-hover text-left"
          >
            <Calendar className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Agenda</h3>
            <p className="text-sm text-orange-100">
              Acompanhe tarefas e compromissos
            </p>
          </button>
        </div>
      </div>

      {/* Cards de Certificados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Certificados */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 card-hover">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Certificados Totais
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {certStats.total}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <FileCheck className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  Registros no sistema
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Certificados Ativos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 card-hover">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Certificados Ativos
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {certStats.ativos}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Dentro da validade
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Certificados Vencidos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 card-hover">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Certificados Vencidos
              </p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                {certStats.vencidos}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Ação necessária
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        {/* Próximos a Vencer (30 dias) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 card-hover">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Próximos a Vencer
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {certStats.proximoVencer}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                  Em até 30 dias
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>
    </LayoutSetor>
  );
}
  