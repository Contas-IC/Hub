import { useState, useEffect } from 'react';
import { 
  X, 
  Save,
  Plus,
  Trash2,
  Building2,
  MapPin
} from 'lucide-react';

export default function ModalCadastroCliente({ cliente, modoEdicao, onClose, onSalvar }) {
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    nomeFantasia: '',
    cnpj: '',
    telefone: '',
    dataConstituicao: '',
    quantidadeFuncionarios: 0,
    tipoApuracao: '',
    atividade: '',
    tipoEntrada: '',
    dataEntrada: '',
    emails: [{ email: '', tipo: 'Principal' }],
    setores: [
      { setor: 'CONTABIL', responsavel: '', status: 'PENDENTE' },
      { setor: 'FISCAL', responsavel: '', status: 'PENDENTE' },
      { setor: 'DP', responsavel: '', status: 'PENDENTE' }
    ],
    grauDificuldade: 'MEDIO',
    status: 'ATIVO',
    dataBaixa: '',
    dataInativacao: '',
    responsavelLegal: '',
    localizacoes: [
      {
        estado: '',
        cidade: '',
        inscricaoMunicipal: '',
        inscricaoEstadual: ''
      }
    ],
    observacoes: ''
  });

  const [erros, setErros] = useState({});
  const [loading, setLoading] = useState(false);

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  useEffect(() => {
    if (modoEdicao && cliente) {
      setFormData({
        codigo: cliente.codigo || '',
        nome: cliente.nome || '',
        nomeFantasia: cliente.nomeFantasia || '',
        cnpj: cliente.cnpj || '',
        telefone: cliente.telefone || '',
        dataConstituicao: cliente.dataConstituicao || '',
        quantidadeFuncionarios: cliente.quantidadeFuncionarios || 0,
        tipoApuracao: cliente.tipoApuracao || '',
        atividade: cliente.atividade || '',
        tipoEntrada: cliente.tipoEntrada || '',
        dataEntrada: cliente.dataEntrada || '',
        emails: cliente.emails || [{ email: '', tipo: 'Principal' }],
        setores: cliente.setores || [
          { setor: 'CONTABIL', responsavel: '', status: 'PENDENTE' },
          { setor: 'FISCAL', responsavel: '', status: 'PENDENTE' },
          { setor: 'DP', responsavel: '', status: 'PENDENTE' }
        ],
        grauDificuldade: cliente.grauDificuldade || 'MEDIO',
        status: cliente.status || 'ATIVO',
        dataBaixa: cliente.dataBaixa || '',
        dataInativacao: cliente.dataInativacao || '',
        responsavelLegal: cliente.responsavelLegal || '',
        localizacoes: cliente.localizacoes || [
          {
            estado: '',
            cidade: '',
            inscricaoMunicipal: '',
            inscricaoEstadual: ''
          }
        ],
        observacoes: cliente.observacoes || ''
      });
    }
  }, [cliente, modoEdicao]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'status') {
      if (value !== 'BAIXADA') {
        setFormData(prev => ({ ...prev, dataBaixa: '' }));
      }
      if (value !== 'INATIVO') {
        setFormData(prev => ({ ...prev, dataInativacao: '' }));
      }
    }
  };

  const handleEmailChange = (index, field, value) => {
    const novosEmails = [...formData.emails];
    novosEmails[index][field] = value;
    setFormData({ ...formData, emails: novosEmails });
  };

  const adicionarEmail = () => {
    setFormData({
      ...formData,
      emails: [...formData.emails, { email: '', tipo: 'Secundário' }]
    });
  };

  const removerEmail = (index) => {
    if (formData.emails.length > 1) {
      const novosEmails = formData.emails.filter((_, i) => i !== index);
      setFormData({ ...formData, emails: novosEmails });
    }
  };

  const handleSetorChange = (index, field, value) => {
    const novosSetores = [...formData.setores];
    novosSetores[index][field] = value;
    setFormData({ ...formData, setores: novosSetores });
  };

  const adicionarSetor = () => {
    setFormData({
      ...formData,
      setores: [...formData.setores, { setor: '', responsavel: '', status: 'PENDENTE' }]
    });
  };

  const removerSetor = (index) => {
    const novosSetores = formData.setores.filter((_, i) => i !== index);
    setFormData({ ...formData, setores: novosSetores });
  };

  const handleLocalizacaoChange = (index, field, value) => {
    const novasLocalizacoes = [...formData.localizacoes];
    novasLocalizacoes[index][field] = value;
    setFormData({ ...formData, localizacoes: novasLocalizacoes });
  };

  const adicionarLocalizacao = () => {
    setFormData({
      ...formData,
      localizacoes: [
        ...formData.localizacoes,
        {
          estado: '',
          cidade: '',
          inscricaoMunicipal: '',
          inscricaoEstadual: ''
        }
      ]
    });
  };

  const removerLocalizacao = (index) => {
    if (formData.localizacoes.length > 1) {
      const novasLocalizacoes = formData.localizacoes.filter((_, i) => i !== index);
      setFormData({ ...formData, localizacoes: novasLocalizacoes });
    }
  };

  const validarFormulario = () => {
    const novosErros = {};

    if (!formData.codigo.trim()) novosErros.codigo = 'Código é obrigatório';
    if (!formData.nome.trim()) novosErros.nome = 'Razão Social é obrigatória';
    if (!formData.cnpj.trim()) novosErros.cnpj = 'CNPJ é obrigatório';
    if (!formData.dataConstituicao) novosErros.dataConstituicao = 'Data de constituição é obrigatória';
    if (!formData.tipoApuracao) novosErros.tipoApuracao = 'Tipo de apuração é obrigatório';
    if (!formData.atividade) novosErros.atividade = 'Atividade é obrigatória';
    if (!formData.responsavelLegal.trim()) novosErros.responsavelLegal = 'Responsável legal é obrigatório';

    if (formData.status === 'BAIXADA' && !formData.dataBaixa) {
      novosErros.dataBaixa = 'Data da baixa é obrigatória';
    }

    if (formData.status === 'INATIVO' && !formData.dataInativacao) {
      novosErros.dataInativacao = 'Data da inativação é obrigatória';
    }

    formData.emails.forEach((email, index) => {
      if (email.email && !email.email.includes('@')) {
        novosErros[`email_${index}`] = 'E-mail inválido';
      }
    });

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      alert('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);
    try {
      await onSalvar(formData);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar cliente');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      ATIVO: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Ativo' },
      INATIVO: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Inativo' },
      BAIXADA: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Baixada' }
    };
    return badges[status] || badges.ATIVO;
  };

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
                {modoEdicao ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <p className="text-sm text-blue-100">
                {modoEdicao ? 'Atualize as informações do cliente' : 'Cadastre um novo cliente'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body - Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Código <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleChange}
                    placeholder="CLI-001"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      erros.codigo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {erros.codigo && <p className="text-xs text-red-500 mt-1">{erros.codigo}</p>}
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Razão Social <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Nome completo da empresa"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      erros.nome ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {erros.nome && <p className="text-xs text-red-500 mt-1">{erros.nome}</p>}
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome Fantasia
                  </label>
                  <input
                    type="text"
                    name="nomeFantasia"
                    value={formData.nomeFantasia}
                    onChange={handleChange}
                    placeholder="Nome comercial da empresa (opcional)"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CNPJ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={handleChange}
                    placeholder="00.000.000/0000-00"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      erros.cnpj ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {erros.cnpj && <p className="text-xs text-red-500 mt-1">{erros.cnpj}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Responsável Legal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="responsavelLegal"
                    value={formData.responsavelLegal}
                    onChange={handleChange}
                    placeholder="Nome do responsável"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      erros.responsavelLegal ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {erros.responsavelLegal && <p className="text-xs text-red-500 mt-1">{erros.responsavelLegal}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantidade de Funcionários
                  </label>
                  <input
                    type="number"
                    name="quantidadeFuncionarios"
                    value={formData.quantidadeFuncionarios}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data de Constituição <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dataConstituicao"
                    value={formData.dataConstituicao}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      erros.dataConstituicao ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {erros.dataConstituicao && <p className="text-xs text-red-500 mt-1">{erros.dataConstituicao}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data de Entrada
                  </label>
                  <input
                    type="date"
                    name="dataEntrada"
                    value={formData.dataEntrada}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Atividade <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="atividade"
                    value={formData.atividade}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      erros.atividade ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Selecione...</option>
                    <option value="SERVICO">Serviço</option>
                    <option value="COMERCIO">Comércio</option>
                    <option value="INDUSTRIA">Indústria</option>
                    <option value="AGRICULTURA_PECUARIA">Agricultura/Pecuária</option>
                    <option value="COM_E_IND">Comércio e Indústria</option>
                    <option value="COM_E_SERV">Comércio e Serviço</option>
                    <option value="COM_IND_E_SERV">Comércio, Indústria e Serviço</option>
                    <option value="CONSTRUTORA">Construtora</option>
                    <option value="ESCOLA">Escola</option>
                    <option value="IMOBILIARIA">Imobiliária</option>
                  </select>
                  {erros.atividade && <p className="text-xs text-red-500 mt-1">{erros.atividade}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Apuração <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tipoApuracao"
                    value={formData.tipoApuracao}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      erros.tipoApuracao ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="">Selecione...</option>
                    <option value="SIMPLES">Simples Nacional</option>
                    <option value="PRESUMIDO">Lucro Presumido</option>
                    <option value="REAL">Lucro Real</option>
                    <option value="MEI">MEI</option>
                    <option value="CEI">CEI</option>
                    <option value="PESSOA_FISICA">Pessoa Física</option>
                  </select>
                  {erros.tipoApuracao && <p className="text-xs text-red-500 mt-1">{erros.tipoApuracao}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Entrada
                  </label>
                  <select
                    name="tipoEntrada"
                    value={formData.tipoEntrada}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Selecione...</option>
                    <option value="CLIENTE_NOVO">Cliente Novo</option>
                    <option value="MIGRACAO">Migração</option>
                    <option value="RETORNO">Retorno</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Grau de Dificuldade
                  </label>
                  <select
                    name="grauDificuldade"
                    value={formData.grauDificuldade}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="BAIXO">Baixo</option>
                    <option value="MEDIO">Médio</option>
                    <option value="ALTO">Alto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="INATIVO">Inativo</option>
                    <option value="BAIXADA">Baixada</option>
                  </select>
                </div>

                {formData.status === 'BAIXADA' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data da Baixa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dataBaixa"
                      value={formData.dataBaixa}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        erros.dataBaixa ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {erros.dataBaixa && <p className="text-xs text-red-500 mt-1">{erros.dataBaixa}</p>}
                  </div>
                )}

                {formData.status === 'INATIVO' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Data da Inativação <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dataInativacao"
                      value={formData.dataInativacao}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        erros.dataInativacao ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {erros.dataInativacao && <p className="text-xs text-red-500 mt-1">{erros.dataInativacao}</p>}
                  </div>
                )}
              </div>
            </div>

            {/* E-mails */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700">
                  E-mails de Contato
                </h3>
                <button
                  type="button"
                  onClick={adicionarEmail}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={16} />
                  Adicionar
                </button>
              </div>
              <div className="space-y-3">
                {formData.emails.map((email, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="email"
                      value={email.email}
                      onChange={(e) => handleEmailChange(index, 'email', e.target.value)}
                      placeholder="email@exemplo.com"
                      className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                        erros[`email_${index}`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    <select
                      value={email.tipo}
                      onChange={(e) => handleEmailChange(index, 'tipo', e.target.value)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Principal">Principal</option>
                      <option value="Secundário">Secundário</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Técnico">Técnico</option>
                    </select>
                    {formData.emails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removerEmail(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Localizações */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <MapPin size={20} />
                  Localizações
                </h3>
                <button
                  type="button"
                  onClick={adicionarLocalizacao}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={16} />
                  Adicionar
                </button>
              </div>
              <div className="space-y-4">
                {formData.localizacoes.map((localizacao, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Localização {index + 1}</h4>
                      {formData.localizacoes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removerLocalizacao(index)}
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Estado
                        </label>
                        <select
                          value={localizacao.estado}
                          onChange={(e) => handleLocalizacaoChange(index, 'estado', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Selecione...</option>
                          {estados.map(estado => (
                            <option key={estado} value={estado}>{estado}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Cidade
                        </label>
                        <input
                          type="text"
                          value={localizacao.cidade}
                          onChange={(e) => handleLocalizacaoChange(index, 'cidade', e.target.value)}
                          placeholder="Nome da cidade"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Inscrição Municipal
                        </label>
                        <input
                          type="text"
                          value={localizacao.inscricaoMunicipal}
                          onChange={(e) => handleLocalizacaoChange(index, 'inscricaoMunicipal', e.target.value)}
                          placeholder="Número da inscrição"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Inscrição Estadual
                        </label>
                        <input
                          type="text"
                          value={localizacao.inscricaoEstadual}
                          onChange={(e) => handleLocalizacaoChange(index, 'inscricaoEstadual', e.target.value)}
                          placeholder="Número da inscrição"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Setores */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700">
                  Setores e Responsáveis
                </h3>
                <button
                  type="button"
                  onClick={adicionarSetor}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={16} />
                  Adicionar
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {formData.setores.map((setor, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">{setor.setor || 'Novo Setor'}</h4>
                      <button
                        type="button"
                        onClick={() => removerSetor(index)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <select
                        value={setor.setor}
                        onChange={(e) => handleSetorChange(index, 'setor', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Selecione o setor...</option>
                        <option value="CONTABIL">Contábil</option>
                        <option value="FISCAL">Fiscal</option>
                        <option value="DP">DP</option>
                      </select>
                      <input
                        type="text"
                        value={setor.responsavel}
                        onChange={(e) => handleSetorChange(index, 'responsavel', e.target.value)}
                        placeholder="Responsável"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <select
                        value={setor.status}
                        onChange={(e) => handleSetorChange(index, 'status', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="PENDENTE">Pendente</option>
                        <option value="ATIVO">Ativo</option>
                        <option value="INATIVO">Inativo</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                Observações
              </h3>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows="4"
                placeholder="Informações adicionais sobre o cliente..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={18} />
                Salvar Cliente
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
