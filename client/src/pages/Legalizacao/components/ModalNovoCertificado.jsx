import { useEffect, useMemo, useState } from 'react';
import { X, Save, Award } from 'lucide-react';
import api from '../../../services/api';

export default function ModalNovoCertificado({ onClose, onSalvar, clientes = [] }) {
  const [formData, setFormData] = useState({
    clienteId: '',
    nomeCliente: '',
    tipo: '',
    dataEmissao: '',
    dataVencimento: '',
    observacoes: ''
  });
  const [loading, setLoading] = useState(false);

  const [sugestoes, setSugestoes] = useState([]);
  const [buscando, setBuscando] = useState(false);

  const clientesOptions = useMemo(() => {
    return (clientes || []).map(c => ({ value: String(c.id), label: `${c.nome} • ${c.cnpj}` }));
  }, [clientes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSalvar(formData);
    } finally {
      setLoading(false);
    }
  };

  // Buscar clientes conforme o nome digitado
  useEffect(() => {
    const q = formData.nomeCliente?.trim();
    if (!q || q.length < 2) {
      setSugestoes([]);
      return;
    }
    let cancelado = false;
    setBuscando(true);
    (async () => {
      try {
        const resp = await api.get('/clientes', { params: { busca: q } });
        if (!cancelado) {
          const lista = (resp.data?.dados || []).map(c => ({ id: String(c.id), nome: c.nome_empresa, cnpj: c.cnpj }));
          setSugestoes(lista);
        }
      } catch (e) {
        if (!cancelado) setSugestoes([]);
      } finally {
        if (!cancelado) setBuscando(false);
      }
    })();
    return () => { cancelado = true; };
  }, [formData.nomeCliente]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scaleIn flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Novo Certificado Digital</h2>
              <p className="text-sm text-blue-100">Informe os dados do certificado</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Cliente: digitar nome e selecionar sugestão (auto busca) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cliente (digite e selecione da base ou deixe avulso) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="nomeCliente"
                value={formData.nomeCliente}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, nomeCliente: e.target.value, clienteId: '' }));
                }}
                placeholder="Ex.: ACME LTDA"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {buscando && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">Buscando...</div>
              )}
              {sugestoes.length > 0 && (
                <div className="absolute mt-1 w-full max-h-40 overflow-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow z-10">
                  {sugestoes.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, clienteId: s.id, nomeCliente: s.nome }));
                        setSugestoes([]);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-900 dark:text-white">{s.nome}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{s.cnpj}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Selecione uma sugestão para anexar ao cliente. Caso não selecione, será salvo como avulso.
            </p>
          </div>

          {/* Tipo de Certificado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Certificado <span className="text-red-500">*</span>
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Selecione...</option>
              <option value="e-CPF A1">e-CPF A1</option>
              <option value="e-CPF A3">e-CPF A3</option>
              <option value="e-CNPJ A1">e-CNPJ A1</option>
              <option value="e-CNPJ A3">e-CNPJ A3</option>
            </select>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data de Emissão
              </label>
              <input
                type="date"
                name="dataEmissao"
                value={formData.dataEmissao}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data de Vencimento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dataVencimento"
                value={formData.dataVencimento}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observações
            </label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              rows="3"
              placeholder="Informações adicionais sobre o certificado..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>
        </div>

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
                Salvar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}