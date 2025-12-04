// arquivo: client/src/pages/Legalizacao/Financeiros.jsx

import { useState, useEffect } from 'react';
import { Search, Edit2, DollarSign } from 'lucide-react';
import ModalFinanceiroCliente from '../../components/Legalizacao/ModalFinanceiroCliente';
import { financeiros, configuracoes } from '../../services/api';

export default function Financeiros() {
  const [financeirosLista, setFinanceirosLista] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [salarioMinimo, setSalarioMinimo] = useState(1412.00);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [finResponse, salResponse] = await Promise.all([
        financeiros.listar(),
        configuracoes.buscarSalarioMinimo()
      ]);

      setFinanceirosLista(finResponse.data || []);
      setSalarioMinimo(salResponse.data.valor || 1412.00);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModal = async (clienteId) => {
    try {
      const response = await financeiros.buscarPorCliente(clienteId);
      setClienteSelecionado(response.data);
      setModalAberto(true);
    } catch (error) {
      console.error('Erro ao buscar financeiro:', error);
      alert('Erro ao carregar dados do cliente');
    }
  };

  const handleSalvarFinanceiro = async (clienteId, dados) => {
    try {
      await financeiros.atualizar(clienteId, dados);
      alert('Dados financeiros atualizados com sucesso!');
      setModalAberto(false);
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert(error.response?.data?.message || 'Erro ao salvar dados financeiros');
    }
  };

  const calcularValor = (percentual) => {
    if (!percentual || isNaN(percentual)) return null;
    return (salarioMinimo * (parseFloat(percentual) / 100)).toFixed(2);
  };

  const financeirosFiltrados = financeirosLista.filter(item => {
    if (!busca) return true;
    const searchLower = busca.toLowerCase();
    return (
      item.cliente_codigo?.toLowerCase().includes(searchLower) ||
      item.cliente_nome?.toLowerCase().includes(searchLower) ||
      item.cliente_cnpj?.includes(searchLower)
    );
  });

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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Dados Financeiros
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gerencie cobranças e dados financeiros dos clientes
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Salário Mínimo</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                R$ {salarioMinimo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Busca */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por código, empresa ou CNPJ..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Código</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Empresa</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">CNPJ</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Cobrança</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">%</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Valor (R$)</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Venc</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {financeirosFiltrados.map((item) => {
                  const valor = calcularValor(item.percentual_salario_minimo);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {item.cliente_codigo}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {item.cliente_nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {item.cliente_cnpj}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {item.tipo_cobranca || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900 dark:text-white">
                        {item.percentual_salario_minimo || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600 dark:text-green-400">
                        {valor ? `R$ ${parseFloat(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 dark:text-gray-400">
                        {item.dia_vencimento ? `Dia ${item.dia_vencimento}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleAbrirModal(item.cliente_id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {financeirosFiltrados.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  Nenhum cliente encontrado
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalAberto && clienteSelecionado && (
        <ModalFinanceiroCliente
          cliente={clienteSelecionado}
          salarioMinimo={salarioMinimo}
          onClose={() => setModalAberto(false)}
          onSalvar={handleSalvarFinanceiro}
        />
      )}
    </div>
  );
}
