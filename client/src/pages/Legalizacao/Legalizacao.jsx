// arquivo: client/src/pages/Legalizacao/Legalizacao.jsx

import { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Award,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { legalizacao, certificados, clientes, tarefas } from '../../services/api';

export default function Legalizacao() {
  const [statsEmpresas, setStatsEmpresas] = useState({
    empresasEntradas: 0,
    empresasSaidas: 0,
    empresasAtivas: 0,
    dadosIncompletos: 0
  });

  const [statsCertificados, setStatsCertificados] = useState({
    total: 0,
    ativos: 0,
    vencidos: 0,
    proximoVencer: 0
  });

  const [statsTarefas, setStatsTarefas] = useState({
    pendentes: 0,
    emAndamento: 0,
    concluidas: 0,
    atrasadas: 0
  });

  const [empresasRecentes, setEmpresasRecentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro('');

      // Estatísticas de legalização (empresas) + lista
      const [legResp, certResp, tarefasResp, clientesResp] = await Promise.all([
        legalizacao.estatisticas(),       // deve retornar { empresasEntradas, empresasSaidas, empresasAtivas, dadosIncompletos }
        certificados.estatisticas(),      // { total, ativos, vencidos, proximoVencer }
        tarefas.estatisticas(),           // { pendentes, emAndamento, concluidas, atrasadas, total }
        clientes.listar({ page: 1, limit: 5 }) // últimos clientes para “Empresas recentes”
      ]);

      setStatsEmpresas(legResp.data || {
        empresasEntradas: 0,
        empresasSaidas: 0,
        empresasAtivas: 0,
        dadosIncompletos: 0
      });

      setStatsCertificados(certResp.data || {
        total: 0,
        ativos: 0,
        vencidos: 0,
        proximoVencer: 0
      });

      setStatsTarefas(tarefasResp.data || {
        pendentes: 0,
        emAndamento: 0,
        concluidas: 0,
        atrasadas: 0
      });

      const lista = (clientesResp.data?.clientes || [])
        .sort((a, b) => new Date(b.data_entrada_escritorio || b.data_cadastro || 0) - new Date(a.data_entrada_escritorio || a.data_cadastro || 0))
        .slice(0, 5);

      setEmpresasRecentes(lista);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setErro('Erro ao carregar informações do dashboard. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return 'N/A';
    return new Date(dataISO).toLocaleDateString('pt-BR');
  };

  // “Gráfico” simples de barras horizontais com base nas estatísticas de empresas
  const totalMovimento = statsEmpresas.empresasEntradas + statsEmpresas.empresasSaidas;
  const totalStatus = statsEmpresas.empresasAtivas + statsEmpresas.empresasSaidas;
  const percent = (parte, total) => {
    if (!total || total <= 0) return 0;
    return Math.round((parte / total) * 100);
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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Módulo de Legalização
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visão geral dos processos, empresas, certificados e tarefas do setor
          </p>
          {erro && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
              {erro}
            </div>
          )}
        </div>

        {/* Cards de Estatísticas - Empresas (mantidos) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-10 h-10 opacity-80" />
              <span className="text-3xl font-bold">{statsEmpresas.empresasEntradas}</span>
            </div>
            <h3 className="text-lg font-semibold opacity-90">Empresas Entradas</h3>
            <p className="text-sm opacity-75">Últimos 30 dias</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <TrendingDown className="w-10 h-10 opacity-80" />
              <span className="text-3xl font-bold">{statsEmpresas.empresasSaidas}</span>
            </div>
            <h3 className="text-lg font-semibold opacity-90">Empresas Saídas / Baixadas</h3>
            <p className="text-sm opacity-75">Baixas/Inativações registradas</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-10 h-10 opacity-80" />
              <span className="text-3xl font-bold">{statsEmpresas.empresasAtivas}</span>
            </div>
            <h3 className="text-lg font-semibold opacity-90">Empresas Ativas</h3>
            <p className="text-sm opacity-75">Clientes em acompanhamento</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <AlertCircle className="w-10 h-10 opacity-80" />
              <span className="text-3xl font-bold">{statsEmpresas.dadosIncompletos}</span>
            </div>
            <h3 className="text-lg font-semibold opacity-90">Dados Incompletos</h3>
            <p className="text-sm opacity-75">Empresas com cadastro pendente</p>
          </div>
        </div>

        {/* “Gráfico” de Entradas x Saídas x Ativas (mantido e mais coerente) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Movimento de Empresas (Entraram x Saíram)
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Comparativo das empresas que entraram e saíram do escritório no período analisado.
            </p>

            <div className="space-y-4">
              {/* Barras horizontais simples */}
              <div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Entradas</span>
                  <span>{statsEmpresas.empresasEntradas} empresas</span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-green-500 rounded-full transition-all"
                    style={{
                      width: `${percent(statsEmpresas.empresasEntradas, totalMovimento || 1)}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Saídas / Baixas</span>
                  <span>{statsEmpresas.empresasSaidas} empresas</span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-red-500 rounded-full transition-all"
                    style={{
                      width: `${percent(statsEmpresas.empresasSaidas, totalMovimento || 1)}%`
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Total movimentado: {totalMovimento} empresa{totalMovimento === 1 ? '' : 's'}.
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Situação da Base de Clientes
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Distribuição entre empresas ativas e baixadas/inativas.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Ativas</span>
                  <span>{statsEmpresas.empresasAtivas} empresas</span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-blue-500 rounded-full transition-all"
                    style={{
                      width: `${percent(statsEmpresas.empresasAtivas, totalStatus || 1)}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Baixadas / Inativas</span>
                  <span>{statsEmpresas.empresasSaidas} empresas</span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-orange-500 rounded-full transition-all"
                    style={{
                      width: `${percent(statsEmpresas.empresasSaidas, totalStatus || 1)}%`
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Total analisado: {totalStatus} empresa{totalStatus === 1 ? '' : 's'}.
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas - Certificados (mantidos) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{statsCertificados.total}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Certificados Totais</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cadastrados no sistema</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{statsCertificados.ativos}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Certificados Ativos</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Dentro da validade</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{statsCertificados.proximoVencer}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Próximos a Vencer</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Próximos 30 dias</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{statsCertificados.vencidos}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Certificados Vencidos</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Requer renovação</p>
          </div>
        </div>

        {/* Cards de Estatísticas - Tarefas do setor */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Pendentes</span>
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {statsTarefas.pendentes}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Em andamento</span>
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {statsTarefas.emAndamento}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Concluídas</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {statsTarefas.concluidas}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Atrasadas</span>
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {statsTarefas.atrasadas}
            </p>
          </div>
        </div>

        {/* Empresas Recentes */}
        {empresasRecentes.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Empresas Recentes
            </h2>
            <div className="space-y-4">
              {empresasRecentes.map((empresa) => (
                <div
                  key={empresa.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {empresa.nome_empresa}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      CNPJ: {empresa.cnpj}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      empresa.status === 'ATIVO'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : empresa.status === 'INATIVO'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {empresa.status}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Entrada: {formatarData(empresa.data_entrada_escritorio || empresa.data_cadastro)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
