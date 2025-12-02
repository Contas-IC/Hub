import { useEffect, useState } from 'react';
import { Activity, User, Clock, FileText, DollarSign, Award, Calendar } from 'lucide-react';
import { auditoriaService } from '../../services/auditoria';

export default function AtividadesRecentes({ limite = 10, modulo = null }) {
  const [atividades, setAtividades] = useState([]);

  useEffect(() => {
    carregarAtividades();
    
    // Atualiza a cada 30 segundos
    const interval = setInterval(carregarAtividades, 30000);
    return () => clearInterval(interval);
  }, [modulo, limite]);

  const carregarAtividades = () => {
    const logs = auditoriaService.getLogs({ modulo, limite });
    setAtividades(logs);
  };

  const getIconeModulo = (moduloNome) => {
    const icones = {
      CLIENTES: FileText,
      FINANCEIROS: DollarSign,
      CERTIFICADOS: Award,
      AGENDA: Calendar
    };
    return icones[moduloNome] || Activity;
  };

  const getCorAcao = (acao) => {
    const cores = {
      CRIAR: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
      EDITAR: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
      EXCLUIR: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
      VISUALIZAR: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30'
    };
    return cores[acao] || 'text-gray-600 dark:text-gray-400';
  };

  const formatarTempo = (timestamp) => {
    const data = new Date(timestamp);
    const agora = new Date();
    const diff = Math.floor((agora - data) / 1000); // segundos

    if (diff < 60) return 'Agora mesmo';
    if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity size={20} className="text-blue-600 dark:text-blue-400" />
          Atividades Recentes
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {atividades.length} registros
        </span>
      </div>

      {atividades.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Activity size={40} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhuma atividade recente</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {atividades.map((atividade) => {
            const IconeModulo = getIconeModulo(atividade.modulo);
            return (
              <div
                key={atividade.id}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className={`p-2 rounded-lg ${getCorAcao(atividade.acao)}`}>
                  <IconeModulo size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        <span className="font-semibold">{atividade.usuario}</span>
                        {' '}
                        <span className="text-gray-600 dark:text-gray-400">
                          {atividade.acao === 'CRIAR' && 'criou'}
                          {atividade.acao === 'EDITAR' && 'editou'}
                          {atividade.acao === 'EXCLUIR' && 'excluiu'}
                          {atividade.acao === 'VISUALIZAR' && 'visualizou'}
                        </span>
                        {' '}
                        <span className="font-semibold">{atividade.entidade}</span>
                      </p>
                      {atividade.detalhes && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {atividade.detalhes}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        em <span className="font-medium">{atividade.modulo}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {formatarTempo(atividade.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
