import { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  Building2,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import Loading from '../../components/Loading';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    clientesAtivos: 0,
    totalFuncionarios: 0,
    clientesNovos: []
  });

  const [dadosEntradas, setDadosEntradas] = useState([
    { mes: 'Jun', clientes: 2 },
    { mes: 'Jul', clientes: 5 },
    { mes: 'Ago', clientes: 12 },
    { mes: 'Set', clientes: 45 },
    { mes: 'Out', clientes: 8 },
    { mes: 'Nov', clientes: 3 }
  ]);

  const [clientesEmProgressao, setClientesEmProgressao] = useState([
    {
      id: 1,
      codigo: 'CLI001',
      nome_empresa: 'Tech Solutions LTDA',
      cnpj: '12.345.678/0001-90',
      regime: 'SIMPLES',
      etapas: {
        cadastro_empresa: true,
        cadastro_dominio: true,
        cadastro_acessorias: false,
        enviado_onboarding: false,
        reuniao_agendada: false,
        reuniao_concluida: false,
        cliente_ativo: false
      },
      porcentagem: 28
    },
    {
      id: 2,
      codigo: 'CLI002',
      nome_empresa: 'Comércio ABC',
      cnpj: '98.765.432/0001-10',
      regime: 'PRESUMIDO',
      etapas: {
        cadastro_empresa: true,
        cadastro_dominio: true,
        cadastro_acessorias: true,
        enviado_onboarding: true,
        reuniao_agendada: true,
        reuniao_concluida: false,
        cliente_ativo: false
      },
      porcentagem: 71
    },
    {
      id: 3,
      codigo: 'CLI003',
      nome_empresa: 'Indústria XYZ S/A',
      cnpj: '11.222.333/0001-44',
      regime: 'REAL',
      etapas: {
        cadastro_empresa: true,
        cadastro_dominio: false,
        cadastro_acessorias: false,
        enviado_onboarding: false,
        reuniao_agendada: false,
        reuniao_concluida: false,
        cliente_ativo: false
      },
      porcentagem: 14
    }
  ]);

  useEffect(() => {
    carregarDashboard();
  }, []);

  const carregarDashboard = async () => {
    try {
      setTimeout(() => {
        setStats({
          clientesAtivos: 332,
          totalFuncionarios: 1338,
          clientesNovos: [
            { 
              codigo: 'CLI001', 
              nome_empresa: 'Tech Solutions LTDA', 
              cnpj: '12.345.678/0001-90',
              regime: 'SIMPLES', 
              data: '2025-11-15' 
            },
            { 
              codigo: 'CLI002', 
              nome_empresa: 'Comércio ABC', 
              cnpj: '98.765.432/0001-10',
              regime: 'PRESUMIDO', 
              data: '2025-11-16' 
            },
            { 
              codigo: 'CLI003', 
              nome_empresa: 'Indústria XYZ S/A', 
              cnpj: '11.222.333/0001-44',
              regime: 'REAL', 
              data: '2025-11-18' 
            }
          ]
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading texto="Carregando dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clientes Ativos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Clientes Ativos</p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.clientesAtivos}</p>
            </div>
            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 size={28} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Funcionários */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Funcionários Ativos</p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.totalFuncionarios}</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <UserCheck size={28} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-blue-600 dark:text-blue-400" size={20} />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Entradas de Clientes por Mês</h2>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dadosEntradas}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
            <XAxis dataKey="mes" stroke="#6b7280" className="dark:stroke-gray-400" />
            <YAxis stroke="#6b7280" className="dark:stroke-gray-400" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#374151' }}
            />
            <Line 
              type="monotone" 
              dataKey="clientes" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Barra Progressão */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="text-orange-600 dark:text-orange-400" size={20} />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Barra de Progressão</h2>
        </div>

        <div className="space-y-4">
          {clientesEmProgressao.map((cliente) => (
            <div key={cliente.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Building2 size={18} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{cliente.nome_empresa}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{cliente.codigo} • {cliente.cnpj}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                    {cliente.regime}
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {cliente.porcentagem}%
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${cliente.porcentagem}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-4 lg:grid-cols-7 gap-2">
                {Object.entries(cliente.etapas).map(([key, value], index) => (
                  <div 
                    key={index}
                    className={`text-center px-2 py-1 rounded text-xs font-medium ${
                      value 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {key.split('_')[1] || key}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clientes Novos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="text-blue-600 dark:text-blue-400" size={20} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Clientes Novos</h2>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Últimos 7 dias</span>
        </div>
        
        <div className="space-y-3">
          {stats.clientesNovos.map((cliente, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Building2 size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{cliente.nome_empresa}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{cliente.codigo} • {cliente.cnpj}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                  {cliente.regime}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(cliente.data).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
