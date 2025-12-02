import { useState, useEffect } from 'react';
import { Settings, Save, Edit2 } from 'lucide-react';
import LayoutSetor from '../../components/Layout/LayoutSetor';
import SidebarLegalizacao from './components/SidebarLegalizacao';
import api from '../../services/api';

export default function Configuracoes() {
  const [salarioMinimo, setSalarioMinimo] = useState(1412.00);
  const [editandoSalario, setEditandoSalario] = useState(false);
  const [novoSalario, setNovoSalario] = useState(salarioMinimo);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Buscar salário mínimo da API ao carregar o componente
  useEffect(() => {
    const buscarSalarioMinimo = async () => {
      try {
        const response = await api.get('/configuracoes/salario-minimo');
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

    buscarSalarioMinimo();
  }, []);

  const handleSalvar = () => {
    if (isNaN(parseFloat(novoSalario)) || novoSalario < 1) {
      setMsg('Informe um valor válido para o salário mínimo.');
      return;
    }
    setSalarioMinimo(parseFloat(novoSalario));
    setEditandoSalario(false);
    setMsg('Salário mínimo atualizado com sucesso!');
    setTimeout(() => setMsg(''), 2500);
    // Aqui você pode fazer um POST/PATCH para a API também
  };

  return (
    <LayoutSetor sidebar={SidebarLegalizacao} titulo="Configurações do Módulo">
      <div className="p-6 max-w-2xl mx-auto space-y-8">

        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configurações Gerais
          </h2>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Parâmetros Financeiros
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-lg">
            O valor do salário mínimo é utilizado como referência para cálculos automáticos de porcentagem na aba Financeiros.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Salário Mínimo Atual (R$)
              </label>
              {editandoSalario ? (
                <input
                  type="number"
                  className="w-full px-4 py-2 rounded-lg border border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold text-xl focus:ring-2 focus:ring-blue-500"
                  value={novoSalario}
                  min={500}
                  step={0.01}
                  onChange={e => setNovoSalario(e.target.value)}
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-2xl text-blue-700 dark:text-blue-300">
                    R$ {salarioMinimo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <button
                    type="button"
                    className="px-3 py-1 text-xs flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    onClick={() => {
                      setNovoSalario(salarioMinimo);
                      setEditandoSalario(true);
                    }}
                  >
                    <Edit2 size={17} /> Alterar
                  </button>
                </div>
              )}
            </div>
            {editandoSalario && (
              <div className="flex gap-3 items-end">
                <button
                  type="button"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSalvar}
                  disabled={salvando}
                >
                  <Save size={18} />
                  {salvando ? 'Salvando...' : 'Salvar valor'}
                </button>
                <button
                  type="button"
                  className="text-gray-700 dark:text-gray-300 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setEditandoSalario(false)}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
          {msg && <p className="mt-4 text-sm text-green-700 dark:text-green-400">{msg}</p>}
        </div>

        {/* Novos Parâmetros do Sistema podem ser adicionados aqui */}
        {/* <div className="...">...</div> */}
      </div>
    </LayoutSetor>
  );
}
