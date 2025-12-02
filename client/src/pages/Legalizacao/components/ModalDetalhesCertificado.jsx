import { 
  X, 
  Award, 
  Calendar, 
  User, 
  Building2,
  FileText,
  Edit,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

export default function ModalDetalhesCertificado({ cliente, onClose, onEditar }) {
  if (!cliente) return null;

  const getStatusCertificado = () => {
    if (!cliente.certificado.temCertificado) {
      return { 
        label: 'Sem Certificado', 
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', 
        icon: X 
      };
    }

    const hoje = new Date();
    const venc = new Date(cliente.certificado.dataVencimento);
    const dias = Math.floor((venc - hoje) / (1000 * 60 * 60 * 24));

    if (dias < 0) {
      return { 
        label: 'Vencido', 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', 
        icon: AlertTriangle 
      };
    } else if (dias <= 30) {
      return { 
        label: 'Vence em breve', 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', 
        icon: Clock 
      };
    } else {
      return { 
        label: 'Ativo', 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', 
        icon: CheckCircle 
      };
    }
  };

  const status = getStatusCertificado();
  const StatusIcon = status.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Detalhes do Certificado Digital
              </h2>
              <p className="text-sm text-blue-100">
                {cliente.codigo} - {cliente.nome}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEditar}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white"
              title="Editar"
            >
              <Edit size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
          {/* Status do Certificado */}
          <div className={`p-4 rounded-lg border-2 ${
            !cliente.certificado.temCertificado ? 'border-gray-500 bg-gray-50 dark:bg-gray-900/20' :
            status.label === 'Ativo' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
            status.label === 'Vence em breve' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
            'border-red-500 bg-red-50 dark:bg-red-900/20'
          }`}>
            <div className="flex items-center gap-3">
              <StatusIcon className={`w-8 h-8 ${
                !cliente.certificado.temCertificado ? 'text-gray-600 dark:text-gray-400' :
                status.label === 'Ativo' ? 'text-green-600 dark:text-green-400' :
                status.label === 'Vence em breve' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`} />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{status.label}</p>
              </div>
            </div>
          </div>

          {/* Informações da Empresa */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 size={20} />
              Informações da Empresa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Nome</label>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{cliente.nome}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">CNPJ</label>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{cliente.cnpj}</p>
              </div>
            </div>
          </div>

          {/* Dados do Certificado */}
          {cliente.certificado.temCertificado ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Award size={20} />
                Dados do Certificado
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Tipo de Certificado</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{cliente.certificado.tipo}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Data de Emissão</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(cliente.certificado.dataEmissao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Data de Vencimento</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(cliente.certificado.dataVencimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Senha</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{cliente.certificado.senha}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Responsável</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                    <User size={14} />
                    {cliente.certificado.responsavel}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <X className="w-16 h-16 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                Este cliente ainda não possui certificado digital cadastrado.
              </p>
            </div>
          )}

          {/* Observações */}
          {cliente.certificado.observacoes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText size={20} />
                Observações
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {cliente.certificado.observacoes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={onEditar}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Edit size={18} />
            Gerenciar Certificado
          </button>
        </div>
      </div>
    </div>
  );
}
