import { 
  X, 
  Edit,
  Building2,
  Mail,
  Phone,
  Calendar,
  Users,
  MapPin,
  FileText,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

export default function ModalDetalhesCliente({ cliente, onClose, onEditar }) {
  if (!cliente) return null;

  const getStatusBadge = (status) => {
    const badges = {
      ATIVO: { 
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', 
        label: 'Ativo',
        icon: CheckCircle
      },
      INATIVO: { 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', 
        label: 'Inativo',
        icon: Clock
      },
      BAIXADA: { 
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', 
        label: 'Baixada',
        icon: XCircle
      }
    };
    return badges[status] || badges.ATIVO;
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
    return atividades[atividade] || atividade;
  };

  const getTipoApuracaoLabel = (tipo) => {
    const tipos = {
      SIMPLES: 'Simples Nacional',
      PRESUMIDO: 'Lucro Presumido',
      REAL: 'Lucro Real',
      MEI: 'MEI',
      CEI: 'CEI',
      PESSOA_FISICA: 'Pessoa Física'
    };
    return tipos[tipo] || tipo;
  };

  const getTipoEntradaLabel = (tipo) => {
    const tipos = {
      CLIENTE_NOVO: 'Cliente Novo',
      MIGRACAO: 'Migração',
      RETORNO: 'Retorno'
    };
    return tipos[tipo] || tipo;
  };

  const getGrauDificuldadeInfo = (grau) => {
    const graus = {
      BAIXO: { label: 'Baixo', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      MEDIO: { label: 'Médio', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      ALTO: { label: 'Alto', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
    };
    return graus[grau] || graus.MEDIO;
  };

  const getSetorStatusBadge = (status) => {
    const badges = {
      ATIVO: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Ativo' },
      PENDENTE: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pendente' },
      INATIVO: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', label: 'Inativo' }
    };
    return badges[status] || badges.PENDENTE;
  };

  const statusBadge = getStatusBadge(cliente.status);
  const StatusIcon = statusBadge.icon;
  const grauInfo = getGrauDificuldadeInfo(cliente.grauDificuldade);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Detalhes do Cliente
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
          {/* Status do Cliente - Destaque */}
          <div className={`p-4 rounded-lg border-2 ${
            cliente.status === 'ATIVO' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
            cliente.status === 'INATIVO' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
            'border-red-500 bg-red-50 dark:bg-red-900/20'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <StatusIcon className={`w-8 h-8 ${
                  cliente.status === 'ATIVO' ? 'text-green-600 dark:text-green-400' :
                  cliente.status === 'INATIVO' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-red-600 dark:text-red-400'
                }`} />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status do Cliente</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{statusBadge.label}</p>
                </div>
              </div>
              {cliente.status === 'BAIXADA' && cliente.dataBaixa && (
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Data da Baixa</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(cliente.dataBaixa).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
              {cliente.status === 'INATIVO' && cliente.dataInativacao && (
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Data da Inativação</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(cliente.dataInativacao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Building2 size={20} />
              Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Razão Social</label>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{cliente.nome}</p>
              </div>
              {cliente.nomeFantasia && (
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Nome Fantasia</label>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">{cliente.nomeFantasia}</p>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Código</label>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{cliente.codigo}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">CNPJ</label>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{cliente.cnpj}</p>
              </div>
              {cliente.telefone && (
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Telefone</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                    <Phone size={14} />
                    {cliente.telefone}
                  </p>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Responsável Legal</label>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{cliente.responsavelLegal}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Atividade</label>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{getAtividadeLabel(cliente.atividade)}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Tipo de Apuração</label>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{getTipoApuracaoLabel(cliente.tipoApuracao)}</p>
              </div>
              {cliente.tipoEntrada && (
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Tipo de Entrada</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{getTipoEntradaLabel(cliente.tipoEntrada)}</p>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Data de Constituição</label>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                  <Calendar size={14} />
                  {new Date(cliente.dataConstituicao).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Data de Entrada</label>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                  <Calendar size={14} />
                  {new Date(cliente.dataEntrada).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Quantidade de Funcionários</label>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                  <Users size={14} />
                  {cliente.quantidadeFuncionarios}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Grau de Dificuldade</label>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${grauInfo.color}`}>
                  {grauInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* E-mails de Contato */}
          {cliente.emails && cliente.emails.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Mail size={20} />
                E-mails de Contato
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cliente.emails.map((email, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{email.tipo}</span>
                      <Mail size={14} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white break-all">{email.email}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Localizações */}
          {cliente.localizacoes && cliente.localizacoes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Localizações
              </h3>
              <div className="space-y-3">
                {cliente.localizacoes.map((loc, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Estado</label>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{loc.estado}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Cidade</label>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{loc.cidade}</p>
                      </div>
                      {loc.inscricaoMunicipal && (
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Insc. Municipal</label>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{loc.inscricaoMunicipal}</p>
                        </div>
                      )}
                      {loc.inscricaoEstadual && (
                        <div>
                          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Insc. Estadual</label>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{loc.inscricaoEstadual}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Setores e Responsáveis */}
          {cliente.setores && cliente.setores.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} />
                Setores e Responsáveis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cliente.setores.map((setor, index) => {
                  const setorBadge = getSetorStatusBadge(setor.status);
                  return (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{setor.setor}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${setorBadge.color}`}>
                          {setorBadge.label}
                        </span>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Responsável</label>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {setor.responsavel || 'Não atribuído'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Observações */}
          {cliente.observacoes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText size={20} />
                Observações
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {cliente.observacoes}
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
            Editar Cliente
          </button>
        </div>
      </div>
    </div>
  );
}
