// arquivo: client/src/pages/Legalizacao/Agenda.jsx

import { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Users,
  Filter,
  ArrowRight
} from 'lucide-react';
import { tarefas } from '../../services/api';
import ModalNovaTarefa from '../../components/Legalizacao/ModalNovaTarefa';

export default function Agenda() {
  const [tarefasLista, setTarefasLista] = useState([]);
  const [stats, setStats] = useState({
    pendentes: 0,
    emAndamento: 0,
    concluidas: 0,
    atrasadas: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('PENDENTE');
  const [filtroData, setFiltroData] = useState('7'); // próximos 7 dias
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    carregarDados();
  }, [filtroStatus, filtroData]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro('');

      const hoje = new Date();
      let dataInicio = null;
      let dataFim = null;

      if (filtroData === '7') {
        dataInicio = hoje.toISOString().slice(0, 10);
        const fim = new Date();
        fim.setDate(hoje.getDate() + 7);
        dataFim = fim.toISOString().slice(0, 10);
      } else if (filtroData === '30') {
        dataInicio = hoje.toISOString().slice(0, 10);
        const fim = new Date();
        fim.setDate(hoje.getDate() + 30);
        dataFim = fim.toISOString().slice(0, 10);
      }

      const params = {};
      if (filtroStatus !== 'TODAS') params.status = filtroStatus;
      if (dataInicio) params.dataInicio = dataInicio;
      if (dataFim) params.dataFim = dataFim;

      const [tarefasResp, statsResp] = await Promise.all([
        tarefas.listar(params),
        tarefas.estatisticas()
      ]);

      setTarefasLista(tarefasResp.data || []);
      setStats(statsResp.data || stats);

    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
      setErro('Erro ao carregar tarefas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleNovaTarefa = async (dados) => {
    try {
      await tarefas.criar({
        titulo: dados.titulo,
        descricao: dados.descricao || '',
        cliente_id: dados.clienteId || null,
        usuario_responsavel_id: dados.responsavelId || null,
        prioridade: dados.prioridade || 'MEDIA',
        status: dados.status || 'PENDENTE',
        data_vencimento: `${dados.data}T${dados.hora || '12:00'}:00`
      });
      setModalAberto(false);
      await carregarDados();
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      alert(error.response?.data?.message || 'Erro ao criar tarefa');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDENTE: {
        label: 'Pendente',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: AlertCircle
      },
      EM_ANDAMENTO: {
        label: 'Em andamento',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: Clock
      },
      CONCLUIDA: {
        label: 'Concluída',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle
      }
    };
    return map[status] || map.PENDENTE;
  };

  const formatarDataHora = (dataISO) => {
    if (!dataISO) return '-';
    const d = new Date(dataISO);
    const data = d.toLocaleDateString('pt-BR');
    const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${data} • ${hora}`;
  };

  const tarefasProximas = tarefasLista
    .slice()
    .sort((a, b) => new Date(a.data_vencimento) - new Date(b.data_vencimento))
    .slice(0, 10);

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
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  Agenda do Setor
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Gerencie compromissos e pendências do setor
                </p>
              </div>
            </div>
            <button
              onClick={() => setModalAberto(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nova Tarefa
            </button>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Pendentes
              </span>
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.pendentes}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Em andamento
              </span>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.emAndamento}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Concluídas
              </span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.concluidas}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Atrasadas
              </span>
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.atrasadas}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">
                Filtros da agenda
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="TODAS">Todas as tarefas</option>
                <option value="PENDENTE">Pendentes</option>
                <option value="EM_ANDAMENTO">Em andamento</option>
                <option value="CONCLUIDA">Concluídas</option>
              </select>

              <select
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7">Próximos 7 dias</option>
                <option value="30">Próximos 30 dias</option>
                <option value="TODAS">Todas as datas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de tarefas */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Próximas tarefas
              </h2>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {tarefasProximas.length} tarefa(s) listada(s)
            </span>
          </div>

          {erro && (
            <div className="px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
              {erro}
            </div>
          )}

          {tarefasProximas.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhuma tarefa pendente para o período selecionado.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {tarefasProximas.map((tarefa) => {
                const badge = getStatusBadge(tarefa.status);
                const Icon = badge.icon;

                return (
                  <div
                    key={tarefa.id}
                    className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {tarefa.titulo}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${badge.className}`}>
                          <Icon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </div>
                      {tarefa.descricao && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {tarefa.descricao}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {formatarDataHora(tarefa.data_vencimento)}
                        </span>
                        {tarefa.cliente_nome && (
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {tarefa.cliente_nome}
                          </span>
                        )}
                      </div>
                    </div>
                    {tarefa.prioridade && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span className="uppercase tracking-wide">
                          Prioridade: {tarefa.prioridade}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {modalAberto && (
        <ModalNovaTarefa
          onClose={() => setModalAberto(false)}
          onSalvar={handleNovaTarefa}
        />
      )}
    </div>
  );
}
