import { useState, useEffect } from 'react';
import { 
  Plus, Search, Eye, Edit, Save, X, DollarSign, Calendar, Percent, FileText
} from 'lucide-react';
import LayoutSetor from '../../components/Layout/LayoutSetor';
import SidebarLegalizacao from './components/SidebarLegalizacao';
import ModalFinanceiroCliente from './components/ModalFinanceiroCliente';
import api from '../../services/api';

export default function Financeiros() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalFinanceiro, setModalFinanceiro] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [filtros, setFiltros] = useState({ busca: '' });

  // Salário mínimo pode vir das configs do backend!
  const salarioMinimo = 1412.00;

  // Listagem real via API
  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        const params = {};
        if (filtros.busca) params.busca = filtros.busca;
        const { data } = await api.get('/clientes', { params });
        const clientesApi = (data?.dados || []).map((cl) => ({
          id: cl.id,
          codigo: cl.codigo,
          nome: cl.nome_empresa,
          cnpj: cl.cnpj,
          financeiro: {
            cobranca: cl.tipo_cobranca || '',
            percentual: cl.percentual_cobranca ?? '',
            valor: cl.valor_cobranca ?? '',
            vencimento: cl.dia_vencimento ?? ''
          }
        }));
        setClientes(clientesApi);
      } catch (err) {
        console.error('Erro ao listar clientes (financeiros):', err);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [filtros.busca]);

  const handleVisualizarFinanceiro = (cliente) => {
    setClienteSelecionado(cliente);
    setModalFinanceiro(true);
  };

  return (
    <LayoutSetor sidebar={SidebarLegalizacao} titulo="Legalização - Financeiros">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financeiros das Empresas</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Gerencie cobranças e dados financeiros dos clientes.
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, código ou CNPJ..."
              value={filtros.busca}
              onChange={e => setFiltros({ ...filtros, busca: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Tabela de Financeiros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Empresa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">CNPJ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Cobrança</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">%</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Valor (R$)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Venc</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center">Carregando...</td>
                  </tr>
                ) : clientes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center">Nenhum cliente encontrado</td>
                  </tr>
                ) : (
                  clientes.map(cliente => {
                    const f = cliente.financeiro || {};
                    const valor =
                      f.percentual
                        ? (salarioMinimo * parseFloat(f.percentual) / 100).toFixed(2)
                        : f.valor;
                    return (
                      <tr
                        key={cliente.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => handleVisualizarFinanceiro(cliente)}
                      >
                        <td className="px-6 py-4">{cliente.codigo}</td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{cliente.nome}</td>
                        <td className="px-6 py-4">{cliente.cnpj}</td>
                        <td className="px-6 py-4">{f.cobranca}</td>
                        <td className="px-6 py-4">{f.percentual}</td>
                        <td className="px-6 py-4">{valor ? `R$ ${valor}` : ''}</td>
                        <td className="px-6 py-4">{f.vencimento ? `Dia ${f.vencimento}` : ''}</td>
                        <td className="px-6 py-4 text-right">
                          <Eye size={18} className="text-blue-600 dark:text-blue-400" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal pop-up */}
      {modalFinanceiro && (
        <ModalFinanceiroCliente
          cliente={clienteSelecionado}
          onClose={() => setModalFinanceiro(false)}
          salarioMinimo={salarioMinimo}
          onSalvar={async (atualizado) => {
            try {
              const f = atualizado.financeiro || {};
              await api.put(`/clientes/${atualizado.id}/financeiro`, {
                tipo_cobranca: f.cobranca || null,
                percentual_cobranca: f.percentual !== '' ? Number(f.percentual) : null,
                valor_cobranca: f.percentual ? null : (f.valor !== '' ? Number(String(f.valor).replace(',', '.')) : null),
                dia_vencimento: f.vencimento !== '' ? Number(f.vencimento) : null
              });
              setClientes(clientes =>
                clientes.map(c => c.id === atualizado.id ? atualizado : c)
              );
              setModalFinanceiro(false);
            } catch (err) {
              console.error('Erro ao salvar financeiro:', err);
              alert('Falha ao salvar dados financeiros.');
            }
          }}
        />
      )}
    </LayoutSetor>
  );
}
