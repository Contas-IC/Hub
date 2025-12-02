import { Loader2 } from 'lucide-react';

export default function LoadingModulo({ modulo }) {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
      <div className="text-center space-y-4">
        {/* Spinner Animado */}
        <div className="relative">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Texto */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Carregando {modulo}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Preparando o ambiente...
          </p>
        </div>

        {/* Barra de Progresso */}
        <div className="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mx-auto">
          <div className="h-full bg-blue-600 rounded-full animate-progress"></div>
        </div>
      </div>
    </div>
  );
}
