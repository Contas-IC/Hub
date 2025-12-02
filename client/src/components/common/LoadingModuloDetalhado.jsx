import { useState, useEffect } from 'react';
import { Loader2, Check } from 'lucide-react';

export default function LoadingModuloDetalhado({ modulo }) {
  const [etapaAtual, setEtapaAtual] = useState(0);

  const etapas = [
    'Verificando permissões',
    'Carregando dados',
    'Preparando interface',
    'Finalizando'
  ];

  useEffect(() => {
    const intervalo = setInterval(() => {
      setEtapaAtual(prev => {
        if (prev < etapas.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 300);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
      <div className="text-center space-y-6 max-w-md w-full px-6">
        {/* Spinner */}
        <div className="relative mx-auto w-20 h-20">
          <Loader2 className="w-20 h-20 text-blue-600 animate-spin" />
        </div>

        {/* Título */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {modulo}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Carregando módulo...
          </p>
        </div>

        {/* Etapas */}
        <div className="space-y-3 text-left">
          {etapas.map((etapa, index) => (
            <div key={index} className="flex items-center gap-3">
              {index < etapaAtual ? (
                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : index === etapaAtual ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
              )}
              <span className={`text-sm ${
                index <= etapaAtual 
                  ? 'text-gray-900 dark:text-white font-medium' 
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {etapa}
              </span>
            </div>
          ))}
        </div>

        {/* Barra de Progresso */}
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${((etapaAtual + 1) / etapas.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
