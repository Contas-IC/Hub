// arquivo: client/src/pages/Legalizacao/Configuracoes.jsx

import { useState, useEffect } from 'react';
import { Settings, Save, Edit2 } from 'lucide-react';
import { configuracoes } from '../../services/api';

export default function Configuracoes() {
  const [salarioMinimo, setSalarioMinimo] = useState(1412.00);
  const [editandoSalario, setEditandoSalario] = useState(false);
  const [novoSalario, setNovoSalario] = useState(1412.00);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    buscarSalarioMinimo();
  }, []);

  const buscarSalarioMinimo = async () => {
    try {
      setLoading(true);
      const response = await configuracoes.buscarSalarioMinimo();
      const valor = response.data.valor;
      setSalarioMinimo(valor);
      setNovoSalario(valor);
    } catch (error) {
      console.error('Erro ao buscar salário mínimo:', error);
      setMsg('Erro ao carregar salário mínimo. Usando valor padrão.');
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    if (isNaN(parseFloat(novoSalario)) || novoSalario < 1) {
      setMsg('Informe um valor válido para o salário mínimo.');
      setTimeout(() => setMsg(''), 3000);
      return;
    }

    try {
      setSalvando(true);
      await configuracoes.atualizarSalarioMinimo(parseFloat(novoSalario));
      setSalarioMinimo(parseFloat(novoSalario));
      setEditandoSalario(false);
      setMsg('Salário mínimo atualizado com sucesso!');
      setTimeout(() => setMsg(''), 2500);
    } catch (error) {
      console.error('Erro ao salvar salário mínimo:', error);
      setMsg('Erro ao salvar. Tente novamente.');
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setSalvando(false);
    }
  };

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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Configurações Gerais
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Configure os parâmetros do sistema
          </p>
        </div>

        {/* Parâmetros Financeiros */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Parâmetros Financeiros
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            O valor do salário mínimo é utilizado como referência para cálculos automáticos de porcentagem na aba Financeiros.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Salário Mínimo Atual (R$)
              </label>
              
              {editandoSalario ? (
                <input
                  type="number"
                  step="0.01"
                  value={novoSalario}
                  onChange={(e) => setNovoSalario(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  autoFocus
                />
              ) : (
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    R$ {salarioMinimo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <button
                    onClick={() => {
                      setNovoSalario(salarioMinimo);
                      setEditandoSalario(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Alterar
                  </button>
                </div>
              )}
            </div>

            {editandoSalario && (
              <div className="flex gap-3">
                <button
                  onClick={handleSalvar}
                  disabled={salvando}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {salvando ? 'Salvando...' : 'Salvar valor'}
                </button>
                <button
                  onClick={() => setEditandoSalario(false)}
                  disabled={salvando}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            )}

            {msg && (
              <div className={`p-4 rounded-xl ${
                msg.includes('sucesso') 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}>
                {msg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
