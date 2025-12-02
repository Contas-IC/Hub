import { useState } from 'react';
import { X, Save, DollarSign, Calendar, Percent, FileText } from 'lucide-react';

export default function ModalFinanceiroCliente({ cliente, onClose, salarioMinimo, onSalvar }) {
  const [fData, setFData] = useState(cliente.financeiro || {
    cobranca: '', percentual: '', valor: '', vencimento: '', observacao: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFData(data => ({
      ...data,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const valorCalculado = fData.percentual
    ? (salarioMinimo * parseFloat(fData.percentual || 0) / 100).toFixed(2)
    : fData.valor;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSalvar({ ...cliente, financeiro: fData });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden animate-scaleIn flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex gap-3 items-center">
            <DollarSign className="text-white" size={28} />
            <div>
              <h2 className="text-xl font-bold text-white">Dados Financeiros</h2>
              <span className="text-blue-100 text-xs">{cliente.codigo} - {cliente.nome}</span>
            </div>
          </div>
          <button onClick={onClose} type="button" className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Forma de Cobrança */}
          <div>
            <label className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-1">
              <FileText size={16} /> Forma de Cobrança
            </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
              type="text"
              name="cobranca"
              value={fData.cobranca}
              onChange={handleChange}
              placeholder="Descreva a cobrança (ex: Boleto, Pix...)"
              maxLength={40}
            />
          </div>

          {/* Grid para % | Valor | Vencimento | Conexa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Percentual e Valor */}
            <div>
              <label className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-1">
                <Percent size={16} /> Percentual %
              </label>
              <input
                className="pl-4 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                type="number"
                name="percentual"
                value={fData.percentual}
                onChange={handleChange}
                min={0}
                max={100}
                step={0.01}
                placeholder="Ex: 10"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-1">
                <DollarSign size={16} /> Valor (R$)
              </label>
              <input
                className="pl-4 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                type="text"
                name="valor"
                value={fData.percentual ? valorCalculado : fData.valor}
                readOnly={!!fData.percentual}
                onChange={handleChange}
                placeholder="Valor cobrado"
              />
              {fData.percentual ? (
                <p className="text-xs text-gray-500 mt-1">
                  {`Calculado: ${fData.percentual}% de R$ ${salarioMinimo} = `}
                  <span className="font-semibold">R$ {valorCalculado}</span>
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            {/* Vencimento */}
            <div>
              <label className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-1">
                <Calendar size={16} /> Dia de Vencimento
              </label>
              <input
                className="pl-4 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                type="number"
                name="vencimento"
                value={fData.vencimento}
                onChange={handleChange}
                min={1}
                max={31}
                placeholder="Ex: 10"
              />
            </div>
            {/* Vazio para layout consistente (retirada de campos não suportados no schema atual) */}
            <div />
          </div>

          {/* Observação */}
          <div>
            <label className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-1">
              Observação
            </label>
            <textarea
              name="observacao"
              value={fData.observacao || ''}
              onChange={handleChange}
              className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-gray-900 dark:text-white resize-none"
              rows={2}
              placeholder="Informações adicionais importantes..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Save size={18} />
            )}
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
