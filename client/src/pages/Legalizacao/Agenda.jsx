import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Plus, Clock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import LayoutSetor from '../../components/Layout/LayoutSetor';
import SidebarLegalizacao from './components/SidebarLegalizacao';
import ModalNovaTarefa from './components/ModalNovaTarefa';

export default function Agenda() {
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [modalNovaTarefa, setModalNovaTarefa] = useState(false);
  const [tarefas, setTarefas] = useState([]);

  // Carregar apenas dados inseridos (localStorage)
  useEffect(() => {
    try {
      const armazenadas = JSON.parse(localStorage.getItem('legalizacao_tarefas') || '[]');
      setTarefas(Array.isArray(armazenadas) ? armazenadas : []);
    } catch (e) {
      setTarefas([]);
    }
  }, []);

  // Persistir alterações
  useEffect(() => {
    localStorage.setItem('legalizacao_tarefas', JSON.stringify(tarefas));
  }, [tarefas]);

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDiasDoMes = (data) => {
    const ano = data.getFullYear();
    const mes = data.getMonth();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const diasNoMes = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay();

    const dias = [];
    // Preencher dias vazios do início
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null);
    }
    // Preencher dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
      dias.push(dia);
    }
    return dias;
  };

  const mudarMes = (direcao) => {
    const novaData = new Date(dataSelecionada);
    novaData.setMonth(novaData.getMonth() + direcao);
    setDataSelecionada(novaData);
  };

  const getTarefasDoDia = (dia) => {
    if (!dia) return [];
    const dataStr = `${dataSelecionada.getFullYear()}-${String(dataSelecionada.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return tarefas.filter(t => t.data === dataStr);
  };

  const hoje = new Date();
  const ehHoje = (dia) => {
    return dia === hoje.getDate() &&
           dataSelecionada.getMonth() === hoje.getMonth() &&
           dataSelecionada.getFullYear() === hoje.getFullYear();
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDENTE: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
      CONCLUIDO: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
      ATRASADO: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle }
    };
    return badges[status] || badges.PENDENTE;
  };

  const tarefasProximas = tarefas
    .filter(t => t.status === 'PENDENTE')
    .sort((a, b) => new Date(a.data + ' ' + a.hora) - new Date(b.data + ' ' + b.hora))
    .slice(0, 5);

  return (
    <LayoutSetor sidebar={SidebarLegalizacao} titulo="Legalização - Agenda">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Agenda e Tarefas</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gerencie compromissos e pendências do setor
            </p>
          </div>
          <button
            onClick={() => setModalNovaTarefa(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Nova Tarefa
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendário */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {meses[dataSelecionada.getMonth()]} {dataSelecionada.getFullYear()}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => mudarMes(-1)}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  ←
                </button>
                <button
                  onClick={() => setDataSelecionada(new Date())}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 text-sm"
                >
                  Hoje
                </button>
                <button
                  onClick={() => mudarMes(1)}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  →
                </button>
              </div>
            </div>

            {/* Grid do calendário */}
            <div className="grid grid-cols-7 gap-2">
              {/* Cabeçalho dos dias da semana */}
              {diasSemana.map(dia => (
                <div key={dia} className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2">
                  {dia}
                </div>
              ))}

              {/* Dias do mês */}
              {getDiasDoMes(dataSelecionada).map((dia, index) => {
                const tarefasDia = getTarefasDoDia(dia);
                const temTarefas = tarefasDia.length > 0;
                const diaHoje = ehHoje(dia);

                return (
                  <div
                    key={index}
                    className={`
                      min-h-20 p-2 rounded-lg border transition-all cursor-pointer
                      ${dia ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-900'}
                      ${diaHoje ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}
                      ${temTarefas ? 'border-yellow-300 dark:border-yellow-700' : ''}
                    `}
                    onClick={() => dia && alert(`Tarefas do dia ${dia}: ${tarefasDia.length}`)}
                  >
                    {dia && (
                      <>
                        <div className={`text-sm font-medium ${diaHoje ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                          {dia}
                        </div>
                        {temTarefas && (
                          <div className="mt-1 flex gap-1 flex-wrap">
                            {tarefasDia.slice(0, 2).map(t => (
                              <div key={t.id} className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            ))}
                            {tarefasDia.length > 2 && (
                              <span className="text-xs text-gray-500">+{tarefasDia.length - 2}</span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lista de Tarefas Próximas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock size={20} />
              Próximas Tarefas
            </h3>
            <div className="space-y-3">
              {tarefasProximas.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  Nenhuma tarefa pendente
                </p>
              ) : (
                tarefasProximas.map(tarefa => {
                  const badge = getStatusBadge(tarefa.status);
                  const Icon = badge.icon;
                  return (
                    <div key={tarefa.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">{tarefa.titulo}</h4>
                        <Icon size={16} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{tarefa.cliente}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          {new Date(tarefa.data).toLocaleDateString('pt-BR')} às {tarefa.hora}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-xs">
                          {tarefa.tipo}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Tabela de Todas as Tarefas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Todas as Tarefas</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Tarefa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Data/Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {tarefas.map(tarefa => {
                  const badge = getStatusBadge(tarefa.status);
                  return (
                    <tr key={tarefa.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{tarefa.titulo}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{tarefa.cliente}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(tarefa.data).toLocaleDateString('pt-BR')} - {tarefa.hora}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded text-xs">
                          {tarefa.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                          {tarefa.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setTarefas(tarefas.filter(t => t.id !== tarefa.id));
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Nova Tarefa */}
      {modalNovaTarefa && (
        <ModalNovaTarefa
          onClose={() => setModalNovaTarefa(false)}
          onSalvar={(novaTarefa) => {
            const novoRegistro = { ...novaTarefa, id: Date.now() };
            setTarefas([...tarefas, novoRegistro]);
            setModalNovaTarefa(false);
          }}
        />
      )}
    </LayoutSetor>
  );
}
